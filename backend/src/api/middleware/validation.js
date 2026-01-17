const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }
    
    next();
  };
};

const schemas = {
  createExtension: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().max(100),
    email: Joi.string().email(),
    enabled: Joi.boolean(),
    callForwardEnabled: Joi.boolean(),
    callForwardNumber: Joi.string().pattern(/^[0-9+]+$/),
    voicemailEnabled: Joi.boolean(),
    recordingEnabled: Joi.boolean()
  }),

  updateExtension: Joi.object({
    password: Joi.string().min(6).optional(), // Password o'zgartirish ixtiyoriy
    displayName: Joi.string().max(100).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    enabled: Joi.boolean(),
    callForwardEnabled: Joi.boolean(),
    callForwardNumber: Joi.string().pattern(/^[0-9+]+$/).allow(null, ''),
    voicemailEnabled: Joi.boolean(),
    recordingEnabled: Joi.boolean()
  }),

  changePassword: Joi.object({
    password: Joi.string().min(6).required()
  }),

  createDID: Joi.object({
    number: Joi.string().pattern(/^[0-9+]+$/).required(),
    provider: Joi.string(),
    trunkUsername: Joi.string(),
    trunkPassword: Joi.string(),
    routeType: Joi.string().valid('extension', 'ivr', 'queue', 'voicemail').required(),
    routeTargetId: Joi.number().integer().required(),
    enabled: Joi.boolean()
  }),

  updateDIDRoute: Joi.object({
    routeType: Joi.string().valid('extension', 'ivr', 'queue', 'voicemail').required(),
    routeTargetId: Joi.number().integer().required()
  }),

  createCall: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    direction: Joi.string().valid('inbound', 'outbound', 'internal')
  }),

  createIVR: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    timeout: Joi.number().integer().min(1).max(60),
    maxAttempts: Joi.number().integer().min(1).max(10),
    config: Joi.object().required(),
    enabled: Joi.boolean()
  }),

  createQueue: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    strategy: Joi.string().valid('ringall', 'leastrecent', 'fewestcalls', 'random'),
    timeout: Joi.number().integer().min(1),
    maxWait: Joi.number().integer().min(1),
    retry: Joi.number().integer().min(0),
    wrapUpTime: Joi.number().integer().min(0),
    enabled: Joi.boolean()
  })
};

module.exports = {
  validate,
  schemas
};
