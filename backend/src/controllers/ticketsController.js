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
      WHERE tickets.organization_id = $1
      ORDER BY tickets.created_at DESC
    `, [req.user.org_id]);
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
      WHERE tickets.id = $1 AND tickets.organization_id = $2
    `, [id, req.user.org_id]);

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
    const org_id = req.user.org_id;

    let assetName = null;
    if (asset_id) {
      const assetResult = await pool.query(
        'SELECT name FROM assets WHERE id = $1 AND organization_id = $2',
        [asset_id, org_id]
      );
      if (assetResult.rows.length > 0) {
        assetName = assetResult.rows[0].name;
      }
    }

    const result = await pool.query(`
      INSERT INTO tickets (title, description, asset_id, priority, reporter_id, assigned_to_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, asset_id, priority || 'medium', reporter_id, assigned_to_id, org_id]);

    const ticket = result.rows[0];

    const { analyzeTicket } = require('../services/aiTriage');
    const aiAnalysis = await analyzeTicket(title, description, assetName, req.user.industry);

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

    const result = await pool.query(`
      UPDATE tickets
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          assigned_to_id = COALESCE($5, assigned_to_id),
          resolved_at = CASE WHEN $3 = 'resolved' THEN NOW() ELSE resolved_at END,
          updated_at = NOW()
      WHERE id = $6 AND organization_id = $7
      RETURNING *
    `, [title, description, status, priority, assigned_to_id, id, req.user.org_id]);

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
      'DELETE FROM tickets WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, req.user.org_id]
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

const getTicketStats = async (req, res) => {
  try {
    const org_id = req.user.org_id;

    const ticketTrends = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'resolved' OR status = 'closed') as resolved
      FROM tickets
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND organization_id = $1
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [org_id]);

    const priorityDist = await pool.query(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      WHERE organization_id = $1
      GROUP BY priority
    `, [org_id]);

    const avgResolution = await pool.query(`
      SELECT
        ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric, 1) as avg_hours
      FROM tickets
      WHERE resolved_at IS NOT NULL AND organization_id = $1
    `, [org_id]);

    const assetsByType = await pool.query(`
      SELECT asset_types.name as type, COUNT(*) as count
      FROM assets
      LEFT JOIN asset_types ON assets.asset_type_id = asset_types.id
      WHERE assets.organization_id = $1
      GROUP BY asset_types.name
    `, [org_id]);

    res.json({
      trends: ticketTrends.rows,
      priorityDistribution: priorityDist.rows,
      avgResolutionHours: avgResolution.rows[0]?.avg_hours || 0,
      assetsByType: assetsByType.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const submitResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { steps, root_cause, solution_applied } = req.body;
    const org_id = req.user.org_id;

    if (!steps?.trim() || !root_cause?.trim() || !solution_applied?.trim()) {
      return res.status(400).json({ error: 'All three resolution fields are required' });
    }

    const ticketResult = await pool.query(`
      SELECT tickets.*, assets.name as asset_name
      FROM tickets
      LEFT JOIN assets ON tickets.asset_id = assets.id
      WHERE tickets.id = $1 AND tickets.organization_id = $2
    `, [id, org_id]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return res.status(400).json({ error: 'Ticket is already resolved' });
    }

    const { gradeResolution } = require('../services/aiTriage');
    const gradeResult = await gradeResolution(
      { title: ticket.title, description: ticket.description, asset_name: ticket.asset_name },
      { priority: ticket.ai_priority_suggestion, category: ticket.ai_category, recommendation: ticket.ai_recommendation },
      { steps, root_cause, solution_applied },
      req.user.industry
    );

    let newStatus = 'resolved';
    let flaggedForReview = false;
    let requiresAdminApproval = false;

    if (gradeResult) {
      if (gradeResult.score >= 75) {
        newStatus = 'resolved';
      } else if (gradeResult.score >= 60) {
        newStatus = 'resolved';
        flaggedForReview = true;
      } else {
        newStatus = ticket.status;
        requiresAdminApproval = true;
      }
    }

    const updateResult = await pool.query(`
      UPDATE tickets SET
        resolution_steps = $1,
        root_cause = $2,
        solution_applied = $3,
        ai_grade = $4,
        ai_grade_score = $5,
        ai_grade_feedback = $6,
        ai_grade_strengths = $7,
        ai_grade_improvements = $8,
        flagged_for_review = $9,
        requires_admin_approval = $10,
        resolved_by = $11,
        status = $12,
        resolved_at = CASE WHEN $12 = 'resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE id = $13 AND organization_id = $14
      RETURNING *
    `, [
      steps,
      root_cause,
      solution_applied,
      gradeResult?.grade ?? null,
      gradeResult?.score ?? null,
      gradeResult?.feedback ?? null,
      gradeResult ? JSON.stringify(gradeResult.strengths) : null,
      gradeResult ? JSON.stringify(gradeResult.improvements) : null,
      flaggedForReview,
      requiresAdminApproval,
      req.user.id,
      newStatus,
      id,
      org_id,
    ]);

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const approveResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const org_id = req.user.org_id;

    const result = await pool.query(`
      UPDATE tickets SET
        requires_admin_approval = false,
        status = 'resolved',
        resolved_at = NOW(),
        admin_approved_by = $1,
        admin_approved_at = NOW(),
        updated_at = NOW()
      WHERE id = $2 AND organization_id = $3 AND requires_admin_approval = true
      RETURNING *
    `, [req.user.id, id, org_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or does not require approval' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, getTicketStats, submitResolution, approveResolution };