const DIDNumber = require('../../database/models/DIDNumber');
const Extension = require('../../database/models/Extension');
const IVR = require('../../database/models/IVR');
const Queue = require('../../database/models/Queue');
const logger = require('../../utils/logger');

class DIDRouter {
  async routeDID(didNumberId) {
    try {
      const didNumber = await DIDNumber.findById(didNumberId);
      
      if (!didNumber || !didNumber.enabled) {
        logger.warn(`DID ${didNumberId} not found or disabled`);
        return null;
      }

      const route = {
        didNumberId: didNumber.id,
        didNumber: didNumber.number,
        routeType: didNumber.routeType,
        routeTargetId: didNumber.routeTargetId
      };

      // Get target details based on route type
      switch (didNumber.routeType) {
        case 'extension':
          const extension = await Extension.findById(didNumber.routeTargetId);
          if (!extension || !extension.enabled) {
            logger.warn(`Extension ${didNumber.routeTargetId} not found or disabled`);
            return null;
          }
          route.target = {
            type: 'extension',
            id: extension.id,
            username: extension.username,
            displayName: extension.displayName
          };
          break;

        case 'ivr':
          const ivr = await IVR.findById(didNumber.routeTargetId);
          if (!ivr || !ivr.enabled) {
            logger.warn(`IVR ${didNumber.routeTargetId} not found or disabled`);
            return null;
          }
          route.target = {
            type: 'ivr',
            id: ivr.id,
            name: ivr.name,
            config: ivr.config
          };
          break;

        case 'queue':
          const queue = await Queue.findById(didNumber.routeTargetId);
          if (!queue || !queue.enabled) {
            logger.warn(`Queue ${didNumber.routeTargetId} not found or disabled`);
            return null;
          }
          route.target = {
            type: 'queue',
            id: queue.id,
            name: queue.name,
            strategy: queue.strategy
          };
          break;

        case 'voicemail':
          // Voicemail routing
          route.target = {
            type: 'voicemail',
            didNumber: didNumber.number
          };
          break;

        default:
          logger.warn(`Unknown route type: ${didNumber.routeType}`);
          return null;
      }

      logger.info(`DID ${didNumber.number} routed to ${route.routeType}:${route.routeTargetId}`);
      return route;
    } catch (error) {
      logger.error('Error routing DID:', error);
      return null;
    }
  }

  async routeByNumber(calledNumber) {
    try {
      // Remove + and spaces, keep only digits
      const normalizedNumber = calledNumber.replace(/[+\s-]/g, '');
      
      const didNumber = await DIDNumber.findByNumber(normalizedNumber);
      if (!didNumber) {
        return null;
      }

      return await this.routeDID(didNumber.id);
    } catch (error) {
      logger.error('Error routing by number:', error);
      return null;
    }
  }
}

module.exports = new DIDRouter();
