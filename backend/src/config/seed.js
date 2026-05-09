const pool = require('./db');

const seed = async () => {
  try {
    console.log('Seeding database...');

    // Roles
    await pool.query(`
      INSERT INTO roles (name, permissions) VALUES
      ('admin', '{"can_manage_users": true, "can_manage_assets": true, "can_manage_tickets": true, "can_view_reports": true}'),
      ('technician', '{"can_manage_users": false, "can_manage_assets": false, "can_manage_tickets": true, "can_view_reports": false}'),
      ('viewer', '{"can_manage_users": false, "can_manage_assets": false, "can_manage_tickets": false, "can_view_reports": false}')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('Roles seeded');

    // Asset types
    await pool.query(`
      INSERT INTO asset_types (name, description) VALUES
      ('Laptop', 'Portable computers'),
      ('Monitor', 'Display screens'),
      ('Server', 'Server hardware'),
      ('Peripheral', 'Keyboards, mice, and other peripherals'),
      ('Networking', 'Routers, switches, and networking equipment')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('Asset types seeded');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();