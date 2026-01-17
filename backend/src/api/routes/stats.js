const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../../database/connection');
const logger = require('../../utils/logger');

// Dashboard statistics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const queries = {
      totalCalls: 'SELECT COUNT(*) as count FROM calls',
      activeCalls: `SELECT COUNT(*) as count FROM calls WHERE status IN ('ringing', 'answered')`,
      totalExtensions: 'SELECT COUNT(*) as count FROM extensions WHERE enabled = TRUE',
      onlineExtensions: `
        SELECT COUNT(DISTINCT er.extension_id) as count 
        FROM extension_registrations er
        WHERE er.expires > 0 
        AND er.last_updated + (er.expires || ' seconds')::interval > NOW()
      `,
      todayCalls: `
        SELECT COUNT(*) as count 
        FROM calls 
        WHERE DATE(started_at) = CURRENT_DATE
      `,
      todayDuration: `
        SELECT COALESCE(SUM(duration), 0) as total 
        FROM calls 
        WHERE DATE(started_at) = CURRENT_DATE AND status = 'completed'
      `
    };
    
    const stats = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await pool.query(query);
        stats[key] = parseInt(result.rows[0].count || result.rows[0].total || 0);
      } catch (err) {
        logger.error(`Error fetching ${key}:`, err);
        stats[key] = 0;
      }
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Call statistics
router.get('/calls', authenticate, async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    let dateFilter = '';
    if (period === 'day') {
      dateFilter = "WHERE DATE(started_at) = CURRENT_DATE";
    } else if (period === 'week') {
      dateFilter = "WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    const query = `
      SELECT 
        DATE(started_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'no-answer' THEN 1 END) as no_answer,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN duration ELSE 0 END), 0) as total_duration,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN duration ELSE NULL END), 0) as avg_duration
      FROM calls
      ${dateFilter}
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching call stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch call statistics'
    });
  }
});

// Extension statistics
router.get('/extensions', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id,
        e.username,
        e.display_name,
        COUNT(c.id) as total_calls,
        COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_calls,
        COALESCE(SUM(CASE WHEN c.status = 'completed' THEN c.duration ELSE 0 END), 0) as total_duration,
        CASE WHEN er.extension_id IS NOT NULL THEN TRUE ELSE FALSE END as online
      FROM extensions e
      LEFT JOIN calls c ON (c.from_extension_id = e.id OR c.to_extension_id = e.id)
      LEFT JOIN extension_registrations er ON er.extension_id = e.id 
        AND er.expires > 0 
        AND er.last_updated + (er.expires || ' seconds')::interval > NOW()
      WHERE e.enabled = TRUE
      GROUP BY e.id, e.username, e.display_name, er.extension_id
      ORDER BY e.username
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching extension stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extension statistics'
    });
  }
});

module.exports = router;
