const dgram = require('dgram');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const DIDNumber = require('../../database/models/DIDNumber');
const { generateDigestResponse, parseSipMessage } = require('../../utils/helpers');

class SIPTrunkManager {
  constructor() {
    this.socket = null;
    this.trunks = new Map(); // DID number -> trunk info
    this.activeCalls = new Map(); // call-id -> call session
    this.registrations = new Map(); // trunk-id -> registration state
  }

  async initialize() {
    try {
      // Create UDP socket for SIP
      this.socket = dgram.createSocket('udp4');
      
      this.socket.on('message', (msg, rinfo) => {
        this.handleMessage(msg, rinfo);
      });

      this.socket.on('error', (err) => {
        logger.error('SIP Trunk Manager socket error:', err);
      });

      // Bind to SIP port
      const sipPort = config.sip.server.trunkPort || config.sip.server.port;
      this.socket.bind(sipPort, () => {
        logger.info(`SIP Trunk Manager listening on port ${sipPort}`);
      });

      // Load and register all active DID numbers
      const didNumbers = await DIDNumber.findAll({ enabled: true });
      
      for (const did of didNumbers) {
        await this.registerTrunk(did);
      }
      
      logger.info(`SIP Trunk Manager initialized with ${didNumbers.length} trunks`);
    } catch (error) {
      logger.error('Error initializing SIP Trunk Manager:', error);
      throw error;
    }
  }

  async registerTrunk(didNumber) {
    try {
      logger.info(`Registering trunk for DID ${didNumber.number}...`);

      // Store trunk info
      this.trunks.set(didNumber.id, {
        didNumber,
        registered: false,
        expiresAt: 0,
        contactUri: null
      });

      // Send REGISTER request
      await this.sendRegister(didNumber);

      // Schedule re-registration (every 30 minutes)
      setInterval(() => {
        this.sendRegister(didNumber);
      }, 30 * 60 * 1000);

    } catch (error) {
      logger.error(`Error registering trunk ${didNumber.number}:`, error);
      throw error;
    }
  }

  async sendRegister(didNumber) {
    try {
      const trunkServer = didNumber.provider || config.sip.trunk.server;
      const trunkPort = config.sip.trunk.port || 5060;
      
      // Get server IP (simplified - in production use DNS lookup)
      const serverAddress = trunkServer;
      
      const registerRequest = this.buildRegisterRequest(didNumber, trunkServer);
      
      this.socket.send(registerRequest, trunkPort, serverAddress, (err) => {
        if (err) {
          logger.error(`Error sending REGISTER for ${didNumber.number}:`, err);
        } else {
          logger.info(`REGISTER sent for DID ${didNumber.number}`);
        }
      });
    } catch (error) {
      logger.error(`Error sending REGISTER:`, error);
    }
  }

  buildRegisterRequest(didNumber, server) {
    const callId = this.generateCallId();
    const branch = this.generateBranch();
    const cseq = Math.floor(Math.random() * 10000);
    
    const fromTag = this.generateTag();
    const toTag = this.generateTag();

    const request = `REGISTER sip:${server} SIP/2.0\r
Via: SIP/2.0/UDP ${config.sip.server.domain}:${config.sip.server.port};branch=${branch}\r
Max-Forwards: 70\r
From: <sip:${didNumber.trunkUsername}@${server}>;tag=${fromTag}\r
To: <sip:${didNumber.trunkUsername}@${server}>;tag=${toTag}\r
Call-ID: ${callId}\r
CSeq: ${cseq} REGISTER\r
Contact: <sip:${didNumber.trunkUsername}@${config.sip.server.domain}:${config.sip.server.port}>\r
Expires: 3600\r
Content-Length: 0\r
\r
`;

    return Buffer.from(request);
  }

