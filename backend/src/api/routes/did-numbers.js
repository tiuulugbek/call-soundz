const express = require('express');
const router = express.Router();
const DIDNumber = require('../../database/models/DIDNumber');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../../utils/logger');

// Get all DID numbers
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.enabled !== undefined) {
      filters.enabled = req.query.enabled === 'true';
    }
    if (req.query.provider) {
      filters.provider = req.query.provider;
    }
    
    const didNumbers = await DIDNumber.findAll(filters);
    
    res.json({
      success: true,
      data: didNumbers
    });
  } catch (error) {
    logger.error('Error fetching DID numbers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DID numbers'
    });
  }
});

// Get DID number by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const didNumber = await DIDNumber.findById(req.params.id);
    
    if (!didNumber) {
      return res.status(404).json({
        success: false,
        error: 'DID number not found'
      });
    }
    
    res.json({
      success: true,
      data: didNumber
    });
  } catch (error) {
    logger.error('Error fetching DID number:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DID number'
    });
  }
});

// Create new DID number
router.post('/', authenticate, validate(schemas.createDID), async (req, res) => {
  try {
    // Check if number already exists
    const existing = await DIDNumber.findByNumber(req.body.number);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'DID number already exists'
      });
    }
    
    const didNumber = await DIDNumber.create(req.body);
    
    res.status(201).json({
      success: true,
      data: didNumber
    });
  } catch (error) {
    logger.error('Error creating DID number:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create DID number'
    });
  }
});

// Update DID number
router.put('/:id', authenticate, async (req, res) => {
  try {
    const didNumber = await DIDNumber.update(req.params.id, req.body);
    
    if (!didNumber) {
      return res.status(404).json({
        success: false,
        error: 'DID number not found'
      });
    }
    
    res.json({
      success: true,
      data: didNumber
    });
  } catch (error) {
    logger.error('Error updating DID number:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update DID number'
    });
  }
});

// Update DID routing
router.put('/:id/route', authenticate, validate(schemas.updateDIDRoute), async (req, res) => {
  try {
    const { routeType, routeTargetId } = req.body;
    
    const didNumber = await DIDNumber.update(req.params.id, {
      routeType,
      routeTargetId
    });
    
    if (!didNumber) {
      return res.status(404).json({
        success: false,
        error: 'DID number not found'
      });
    }
    
    res.json({
      success: true,
      data: didNumber
    });
  } catch (error) {
    logger.error('Error updating DID route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update DID route'
    });
  }
});

// Delete DID number
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const didNumber = await DIDNumber.delete(req.params.id);
    
    if (!didNumber) {
      return res.status(404).json({
        success: false,
        error: 'DID number not found'
      });
    }
    
    res.json({
      success: true,
      data: didNumber
    });
  } catch (error) {
    logger.error('Error deleting DID number:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete DID number'
    });
  }
});

module.exports = router;
