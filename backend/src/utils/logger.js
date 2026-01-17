const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = '/var/www/call.soundz.uz/logs';

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    // If we can't create the directory, use a local one
    const localLogDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(localLogDir)) {
      fs.mkdirSync(localLogDir, { recursive: true });
    }
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'pbx-system' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Always add Console transport for PM2 logs
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, service }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  )
}));

module.exports = logger;
