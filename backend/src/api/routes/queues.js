const express = require('express');
const router = express.Router();
const Queue = require('../../database/models/Queue');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../../utils/logger');

// Get all queues
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.enabled !== undefined) {
      filters.enabled = req.query.enabled === 'true';
    }
    
    const queues = await Queue.findAll(filters);
    
    res.json({
      success: true,
      data: queues
    });
  } catch (error) {
    logger.error('Error fetching queues:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queues'
    });
  }
});

// Get queue by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }
    
    const members = await Queue.getMembers(req.params.id);
    
    res.json({
      success: true,
      data: {
        ...queue,
        members
      }
    });
  } catch (error) {
    logger.error('Error fetching queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queue'
    });
  }
});

// Create new queue
router.post('/', authenticate, validate(schemas.createQueue), async (req, res) => {
  try {
    const queue = await Queue.create(req.body);
    
    res.status(201).json({
      success: true,
      data: queue
    });
  } catch (error) {
    logger.error('Error creating queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create queue'
    });
  }
});

// Update queue
router.put('/:id', authenticate, async (req, res) => {
  try {
    const queue = await Queue.update(req.params.id, req.body);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }
    
    res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    logger.error('Error updating queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update queue'
    });
  }
});

// Delete queue
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const queue = await Queue.delete(req.params.id);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }
    
    res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    logger.error('Error deleting queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete queue'
    });
  }
});

// Add member to queue
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const { extensionId, priority = 0 } = req.body;
    
    if (!extensionId) {
      return res.status(400).json({
        success: false,
        error: 'extensionId is required'
      });
    }
    
    await Queue.addMember(req.params.id, extensionId, priority);
    
    const members = await Queue.getMembers(req.params.id);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    logger.error('Error adding queue member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add queue member'
    });
  }
});

// Remove member from queue
router.delete('/:id/members/:memberId', authenticate, async (req, res) => {
  try {
    await Queue.removeMember(req.params.id, req.params.memberId);
    
    res.json({
      success: true,
      message: 'Member removed from queue'
    });
  } catch (error) {
    logger.error('Error removing queue member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove queue member'
    });
  }
});

// Get queue statistics
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }
    
    // TODO: Implement actual queue statistics
    // This would track calls in queue, wait times, etc.
    
    res.json({
      success: true,
      data: {
        queueId: queue.id,
        queueName: queue.name,
        members: await Queue.getMembers(req.params.id),
        stats: {
          callsInQueue: 0,
          averageWaitTime: 0,
          totalCalls: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch queue statistics'
    });
  }
});

module.exports = router;
