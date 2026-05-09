from datetime import datetime, timezone
from tabulate import tabulate
from db import get_connection

SLA_THRESHOLD_HOURS = 48

def get_breaching_tickets(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            tickets.id,
            tickets.title,
            tickets.priority,
            tickets.status,
            tickets.created_at,
            assets.name as asset_name,
            users.name as reporter
        FROM tickets
        LEFT JOIN assets ON tickets.asset_id = assets.id
        LEFT JOIN users ON tickets.reporter_id = users.id
        WHERE tickets.status IN ('open', 'in_progress')
        AND tickets.created_at <= NOW() - INTERVAL '%s hours'
    """, (SLA_THRESHOLD_HOURS,))
    rows = cursor.fetchall()
    cursor.close()
    return rows

def escalate_ticket(conn, ticket_id, previous_priority, hours_open):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE tickets
        SET priority = 'critical',
            updated_at = NOW()
        WHERE id = %s AND priority != 'critical'
        RETURNING id
    """, (ticket_id,))
    updated = cursor.fetchone()

    if updated:
        cursor.execute("""
            INSERT INTO sla_breaches (ticket_id, hours_open, previous_priority)
            VALUES (%s, %s, %s)
        """, (ticket_id, round(hours_open, 2), previous_priority))

    conn.commit()
    cursor.close()
    return updated is not None

def run():
    print("\n" + "="*60)
    print(f"  SLA MONITOR — {datetime.now().strftime('%B %d, %Y %H:%M')}")
    print(f"  Threshold: {SLA_THRESHOLD_HOURS} hours")
    print("="*60)

    conn = get_connection()
    breaching = get_breaching_tickets(conn)

    if not breaching:
        print("\n✅ No SLA breaches detected. All tickets within threshold.\n")
        conn.close()
        return

    print(f"\n⚠️  {len(breaching)} ticket(s) breaching SLA threshold:\n")

    escalated = []
    already_critical = []

    for ticket in breaching:
        ticket_id, title, priority, status, created_at, asset_name, reporter = ticket
        created_at = created_at.replace(tzinfo=timezone.utc) if created_at.tzinfo is None else created_at
        hours_open = (datetime.now(timezone.utc) - created_at).total_seconds() / 3600

        was_escalated = escalate_ticket(conn, ticket_id, priority, hours_open)

        if was_escalated:
            escalated.append([ticket_id, title, priority, '→ critical', f'{hours_open:.1f}h', asset_name])
        else:
            already_critical.append([ticket_id, title, status, f'{hours_open:.1f}h', asset_name])

    if escalated:
        print("🚨 ESCALATED TO CRITICAL:")
        print(tabulate(escalated,
            headers=['ID', 'Title', 'Was', 'Now', 'Hours Open', 'Asset'],
            tablefmt='rounded_outline'))

    if already_critical:
        print("\n🔴 ALREADY CRITICAL (no change):")
        print(tabulate(already_critical,
            headers=['ID', 'Title', 'Status', 'Hours Open', 'Asset'],
            tablefmt='rounded_outline'))

    conn.close()
    print(f"\n✅ SLA check complete. {len(escalated)} ticket(s) escalated.\n")
    print("="*60 + "\n")

if __name__ == '__main__':
    run()