const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const INDUSTRIES = [
  { value: 'technology', label: 'Technology / IT' },
  { value: 'av_events', label: 'AV / Live Events' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

const INDUSTRY_ASSET_TYPES = {
  technology: [
    { name: 'Laptop', description: 'Portable computers' },
    { name: 'Monitor', description: 'Display screens' },
    { name: 'Server', description: 'Server hardware' },
    { name: 'Peripheral', description: 'Keyboards, mice, and other peripherals' },
    { name: 'Networking Equipment', description: 'Routers, switches, and networking equipment' },
  ],
  av_events: [
    { name: 'Mixing Board', description: 'Audio mixing consoles' },
    { name: 'Speaker System', description: 'PA and monitor speakers' },
    { name: 'Microphone', description: 'Dynamic, condenser, and wireless mics' },
    { name: 'Lighting Rig', description: 'Stage and venue lighting' },
    { name: 'Amplifier', description: 'Power amplifiers' },
    { name: 'Projector / Display', description: 'Projectors and LED displays' },
    { name: 'Cables & Connectors', description: 'Audio, video, and power cables' },
  ],
  healthcare: [
    { name: 'Medical Device', description: 'General medical devices' },
    { name: 'Computer / Terminal', description: 'Clinical workstations and terminals' },
    { name: 'IV Pump', description: 'Intravenous infusion pumps' },
    { name: 'Patient Monitor', description: 'Vital signs monitors' },
    { name: 'Imaging Equipment', description: 'X-ray, ultrasound, and MRI equipment' },
  ],
  restaurant: [
    { name: 'Commercial Oven', description: 'Convection, combi, and deck ovens' },
    { name: 'Refrigerator / Freezer', description: 'Cold storage equipment' },
    { name: 'POS System', description: 'Point of sale terminals' },
    { name: 'HVAC', description: 'Heating, ventilation, and air conditioning' },
    { name: 'Fryer / Grill', description: 'Deep fryers and flat-top grills' },
  ],
  education: [
    { name: 'Computer / Tablet', description: 'Student and staff devices' },
    { name: 'Projector', description: 'Classroom projectors' },
    { name: 'Smartboard', description: 'Interactive whiteboards' },
    { name: 'Printer', description: 'Classroom and office printers' },
    { name: 'Lab Equipment', description: 'Science and workshop equipment' },
  ],
  manufacturing: [
    { name: 'CNC Machine', description: 'Computer-controlled machining equipment' },
    { name: 'Conveyor System', description: 'Material transport systems' },
    { name: 'Forklift', description: 'Forklifts and material handlers' },
    { name: 'Safety Equipment', description: 'PPE and safety systems' },
    { name: 'Workstation', description: 'Industrial workstations and terminals' },
  ],
  retail: [
    { name: 'POS System', description: 'Point of sale terminals' },
    { name: 'Security Camera', description: 'CCTV and security systems' },
    { name: 'Barcode Scanner', description: 'Handheld and stationary scanners' },
    { name: 'Display Unit', description: 'Shelving, racks, and display fixtures' },
    { name: 'Stockroom Equipment', description: 'Storage and inventory systems' },
  ],
  other: [
    { name: 'Equipment', description: 'General equipment' },
    { name: 'Device', description: 'Electronic devices' },
    { name: 'System', description: 'Systems and infrastructure' },
    { name: 'Tool', description: 'Hand and power tools' },
    { name: 'Vehicle', description: 'Company vehicles' },
  ],
};

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const getIndustries = (req, res) => {
  res.json(INDUSTRIES);
};

const registerOrg = async (req, res) => {
  const { org_name, industry, name, email, password } = req.body;

  if (!org_name || !industry || !name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!INDUSTRIES.find((i) => i.value === industry)) {
    return res.status(400).json({ error: 'Invalid industry' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Email already registered' });
    }

    const orgResult = await client.query(
      'INSERT INTO organizations (name, industry) VALUES ($1, $2) RETURNING *',
      [org_name, industry]
    );
    const org = orgResult.rows[0];

    const password_hash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role_id, organization_id)
       VALUES ($1, $2, $3, 1, $4) RETURNING id, name, email, role_id, organization_id`,
      [name, email, password_hash, org.id]
    );
    const user = userResult.rows[0];

    const types = INDUSTRY_ASSET_TYPES[industry] || INDUSTRY_ASSET_TYPES.other;
    for (const t of types) {
      await client.query(
        'INSERT INTO asset_types (name, description, organization_id) VALUES ($1, $2, $3)',
        [t.name, t.description, org.id]
      );
    }

    await client.query('COMMIT');

    const token = signToken({
      id: user.id,
      email: user.email,
      role: 'admin',
      role_id: 1,
      org_id: org.id,
      industry: org.industry,
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: 'admin' },
      org: { id: org.id, name: org.name, industry: org.industry },
      token,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Organization name already taken' });
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, department, role_id } = req.body;

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, department, role_id, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role_id`,
      [name, email, password_hash, department, role_id || 3, req.user?.org_id || null]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, role_id: user.role_id });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT users.*, roles.name as role,
              organizations.id as org_id,
              organizations.name as org_name,
              organizations.industry as industry
       FROM users
       JOIN roles ON users.role_id = roles.id
       LEFT JOIN organizations ON users.organization_id = organizations.id
       WHERE users.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      role_id: user.role_id,
      org_id: user.org_id,
      industry: user.industry,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      org: {
        id: user.org_id,
        name: user.org_name,
        industry: user.industry,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const result = await pool.query(
      'SELECT id, name FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with that email' });
    }
    res.json({ found: true, name: result.rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, result.rows[0].id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, registerOrg, login, getIndustries, forgotPassword, resetPassword };
