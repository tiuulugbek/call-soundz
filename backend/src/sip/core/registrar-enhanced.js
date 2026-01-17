const dgram = require('dgram');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const Extension = require('../../database/models/Extension');
const { 
  extractUsernameFromUri, 
  generateDigestResponse,
  formatSipUri 
} = require('../../utils/helpers');

class SIPRegistrar {
  constructor() {
    this.server = null;
    this.port = config.sip.server.port;
    this.host = config.sip.server.host;
    this.registrations = new Map(); // username -> registration info
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = dgram.createSocket('udp4');

      this.server.on('message', (msg, rinfo) => {
        this.handleMessage(msg, rinfo);
      });

      this.server.on('error', (err) => {
        logger.error('SIP Server error:', err);
        reject(err);
      });

      this.server.bind(this.port, this.host, () => {
        logger.info(`SIP Registrar started on ${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  getExtensionContact(username) {
    const registration = this.registrations.get(username);
    if (registration && registration.expiresAt > Date.now()) {
      return registration.contactUri;
    }
    return null;
  }

  async handleMessage(msg, rinfo) {
    try {
      const message = msg.toString();
      const lines = message.split('\r\n');
      const requestLine = lines[0];

      if (requestLine.startsWith('REGISTER')) {
        await this.handleRegister(message, rinfo);
      } else if (requestLine.startsWith('INVITE')) {
        await this.handleInvite(message, rinfo);
      } else if (requestLine.startsWith('ACK')) {
        await this.handleAck(message, rinfo);
      } else if (requestLine.startsWith('BYE')) {
        await this.handleBye(message, rinfo);
      }
    } catch (error) {
      logger.error('Error handling SIP message:', error);
    }
  }

  async handleRegister(message, rinfo) {
    // Implementation from existing registrar.js
    // ... (keep existing implementation)
  }

  async handleInvite(message, rinfo) {
    // Implementation from existing registrar.js
    // ... (keep existing implementation)
  }

  async handleAck(message, rinfo) {
    // Implementation
  }

  async handleBye(message, rinfo) {
    // Implementation
  }
}

module.exports = SIPRegistrar;