  async handleMessage(msg, rinfo) {
    try {
      const message = msg.toString();
      const lines = message.split('\r\n');
      const requestLine = lines[0];

      if (requestLine.startsWith('SIP/2.0')) {
        // Response
        await this.handleResponse(message, rinfo);
      } else if (requestLine.startsWith('INVITE')) {
        // Incoming call
        await this.handleIncomingCall(message, rinfo);
      } else if (requestLine.startsWith('REGISTER')) {
        // Registration request (shouldn't happen for trunk)
        logger.warn('Unexpected REGISTER request received');
      }
    } catch (error) {
      logger.error('Error handling SIP message:', error);
    }
  }

  async handleResponse(message, rinfo) {
    const lines = message.split('\r\n');
    const statusLine = lines[0];
    const statusCode = parseInt(statusLine.split(' ')[1]);

    if (statusCode >= 200 && statusCode < 300) {
      // Success response
      if (message.includes('REGISTER')) {
        logger.info('✅ Trunk registration successful');
        // Extract contact and expires from response
        // Update registration state
      }
    } else if (statusCode === 401 || statusCode === 407) {
      // Authentication required
      logger.info('Authentication required, sending authenticated REGISTER');
      // Handle digest authentication
    } else {
      logger.warn(`Registration failed with status ${statusCode}`);
    }
  }

  async handleIncomingCall(message, rinfo) {
    try {
      const parsed = parseSipMessage(message);
      const callId = parsed.headers['Call-ID'];
      const from = parsed.headers.From;
      const to = parsed.headers.To;
      
      // Extract DID number from To header
      const toUri = this.extractUri(to);
      const didNumber = await this.findDIDByUri(toUri);

      if (!didNumber) {
        logger.warn(`No DID found for URI: ${toUri}`);
        this.sendResponse(rinfo, 404, message);
        return;
      }

      logger.info(`Incoming call to DID ${didNumber.number}, Call-ID: ${callId}`);

      // Route call
      const router = require('../routing/did-router');
      const route = await router.routeDID(didNumber.id);

      if (!route) {
        logger.warn(`No route found for DID ${didNumber.number}`);
        this.sendResponse(rinfo, 404, message);
        return;
      }

      // Store call session
      this.activeCalls.set(callId, {
        didNumber,
        route,
        from,
        to,
        rinfo,
        state: 'ringing'
      });

      // Handle call routing
      const callHandler = require('../handlers/call-handler');
      await callHandler.handleIncomingCall(message, rinfo, route, callId);

    } catch (error) {
      logger.error('Error handling incoming call:', error);
      if (rinfo) {
        this.sendResponse(rinfo, 500, message);
      }
    }
  }

  async findDIDByUri(uri) {
    // Extract number from URI
    const match = uri.match(/sip:(\d+)@/);
    if (match) {
      const number = match[1];
      return await DIDNumber.findByNumber(number);
    }
    return null;
  }

  extractUri(header) {
    const match = header.match(/<([^>]+)>/);
    return match ? match[1] : header.split(' ')[0];
  }

  sendResponse(rinfo, statusCode, originalMessage) {
    const parsed = parseSipMessage(originalMessage);
    const via = parsed.headers.Via;
    const from = parsed.headers.From;
    const to = parsed.headers.To;
    const callId = parsed.headers['Call-ID'];
    const cseq = parsed.headers.CSeq;

    const response = `SIP/2.0 ${statusCode} ${this.getStatusText(statusCode)}\r
Via: ${via}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Content-Length: 0\r
\r
`;

    this.socket.send(Buffer.from(response), rinfo.port, rinfo.address, (err) => {
      if (err) {
        logger.error('Error sending SIP response:', err);
      }
    });
  }

  getStatusText(code) {
    const statuses = {
      200: 'OK',
      404: 'Not Found',
      500: 'Server Internal Error'
    };
    return statuses[code] || 'Unknown';
  }

  generateCallId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + '@' + 
           config.sip.server.domain;
  }

  generateBranch() {
    return 'z9hG4bK' + Math.random().toString(36).substring(2, 15);
  }

  generateTag() {
    return Math.random().toString(36).substring(2, 15);
  }
}

module.exports = new SIPTrunkManager();
