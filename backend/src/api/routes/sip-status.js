const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const logger = require('../../utils/logger');

// Get SIP Trunk registration status
router.get('/trunks', authenticate, async (req, res) => {
  try {
    const SIPTrunkManager = require('../../sip/trunk/manager');
    const trunkManager = global.sipTrunkManager;
    
    if (!trunkManager) {
      return res.json({
        success: false,
        error: 'SIP Trunk Manager not initialized'
      });
    }

    const trunks = [];
    for (const [didId, trunkInfo] of trunkManager.trunks.entries()) {
      trunks.push({
        didId,
        number: trunkInfo.didNumber.number,
        provider: trunkInfo.didNumber.provider,
        registered: trunkInfo.registered,
        expiresAt: trunkInfo.expiresAt,
        contactUri: trunkInfo.contactUri
      });
    }

    res.json({
      success: true,
      data: trunks
    });
  } catch (error) {
    logger.error('Error fetching trunk status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trunk status'
    });
  }
});

// Get Extension registration status
router.get('/extensions', authenticate, async (req, res) => {
  try {
    const SIPRegistrar = require('../../sip/core/registrar');
    const registrar = global.sipRegistrar;
    
    if (!registrar) {
      return res.json({
        success: false,
        error: 'SIP Registrar not initialized'
      });
    }

    // Get registered extensions
    const registeredExtensions = registrar.getRegisteredExtensions ? registrar.getRegisteredExtensions() : [];
    
    res.json({
      success: true,
      data: registeredExtensions
    });
  } catch (error) {
    logger.error('Error fetching extension status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extension status'
    });
  }
});

// Get SIP server status
router.get('/server', authenticate, async (req, res) => {
  try {
    const SIPRegistrar = require('../../sip/core/registrar');
    const SIPTrunkManager = require('../../sip/trunk/manager');
    
    const registrar = global.sipRegistrar;
    const trunkManager = global.sipTrunkManager;
    
    res.json({
      success: true,
      data: {
        registrar: {
          running: !!registrar,
          port: registrar ? registrar.port : null
        },
        trunkManager: {
          running: !!trunkManager,
          trunksCount: trunkManager ? trunkManager.trunks.size : 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching SIP server status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SIP server status'
    });
  }
});

module.exports = router;
