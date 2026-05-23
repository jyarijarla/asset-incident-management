const pool = require('../config/db');

const getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT assets.*,
             asset_types.name as asset_type,
             users.name as assigned_to
      FROM assets
      LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
      LEFT JOIN users ON assets.assigned_user_id = users.id
      WHERE assets.organization_id = $1
      ORDER BY assets.created_at DESC
    `, [req.user.org_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT assets.*,
             asset_types.name as asset_type,
             users.name as assigned_to
      FROM assets
      LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
      LEFT JOIN users ON assets.assigned_user_id = users.id
      WHERE assets.id = $1 AND assets.organization_id = $2
    `, [id, req.user.org_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createAsset = async (req, res) => {
  try {
    const { name, asset_type_id, serial_number, status, location, purchase_date, assigned_user_id } = req.body;

    const result = await pool.query(`
      INSERT INTO assets (name, asset_type_id, serial_number, status, location, purchase_date, assigned_user_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, asset_type_id, serial_number, status || 'active', location, purchase_date, assigned_user_id, req.user.org_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, asset_type_id, serial_number, status, location, purchase_date, assigned_user_id } = req.body;

    const result = await pool.query(`
      UPDATE assets
      SET name = COALESCE($1, name),
          asset_type_id = COALESCE($2, asset_type_id),
          serial_number = COALESCE($3, serial_number),
          status = COALESCE($4, status),
          location = COALESCE($5, location),
          purchase_date = COALESCE($6, purchase_date),
          assigned_user_id = COALESCE($7, assigned_user_id),
          updated_at = NOW()
      WHERE id = $8 AND organization_id = $9
      RETURNING *
    `, [name, asset_type_id, serial_number, status, location, purchase_date, assigned_user_id, id, req.user.org_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, req.user.org_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset };