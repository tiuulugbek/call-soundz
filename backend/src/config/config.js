require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3005,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },
  
  sip: {
    server: {
      host: process.env.SIP_HOST || '0.0.0.0',
      port: parseInt(process.env.SIP_PORT) || 5060,
      trunkPort: parseInt(process.env.SIP_TRUNK_PORT) || 5061,
      transport: process.env.SIP_TRANSPORT || 'udp',
      domain: process.env.SIP_DOMAIN || 'call.soundz.uz'
    },
    
    trunk: {
      provider: 'bell.uz',
      server: process.env.TRUNK_SERVER || 'bell.uz',
      username: process.env.TRUNK_USERNAME || '99785553322',
      password: process.env.TRUNK_PASSWORD || '',
      port: parseInt(process.env.TRUNK_PORT) || 5060,
      transport: process.env.TRUNK_TRANSPORT || 'udp'
    }
  },
  
  media: {
    rtp: {
      startPort: parseInt(process.env.RTP_START_PORT) || 10000,
      endPort: parseInt(process.env.RTP_END_PORT) || 20000
    },
    codecs: ['PCMU', 'PCMA', 'opus'],
    echoCancellation: process.env.ECHO_CANCELLATION !== 'false'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'soundzcalldb',
    username: process.env.DB_USER || 'soundzuz_user',
    password: process.env.DB_PASSWORD || 'Soundz&2026',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  
  recording: {
    enabled: process.env.RECORDING_ENABLED !== 'false',
    format: process.env.RECORDING_FORMAT || 'wav',
    path: process.env.RECORDING_PATH || '/var/www/call.soundz.uz/recordings',
    maxSize: parseInt(process.env.RECORDING_MAX_SIZE) || 100 * 1024 * 1024
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  voicemail: {
    path: process.env.VOICEMAIL_PATH || '/var/www/call.soundz.uz/voicemails',
    maxDuration: parseInt(process.env.VOICEMAIL_MAX_DURATION) || 300
  },
  
  ivr: {
    audioPath: process.env.IVR_AUDIO_PATH || '/var/www/call.soundz.uz/ivr'
  }
};
