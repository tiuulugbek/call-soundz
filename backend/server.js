const http = require('http');
const socketIo = require('socket.io');
const app = require('./src/api/app');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const WebSocketManager = require('./src/api/websocket');
const SIPRegistrar = require('./src/sip/core/registrar');

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize WebSocket manager
const wsManager = new WebSocketManager(io);

// Make wsManager available globally
global.wsManager = wsManager;

// Initialize SIP Registrar
const sipRegistrar = new SIPRegistrar();
global.sipRegistrar = sipRegistrar;

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

async function start() {
  try {
    // Start SIP Registrar
    await sipRegistrar.start();
    
    // Load extension passwords into cache on server start
    // Note: This only works if extensions were created/updated after server last started
    // For persistent password cache, use Redis or database storage
    try {
      const Extension = require('./src/database/models/Extension');
      const extensions = await Extension.findAll();
      logger.info(`Loading ${extensions.length} extensions on startup...`);
      // Note: We cannot load passwords from database as they are hashed with bcrypt
      // Passwords must be set via API (create/update) to populate cache
      logger.info('Extension passwords will be loaded from cache when extensions are created/updated');
    } catch (error) {
      logger.warn('Could not load extensions on startup:', error.message);
    }
    
    // Start HTTP server
    server.listen(PORT, HOST, () => {
      logger.info(`PBX System server started on ${HOST}:${PORT}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`SIP Domain: ${config.sip.server.domain}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  sipRegistrar.stop();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  sipRegistrar.stop();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { server, io };

// Auto-migrate trunk_password column
const pool = require('./src/database/connection');
(async () => {
    try {
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'did_numbers' AND column_name = 'trunk_password'
        `);
        
        if (checkResult.rows.length === 0) {
            await pool.query(`
                ALTER TABLE did_numbers 
                ADD COLUMN trunk_password VARCHAR(255)
            `);
            console.log('✅ trunk_password column qo\'shildi');
        }
    } catch (error) {
        console.error('⚠️  trunk_password migration xatosi:', error.message);
    }
})();

// Initialize SIP Trunk Manager
const SIPTrunkManager = require('./src/sip/trunk/manager');
const sipTrunkManagerInstance = SIPTrunkManager;

(async () => {
  try {
    await sipTrunkManagerInstance.initialize();
    logger.info('✅ SIP Trunk Manager initialized');
  } catch (error) {
    logger.error('❌ SIP Trunk Manager initialization failed:', error);
    logger.error('Error stack:', error.stack);
  }
})();
