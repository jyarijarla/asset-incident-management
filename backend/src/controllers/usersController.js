const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT users.id, users.name, users.email, users.department,
             users.created_at, roles.name as role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.organization_id = $1
      ORDER BY users.created_at DESC
    `, [req.user.org_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT users.id, users.name, users.email, users.department,
             users.created_at, roles.name as role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1 AND users.organization_id = $2
    `, [id, req.user.org_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT users.id, users.name, users.email, users.department,
             users.created_at, roles.name as role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1
    `, [req.user.id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, role_id } = req.body;

    const result = await pool.query(`
      UPDATE users
      SET name = COALESCE($1, name),
          department = COALESCE($2, department),
          role_id = COALESCE($3, role_id)
      WHERE id = $4 AND organization_id = $5
      RETURNING id, name, email, department, role_id
    `, [name, department, role_id, id, req.user.org_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, req.user.org_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, getMe, updateUser, deleteUser };