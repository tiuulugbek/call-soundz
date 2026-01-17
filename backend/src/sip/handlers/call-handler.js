const logger = require('../../utils/logger');
const Call = require('../../database/models/Call');
const Extension = require('../../database/models/Extension');
const { parseSipMessage } = require('../../utils/helpers');

class CallHandler {
  async handleIncomingCall(message, rinfo, route, callId) {
    try {
      const parsed = parseSipMessage(message);
      const from = parsed.headers.From;
      const to = route.didNumber;

      logger.info(`Handling incoming call: ${from} -> ${to}, Route: ${route.routeType}`);

      // Create call record
      const call = await Call.create({
        callId: callId,
        fromNumber: this.extractNumber(from),
        toNumber: to,
        didNumberId: route.didNumberId,
        direction: 'inbound',
        status: 'ringing',
        startedAt: new Date()
      });

      // Route based on type
      switch (route.routeType) {
        case 'extension':
          await this.routeToExtension(message, rinfo, route.target, call);
          break;
        case 'ivr':
          await this.routeToIVR(message, rinfo, route.target, call);
          break;
        case 'queue':
          await this.routeToQueue(message, rinfo, route.target, call);
          break;
        case 'voicemail':
          await this.routeToVoicemail(message, rinfo, route.target, call);
          break;
        default:
          logger.warn(`Unknown route type: ${route.routeType}`);
          this.sendResponse(rinfo, 404, message);
      }
    } catch (error) {
      logger.error('Error handling incoming call:', error);
      if (rinfo) {
        this.sendResponse(rinfo, 500, message);
      }
    }
  }

  extractNumber(header) {
    const match = header.match(/sip:(\d+)@/);
    return match ? match[1] : 'unknown';
  }

  async routeToExtension(message, rinfo, target, call) {
    try {
      logger.info(`Routing call to extension: ${target.username}`);

      // Find extension's SIP endpoint
      const extension = await Extension.findById(target.id);
      if (!extension) {
        throw new Error(`Extension ${target.id} not found`);
      }

      // Get extension's contact URI (from registrar)
      const registrar = require('../core/registrar');
      const contactUri = registrar.getExtensionContact(extension.username);

      if (!contactUri) {
        logger.warn(`Extension ${extension.username} not registered`);
        // Reject call
        this.sendResponse(rinfo, 480, message);
        await Call.update(call.id, { status: 'no-answer', endedAt: new Date() });
        return;
      }

      // Forward INVITE to extension
      // This is simplified - in production, you'd use SIP proxy or B2BUA
      await this.forwardInviteToExtension(message, rinfo, contactUri, call);

    } catch (error) {
      logger.error('Error routing to extension:', error);
      this.sendResponse(rinfo, 500, message);
    }
  }

  async forwardInviteToExtension(message, rinfo, contactUri, call) {
    // Parse contact URI
    const match = contactUri.match(/sip:([^@]+)@([^:]+):?(\d+)?/);
    if (!match) {
      throw new Error(`Invalid contact URI: ${contactUri}`);
    }

    const [, username, host, port] = match;
    const targetPort = port || 5060;

    // Modify INVITE to forward to extension
    const parsed = parseSipMessage(message);
    const modifiedInvite = this.modifyInviteForExtension(message, contactUri);

    // Send to extension
    const dgram = require('dgram');
    const socket = dgram.createSocket('udp4');
    
    socket.send(Buffer.from(modifiedInvite), targetPort, host, (err) => {
      if (err) {
        logger.error('Error forwarding INVITE to extension:', err);
        this.sendResponse(rinfo, 500, message);
      } else {
        logger.info(`INVITE forwarded to extension ${username}`);
        // Send 100 Trying response
        this.sendResponse(rinfo, 100, message);
      }
      socket.close();
    });

    // Update call record
    await Call.update(call.id, {
      toExtensionId: call.toExtensionId,
      status: 'ringing'
    });
  }

  modifyInviteForExtension(originalMessage, contactUri) {
    const parsed = parseSipMessage(originalMessage);
    
    // Modify Request-URI
    const modifiedRequestLine = `INVITE ${contactUri} SIP/2.0`;
    
    // Modify headers
    const modifiedHeaders = { ...parsed.headers };
    modifiedHeaders['Request-URI'] = contactUri;
    
    // Rebuild message
    let modifiedMessage = modifiedRequestLine + '\r\n';
    for (const [key, value] of Object.entries(modifiedHeaders)) {
      modifiedMessage += `${key}: ${value}\r\n`;
    }
    modifiedMessage += '\r\n';
    modifiedMessage += parsed.body;

    return modifiedMessage;
  }

  async routeToIVR(message, rinfo, target, call) {
    try {
      logger.info(`Routing call to IVR: ${target.name}`);
      
      // Send 200 OK with SDP for IVR
      // In production, you'd play IVR menu audio
      this.sendResponse(rinfo, 200, message);
      
      // TODO: Implement IVR handler
      logger.warn('IVR routing not yet implemented');

    } catch (error) {
      logger.error('Error routing to IVR:', error);
      this.sendResponse(rinfo, 500, message);
    }
  }

  async routeToQueue(message, rinfo, target, call) {
    try {
      logger.info(`Routing call to queue: ${target.name}`);
      
      // Send 200 OK
      this.sendResponse(rinfo, 200, message);
      
      // TODO: Implement queue handler
      logger.warn('Queue routing not yet implemented');

    } catch (error) {
      logger.error('Error routing to queue:', error);
      this.sendResponse(rinfo, 500, message);
    }
  }

  async routeToVoicemail(message, rinfo, target, call) {
    try {
      logger.info(`Routing call to voicemail: ${target.didNumber}`);
      
      // Send 200 OK
      this.sendResponse(rinfo, 200, message);
      
      // TODO: Implement voicemail handler
      logger.warn('Voicemail routing not yet implemented');

    } catch (error) {
      logger.error('Error routing to voicemail:', error);
      this.sendResponse(rinfo, 500, message);
    }
  }

  sendResponse(rinfo, statusCode, originalMessage) {
    const parsed = parseSipMessage(originalMessage);
    const via = parsed.headers.Via;
    const from = parsed.headers.From;
    const to = parsed.headers.To;
    const callId = parsed.headers['Call-ID'];
    const cseq = parsed.headers.CSeq;

    const statusTexts = {
      100: 'Trying',
      180: 'Ringing',
      200: 'OK',
      404: 'Not Found',
      480: 'Temporarily Unavailable',
      500: 'Server Internal Error'
    };

    const response = `SIP/2.0 ${statusCode} ${statusTexts[statusCode] || 'Unknown'}\r
Via: ${via}\r
From: ${from}\r
To: ${to}\r
Call-ID: ${callId}\r
CSeq: ${cseq}\r
Content-Length: 0\r
\r
`;

    const dgram = require('dgram');
    const socket = dgram.createSocket('udp4');
    
    socket.send(Buffer.from(response), rinfo.port, rinfo.address, (err) => {
      if (err) {
        logger.error('Error sending SIP response:', err);
      }
      socket.close();
    });
  }
}

module.exports = new CallHandler();
