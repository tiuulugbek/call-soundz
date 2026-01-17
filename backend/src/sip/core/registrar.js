const dgram = require('dgram');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const Extension = require('../../database/models/Extension');
const DIDNumber = require('../../database/models/DIDNumber');
const pool = require('../../database/connection');
const crypto = require('crypto');
const didRouter = require('../routing/did-router');
const { 
  extractUsernameFromUri, 
  generateDigestResponse,
  formatSipUri,
  calculateMD5
} = require('../../utils/helpers');

// In-memory password cache for SIP authentication
// In production, use Redis or another secure cache
const sipPasswordCache = new Map();

class SIPRegistrar {
  constructor() {
    this.server = null;
    this.port = config.sip.server.port;
    this.host = config.sip.server.host;
    // Call session tracking: callId -> { originalCallId, direction, fromRinfo, toRinfo, state, ... }
    this.activeCalls = new Map();
    // Trunk registration tracking
    this.trunkRegistrations = new Map(); // trunkServer -> { registered: boolean, expires: number, registrationTimer: Timer }
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

      this.server.bind(this.port, this.host, async () => {
        logger.info(`SIP Registrar started on ${this.host}:${this.port}`);
        // Register with trunk servers after startup
        await this.registerWithTrunks();
        resolve();
      });
    });
  }

  async handleMessage(msg, rinfo) {
    let message = null;
    let requestLine = null;
    
    try {
      message = msg.toString();
      
      // Info-level logging - hamma SIP xabarlarni ko'rish uchun
      logger.info(`[SIP] Received message from ${rinfo.address}:${rinfo.port}`);
      // Console.log for immediate debugging
      console.log(`[SIP DEBUG] Received UDP packet from ${rinfo.address}:${rinfo.port}, length: ${msg.length}`);
      
      const lines = message.split('\r\n');
      requestLine = lines[0];
      
      if (!requestLine) {
        logger.warn('[SIP] Empty request line');
        return;
      }
      
      logger.info(`[SIP] Request: ${requestLine.substring(0, 80)}`);

      // Check if this is a SIP response (starts with SIP/2.0)
      if (requestLine.startsWith('SIP/2.0')) {
        const statusMatch = requestLine.match(/SIP\/2\.0\s+(\d+)\s+(.+)/);
        const statusCode = statusMatch ? statusMatch[1] : 'unknown';
        const statusText = statusMatch ? statusMatch[2] : '';
        
        // Log ALL responses from trunk server (81.95.237.38)
        if (rinfo.address === '81.95.237.38' || rinfo.address.includes('81.95.237')) {
          logger.info(`[SIP] ⚠️ TRUNK RESPONSE ${statusCode} ${statusText} from ${rinfo.address}:${rinfo.port}`);
          logger.info(`[SIP] Full trunk response:\n${message.substring(0, 500)}${message.length > 500 ? '...' : ''}`);
        } else {
          logger.info(`[SIP] Response ${statusCode} received from ${rinfo.address}:${rinfo.port}: ${requestLine.substring(0, 80)}`);
        }
        
        // Check if this is a trunk registration response
        const callId = this.extractHeader(message, 'Call-ID');
        if (callId) {
          for (const [trunkServer, trunkInfo] of this.trunkRegistrations) {
            if (trunkInfo.callId === callId) {
              logger.info(`[SIP] ⚠️ This is trunk registration response for ${trunkServer}`);
              await this.handleTrunkRegistrationResponse(message, { ...rinfo, statusCode: parseInt(statusCode) });
              return;
            }
          }
        }
        
        // Handle regular call responses
        await this.handleResponse(message, rinfo);
        return;
      }

      if (requestLine.startsWith('REGISTER')) {
        logger.info(`[SIP] Processing REGISTER from ${rinfo.address}:${rinfo.port}`);
        await this.handleRegister(message, rinfo);
      } else if (requestLine.startsWith('INVITE')) {
        logger.info(`[SIP] INVITE received from ${rinfo.address}:${rinfo.port}`);
        await this.handleInvite(message, rinfo);
      } else if (requestLine.startsWith('ACK')) {
        logger.info(`[SIP] ACK received from ${rinfo.address}:${rinfo.port}`);
        await this.handleAck(message, rinfo);
      } else if (requestLine.startsWith('BYE')) {
        logger.info(`[SIP] BYE received from ${rinfo.address}:${rinfo.port}`);
        await this.handleBye(message, rinfo);
      } else if (requestLine.startsWith('CANCEL')) {
        logger.info(`[SIP] CANCEL received from ${rinfo.address}:${rinfo.port}`);
        await this.handleCancel(message, rinfo);
      } else if (requestLine.startsWith('OPTIONS')) {
        // OPTIONS metodini qo'llab-quvvatlash (SIP keepalive uchun)
        logger.info(`[SIP] OPTIONS request from ${rinfo.address}:${rinfo.port}`);
        this.handleOptions(message, rinfo);
      } else {
        logger.warn(`[SIP] Unhandled method: ${requestLine}`);
      }
    } catch (error) {
      logger.error('[SIP] Error handling SIP message:', error);
      logger.error('[SIP] Error stack:', error.stack);
      // Always try to send error response if we have the original message
      if (message && requestLine) {
        try {
          this.sendResponse(rinfo, '500 Internal Server Error', message);
        } catch (sendError) {
          logger.error('[SIP] Error sending error response:', sendError);
        }
      }
    }
  }

  async handleRegister(message, rinfo) {
    try {
      const lines = message.split('\r\n');
      const requestLine = lines[0];
      
      logger.debug(`Received REGISTER from ${rinfo.address}:${rinfo.port}`);
      logger.debug(`Request line: ${requestLine}`);
      
      // Extract username from From header
      const fromHeader = lines.find(l => l.startsWith('From:'));
      const username = extractUsernameFromUri(fromHeader);
      
      if (!username) {
        logger.warn('No username found in From header');
        this.sendResponse(rinfo, '400 Bad Request', message);
        return;
      }
      
      logger.debug(`Extracted username: ${username}`);

      // Find extension
      const extension = await Extension.findByUsername(username);
      if (!extension || !extension.enabled) {
        logger.warn(`Extension not found or disabled: ${username}`);
        this.sendResponse(rinfo, '404 Not Found', message);
        return;
      }
      
      logger.debug(`Extension found: ${extension.username}, enabled: ${extension.enabled}`);

      // Extract Contact header
      const contactHeader = lines.find(l => l.startsWith('Contact:'));
      const expiresHeader = lines.find(l => l.startsWith('Expires:'));
      const expires = expiresHeader ? parseInt(expiresHeader.split(':')[1].trim()) : 3600;

      // Handle authentication if needed
      const authHeader = lines.find(l => l.startsWith('Authorization:'));
      if (!authHeader) {
        // Send 401 Unauthorized with challenge
        logger.debug(`No Authorization header, sending 401 challenge for ${username}`);
        this.send401Challenge(rinfo, message, username);
        return;
      }

      logger.debug(`Authorization header present, verifying auth for ${username}`);

      // Verify authentication
      const authValid = await this.verifyAuth(authHeader, extension, message);
      if (!authValid) {
        logger.warn(`Authentication failed for ${username}`);
        this.sendResponse(rinfo, '403 Forbidden', message);
        return;
      }

      logger.debug(`Authentication successful for ${username}`);

      // Extract Contact URI properly
      let contactUri;
      if (contactHeader) {
        // Contact header can be: Contact: <sip:user@host:port>;expires=3600
        // or: Contact: sip:user@host:port;expires=3600
        const contactMatch = contactHeader.match(/<([^>]+)>|sip:([^\s;]+)/);
        if (contactMatch) {
          contactUri = contactMatch[1] || contactMatch[2];
        } else {
          // Fallback: extract after Contact:
          contactUri = contactHeader.split(':').slice(1).join(':').split(';')[0].trim();
        }
      }
      
      if (!contactUri) {
        // Default contact URI
        contactUri = `sip:${username}@${rinfo.address}:${rinfo.port}`;
      }
      
      logger.debug(`Contact URI: ${contactUri}, expires: ${expires}`);
      
      await pool.query(`
        INSERT INTO extension_registrations (extension_id, contact_uri, expires, last_updated)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (extension_id)
        DO UPDATE SET contact_uri = $2, expires = $3, last_updated = NOW()
      `, [extension.id, contactUri, expires]);

      // Send 200 OK
      const response = this.buildRegisterResponse(message, expires, contactUri, rinfo);
      this.sendRawResponse(rinfo, response);

      logger.info(`Extension ${username} registered from ${rinfo.address}:${rinfo.port}`);
    
      // Emit WebSocket event
      if (global.wsManager) {
        global.wsManager.emitExtensionEvent('registered', {
          extensionId: extension.id,
          username: extension.username,
          contactUri
        });
      }
    } catch (error) {
      logger.error('Error in handleRegister:', error);
      logger.error('Error stack:', error.stack);
      this.sendResponse(rinfo, '500 Internal Server Error', message);
    }
  }

  send401Challenge(rinfo, originalMessage, username) {
    const nonce = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const realm = config.sip.server.domain;
    
    // Extract To header and add tag if not present
    let toHeader = this.extractHeader(originalMessage, 'To');
    if (!toHeader.includes('tag=')) {
      const tag = this.generateTag();
      toHeader += ';tag=' + tag;
    }
    
    // Fix Via header - add received and rport for NAT traversal
    let viaHeader = this.extractHeader(originalMessage, 'Via');
    // Add received parameter if not present
    if (!viaHeader.includes('received=')) {
      viaHeader += `;received=${rinfo.address}`;
    }
    // Add rport parameter if not present
    if (!viaHeader.includes('rport=')) {
      viaHeader += `;rport=${rinfo.port}`;
    }
    
    const response = `SIP/2.0 401 Unauthorized\r
Via: ${viaHeader}\r
From: ${this.extractHeader(originalMessage, 'From')}\r
To: ${toHeader}\r
Call-ID: ${this.extractHeader(originalMessage, 'Call-ID')}\r
CSeq: ${this.extractHeader(originalMessage, 'CSeq')}\r
WWW-Authenticate: Digest realm="${realm}", nonce="${nonce}", algorithm=MD5, qop="auth"\r
Content-Length: 0\r
\r
`;
    
    logger.info(`[SIP] Sending 401 challenge for ${username} to ${rinfo.address}:${rinfo.port}`);
    logger.debug(`Sending 401 challenge for ${username} with nonce ${nonce}`);
    this.sendRawResponse(rinfo, response);
  }
  
  generateTag() {
    return crypto.randomBytes(8).toString('hex');
  }

  async verifyAuth(authHeader, extension, message) {
    try {
      // Parse Authorization header: Digest username="...", realm="...", nonce="...", uri="...", response="...", etc.
      const authParams = this.parseAuthHeader(authHeader);
      
      if (!authParams.username || !authParams.realm || !authParams.nonce || !authParams.uri || !authParams.response) {
        logger.warn('Missing required Digest auth parameters');
        return false;
      }

      // Extract username and verify it matches extension
      const username = authParams.username;
      if (username !== extension.username) {
        logger.warn(`Username mismatch: ${username} != ${extension.username}`);
        return false;
      }

      // Extract method and URI from request
      const requestLine = message.split('\r\n')[0];
      const method = requestLine.split(' ')[0]; // REGISTER
      const requestUri = authParams.uri; // URI from Authorization header
      
      const realm = config.sip.server.domain;
      const nonce = authParams.nonce;
      const nc = authParams.nc || '00000001'; // nonce count
      const cnonce = authParams.cnonce || '';
      const qop = authParams.qop || null; // qop might not be present
      
      // Get password from cache
      const password = await this.getExtensionPassword(extension);
      
      if (!password) {
        logger.warn(`Could not retrieve password for extension ${extension.username}. Please reset the password.`);
        logger.debug(`Available cache keys: ${Array.from(sipPasswordCache.keys()).join(', ')}`);
        return false;
      }

      // Calculate expected response based on whether qop is present
      let expectedResponse;
      if (qop) {
        // qop is present: MD5(HA1:nonce:nc:cnonce:qop:HA2)
        expectedResponse = generateDigestResponse(
          username,
          realm,
          password,
          method,
          requestUri,
          nonce,
          nc,
          cnonce,
          qop
        );
      } else {
        // qop is not present: MD5(HA1:nonce:HA2)
        const ha1 = calculateMD5(`${username}:${realm}:${password}`);
        const ha2 = calculateMD5(`${method}:${requestUri}`);
        expectedResponse = calculateMD5(`${ha1}:${nonce}:${ha2}`);
      }
      
      logger.debug(`Digest auth verification for ${username}: qop=${qop}, nc=${nc}, cnonce=${cnonce ? 'present' : 'none'}`);

      // Compare responses
      const authValid = authParams.response.toLowerCase() === expectedResponse.toLowerCase();
      
      if (!authValid) {
        logger.warn(`Digest auth verification failed for ${username}`);
        logger.debug(`Expected: ${expectedResponse}, Got: ${authParams.response}`);
      }
      
      return authValid;
    } catch (error) {
      logger.error('Error verifying authentication:', error);
      logger.error('Error stack:', error.stack);
      return false;
    }
  }

  parseAuthHeader(authHeader) {
    const params = {};
    
    // Remove "Digest " prefix if present
    let headerValue = authHeader.replace(/^Authorization:\s*Digest\s+/i, '').replace(/^Digest\s+/i, '');
    
    // Parse key="value" or key=value pairs
    // Handle both quoted and unquoted values
    const regex = /(\w+)=(?:"([^"]+)"|([^",\s]+))/g;
    let match;
    
    while ((match = regex.exec(headerValue)) !== null) {
      const key = match[1].toLowerCase();
      const value = match[2] || match[3]; // Use quoted value if present, otherwise unquoted
      params[key] = value;
    }
    
    logger.debug(`Parsed auth params: ${JSON.stringify(Object.keys(params))}`);
    return params;
  }

  async getExtensionPassword(extension) {
    // SIP Digest authentication requires the plain password
    // Since we hash passwords with bcrypt for API auth, we store plain password in cache
    
    // Check in-memory cache first
    const cachedPassword = sipPasswordCache.get(extension.username);
    if (cachedPassword) {
      logger.debug(`Password found in cache for ${extension.username}`);
      return cachedPassword;
    }
    
    // Try to get from extension object if available (from creation context)
    if (extension.sipPassword) {
      sipPasswordCache.set(extension.username, extension.sipPassword);
      return extension.sipPassword;
    }
    
    // If not in cache, try to retrieve from database
    // Note: This requires the password to be stored in a retrievable format
    // For now, return null and log warning
    logger.warn(`SIP password not available for extension ${extension.username}. Password may need to be reset.`);
    
    return null;
  }

  // Store SIP password in cache (called from extension creation/update)
  static setExtensionPassword(username, password) {
    sipPasswordCache.set(username, password);
    logger.info(`[SIP] Stored SIP password in cache for ${username}`);
    logger.debug(`Stored SIP password in cache for ${username}`);
  }

  // Clear SIP password from cache
  static clearExtensionPassword(username) {
    sipPasswordCache.delete(username);
    logger.debug(`Cleared SIP password from cache for ${username}`);
  }

  buildRegisterResponse(originalMessage, expires, contactUri, rinfo) {
    // Fix Via header - add received and rport for NAT traversal
    let via = this.extractHeader(originalMessage, 'Via');
    // Add received parameter if not present
    if (!via.includes('received=')) {
      via += `;received=${rinfo.address}`;
    }
    // Add rport parameter if not present
    if (!via.includes('rport=')) {
      via += `;rport=${rinfo.port}`;
    }
    
    const from = this.extractHeader(originalMessage, 'From');
    const to = this.extractHeader(originalMessage, 'To');
    const callId = this.extractHeader(originalMessage, 'Call-ID');
    const cseq = this.extractHeader(originalMessage, 'CSeq');
    
    return `SIP/2.0 200 OK\r
Via: ${via}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Contact: ${contactUri};expires=${expires}\r
Content-Length: 0\r
\r
`;
  }

  extractHeader(message, headerName) {
    const lines = message.split('\r\n');
    const header = lines.find(l => l.startsWith(`${headerName}:`));
    return header ? header.substring(headerName.length + 1).trim() : '';
  }

  handleOptions(message, rinfo) {
    // Respond to OPTIONS with 200 OK (SIP keepalive)
    try {
      logger.info(`[SIP] Handling OPTIONS from ${rinfo.address}:${rinfo.port}`);
      
      // Fix Via header - add received and rport for NAT traversal
      let via = this.extractHeader(message, 'Via');
      // Add received parameter if not present
      if (!via.includes('received=')) {
        via += `;received=${rinfo.address}`;
      }
      // Add rport parameter if not present
      if (!via.includes('rport=')) {
        via += `;rport=${rinfo.port}`;
      }
      
      const from = this.extractHeader(message, 'From');
      const to = this.extractHeader(message, 'To');
      const callId = this.extractHeader(message, 'Call-ID');
      const cseq = this.extractHeader(message, 'CSeq');
      
      const response = `SIP/2.0 200 OK\r
Via: ${via}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Content-Length: 0\r
\r
`;
      
      this.sendRawResponse(rinfo, response);
      logger.info(`[SIP] Sent 200 OK for OPTIONS to ${rinfo.address}:${rinfo.port}`);
    } catch (error) {
      logger.error('[SIP] Error handling OPTIONS:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  async handleInvite(message, rinfo) {
    try {
      const lines = message.split('\r\n');
      const requestLine = lines[0];
      
      logger.info(`[SIP] INVITE received from ${rinfo.address}:${rinfo.port}`);
      logger.debug(`INVITE request: ${requestLine}`);
      
      // Extract From and To headers
      const fromHeader = lines.find(l => l.startsWith('From:'));
      const toHeader = lines.find(l => l.startsWith('To:'));
      const callId = this.extractHeader(message, 'Call-ID');
      const cseq = this.extractHeader(message, 'CSeq');
      
      if (!fromHeader || !toHeader) {
        logger.warn('[SIP] Missing From or To header in INVITE');
        this.sendResponse(rinfo, '400 Bad Request', message);
        return;
      }
      
      // Extract From username (caller)
      const fromUsername = extractUsernameFromUri(fromHeader);
      if (!fromUsername) {
        logger.warn('[SIP] Could not extract username from From header');
        this.sendResponse(rinfo, '400 Bad Request', message);
        return;
      }
      
      // Extract To username/number (callee)
      // To header format: To: <sip:1001@call.soundz.uz> or To: sip:1001@call.soundz.uz
      let toUri;
      const toMatch = toHeader.match(/To:\s*(?:<)?sip:([^@>\s]+)@?/);
      if (toMatch) {
        toUri = toMatch[1];
      } else {
        // Fallback: try to extract after sip:
        const parts = toHeader.split('sip:');
        if (parts[1]) {
          toUri = parts[1].split('@')[0].split('>')[0].split(';')[0].trim();
        }
      }
      
      if (!toUri) {
        logger.warn(`[SIP] Could not extract To username from header: ${toHeader}`);
        this.sendResponse(rinfo, '400 Bad Request', message);
        return;
      }
      
      logger.info(`[SIP] Call from ${fromUsername} to ${toUri}`);
      
      // Send 100 Trying (provisional response)
      this.send100Trying(rinfo, message);
      
      // Check if this is an incoming call from trunk (To header contains DID number)
      const didNumber = await DIDNumber.findByNumber(toUri);
      if (didNumber && didNumber.enabled) {
        logger.info(`[SIP] Incoming call to DID ${didNumber.number} from ${fromUsername}`);
        // Route incoming call based on DID routing configuration
        await this.handleIncomingCall(message, rinfo, didNumber, callId);
        return;
      }
      
      // Check if caller extension is registered (for outgoing/internal calls)
      const callerExtension = await Extension.findByUsername(fromUsername);
      if (!callerExtension || !callerExtension.enabled) {
        logger.warn(`[SIP] Caller extension not found or disabled: ${fromUsername}`);
        this.sendResponse(rinfo, '403 Forbidden', message);
        return;
      }
      
      // Find callee extension
      const calleeExtension = await Extension.findByUsername(toUri);
      
      logger.debug(`[SIP] Looking for extension: ${toUri}, found: ${calleeExtension ? 'yes' : 'no'}, enabled: ${calleeExtension?.enabled}`);
      
      if (calleeExtension && calleeExtension.enabled) {
        // Internal call - forward to registered extension
        const registeredExts = await this.getRegisteredExtensions();
        logger.debug(`[SIP] Registered extensions: ${registeredExts.map(e => e.username).join(', ')}`);
        
        const registeredExt = registeredExts.find(e => e.username === toUri);
        
        if (registeredExt && registeredExt.contact_uri) {
          logger.info(`[SIP] Forwarding INVITE to registered extension ${toUri} at ${registeredExt.contact_uri}`);
          // TODO: Forward INVITE to registered extension's contact URI
          // For now, send 180 Ringing and 200 OK
          this.send180Ringing(rinfo, message);
          // After some delay, send 200 OK
          setTimeout(() => {
            this.send200OK(rinfo, message);
          }, 1000);
        } else {
          logger.warn(`[SIP] Extension ${toUri} found but not registered (enabled: ${calleeExtension.enabled}, registered: ${registeredExt ? 'yes' : 'no'})`);
          // Extension exists but not registered - still send 180 Ringing and 200 OK for testing
          // In production, this should wait for registration
          this.send180Ringing(rinfo, message);
          setTimeout(() => {
            this.send200OK(rinfo, message);
          }, 1000);
        }
      } else {
        // External call - check if it's a DID number or forward to trunk
        // Remove + prefix if present for extension lookup
        const cleanToUri = toUri.startsWith('+') ? toUri.substring(1) : toUri;
        const extWithPlus = await Extension.findByUsername(cleanToUri);
        
        if (extWithPlus && extWithPlus.enabled) {
          // Extension found with + prefix
          const registeredExts = await this.getRegisteredExtensions();
          const registeredExt = registeredExts.find(e => e.username === cleanToUri);
          
          if (registeredExt && registeredExt.contact_uri) {
            logger.info(`[SIP] Forwarding INVITE to registered extension ${cleanToUri} at ${registeredExt.contact_uri}`);
            this.send180Ringing(rinfo, message);
            setTimeout(() => {
              this.send200OK(rinfo, message);
            }, 1000);
          } else {
            logger.warn(`[SIP] Extension ${cleanToUri} found but not registered`);
            this.sendResponse(rinfo, '404 Not Found', message);
          }
        } else {
          // External call - forward to trunk
          logger.info(`[SIP] External call to ${toUri}, forwarding to trunk`);
          await this.handleOutgoingCall(message, rinfo, fromUsername, toUri, callerExtension);
        }
      }
    } catch (error) {
      logger.error('[SIP] Error handling INVITE:', error);
      logger.error('[SIP] Error stack:', error.stack);
      this.sendResponse(rinfo, '500 Internal Server Error', message);
    }
  }
  
  send100Trying(rinfo, originalMessage) {
    const via = this.extractHeader(originalMessage, 'Via');
    const from = this.extractHeader(originalMessage, 'From');
    const to = this.extractHeader(originalMessage, 'To');
    const callId = this.extractHeader(originalMessage, 'Call-ID');
    const cseq = this.extractHeader(originalMessage, 'CSeq');
    
    let viaHeader = via;
    if (!viaHeader.includes('received=')) {
      viaHeader += `;received=${rinfo.address}`;
    }
    if (!viaHeader.includes('rport=')) {
      viaHeader += `;rport=${rinfo.port}`;
    }
    
    const response = `SIP/2.0 100 Trying\r
Via: ${viaHeader}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Content-Length: 0\r
\r
`;
    
    logger.info(`[SIP] Sending 100 Trying to ${rinfo.address}:${rinfo.port}`);
    this.sendRawResponse(rinfo, response);
  }
  
  send180Ringing(rinfo, originalMessage) {
    const via = this.extractHeader(originalMessage, 'Via');
    const from = this.extractHeader(originalMessage, 'From');
    let to = this.extractHeader(originalMessage, 'To');
    if (!to.includes('tag=')) {
      to += `;tag=${this.generateTag()}`;
    }
    const callId = this.extractHeader(originalMessage, 'Call-ID');
    const cseq = this.extractHeader(originalMessage, 'CSeq');
    
    let viaHeader = via;
    if (!viaHeader.includes('received=')) {
      viaHeader += `;received=${rinfo.address}`;
    }
    if (!viaHeader.includes('rport=')) {
      viaHeader += `;rport=${rinfo.port}`;
    }
    
    const response = `SIP/2.0 180 Ringing\r
Via: ${viaHeader}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Content-Length: 0\r
\r
`;
    
    logger.info(`[SIP] Sending 180 Ringing to ${rinfo.address}:${rinfo.port}`);
    this.sendRawResponse(rinfo, response);
  }
  
  send200OK(rinfo, originalMessage, sdpBody = '') {
    const via = this.extractHeader(originalMessage, 'Via');
    const from = this.extractHeader(originalMessage, 'From');
    let to = this.extractHeader(originalMessage, 'To');
    if (!to.includes('tag=')) {
      to += `;tag=${this.generateTag()}`;
    }
    const callId = this.extractHeader(originalMessage, 'Call-ID');
    const cseq = this.extractHeader(originalMessage, 'CSeq');
    
    let viaHeader = via;
    if (!viaHeader.includes('received=')) {
      viaHeader += `;received=${rinfo.address}`;
    }
    if (!viaHeader.includes('rport=')) {
      viaHeader += `;rport=${rinfo.port}`;
    }
    
    const contactUri = `sip:${config.sip.server.domain}:${config.sip.server.port}`;
    
    const response = `SIP/2.0 200 OK\r
Via: ${viaHeader}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Contact: <${contactUri}>\r
Content-Type: application/sdp\r
Content-Length: ${Buffer.byteLength(sdpBody)}\r
\r
${sdpBody}`;
    
    logger.info(`[SIP] Sending 200 OK to ${rinfo.address}:${rinfo.port}`);
    this.sendRawResponse(rinfo, response);
  }

  async handleAck(message, rinfo) {
    try {
      const callId = this.extractHeader(message, 'Call-ID');
      logger.info(`[SIP] ACK received from ${rinfo.address}:${rinfo.port}, Call-ID: ${callId}`);
      
      // Check if this is an ACK for an outgoing call (from extension to trunk)
      const callSession = this.activeCalls.get(callId);
      if (callSession && callSession.direction === 'outgoing') {
        // This ACK is from extension, already forwarded by sendAckToTrunk when 200 OK was received
        // Just acknowledge it
        logger.info(`[SIP] ACK received from extension for outgoing call ${callId}`);
        return;
      }
      
      // For incoming calls or other cases, handle normally
      logger.debug('[SIP] ACK received');
      
    } catch (error) {
      logger.error('[SIP] Error handling ACK:', error);
    }
  }

  async handleBye(message, rinfo) {
    try {
      const callId = this.extractHeader(message, 'Call-ID');
      logger.info(`[SIP] BYE received from ${rinfo.address}:${rinfo.port}, Call-ID: ${callId}`);
      
      // Check if this is a BYE for an outgoing call (from extension to trunk)
      const callSession = this.activeCalls.get(callId);
      if (callSession && callSession.direction === 'outgoing') {
        // Forward BYE to trunk
        await this.forwardByeToTrunk(message, rinfo, callSession);
      }
      
      // Send 200 OK response to BYE request
      this.sendResponse(rinfo, '200 OK', message);
      
      logger.info(`[SIP] Call terminated from ${rinfo.address}:${rinfo.port}`);
      
      // Clean up call session
      if (callSession) {
        this.activeCalls.delete(callId);
        logger.info(`[SIP] Call session ${callId} cleaned up`);
      }
      
      // TODO: Emit WebSocket event for call termination
      // TODO: Update call status in database
    } catch (error) {
      logger.error('[SIP] Error handling BYE:', error);
      logger.error('[SIP] Error stack:', error.stack);
      this.sendResponse(rinfo, '500 Internal Server Error', message);
    }
  }

  async handleCancel(message, rinfo) {
    // TODO: Implement CANCEL handling
    logger.info(`[SIP] CANCEL received from ${rinfo.address}:${rinfo.port}`);
    logger.debug('CANCEL received');
  }

  sendResponse(rinfo, status, originalMessage) {
    // Fix Via header - add received and rport for NAT traversal
    let via = this.extractHeader(originalMessage, 'Via');
    // Add received parameter if not present
    if (!via.includes('received=')) {
      via += `;received=${rinfo.address}`;
    }
    // Add rport parameter if not present
    if (!via.includes('rport=')) {
      via += `;rport=${rinfo.port}`;
    }
    
    const from = this.extractHeader(originalMessage, 'From');
    const to = this.extractHeader(originalMessage, 'To');
    const callId = this.extractHeader(originalMessage, 'Call-ID');
    const cseq = this.extractHeader(originalMessage, 'CSeq');
    
    const response = `SIP/2.0 ${status}\r
Via: ${via}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Content-Length: 0\r
\r
`;
    
    logger.info(`[SIP] Sending response ${status} to ${rinfo.address}:${rinfo.port}`);
    this.sendRawResponse(rinfo, response);
  }

  sendRawResponse(rinfo, response) {
    try {
      logger.info(`[SIP] Sending response to ${rinfo.address}:${rinfo.port}`);
      logger.debug(`[SIP] Response preview: ${response.substring(0, 100)}...`);
      
      this.server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) {
          logger.error(`[SIP] Error sending response to ${rinfo.address}:${rinfo.port}:`, err);
          logger.error(`[SIP] Error details:`, err.message);
        } else {
          logger.info(`[SIP] Response sent successfully to ${rinfo.address}:${rinfo.port}`);
        }
      });
    } catch (error) {
      logger.error('[SIP] Error in sendRawResponse:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }


  getRegisteredExtensions() {
    // Return registered extensions from database
    // expires is stored as integer (seconds), so we need to compare with last_updated + expires
    return new Promise(async (resolve, reject) => {
      try {
        const pool = require('../../database/connection');
        const result = await pool.query(`
          SELECT 
            er.extension_id,
            e.username,
            e.display_name,
            er.contact_uri,
            er.expires,
            er.last_updated,
            CASE 
              WHEN (er.last_updated + INTERVAL '1 second' * er.expires) > NOW() THEN true 
              ELSE false 
            END as registered
          FROM extension_registrations er
          JOIN extensions e ON er.extension_id = e.id
          WHERE (er.last_updated + INTERVAL '1 second' * er.expires) > NOW()
          ORDER BY er.last_updated DESC
        `);
        
        resolve(result.rows);
      } catch (error) {
        logger.error('Error getting registered extensions:', error);
        resolve([]);
      }
    });
  }

  async handleIncomingCall(message, rinfo, didNumber, callId) {
    try {
      logger.info(`[SIP] Handling incoming call to DID ${didNumber.number}, Call-ID: ${callId}`);
      
      // Route DID to configured target
      const route = await didRouter.routeDID(didNumber.id);
      
      if (!route) {
        logger.warn(`[SIP] No route found for DID ${didNumber.number}`);
        this.sendResponse(rinfo, '404 Not Found', message);
        return;
      }
      
      logger.info(`[SIP] DID ${didNumber.number} routed to ${route.routeType}:${route.routeTargetId}`);
      
      // Route based on route type
      switch (route.routeType) {
        case 'extension':
          await this.routeIncomingCallToExtension(message, rinfo, route.target);
          break;
        case 'ivr':
          // TODO: Implement IVR routing
          logger.warn(`[SIP] IVR routing not yet implemented for DID ${didNumber.number}`);
          this.sendResponse(rinfo, '404 Not Found', message);
          break;
        case 'queue':
          // TODO: Implement Queue routing
          logger.warn(`[SIP] Queue routing not yet implemented for DID ${didNumber.number}`);
          this.sendResponse(rinfo, '404 Not Found', message);
          break;
        case 'voicemail':
          // TODO: Implement Voicemail routing
          logger.warn(`[SIP] Voicemail routing not yet implemented for DID ${didNumber.number}`);
          this.sendResponse(rinfo, '404 Not Found', message);
          break;
        default:
          logger.warn(`[SIP] Unknown route type: ${route.routeType}`);
          this.sendResponse(rinfo, '404 Not Found', message);
      }
    } catch (error) {
      logger.error('[SIP] Error handling incoming call:', error);
      logger.error('[SIP] Error stack:', error.stack);
      this.sendResponse(rinfo, '500 Internal Server Error', message);
    }
  }

  async routeIncomingCallToExtension(message, rinfo, target) {
    try {
      logger.info(`[SIP] Routing incoming call to extension: ${target.username}`);
      
      // Find extension
      const extension = await Extension.findById(target.id);
      if (!extension || !extension.enabled) {
        logger.warn(`[SIP] Extension ${target.id} not found or disabled`);
        this.sendResponse(rinfo, '404 Not Found', message);
        return;
      }
      
      // Check if extension is registered
      const registeredExts = await this.getRegisteredExtensions();
      const registeredExt = registeredExts.find(e => e.username === target.username);
      
      if (!registeredExt || !registeredExt.contact_uri) {
        logger.warn(`[SIP] Extension ${target.username} not registered`);
        // Send 180 Ringing anyway (for testing)
        this.send180Ringing(rinfo, message);
        setTimeout(() => {
          this.send200OK(rinfo, message);
        }, 1000);
        return;
      }
      
      // Forward INVITE to registered extension
      logger.info(`[SIP] Forwarding INVITE to extension ${target.username} at ${registeredExt.contact_uri}`);
      
      // Parse contact URI
      const contactMatch = registeredExt.contact_uri.match(/sip:([^@]+)@([^:]+):?(\d+)?/);
      if (!contactMatch) {
        logger.warn(`[SIP] Invalid contact URI: ${registeredExt.contact_uri}`);
        this.sendResponse(rinfo, '500 Internal Server Error', message);
        return;
      }
      
      const [, username, host, port] = contactMatch;
      const targetPort = port ? parseInt(port) : 5060;
      
      // Extract Call-ID from incoming INVITE
      const originalCallId = this.extractHeader(message, 'Call-ID');
      const originalRequestUri = message.split('\r\n')[0].split(' ')[1];
      
      // Modify INVITE for extension
      const modifiedInvite = this.modifyInviteForExtension(message, registeredExt.contact_uri, target.username);
      
      // Store call session for incoming call (trunk -> extension)
      this.activeCalls.set(originalCallId, {
        originalCallId: originalCallId,
        direction: 'incoming',
        trunkRinfo: rinfo, // From trunk
        extensionRinfo: { address: host, port: targetPort }, // To extension
        extensionUsername: target.username,
        state: 'invite-forwarded',
        originalMessage: message,
        createdAt: Date.now()
      });
      
      // Send INVITE to extension
      this.server.send(Buffer.from(modifiedInvite), targetPort, host, (err) => {
        if (err) {
          logger.error(`[SIP] Error forwarding INVITE to extension ${target.username}:`, err);
          this.sendResponse(rinfo, '500 Internal Server Error', message);
        } else {
          logger.info(`[SIP] INVITE forwarded to extension ${target.username} at ${host}:${targetPort}`);
          // Send 100 Trying to trunk (already sent, but keeping for clarity)
        }
      });
      
    } catch (error) {
      logger.error('[SIP] Error routing incoming call to extension:', error);
      this.sendResponse(rinfo, '500 Internal Server Error', message);
    }
  }

  modifyInviteForExtension(originalMessage, contactUri, extensionUsername) {
    try {
      const lines = originalMessage.split('\r\n');
      const requestLine = lines[0];
      
      // Extract headers
      const via = this.extractHeader(originalMessage, 'Via');
      const from = this.extractHeader(originalMessage, 'From');
      const callId = this.extractHeader(originalMessage, 'Call-ID');
      const cseq = this.extractHeader(originalMessage, 'CSeq');
      const contact = this.extractHeader(originalMessage, 'Contact') || `Contact: <sip:${extensionUsername}@${config.sip.server.domain}:${config.sip.server.port}>`;
      const userAgent = this.extractHeader(originalMessage, 'User-Agent') || 'PBX System';
      const allow = 'Allow: INVITE, ACK, CANCEL, BYE, OPTIONS, REGISTER';
      
      // Get body (SDP)
      const bodyStart = originalMessage.indexOf('\r\n\r\n');
      const body = bodyStart >= 0 ? originalMessage.substring(bodyStart + 4) : '';
      
      // Modify Request-URI to extension contact
      const newRequestLine = `INVITE ${contactUri} SIP/2.0`;
      
      // Modify To header to extension
      let toHeader = this.extractHeader(originalMessage, 'To');
      if (toHeader && !toHeader.includes(`sip:${extensionUsername}@`)) {
        // Extract display name if present
        const toMatch = toHeader.match(/To:\s*(.+?)\s*<sip:/) || toHeader.match(/To:\s*(.+?)\s*sip:/);
        const displayName = toMatch && toMatch[1] ? toMatch[1].trim() : '';
        const toTagMatch = toHeader.match(/tag=([^;]+)/);
        const toTag = toTagMatch ? `;tag=${toTagMatch[1]}` : '';
        toHeader = `To: ${displayName ? `<sip:${extensionUsername}@${config.sip.server.domain}>${toTag}` : `<sip:${extensionUsername}@${config.sip.server.domain}>${toTag}`}`;
      }
      
      // Build modified INVITE
      const modifiedInvite = `${newRequestLine}\r
Via: ${via}\r
Max-Forwards: 70\r
From: ${from}\r
To: ${toHeader || `To: <sip:${extensionUsername}@${config.sip.server.domain}>`}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
${contact}\r
User-Agent: ${userAgent}\r
${allow}\r
Content-Type: application/sdp\r
Content-Length: ${body.length}\r
\r
${body}`;
      
      return modifiedInvite;
      
    } catch (error) {
      logger.error('[SIP] Error modifying INVITE for extension:', error);
      throw error;
    }
  }

  async handleOutgoingCall(message, rinfo, fromUsername, toNumber, callerExtension) {
    try {
      logger.info(`[SIP] Handling outgoing call from ${fromUsername} to ${toNumber}`);
      
      // Normalize phone number (remove +, spaces, etc.)
      const normalizedNumber = toNumber.replace(/[+\s-]/g, '');
      
      // Get DID for this extension (if configured)
      const didNumber = await DIDNumber.findAll({ enabled: true });
      // For now, use first available DID
      const trunkDID = didNumber.length > 0 ? didNumber[0] : null;
      
      if (!trunkDID) {
        logger.warn(`[SIP] No DID configured for outgoing calls`);
        this.sendResponse(rinfo, '404 Not Found', message);
        return;
      }
      
      logger.info(`[SIP] Forwarding call to trunk using DID ${trunkDID.number}`);
      
      // Forward INVITE to trunk
      await this.forwardInviteToTrunk(message, rinfo, fromUsername, normalizedNumber, trunkDID, callerExtension);
      
    } catch (error) {
      logger.error('[SIP] Error handling outgoing call:', error);
      logger.error('[SIP] Error stack:', error.stack);
      this.sendResponse(rinfo, '500 Internal Server Error', message);
    }
  }

  async forwardInviteToTrunk(originalMessage, rinfo, fromUsername, toNumber, didNumber, callerExtension) {
    try {
      const trunkServer = didNumber.provider || config.sip.trunk.server;
      const trunkPort = config.sip.trunk.port || 5060;
      
      // Resolve DNS to IP for trunk server
      const dns = require('dns').promises;
      let trunkServerIP = trunkServer;
      try {
        const resolved = await dns.lookup(trunkServer);
        trunkServerIP = resolved.address;
        logger.info(`[SIP] Resolved trunk server ${trunkServer} to ${trunkServerIP}`);
      } catch (dnsError) {
        logger.warn(`[SIP] Could not resolve trunk server ${trunkServer}, using as-is:`, dnsError.message);
      }
      
      logger.info(`[SIP] Forwarding INVITE to trunk ${trunkServer} (${trunkServerIP}):${trunkPort} for number ${toNumber}`);
      
      // Parse original INVITE
      const lines = originalMessage.split('\r\n');
      const requestLine = lines[0];
      
      // Build new INVITE for trunk
      const callId = this.generateCallId();
      const branch = this.generateBranch();
      const cseq = parseInt(this.extractHeader(originalMessage, 'CSeq').split(' ')[0]) || 1;
      const fromTag = this.generateTag();
      
      // Modify Request-URI to point to trunk
      const newRequestLine = `INVITE sip:${toNumber}@${trunkServer} SIP/2.0`;
      
      // Build new headers
      const viaHeader = `Via: SIP/2.0/UDP ${config.sip.server.domain}:${config.sip.server.port};branch=${branch};rport`;
      const fromHeader = `From: <sip:${didNumber.trunkUsername}@${trunkServer}>;tag=${fromTag}`;
      const toHeader = `To: <sip:${toNumber}@${trunkServer}>`;
      const callIdHeader = `Call-ID: ${callId}`;
      const cseqHeader = `CSeq: ${cseq} INVITE`;
      const maxForwardsHeader = 'Max-Forwards: 70';
      
      // Get original Contact, User-Agent, etc.
      const contactHeader = this.extractHeader(originalMessage, 'Contact') || 
                           `Contact: <sip:${didNumber.trunkUsername}@${config.sip.server.domain}:${config.sip.server.port}>`;
      const userAgentHeader = this.extractHeader(originalMessage, 'User-Agent') || 'PBX System';
      const allowHeader = 'Allow: INVITE, ACK, CANCEL, BYE, OPTIONS, REGISTER';
      
      // Generate Proxy-Authorization header for trunk authentication
      // For OnlinePBX and most trunk providers, we may need to send authentication
      // Some trunks accept pre-authentication, others require 401 challenge first
      let proxyAuthHeader = '';
      if (didNumber.trunkPassword) {
        const realm = trunkServer;
        const uri = `sip:${toNumber}@${trunkServer}`;
        const nc = '00000001';
        const cnonce = this.generateTag();
        const qop = 'auth';
        const method = 'INVITE';
        
        // Try pre-authentication with generated nonce (some trunks accept this)
        // If trunk sends 401, we'll handle it in handleResponse and retry with proper nonce from challenge
        const nonce = this.generateTag(); // Generate nonce for pre-auth attempt
        const digestResponse = generateDigestResponse(
          didNumber.trunkUsername,
          realm,
          didNumber.trunkPassword,
          method,
          uri,
          nonce,
          nc,
          cnonce,
          qop
        );
        
        proxyAuthHeader = `Proxy-Authorization: Digest username="${didNumber.trunkUsername}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${digestResponse}", qop=${qop}, nc=${nc}, cnonce="${cnonce}"\r
`;
        
        logger.info(`[SIP] Added Proxy-Authorization for trunk ${trunkServer} (pre-auth attempt)`);
      } else {
        logger.warn(`[SIP] No trunk password configured for DID ${didNumber.number}. Authentication may fail.`);
      }
      
      // Get original body (SDP)
      const bodyStart = originalMessage.indexOf('\r\n\r\n');
      const body = bodyStart >= 0 ? originalMessage.substring(bodyStart + 4) : '';
      
      // Build modified INVITE
      const modifiedInvite = `${newRequestLine}\r
${viaHeader}\r
${maxForwardsHeader}\r
${fromHeader}\r
${toHeader}\r
${callIdHeader}\r
${cseqHeader}\r
${contactHeader}\r
User-Agent: ${userAgentHeader}\r
${allowHeader}\r
${proxyAuthHeader}Content-Type: application/sdp\r
Content-Length: ${body.length}\r
\r
${body}`;
      
      // Log INVITE for debugging (full message)
      logger.info(`[SIP] Sending INVITE to trunk ${trunkServerIP}:${trunkPort}:\n${modifiedInvite.substring(0, 800)}${modifiedInvite.length > 800 ? '...' : ''}`);
      
      // Log full INVITE for comparison with OnlinePBX/MicroSIP
      logger.debug(`[SIP] Full INVITE message:\n${modifiedInvite}`);
      
      // Send INVITE to trunk (use IP address)
      this.server.send(Buffer.from(modifiedInvite), trunkPort, trunkServerIP, (err) => {
        if (err) {
          logger.error(`[SIP] Error forwarding INVITE to trunk ${trunkServerIP}:${trunkPort}:`, err);
          this.sendResponse(rinfo, '502 Bad Gateway', originalMessage);
        } else {
          logger.info(`[SIP] INVITE forwarded to trunk ${trunkServerIP}:${trunkPort}`);
          logger.debug(`[SIP] Waiting for trunk response (Call-ID: ${callId})...`);
          // Send 100 Trying to caller (already sent, but keeping for clarity)
          // Note: We need to handle trunk's response and forward it back to caller
        }
      });
      
      // Store call session to forward trunk's responses back to caller
      const originalCallId = this.extractHeader(originalMessage, 'Call-ID');
      const originalRequestUri = originalMessage.split('\r\n')[0].split(' ')[1]; // Extract Request-URI from first line
      
      this.activeCalls.set(callId, {
        originalCallId: originalCallId,
        trunkCallId: callId, // Trunk Call-ID (same as generated callId)
        originalRequestUri: originalRequestUri,
        direction: 'outgoing',
        fromRinfo: rinfo,
        fromUsername: fromUsername,
        toNumber: toNumber,
        didNumber: didNumber,
        trunkServer: trunkServer,
        trunkIP: trunkServerIP, // Store resolved IP
        trunkPort: trunkPort,
        trunkRinfo: { address: trunkServerIP, port: trunkPort },
        state: 'invite-sent',
        originalMessage: originalMessage,
        createdAt: Date.now()
      });
      
      logger.info(`[SIP] Call session created: ${callId} -> ${originalCallId}`);
      
      // Don't send placeholder 180/200 - wait for trunk response
      
    } catch (error) {
      logger.error('[SIP] Error forwarding INVITE to trunk:', error);
      logger.error('[SIP] Error stack:', error.stack);
      this.sendResponse(rinfo, '500 Internal Server Error', originalMessage);
    }
  }

  async handleResponse(message, rinfo) {
    try {
      const lines = message.split('\r\n');
      const statusLine = lines[0];
      
      // Parse status code: SIP/2.0 200 OK
      const statusMatch = statusLine.match(/SIP\/2\.0\s+(\d+)\s+(.+)/);
      if (!statusMatch) {
        logger.warn(`[SIP] Could not parse response status line: ${statusLine}`);
        return;
      }
      
      const statusCode = parseInt(statusMatch[1]);
      const statusText = statusMatch[2];
      
      // Extract Call-ID to find the call session
      const callId = this.extractHeader(message, 'Call-ID');
      if (!callId) {
        logger.warn('[SIP] Response missing Call-ID header');
        return;
      }
      
      logger.info(`[SIP] Response ${statusCode} ${statusText} received for Call-ID: ${callId}`);
      
      // Find call session
      const callSession = this.activeCalls.get(callId);
      if (!callSession) {
        logger.debug(`[SIP] No call session found for Call-ID: ${callId} (might be a different call)`);
        return;
      }
      
      // Check call direction
      if (callSession.direction === 'outgoing') {
        logger.info(`[SIP] Forwarding response ${statusCode} to extension ${callSession.fromUsername}`);
        // Forward response to extension (caller) - outgoing call
        await this.forwardResponseToExtension(message, rinfo, callSession, statusCode);
      } else if (callSession.direction === 'incoming') {
        logger.info(`[SIP] Forwarding response ${statusCode} to trunk (incoming call from extension ${callSession.extensionUsername})`);
        // Forward response to trunk - incoming call
        await this.forwardResponseToTrunk(message, rinfo, callSession, statusCode);
      }
      
      // Store headers for later use (BYE, ACK)
      // Note: responseMessage is message parameter
      const responseMessageForHeaders = message;
      if (callSession.direction === 'outgoing' && !callSession.trunkFrom) {
        callSession.trunkFrom = this.extractHeader(responseMessageForHeaders, 'From');
        callSession.trunkTo = this.extractHeader(responseMessageForHeaders, 'To');
      } else if (callSession.direction === 'incoming' && !callSession.extensionFrom) {
        callSession.extensionFrom = this.extractHeader(responseMessage, 'From');
        callSession.extensionTo = this.extractHeader(responseMessage, 'To');
      }
      
      // Handle 401/407 challenge for trunk authentication
      if ((statusCode === 401 || statusCode === 407) && callSession.direction === 'outgoing') {
        logger.info(`[SIP] Received ${statusCode} challenge from trunk, retrying with authentication`);
        await this.handleTrunkChallenge(message, rinfo, callSession, statusCode);
        return; // Don't forward 401 to extension yet, wait for retry
      }
      
      // Store responseMessage reference for later use
      const responseMessage = message;
      
      // Update call session state
      if (statusCode === 180 || statusCode === 183) {
        callSession.state = 'ringing';
      } else if (statusCode >= 200 && statusCode < 300) {
        callSession.state = 'answered';
      } else if (statusCode >= 400) {
        callSession.state = 'failed';
        // Clean up failed calls after a delay
        setTimeout(() => {
          this.activeCalls.delete(callId);
        }, 60000);
      }
      
    } catch (error) {
      logger.error('[SIP] Error handling response:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  async forwardResponseToTrunk(responseMessage, extensionRinfo, callSession, statusCode) {
    try {
      // Parse extension response
      const extensionCallId = this.extractHeader(responseMessage, 'Call-ID');
      const extensionVia = this.extractHeader(responseMessage, 'Via');
      const extensionFrom = this.extractHeader(responseMessage, 'From');
      const extensionTo = this.extractHeader(responseMessage, 'To');
      const extensionCSeq = this.extractHeader(responseMessage, 'CSeq');
      
      // Get response body (SDP)
      const bodyStart = responseMessage.indexOf('\r\n\r\n');
      const body = bodyStart >= 0 ? responseMessage.substring(bodyStart + 4) : '';
      
      // Build response for trunk with original Call-ID and headers from trunk INVITE
      const statusLine = `SIP/2.0 ${statusCode} ${this.getStatusText(statusCode)}`;
      const trunkVia = this.extractHeader(callSession.originalMessage, 'Via');
      const trunkFrom = this.extractHeader(callSession.originalMessage, 'From');
      const trunkTo = this.extractHeader(callSession.originalMessage, 'To');
      const trunkCSeq = this.extractHeader(callSession.originalMessage, 'CSeq');
      const originalCallId = callSession.originalCallId;
      
      // Build response
      let responseHeaders = `${statusLine}\r
Via: ${trunkVia || extensionVia}\r
From: ${trunkFrom}\r
To: ${trunkTo}\r
Call-ID: ${originalCallId}\r
CSeq: ${trunkCSeq}\r
`;
      
      // Add Contact header for 200 OK
      if (statusCode >= 200 && statusCode < 300) {
        const contactHeader = this.extractHeader(responseMessage, 'Contact');
        if (contactHeader) {
          responseHeaders += `Contact: ${contactHeader}\r
`;
        }
      }
      
      // Add Content-Type and Content-Length for responses with body
      if (statusCode >= 200 && statusCode < 300 && body) {
        responseHeaders += `Content-Type: application/sdp\r
Content-Length: ${body.length}\r
\r
${body}`;
      } else {
        responseHeaders += `Content-Length: 0\r
`;
      }
      
      // Send response to trunk
      logger.info(`[SIP] Forwarding response ${statusCode} to trunk ${callSession.trunkRinfo.address}:${callSession.trunkRinfo.port}`);
      this.server.send(Buffer.from(responseHeaders), callSession.trunkRinfo.port, callSession.trunkRinfo.address, (err) => {
        if (err) {
          logger.error(`[SIP] Error forwarding response to trunk:`, err);
        } else {
          logger.info(`[SIP] Response ${statusCode} forwarded to trunk successfully`);
        }
      });
      
      // For 200 OK, trunk will send ACK, which we'll handle in handleAck
      
    } catch (error) {
      logger.error('[SIP] Error forwarding response to trunk:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  async handleTrunkChallenge(challengeMessage, trunkRinfo, callSession, statusCode) {
    try {
      // Extract Proxy-Authenticate or WWW-Authenticate header
      const authHeader = statusCode === 401 
        ? this.extractHeader(challengeMessage, 'WWW-Authenticate')
        : this.extractHeader(challengeMessage, 'Proxy-Authenticate');
      
      if (!authHeader) {
        logger.warn(`[SIP] ${statusCode} challenge received but no authentication header found`);
        // Forward error to extension
        await this.forwardResponseToExtension(challengeMessage, trunkRinfo, callSession, statusCode);
        return;
      }
      
      // Parse authentication challenge
      const realmMatch = authHeader.match(/realm="([^"]+)"/);
      const nonceMatch = authHeader.match(/nonce="([^"]+)"/);
      const qopMatch = authHeader.match(/qop="([^"]+)"/);
      
      if (!realmMatch || !nonceMatch) {
        logger.warn(`[SIP] Could not parse authentication challenge: ${authHeader}`);
        await this.forwardResponseToExtension(challengeMessage, trunkRinfo, callSession, statusCode);
        return;
      }
      
      const realm = realmMatch[1];
      const nonce = nonceMatch[1];
      const qop = qopMatch ? qopMatch[1] : 'auth';
      
      logger.info(`[SIP] Parsed challenge: realm=${realm}, nonce=${nonce.substring(0, 10)}..., qop=${qop}`);
      
      // Get trunk credentials
      const didNumber = callSession.didNumber;
      if (!didNumber.trunkPassword) {
        logger.error(`[SIP] No trunk password configured for authentication challenge`);
        await this.forwardResponseToExtension(challengeMessage, trunkRinfo, callSession, statusCode);
        return;
      }
      
      // Build authenticated INVITE
      const uri = `sip:${callSession.toNumber}@${callSession.trunkServer}`;
      const method = 'INVITE';
      const nc = '00000001';
      const cnonce = this.generateTag();
      
      // Generate digest response
      const digestResponse = generateDigestResponse(
        didNumber.trunkUsername,
        realm,
        didNumber.trunkPassword,
        method,
        uri,
        nonce,
        nc,
        cnonce,
        qop
      );
      
      // Build Proxy-Authorization header
      const proxyAuthHeader = statusCode === 401 
        ? 'Proxy-Authorization'
        : 'Proxy-Authorization';
      
      const authHeaderLine = `${proxyAuthHeader}: Digest username="${didNumber.trunkUsername}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${digestResponse}", qop=${qop}, nc=${nc}, cnonce="${cnonce}"\r
`;
      
      // Modify original INVITE with authentication
      const originalInvite = callSession.originalMessage;
      const lines = originalInvite.split('\r\n');
      const requestLine = lines[0];
      
      // Extract headers
      const via = this.extractHeader(originalInvite, 'Via');
      const from = this.extractHeader(originalInvite, 'From');
      const to = this.extractHeader(originalInvite, 'To');
      const callId = this.extractHeader(originalInvite, 'Call-ID');
      const cseq = this.extractHeader(originalInvite, 'CSeq');
      const contact = this.extractHeader(originalInvite, 'Contact');
      const userAgent = this.extractHeader(originalInvite, 'User-Agent') || 'PBX System';
      const allow = 'Allow: INVITE, ACK, CANCEL, BYE, OPTIONS, REGISTER';
      
      // Get body
      const bodyStart = originalInvite.indexOf('\r\n\r\n');
      const body = bodyStart >= 0 ? originalInvite.substring(bodyStart + 4) : '';
      
      // Build new Request-URI for trunk
      const newRequestLine = `INVITE sip:${callSession.toNumber}@${callSession.trunkServer} SIP/2.0`;
      const trunkVia = `Via: SIP/2.0/UDP ${config.sip.server.domain}:${config.sip.server.port};branch=${this.generateBranch()};rport`;
      const trunkFrom = `From: <sip:${didNumber.trunkUsername}@${callSession.trunkServer}>;tag=${this.generateTag()}`;
      const trunkTo = `To: <sip:${callSession.toNumber}@${callSession.trunkServer}>`;
      const trunkCallId = callSession.trunkCallId || this.generateCallId();
      const trunkCSeq = cseq;
      
      // Build authenticated INVITE
      const authenticatedInvite = `${newRequestLine}\r
${trunkVia}\r
Max-Forwards: 70\r
${trunkFrom}\r
${trunkTo}\r
Call-ID: ${trunkCallId}\r
${trunkCSeq}\r
${contact || `Contact: <sip:${didNumber.trunkUsername}@${config.sip.server.domain}:${config.sip.server.port}>`}\r
User-Agent: ${userAgent}\r
${allow}\r
${authHeaderLine}Content-Type: application/sdp\r
Content-Length: ${body.length}\r
\r
${body}`;
      
      // Get trunk IP (should be stored in call session)
      const trunkIP = callSession.trunkIP || callSession.trunkRinfo.address || callSession.trunkServer;
      
      // Send authenticated INVITE
      logger.info(`[SIP] Retrying INVITE with authentication to trunk ${trunkIP}:${callSession.trunkPort}`);
      this.server.send(Buffer.from(authenticatedInvite), callSession.trunkPort, trunkIP, async (err) => {
        if (err) {
          logger.error(`[SIP] Error sending authenticated INVITE:`, err);
          await this.forwardResponseToExtension(challengeMessage, trunkRinfo, callSession, statusCode);
        } else {
          logger.info(`[SIP] Authenticated INVITE sent to trunk`);
          // Update call session state
          callSession.state = 'retrying';
          callSession.retryCount = (callSession.retryCount || 0) + 1;
        }
      });
      
    } catch (error) {
      logger.error('[SIP] Error handling trunk challenge:', error);
      logger.error('[SIP] Error stack:', error.stack);
      // Forward original challenge to extension
      await this.forwardResponseToExtension(challengeMessage, trunkRinfo, callSession, statusCode);
    }
  }

  async forwardResponseToExtension(responseMessage, trunkRinfo, callSession, statusCode) {
    try {
      // Parse original message headers
      const originalCallId = callSession.originalCallId;
      const originalVia = this.extractHeader(callSession.originalMessage, 'Via');
      const originalFrom = this.extractHeader(callSession.originalMessage, 'From');
      const originalTo = this.extractHeader(callSession.originalMessage, 'To');
      const originalCSeq = this.extractHeader(callSession.originalMessage, 'CSeq');
      
      // Parse trunk response
      const trunkVia = this.extractHeader(responseMessage, 'Via');
      const trunkFrom = this.extractHeader(responseMessage, 'From');
      const trunkTo = this.extractHeader(responseMessage, 'To');
      const trunkCSeq = this.extractHeader(responseMessage, 'CSeq');
      
      // Get response body (SDP)
      const bodyStart = responseMessage.indexOf('\r\n\r\n');
      const body = bodyStart >= 0 ? responseMessage.substring(bodyStart + 4) : '';
      
      // Build response with original Call-ID and headers
      const statusLine = `SIP/2.0 ${statusCode} ${this.getStatusText(statusCode)}`;
      
      // Modify Via header - remove our branch, add received/rport if needed
      let viaHeader = originalVia;
      if (viaHeader) {
        // Add received and rport if not present
        if (!viaHeader.includes('received=')) {
          viaHeader += `;received=${callSession.fromRinfo.address}`;
        }
        if (!viaHeader.includes('rport=')) {
          viaHeader += `;rport=${callSession.fromRinfo.port}`;
        }
      }
      
      // Build headers
      let responseHeaders = `${statusLine}\r
Via: ${viaHeader || trunkVia}\r
From: ${originalFrom}\r
To: ${originalTo}\r
Call-ID: ${originalCallId}\r
CSeq: ${originalCSeq}\r
`;
      
      // Add Contact header for 200 OK
      if (statusCode >= 200 && statusCode < 300) {
        const contactHeader = this.extractHeader(responseMessage, 'Contact');
        if (contactHeader) {
          responseHeaders += `Contact: ${contactHeader}\r
`;
        }
      }
      
      // Add Content-Type and Content-Length for responses with body
      if (statusCode >= 200 && statusCode < 300 && body) {
        responseHeaders += `Content-Type: application/sdp\r
Content-Length: ${body.length}\r
\r
${body}`;
      } else {
        responseHeaders += `Content-Length: 0\r
`;
      }
      
      const modifiedResponse = responseHeaders;
      
      // Send response to extension
      logger.info(`[SIP] Forwarding response ${statusCode} to ${callSession.fromRinfo.address}:${callSession.fromRinfo.port}`);
      this.server.send(Buffer.from(modifiedResponse), callSession.fromRinfo.port, callSession.fromRinfo.address, (err) => {
        if (err) {
          logger.error(`[SIP] Error forwarding response to extension:`, err);
        } else {
          logger.info(`[SIP] Response ${statusCode} forwarded to extension successfully`);
        }
      });
      
      // For 200 OK, also send ACK to trunk
      if (statusCode === 200) {
        await this.sendAckToTrunk(responseMessage, trunkRinfo, callSession);
      }
      
    } catch (error) {
      logger.error('[SIP] Error forwarding response to extension:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  async forwardByeToTrunk(byeMessage, rinfo, callSession) {
    try {
      // Extract headers from BYE
      const originalCallId = this.extractHeader(byeMessage, 'Call-ID');
      const originalCSeq = this.extractHeader(byeMessage, 'CSeq');
      const originalFrom = this.extractHeader(byeMessage, 'From');
      const originalTo = this.extractHeader(byeMessage, 'To');
      
      // Use trunk Call-ID from call session
      const trunkCallId = callSession.trunkCallId || callSession.originalCallId;
      
      // Build BYE for trunk using trunk Call-ID and headers
      const trunkCSeq = originalCSeq; // Use same CSeq sequence
      const byeRequestUri = callSession.originalRequestUri || `sip:${callSession.toNumber}@${callSession.trunkServer}`;
      
      // Get trunk From/To from stored session
      const trunkByeFrom = callSession.trunkFrom || originalFrom;
      const trunkByeTo = callSession.trunkTo || originalTo;
      
      const byeRequest = `BYE ${byeRequestUri} SIP/2.0\r
Via: SIP/2.0/UDP ${config.sip.server.domain}:${config.sip.server.port};branch=${this.generateBranch()}\r
Max-Forwards: 70\r
From: ${trunkByeFrom}\r
To: ${trunkByeTo}\r
Call-ID: ${trunkCallId}\r
CSeq: ${trunkCSeq.split(' ')[0]} BYE\r
Content-Length: 0\r
\r
`;
      
      // Send BYE to trunk
      logger.info(`[SIP] Forwarding BYE to trunk ${callSession.trunkServer}:${callSession.trunkPort}`);
      this.server.send(Buffer.from(byeRequest), callSession.trunkPort, callSession.trunkServer, (err) => {
        if (err) {
          logger.error(`[SIP] Error forwarding BYE to trunk:`, err);
        } else {
          logger.info(`[SIP] BYE forwarded to trunk successfully`);
        }
      });
      
    } catch (error) {
      logger.error('[SIP] Error forwarding BYE to trunk:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  async sendAckToTrunk(responseMessage, trunkRinfo, callSession) {
    try {
      // Extract headers from response
      const trunkCallId = this.extractHeader(responseMessage, 'Call-ID');
      const trunkCSeq = this.extractHeader(responseMessage, 'CSeq');
      const trunkFrom = this.extractHeader(responseMessage, 'From');
      const trunkTo = this.extractHeader(responseMessage, 'To');
      
      // Build ACK
      const ackRequestUri = callSession.originalRequestUri || `sip:${callSession.toNumber}@${callSession.trunkServer}`;
      const ackRequest = `ACK ${ackRequestUri} SIP/2.0\r
Via: SIP/2.0/UDP ${config.sip.server.domain}:${config.sip.server.port};branch=${this.generateBranch()}\r
Max-Forwards: 70\r
From: ${trunkFrom}\r
To: ${trunkTo}\r
Call-ID: ${trunkCallId}\r
CSeq: ${trunkCSeq.split(' ')[0]} ACK\r
Content-Length: 0\r
\r
`;
      
      // Send ACK to trunk
      logger.info(`[SIP] Sending ACK to trunk ${callSession.trunkServer}:${callSession.trunkPort}`);
      this.server.send(Buffer.from(ackRequest), callSession.trunkPort, callSession.trunkServer, (err) => {
        if (err) {
          logger.error(`[SIP] Error sending ACK to trunk:`, err);
        } else {
          logger.info(`[SIP] ACK sent to trunk successfully`);
        }
      });
      
    } catch (error) {
      logger.error('[SIP] Error sending ACK to trunk:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  getStatusText(statusCode) {
    const statusTexts = {
      100: 'Trying',
      180: 'Ringing',
      183: 'Session Progress',
      200: 'OK',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      480: 'Temporarily Unavailable',
      486: 'Busy Here',
      487: 'Request Terminated',
      500: 'Server Internal Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Server Time-out'
    };
    return statusTexts[statusCode] || 'Unknown';
  }

  generateCallId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + '@' + 
           config.sip.server.domain;
  }

  generateBranch() {
    return 'z9hG4bK' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Register with trunk servers (for incoming calls)
   */
  async registerWithTrunks() {
    try {
      logger.info('[SIP] Starting trunk registration...');
      
      // Get all enabled DID numbers with trunk credentials
      const didNumbers = await DIDNumber.findAll();
      const trunksToRegister = new Map();
      
      for (const did of didNumbers) {
        if (!did.enabled || !did.trunkUsername || !did.trunkPassword) {
          continue;
        }
        
        const trunkServer = did.provider || config.sip.trunk.server;
        if (!trunkServer) {
          continue;
        }
        
        // Group by trunk server (one registration per trunk)
        if (!trunksToRegister.has(trunkServer)) {
          trunksToRegister.set(trunkServer, {
            server: trunkServer,
            username: did.trunkUsername,
            password: did.trunkPassword,
            didNumber: did.number
          });
        }
      }
      
      // Register with each unique trunk
      for (const [trunkServer, trunkInfo] of trunksToRegister) {
        await this.registerWithTrunk(trunkInfo.server, trunkInfo.username, trunkInfo.password, trunkInfo.didNumber);
      }
      
      logger.info(`[SIP] Trunk registration completed for ${trunksToRegister.size} trunk(s)`);
    } catch (error) {
      logger.error('[SIP] Error registering with trunks:', error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  /**
   * Register with a specific trunk server
   */
  async registerWithTrunk(trunkServer, username, password, didNumber) {
    try {
      const trunkPort = config.sip.trunk.port || 5060;
      
      // Resolve DNS
      const dns = require('dns').promises;
      let trunkIP = trunkServer;
      try {
        const resolved = await dns.lookup(trunkServer);
        trunkIP = resolved.address;
        logger.info(`[SIP] Resolved trunk server ${trunkServer} to ${trunkIP}`);
      } catch (dnsError) {
        logger.warn(`[SIP] Could not resolve trunk server ${trunkServer}, using as-is:`, dnsError.message);
      }
      
      // Generate registration parameters
      const callId = this.generateCallId();
      const branch = this.generateBranch();
      const fromTag = this.generateTag();
      const expires = 3600; // 1 hour
      
      // Build REGISTER request (OnlinePBX/MicroSIP format)
      // OnlinePBX va MicroSIP'da ishlayotgan formatni qo'llaymiz
      const requestUri = `sip:${trunkServer}`;
      const fromHeader = `From: <sip:${username}@${trunkServer}>;tag=${fromTag}`;
      const toHeader = `To: <sip:${username}@${trunkServer}>`;
      
      // Get server IP address for Contact header (OnlinePBX/MicroSIP uses IP, not domain)
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      let serverIP = config.sip.server.domain; // Fallback to domain
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            serverIP = iface.address;
            break;
          }
        }
        if (serverIP !== config.sip.server.domain) break;
      }
      
      // Via header - OnlinePBX/MicroSIP uses IP or domain
      const viaHeader = `Via: SIP/2.0/UDP ${serverIP}:${config.sip.server.port};branch=${branch};rport`;
      // Contact header - OnlinePBX/MicroSIP typically uses IP address
      const contactHeader = `Contact: <sip:${username}@${serverIP}:${config.sip.server.port}>;expires=${expires}`;
      const callIdHeader = `Call-ID: ${callId}`;
      const cseqHeader = `CSeq: 1 REGISTER`;
      const maxForwardsHeader = 'Max-Forwards: 70';
      const userAgentHeader = `User-Agent: PBX System`;
      
      // Build REGISTER without authentication first (trunk may require challenge)
      // OnlinePBX va MicroSIP formatiga mos qilamiz
      const registerRequest = `REGISTER ${requestUri} SIP/2.0\r
${viaHeader}\r
${maxForwardsHeader}\r
${fromHeader}\r
${toHeader}\r
${callIdHeader}\r
${cseqHeader}\r
${contactHeader}\r
${userAgentHeader}\r
Expires: ${expires}\r
Content-Length: 0\r
\r
`;
      
      // Log full REGISTER request for debugging
      logger.info(`[SIP] Full REGISTER request to ${trunkServer}:\n${registerRequest.substring(0, 600)}${registerRequest.length > 600 ? '...' : ''}`);
      
      logger.info(`[SIP] Registering with trunk ${trunkServer} (${trunkIP}):${trunkPort} as ${username}`);
      
      // Send REGISTER request
      this.server.send(Buffer.from(registerRequest), trunkPort, trunkIP, (err) => {
        if (err) {
          logger.error(`[SIP] Error sending REGISTER to trunk ${trunkIP}:${trunkPort}:`, err);
        } else {
          logger.info(`[SIP] REGISTER sent to trunk ${trunkIP}:${trunkPort}`);
          // Store registration info for handling 401 challenge
          this.trunkRegistrations.set(trunkServer, {
            registered: false,
            username: username,
            password: password,
            didNumber: didNumber,
            trunkIP: trunkIP,
            trunkPort: trunkPort,
            callId: callId,
            fromTag: fromTag,
            expires: expires,
            registrationTimer: null
          });
        }
      });
      
    } catch (error) {
      logger.error(`[SIP] Error registering with trunk ${trunkServer}:`, error);
      logger.error('[SIP] Error stack:', error.stack);
    }
  }

  /**
   * Handle trunk registration response (200 OK or 401 challenge)
   */
  async handleTrunkRegistrationResponse(message, rinfo) {
    try {
      // Check if this is a response to our REGISTER
      const statusMatch = message.match(/^SIP\/2\.0 (\d+) (.+)/);
      if (!statusMatch) {
        logger.warn('[SIP] Trunk registration response does not match SIP/2.0 format');
        return; // Not a response
      }
      
      const statusCode = parseInt(statusMatch[1]);
      const statusText = statusMatch[2];
      const callId = this.extractHeader(message, 'Call-ID');
      
      logger.info(`[SIP] ⚠️ Processing trunk registration response: ${statusCode} ${statusText}, Call-ID: ${callId}`);
      
      // Find matching trunk registration
      let trunkInfo = null;
      for (const [trunkServer, info] of this.trunkRegistrations) {
        if (info.callId === callId) {
          trunkInfo = { server: trunkServer, ...info };
          break;
        }
      }
      
      if (!trunkInfo) {
        return; // Not our registration
      }
      
      if (statusCode === 200) {
        logger.info(`[SIP] ✅ Successfully registered with trunk ${trunkInfo.server} (${trunkInfo.trunkIP}:${trunkInfo.trunkPort})`);
        trunkInfo.registered = true;
        this.trunkRegistrations.set(trunkInfo.server, trunkInfo);
        
        // Schedule re-registration before expiry
        const reRegisterTime = (trunkInfo.expires - 60) * 1000; // Re-register 60 seconds before expiry
        if (trunkInfo.registrationTimer) {
          clearTimeout(trunkInfo.registrationTimer);
        }
        trunkInfo.registrationTimer = setTimeout(() => {
          this.registerWithTrunk(trunkInfo.server, trunkInfo.username, trunkInfo.password, trunkInfo.didNumber);
        }, reRegisterTime);
        
      } else if (statusCode === 401 || statusCode === 407) {
        logger.info(`[SIP] ⚠️ Received ${statusCode} challenge from trunk ${trunkInfo.server}, retrying with authentication`);
        logger.info(`[SIP] Challenge message:\n${message.substring(0, 400)}...`);
        await this.handleTrunkRegistrationChallenge(message, rinfo, trunkInfo);
      } else {
        logger.warn(`[SIP] ❌ Trunk registration failed with status ${statusCode} ${statusText} for ${trunkInfo.server}`);
        logger.warn(`[SIP] Response message:\n${message.substring(0, 400)}...`);
      }
      
    } catch (error) {
      logger.error('[SIP] Error handling trunk registration response:', error);
    }
  }

  /**
   * Handle trunk registration challenge (401/407) and retry with authentication
   */
  async handleTrunkRegistrationChallenge(challengeMessage, trunkRinfo, trunkInfo) {
    try {
      // Extract authentication challenge
      const authHeader = trunkRinfo.statusCode === 401 
        ? this.extractHeader(challengeMessage, 'WWW-Authenticate')
        : this.extractHeader(challengeMessage, 'Proxy-Authenticate');
      
      if (!authHeader) {
        logger.warn(`[SIP] ${trunkRinfo.statusCode} challenge received but no authentication header found`);
        return;
      }
      
      // Parse challenge
      const realmMatch = authHeader.match(/realm="([^"]+)"/);
      const nonceMatch = authHeader.match(/nonce="([^"]+)"/);
      const qopMatch = authHeader.match(/qop="([^"]+)"/);
      
      if (!realmMatch || !nonceMatch) {
        logger.warn(`[SIP] Could not parse authentication challenge: ${authHeader}`);
        return;
      }
      
      const realm = realmMatch[1];
      const nonce = nonceMatch[1];
      const qop = qopMatch ? qopMatch[1] : 'auth';
      
      // Build authenticated REGISTER
      const requestUri = `sip:${trunkInfo.server}`;
      const uri = requestUri;
      const method = 'REGISTER';
      const nc = '00000001';
      const cnonce = this.generateTag();
      
      // Generate digest response
      const digestResponse = generateDigestResponse(
        trunkInfo.username,
        realm,
        trunkInfo.password,
        method,
        uri,
        nonce,
        nc,
        cnonce,
        qop
      );
      
      const authHeaderLine = trunkRinfo.statusCode === 401 
        ? 'Authorization'
        : 'Proxy-Authorization';
      
      // Get server IP for Contact header (same as initial REGISTER)
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      let serverIP = config.sip.server.domain;
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            serverIP = iface.address;
            break;
          }
        }
        if (serverIP !== config.sip.server.domain) break;
      }
      
      const fromHeader = `From: <sip:${trunkInfo.username}@${trunkInfo.server}>;tag=${trunkInfo.fromTag}`;
      const toHeader = `To: <sip:${trunkInfo.username}@${trunkInfo.server}>`;
      const viaHeader = `Via: SIP/2.0/UDP ${serverIP}:${config.sip.server.port};branch=${this.generateBranch()};rport`;
      const contactHeader = `Contact: <sip:${trunkInfo.username}@${serverIP}:${config.sip.server.port}>;expires=${trunkInfo.expires}`;
      const callIdHeader = `Call-ID: ${trunkInfo.callId}`;
      const cseqHeader = `CSeq: 2 REGISTER`; // Increment CSeq
      
      const authenticatedRegister = `REGISTER ${requestUri} SIP/2.0\r
${viaHeader}\r
Max-Forwards: 70\r
${fromHeader}\r
${toHeader}\r
${callIdHeader}\r
${cseqHeader}\r
${contactHeader}\r
User-Agent: PBX System\r
Expires: ${trunkInfo.expires}\r
${authHeaderLine}: Digest username="${trunkInfo.username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${digestResponse}", qop=${qop}, nc=${nc}, cnonce="${cnonce}"\r
Content-Length: 0\r
\r
`;
      
      logger.info(`[SIP] ⚠️ Retrying REGISTER with authentication to trunk ${trunkInfo.server} (${trunkInfo.trunkIP}:${trunkInfo.trunkPort})`);
      logger.info(`[SIP] Authenticated REGISTER request:\n${authenticatedRegister.substring(0, 600)}${authenticatedRegister.length > 600 ? '...' : ''}`);
      
      this.server.send(Buffer.from(authenticatedRegister), trunkInfo.trunkPort, trunkInfo.trunkIP, (err) => {
        if (err) {
          logger.error(`[SIP] Error sending authenticated REGISTER:`, err);
        } else {
          logger.info(`[SIP] ✅ Authenticated REGISTER sent to trunk ${trunkInfo.trunkIP}:${trunkInfo.trunkPort}`);
        }
      });
      
    } catch (error) {
      logger.error('[SIP] Error handling trunk registration challenge:', error);
    }
  }

  stop() {
    if (this.server) {
      this.server.close();
      logger.info('SIP Registrar stopped');
    }
  }
}

module.exports = SIPRegistrar;
