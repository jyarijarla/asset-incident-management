import os
import csv
from datetime import datetime, timezone, timedelta
from tabulate import tabulate
from db import get_connection

REPORTS_DIR = os.path.join(os.path.dirname(__file__), 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

STALE_DAYS = 90

def get_stale_assets(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            assets.id,
            assets.name,
            asset_types.name as type,
            assets.status,
            assets.location,
            users.name as assigned_to,
            assets.updated_at,
            assets.purchase_date
        FROM assets
        LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
        LEFT JOIN users ON assets.assigned_user_id = users.id
        WHERE assets.updated_at <= NOW() - INTERVAL '%s days'
        ORDER BY assets.updated_at ASC
    """, (STALE_DAYS,))
    rows = cursor.fetchall()
    cursor.close()
    return rows

def get_asset_health(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            asset_types.name as type,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE assets.status = 'active') as active,
            COUNT(*) FILTER (WHERE assets.status = 'inactive') as inactive,
            COUNT(*) FILTER (WHERE assets.status = 'under_maintenance') as under_maintenance,
            COUNT(*) FILTER (WHERE assets.updated_at <= NOW() - INTERVAL '%s days') as stale
        FROM assets
        LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
        GROUP BY asset_types.name
        ORDER BY total DESC
    """, (STALE_DAYS,))
    rows = cursor.fetchall()
    cursor.close()
    return rows

def get_unassigned_assets(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            assets.id,
            assets.name,
            asset_types.name as type,
            assets.status,
            assets.location,
            assets.purchase_date
        FROM assets
        LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
        WHERE assets.assigned_user_id IS NULL
        ORDER BY assets.created_at DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    return rows

def get_ticket_count_per_asset(conn):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            assets.name,
            COUNT(tickets.id) as total_tickets,
            COUNT(tickets.id) FILTER (WHERE tickets.status IN ('open', 'in_progress')) as open_tickets
        FROM assets
        LEFT JOIN tickets ON assets.id = tickets.asset_id
        GROUP BY assets.id, assets.name
        ORDER BY total_tickets DESC
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
    print(f"  ASSET AUDIT REPORT — {datetime.now().strftime('%B %d, %Y')}")
    print(f"  Stale threshold: {STALE_DAYS} days")
    print("="*60)

    conn = get_connection()

    asset_health = get_asset_health(conn)
    stale_assets = get_stale_assets(conn)
    unassigned_assets = get_unassigned_assets(conn)
    ticket_counts = get_ticket_count_per_asset(conn)

    print("\n🖥️  ASSET HEALTH BY TYPE")
    print(tabulate(asset_health,
        headers=['Type', 'Total', 'Active', 'Inactive', 'Maintenance', 'Stale'],
        tablefmt='rounded_outline'))

    if stale_assets:
        print(f"\n⚠️  STALE ASSETS (not updated in {STALE_DAYS}+ days)")
        print(tabulate(stale_assets,
            headers=['ID', 'Name', 'Type', 'Status', 'Location', 'Assigned To', 'Last Updated', 'Purchase Date'],
            tablefmt='rounded_outline'))

        csv_path = save_csv(
            f"stale_assets_{datetime.now().strftime('%Y%m%d')}.csv",
            ['ID', 'Name', 'Type', 'Status', 'Location', 'Assigned To', 'Last Updated', 'Purchase Date'],
            stale_assets
        )
        print(f"\n✅ CSV saved to: {csv_path}")
    else:
        print(f"\n✅ No stale assets found. All assets updated within {STALE_DAYS} days.")

    if unassigned_assets:
        print(f"\n👤 UNASSIGNED ASSETS ({len(unassigned_assets)} total)")
        print(tabulate(unassigned_assets,
            headers=['ID', 'Name', 'Type', 'Status', 'Location', 'Purchase Date'],
            tablefmt='rounded_outline'))
    else:
        print("\n✅ All assets are assigned.")

    print("\n🎫 TICKET HISTORY PER ASSET")
    print(tabulate(ticket_counts,
        headers=['Asset', 'Total Tickets', 'Open Tickets'],
        tablefmt='rounded_outline'))

    conn.close()
    print("\n" + "="*60)
    print("  Audit complete.")
    print("="*60 + "\n")

if __name__ == '__main__':
    run()