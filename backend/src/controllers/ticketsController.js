const pool = require('../config/db');

const getAllTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tickets.*,
             tickets.ai_priority_suggestion,
             tickets.ai_category,
             tickets.ai_recommendation,
             assets.name as asset_name,
             reporter.name as reporter_name,
             assignee.name as assigned_to_name
      FROM tickets
      LEFT JOIN assets ON tickets.asset_id = assets.id
      LEFT JOIN users reporter ON tickets.reporter_id = reporter.id
      LEFT JOIN users assignee ON tickets.assigned_to_id = assignee.id
      ORDER BY tickets.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT tickets.*,
             tickets.ai_priority_suggestion,
             tickets.ai_category,
             tickets.ai_recommendation,
             assets.name as asset_name,
             reporter.name as reporter_name,
             assignee.name as assigned_to_name
      FROM tickets
      LEFT JOIN assets ON tickets.asset_id = assets.id
      LEFT JOIN users reporter ON tickets.reporter_id = reporter.id
      LEFT JOIN users assignee ON tickets.assigned_to_id = assignee.id
      WHERE tickets.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, asset_id, priority, assigned_to_id } = req.body;
    const reporter_id = req.user.id;

    let assetName = null;
    if (asset_id) {
      const assetResult = await pool.query('SELECT name FROM assets WHERE id = $1', [asset_id]);
      if (assetResult.rows.length > 0) {
        assetName = assetResult.rows[0].name;
      }
    }

    const result = await pool.query(`
      INSERT INTO tickets (title, description, asset_id, priority, reporter_id, assigned_to_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, asset_id, priority || 'medium', reporter_id, assigned_to_id]);

    const ticket = result.rows[0];

    const { analyzeTicket } = require('../services/aiTriage');
    const aiAnalysis = await analyzeTicket(title, description, assetName);

    if (aiAnalysis) {
      await pool.query(`
        UPDATE tickets
        SET ai_priority_suggestion = $1,
            ai_category = $2,
            ai_recommendation = $3,
            ai_analyzed_at = NOW()
        WHERE id = $4
      `, [aiAnalysis.priority, aiAnalysis.category, aiAnalysis.recommendation, ticket.id]);

      ticket.ai_priority_suggestion = aiAnalysis.priority;
      ticket.ai_category = aiAnalysis.category;
      ticket.ai_recommendation = aiAnalysis.recommendation;
    }

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to_id } = req.body;

    const resolved_at = status === 'resolved' ? 'NOW()' : null;

    const result = await pool.query(`
      UPDATE tickets
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          assigned_to_id = COALESCE($5, assigned_to_id),
          resolved_at = CASE WHEN $3 = 'resolved' THEN NOW() ELSE resolved_at END,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [title, description, status, priority, assigned_to_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM tickets WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket };