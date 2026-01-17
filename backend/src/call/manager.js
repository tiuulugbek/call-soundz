const Call = require('../database/models/Call');
const { generateCallId } = require('../utils/helpers');
const logger = require('../utils/logger');

// In-memory call storage for active calls
const activeCalls = new Map();

class CallManager {
  async initiateCall({ from, to, direction }) {
    const callId = generateCallId();
    
    try {
      // Create call record
      const call = await Call.create({
        callId,
        fromNumber: from,
        toNumber: to,
        direction,
        status: 'ringing'
      });
      
      // Store in active calls
      activeCalls.set(callId, {
        callId,
        from,
        to,
        direction,
        status: 'ringing',
        startTime: new Date()
      });
      
      // TODO: Implement actual SIP call initiation
      // This would involve SIP INVITE message handling
      
      logger.info(`Call initiated: ${callId} from ${from} to ${to}`);
      
      return call;
    } catch (error) {
      logger.error('Error initiating call:', error);
      throw error;
    }
  }

  async transferCall(callId, target) {
    const call = activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    // TODO: Implement SIP REFER/transfer
    logger.info(`Call ${callId} transferred to ${target}`);
    
    return { success: true, callId, target };
  }

  async holdCall(callId) {
    const call = activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    // TODO: Implement SIP hold (re-INVITE with sendonly)
    logger.info(`Call ${callId} held`);
    
    return { success: true, callId };
  }

  async resumeCall(callId) {
    const call = activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    // TODO: Implement SIP resume (re-INVITE with sendrecv)
    logger.info(`Call ${callId} resumed`);
    
    return { success: true, callId };
  }

  async hangupCall(callId) {
    const call = activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    try {
      const duration = Math.floor((new Date() - call.startTime) / 1000);
      
      await Call.update(callId, {
        status: 'completed',
        endedAt: new Date(),
        duration
      });
      
      activeCalls.delete(callId);
      
      // TODO: Send SIP BYE message
      logger.info(`Call ${callId} terminated`);
      
      return { success: true, callId, duration };
    } catch (error) {
      logger.error('Error hanging up call:', error);
      throw error;
    }
  }

  async startRecording(callId) {
    const call = activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    // TODO: Implement recording start
    await Call.update(callId, {
      recordingEnabled: true
    });
    
    logger.info(`Recording started for call ${callId}`);
    return { success: true, callId };
  }

  async stopRecording(callId) {
    const call = activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }
    
    // TODO: Implement recording stop
    await Call.update(callId, {
      recordingEnabled: false
    });
    
    logger.info(`Recording stopped for call ${callId}`);
    return { success: true, callId };
  }

  getActiveCall(callId) {
    return activeCalls.get(callId);
  }

  getAllActiveCalls() {
    return Array.from(activeCalls.values());
  }
}

module.exports = new CallManager();
