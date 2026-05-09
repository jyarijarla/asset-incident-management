import os
import csv
from datetime import datetime, timedelta
from tabulate import tabulate
from db import get_connection

REPORTS_DIR = os.path.join(os.path.dirname(__file__), 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

def get_ticket_summary(conn):
    cursor = conn.cursor()
    week_ago = datetime.now() - timedelta(days=7)
    
    cursor.execute("""
        SELECT 
            COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
            COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
            COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
            COUNT(*) FILTER (WHERE status = 'closed') as closed,
            COUNT(*) FILTER (WHERE created_at >= %s) as created_this_week,
            COUNT(*) FILTER (WHERE resolved_at >= %s) as resolved_this_week
        FROM tickets
    """, (week_ago, week_ago))
    
    row = cursor.fetchone()
    cursor.close()
    return {
        'open': row[0],
        'in_progress': row[1],
        'resolved': row[2],
        'closed': row[3],
        'created_this_week': row[4],
        'resolved_this_week': row[5],
    }

def get_asset_summary(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
            COUNT(*) FILTER (WHERE status = 'under_maintenance') as under_maintenance,
            COUNT(*) as total
        FROM assets
    """)
    row = cursor.fetchone()
    cursor.close()
    return {
        'active': row[0],
        'inactive': row[1],
        'under_maintenance': row[2],
        'total': row[3],
    }

def get_open_tickets(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            tickets.id,
            tickets.title,
            tickets.priority,
            tickets.status,
            assets.name as asset_name,
            users.name as reporter,
            tickets.created_at
        FROM tickets
        LEFT JOIN assets ON tickets.asset_id = assets.id
        LEFT JOIN users ON tickets.reporter_id = users.id
        WHERE tickets.status IN ('open', 'in_progress')
        ORDER BY 
            CASE tickets.priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END
    """)
    rows = cursor.fetchall()
    cursor.close()
    return rows

def get_assets_under_maintenance(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            assets.name,
            asset_types.name as type,
            assets.location,
            users.name as assigned_to,
            assets.updated_at
        FROM assets
        LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
        LEFT JOIN users ON assets.assigned_user_id = users.id
        WHERE assets.status = 'under_maintenance'
    """)
    rows = cursor.fetchall()
    cursor.close()
    return rows

def save_csv(filename, headers, rows):
    filepath = os.path.join(REPORTS_DIR, filename)
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return filepath

def run():
    print("\n" + "="*60)
    print(f"  WEEKLY SYSTEM REPORT — {datetime.now().strftime('%B %d, %Y')}")
    print("="*60)

    conn = get_connection()

    ticket_summary = get_ticket_summary(conn)
    asset_summary = get_asset_summary(conn)
    open_tickets = get_open_tickets(conn)
    maintenance_assets = get_assets_under_maintenance(conn)

    print("\n📊 TICKET SUMMARY")
    print(tabulate([
        ['Open', ticket_summary['open']],
        ['In Progress', ticket_summary['in_progress']],
        ['Resolved', ticket_summary['resolved']],
        ['Closed', ticket_summary['closed']],
        ['Created This Week', ticket_summary['created_this_week']],
        ['Resolved This Week', ticket_summary['resolved_this_week']],
    ], headers=['Status', 'Count'], tablefmt='rounded_outline'))

    print("\n🖥️  ASSET SUMMARY")
    print(tabulate([
        ['Active', asset_summary['active']],
        ['Inactive', asset_summary['inactive']],
        ['Under Maintenance', asset_summary['under_maintenance']],
        ['Total', asset_summary['total']],
    ], headers=['Status', 'Count'], tablefmt='rounded_outline'))

    if open_tickets:
        print("\n🎫 OPEN & IN-PROGRESS TICKETS")
        print(tabulate(open_tickets,
            headers=['ID', 'Title', 'Priority', 'Status', 'Asset', 'Reporter', 'Created'],
            tablefmt='rounded_outline'))

        csv_path = save_csv(
            f"open_tickets_{datetime.now().strftime('%Y%m%d')}.csv",
            ['ID', 'Title', 'Priority', 'Status', 'Asset', 'Reporter', 'Created'],
            open_tickets
        )
        print(f"\n✅ CSV saved to: {csv_path}")

    if maintenance_assets:
        print("\n⚠️  ASSETS UNDER MAINTENANCE")
        print(tabulate(maintenance_assets,
            headers=['Name', 'Type', 'Location', 'Assigned To', 'Last Updated'],
            tablefmt='rounded_outline'))

    conn.close()
    print("\n" + "="*60)
    print("  Report complete.")
    print("="*60 + "\n")

if __name__ == '__main__':
    run()