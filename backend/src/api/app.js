const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const logger = require('../utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const extensionRoutes = require('./routes/extensions');
const callRoutes = require('./routes/calls');
const didRoutes = require('./routes/did-numbers');
const recordingRoutes = require('./routes/recordings');
const ivrRoutes = require('./routes/ivr');
const queueRoutes = require('./routes/queues');
const statsRoutes = require('./routes/stats');
const sipStatusRoutes = require('./routes/sip-status');

const app = express();

// Trust proxy (Nginx orqali proxy qilinganda kerak)
// Faqat Nginx dan kelayotgan so'rovlarni trust qilish
app.set('trust proxy', 1); // Faqat birinchi proxy ni trust qilish

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
// validate: false va custom keyGenerator bilan trust proxy muammosini hal qilish
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // validate ni butunlay o'chirish - xatolarni oldini olish uchun
  skip: (req) => {
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Custom IP olish - Nginx dan kelayotgan IP ni to'g'ri olish
    // validate o'chirilgani uchun bu xatolarni oldini oladi
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

// Rate limiter ni faqat API uchun ishlatish
app.use('/api/', limiter);

// Static files (frontend)
app.use(express.static('frontend/public'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PBX System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth/login',
      extensions: '/api/v1/extensions',
      calls: '/api/v1/calls',
      stats: '/api/v1/stats'
    },
    documentation: 'https://call.soundz.uz/api/v1'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/extensions', extensionRoutes);
app.use('/api/v1/calls', callRoutes);
app.use('/api/v1/did-numbers', didRoutes);
app.use('/api/v1/recordings', recordingRoutes);
app.use('/api/v1/ivr-menus', ivrRoutes);
app.use('/api/v1/queues', queueRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/sip-status', sipStatusRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

module.exports = app;
