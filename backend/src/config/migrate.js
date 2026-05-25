const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        industry VARCHAR(100) NOT NULL DEFAULT 'technology',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)
    `);
    await client.query(`
      ALTER TABLE assets ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)
    `);
    await client.query(`
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)
    `);
    await client.query(`
      ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)
    `);

    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution_steps TEXT`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS root_cause TEXT`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS solution_applied TEXT`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_grade VARCHAR(2)`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_grade_score INTEGER`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_grade_feedback TEXT`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_grade_strengths JSONB`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_grade_improvements JSONB`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS requires_admin_approval BOOLEAN DEFAULT FALSE`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id)`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS admin_approved_by INTEGER REFERENCES users(id)`);
    await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMPTZ`);

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(128)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`);

    const orphans = await client.query('SELECT COUNT(*) FROM users WHERE organization_id IS NULL');
    if (parseInt(orphans.rows[0].count) > 0) {
      const orgResult = await client.query(`
        INSERT INTO organizations (name, industry)
        VALUES ('Default Organization', 'technology')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `);
      const defaultOrgId = orgResult.rows[0].id;

      await client.query('UPDATE users SET organization_id = $1 WHERE organization_id IS NULL', [defaultOrgId]);
      await client.query('UPDATE assets SET organization_id = $1 WHERE organization_id IS NULL', [defaultOrgId]);
      await client.query('UPDATE tickets SET organization_id = $1 WHERE organization_id IS NULL', [defaultOrgId]);
      await client.query('UPDATE asset_types SET organization_id = $1 WHERE organization_id IS NULL', [defaultOrgId]);

      console.log(`Migrated existing data to org ${defaultOrgId}`);
    }

    await client.query('COMMIT');
    console.log('Migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = migrate;