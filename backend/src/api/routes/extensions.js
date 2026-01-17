const express = require('express');
const router = express.Router();
const Extension = require('../../database/models/Extension');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const SIPRegistrar = require('../../sip/core/registrar');

// Get all extensions
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.enabled !== undefined) {
      filters.enabled = req.query.enabled === 'true';
    }
    
    const extensions = await Extension.findAll(filters);
    
    res.json({
      success: true,
      data: extensions
    });
  } catch (error) {
    logger.error('Error fetching extensions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extensions'
    });
  }
});

// Get extension by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const extension = await Extension.findById(req.params.id);
    
    if (!extension) {
      return res.status(404).json({
        success: false,
        error: 'Extension not found'
      });
    }
    
    res.json({
      success: true,
      data: extension
    });
  } catch (error) {
    logger.error('Error fetching extension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extension'
    });
  }
});

// Create new extension
router.post('/', authenticate, validate(schemas.createExtension), async (req, res) => {
  try {
    // Check if username already exists
    const existing = await Extension.findByUsername(req.body.username);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }
    
    const extension = await Extension.create(req.body);
    
    // Store password in SIP password cache for authentication
    if (req.body.password) {
      SIPRegistrar.setExtensionPassword(extension.username, req.body.password);
      logger.info(`[Extension] Password cached for ${extension.username}`);
    }
    
    // Return SIP account information
    // Use domain instead of host for SIP clients (0.0.0.0 is not valid for clients)
    const sipAccount = {
      username: extension.username,
      password: req.body.password, // Return plain password only on creation
      server: config.sip.server.domain, // Use domain (call.soundz.uz) instead of host (0.0.0.0)
      port: config.sip.server.port,
      domain: config.sip.server.domain,
      transport: config.sip.server.transport || 'udp'
    };
    
    res.status(201).json({
      success: true,
      data: {
        ...extension,
        sipAccount
      }
    });
  } catch (error) {
    logger.error('Error creating extension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create extension'
    });
  }
});

// Update extension
router.put('/:id', authenticate, validate(schemas.updateExtension), async (req, res) => {
  try {
    const extension = await Extension.update(req.params.id, req.body);
    
    if (!extension) {
      return res.status(404).json({
        success: false,
        error: 'Extension not found'
      });
    }
    
    // Update SIP password cache if password was changed
    if (req.body.password) {
      SIPRegistrar.setExtensionPassword(extension.username, req.body.password);
      logger.info(`[Extension] Password cache updated for ${extension.username}`);
    }
    
    res.json({
      success: true,
      data: extension
    });
  } catch (error) {
    logger.error('Error updating extension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update extension'
    });
  }
});

// Delete extension
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const extension = await Extension.delete(req.params.id);
    
    if (!extension) {
      return res.status(404).json({
        success: false,
        error: 'Extension not found'
      });
    }
    
    // Clear password from cache when extension is deleted
    SIPRegistrar.clearExtensionPassword(extension.username);
    logger.info(`[Extension] Password cache cleared for ${extension.username}`);
    
    res.json({
      success: true,
      data: extension
    });
  } catch (error) {
    logger.error('Error deleting extension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete extension'
    });
  }
});

// Get extension status (online/offline)
router.get('/:id/status', authenticate, async (req, res) => {
  try {
    const pool = require('../../database/connection');
    const query = `
      SELECT er.*, e.username
      FROM extension_registrations er
      JOIN extensions e ON e.id = er.extension_id
      WHERE er.extension_id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    
    const isOnline = result.rows.length > 0 && 
                     result.rows[0].expires > 0 &&
                     new Date(result.rows[0].last_updated).getTime() + (result.rows[0].expires * 1000) > Date.now();
    
    res.json({
      success: true,
      data: {
        extensionId: req.params.id,
        online: isOnline,
        registration: result.rows[0] || null
      }
    });
  } catch (error) {
    logger.error('Error fetching extension status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extension status'
    });
  }
});

// Change extension password
router.post('/:id/password', authenticate, validate(schemas.changePassword), async (req, res) => {
  try {
    const extension = await Extension.updatePassword(req.params.id, req.body.password);
    
    if (!extension) {
      return res.status(404).json({
        success: false,
        error: 'Extension not found'
      });
    }
    
    // Update SIP password cache
    if (req.body.password) {
      SIPRegistrar.setExtensionPassword(extension.username, req.body.password);
      logger.info(`[Extension] Password cache updated for ${extension.username}`);
    }
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
});

module.exports = router;
