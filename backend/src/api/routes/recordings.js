const express = require('express');
const router = express.Router();
const Recording = require('../../database/models/Recording');
const { authenticate } = require('../middleware/auth');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

// Get all recordings
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    
    const recordings = await Recording.findAll(filters);
    
    res.json({
      success: true,
      data: recordings,
      count: recordings.length
    });
  } catch (error) {
    logger.error('Error fetching recordings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recordings'
    });
  }
});

// Get recording by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }
    
    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    logger.error('Error fetching recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recording'
    });
  }
});

// Download recording
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }
    
    const filePath = recording.filePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Recording file not found'
      });
    }
    
    res.download(filePath, recording.fileName, (err) => {
      if (err) {
        logger.error('Error downloading recording:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Failed to download recording'
          });
        }
      }
    });
  } catch (error) {
    logger.error('Error downloading recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download recording'
    });
  }
});

// Delete recording
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }
    
    // Delete file if exists
    if (fs.existsSync(recording.filePath)) {
      try {
        fs.unlinkSync(recording.filePath);
      } catch (err) {
        logger.warn('Failed to delete recording file:', err);
      }
    }
    
    await Recording.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Recording deleted'
    });
  } catch (error) {
    logger.error('Error deleting recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete recording'
    });
  }
});

module.exports = router;
