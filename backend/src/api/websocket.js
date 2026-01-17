const logger = require('../utils/logger');

class WebSocketManager {
  constructor(io) {
    this.io = io;
    this.setupHandlers();
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });

      // Subscribe to call events
      socket.on('subscribe:calls', () => {
        socket.join('calls');
        logger.info(`Client ${socket.id} subscribed to call events`);
      });

      // Subscribe to extension events
      socket.on('subscribe:extensions', () => {
        socket.join('extensions');
        logger.info(`Client ${socket.id} subscribed to extension events`);
      });
    });
  }

  emitCallEvent(event, data) {
    this.io.to('calls').emit(`call:${event}`, data);
  }

  emitExtensionEvent(event, data) {
    this.io.to('extensions').emit(`extension:${event}`, data);
  }

  emitSystemEvent(event, data) {
    this.io.emit(`system:${event}`, data);
  }
}

module.exports = WebSocketManager;
