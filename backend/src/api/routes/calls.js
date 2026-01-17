const express = require('express');
const router = express.Router();
const Call = require('../../database/models/Call');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../../utils/logger');
const callManager = require('../../call/manager');

// Get all calls (CDR)
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      fromNumber: req.query.from,
      toNumber: req.query.to,
      direction: req.query.direction,
      status: req.query.status,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    
    const calls = await Call.findAll(filters);
    
    res.json({
      success: true,
      data: calls,
      count: calls.length
    });
  } catch (error) {
    logger.error('Error fetching calls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calls'
    });
  }
});

// Get active calls
router.get('/active', authenticate, async (req, res) => {
  try {
    const calls = await Call.findActive();
    
    res.json({
      success: true,
      data: calls,
      count: calls.length
    });
  } catch (error) {
    logger.error('Error fetching active calls:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active calls'
    });
  }
});

// Get call by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const call = await Call.findById(req.params.id);
    
    if (!call) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }
    
    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    logger.error('Error fetching call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch call'
    });
  }
});

// Create new call (initiate call)
router.post('/', authenticate, validate(schemas.createCall), async (req, res) => {
  try {
    const { from, to, direction = 'outbound' } = req.body;
    
    // Initiate call through call manager
    const result = await callManager.initiateCall({
      from,
      to,
      direction
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error initiating call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate call'
    });
  }
});

// Transfer call
router.post('/:callId/transfer', authenticate, async (req, res) => {
  try {
    const { target } = req.body;
    
    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }
    
    const result = await callManager.transferCall(req.params.callId, target);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error transferring call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transfer call'
    });
  }
});

// Hold call
router.post('/:callId/hold', authenticate, async (req, res) => {
  try {
    await callManager.holdCall(req.params.callId);
    
    res.json({
      success: true,
      message: 'Call held'
    });
  } catch (error) {
    logger.error('Error holding call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to hold call'
    });
  }
});

// Resume call
router.post('/:callId/resume', authenticate, async (req, res) => {
  try {
    await callManager.resumeCall(req.params.callId);
    
    res.json({
      success: true,
      message: 'Call resumed'
    });
  } catch (error) {
    logger.error('Error resuming call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resume call'
    });
  }
});

// Hangup call
router.post('/:callId/hangup', authenticate, async (req, res) => {
  try {
    await callManager.hangupCall(req.params.callId);
    
    res.json({
      success: true,
      message: 'Call terminated'
    });
  } catch (error) {
    logger.error('Error hanging up call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to hangup call'
    });
  }
});

// Start recording
router.post('/:callId/record', authenticate, async (req, res) => {
  try {
    await callManager.startRecording(req.params.callId);
    
    res.json({
      success: true,
      message: 'Recording started'
    });
  } catch (error) {
    logger.error('Error starting recording:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start recording'
    });
  }
});

// Stop recording
router.post('/:callId/record/stop', authenticate, async (req, res) => {
  try {
    await callManager.stopRecording(req.params.callId);
    
    res.json({
      success: true,
      message: 'Recording stopped'
    });
  } catch (error) {
    logger.error('Error stopping recording:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stop recording'
    });
  }
});

module.exports = router;
