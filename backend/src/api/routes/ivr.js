const express = require('express');
const router = express.Router();
const IVR = require('../../database/models/IVR');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const logger = require('../../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.ivr.audioPath;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ivr-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.wav', '.mp3', '.ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only WAV, MP3, OGG are allowed.'));
    }
  }
});

// Get all IVR menus
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {};
    if (req.query.enabled !== undefined) {
      filters.enabled = req.query.enabled === 'true';
    }
    
    const ivrMenus = await IVR.findAll(filters);
    
    res.json({
      success: true,
      data: ivrMenus
    });
  } catch (error) {
    logger.error('Error fetching IVR menus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IVR menus'
    });
  }
});

// Get IVR menu by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ivrMenu = await IVR.findById(req.params.id);
    
    if (!ivrMenu) {
      return res.status(404).json({
        success: false,
        error: 'IVR menu not found'
      });
    }
    
    res.json({
      success: true,
      data: ivrMenu
    });
  } catch (error) {
    logger.error('Error fetching IVR menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IVR menu'
    });
  }
});

// Create new IVR menu
router.post('/', authenticate, validate(schemas.createIVR), async (req, res) => {
  try {
    const ivrMenu = await IVR.create(req.body);
    
    res.status(201).json({
      success: true,
      data: ivrMenu
    });
  } catch (error) {
    logger.error('Error creating IVR menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create IVR menu'
    });
  }
});

// Update IVR menu
router.put('/:id', authenticate, async (req, res) => {
  try {
    const ivrMenu = await IVR.update(req.params.id, req.body);
    
    if (!ivrMenu) {
      return res.status(404).json({
        success: false,
        error: 'IVR menu not found'
      });
    }
    
    res.json({
      success: true,
      data: ivrMenu
    });
  } catch (error) {
    logger.error('Error updating IVR menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update IVR menu'
    });
  }
});

// Delete IVR menu
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const ivrMenu = await IVR.delete(req.params.id);
    
    if (!ivrMenu) {
      return res.status(404).json({
        success: false,
        error: 'IVR menu not found'
      });
    }
    
    res.json({
      success: true,
      data: ivrMenu
    });
  } catch (error) {
    logger.error('Error deleting IVR menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete IVR menu'
    });
  }
});

// Upload greeting audio
router.post('/:id/greeting', authenticate, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }
    
    const ivrMenu = await IVR.update(req.params.id, {
      greetingFile: req.file.filename
    });
    
    if (!ivrMenu) {
      // Delete uploaded file if IVR not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        error: 'IVR menu not found'
      });
    }
    
    res.json({
      success: true,
      data: ivrMenu
    });
  } catch (error) {
    logger.error('Error uploading greeting:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to upload greeting'
    });
  }
});

module.exports = router;
