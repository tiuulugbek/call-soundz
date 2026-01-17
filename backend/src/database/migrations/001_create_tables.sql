-- Extensions Table
CREATE TABLE IF NOT EXISTS extensions (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(100),
  enabled BOOLEAN DEFAULT TRUE,
  call_forward_enabled BOOLEAN DEFAULT FALSE,
  call_forward_number VARCHAR(20),
  voicemail_enabled BOOLEAN DEFAULT TRUE,
  recording_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extensions_username ON extensions(username);
CREATE INDEX IF NOT EXISTS idx_extensions_enabled ON extensions(enabled);

-- DID Numbers Table
CREATE TABLE IF NOT EXISTS did_numbers (
  id SERIAL PRIMARY KEY,
  number VARCHAR(20) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  trunk_username VARCHAR(50),
  route_type VARCHAR(20) NOT NULL,
  route_target_id INTEGER,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_did_numbers_number ON did_numbers(number);
CREATE INDEX IF NOT EXISTS idx_did_numbers_route ON did_numbers(route_type, route_target_id);

-- Calls Table (CDR)
CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  call_id VARCHAR(100) UNIQUE NOT NULL,
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  from_extension_id INTEGER REFERENCES extensions(id),
  to_extension_id INTEGER REFERENCES extensions(id),
  did_number_id INTEGER REFERENCES did_numbers(id),
  direction VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,
  duration INTEGER DEFAULT 0,
  recording_path VARCHAR(255),
  recording_enabled BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP NOT NULL,
  answered_at TIMESTAMP,
  ended_at TIMESTAMP,
  hangup_cause VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_call_id ON calls(call_id);
CREATE INDEX IF NOT EXISTS idx_calls_from_number ON calls(from_number);
CREATE INDEX IF NOT EXISTS idx_calls_to_number ON calls(to_number);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- Recordings Table
CREATE TABLE IF NOT EXISTS recordings (
  id SERIAL PRIMARY KEY,
  call_id INTEGER REFERENCES calls(id),
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  duration INTEGER,
  format VARCHAR(10) DEFAULT 'wav',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_call_id ON recordings(call_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at);

-- IVR Menus Table
CREATE TABLE IF NOT EXISTS ivr_menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  greeting_file VARCHAR(255),
  timeout INTEGER DEFAULT 10,
  max_attempts INTEGER DEFAULT 3,
  invalid_audio_file VARCHAR(255),
  timeout_audio_file VARCHAR(255),
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Queues Table
CREATE TABLE IF NOT EXISTS queues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  strategy VARCHAR(20) DEFAULT 'ringall',
  timeout INTEGER DEFAULT 30,
  max_wait INTEGER DEFAULT 300,
  retry INTEGER DEFAULT 5,
  wrap_up_time INTEGER DEFAULT 10,
  announcement_file VARCHAR(255),
  music_on_hold VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_members (
  id SERIAL PRIMARY KEY,
  queue_id INTEGER REFERENCES queues(id) ON DELETE CASCADE,
  extension_id INTEGER REFERENCES extensions(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(queue_id, extension_id)
);

-- Voicemail Table
CREATE TABLE IF NOT EXISTS voicemails (
  id SERIAL PRIMARY KEY,
  extension_id INTEGER REFERENCES extensions(id) ON DELETE CASCADE,
  caller_number VARCHAR(20),
  caller_name VARCHAR(100),
  file_path VARCHAR(255) NOT NULL,
  duration INTEGER,
  listened BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voicemails_extension ON voicemails(extension_id);
CREATE INDEX IF NOT EXISTS idx_voicemails_listened ON voicemails(listened);

-- Conferences Table
CREATE TABLE IF NOT EXISTS conferences (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  pin_code VARCHAR(20),
  max_participants INTEGER DEFAULT 10,
  recording_enabled BOOLEAN DEFAULT FALSE,
  recording_path VARCHAR(255),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conference_participants (
  id SERIAL PRIMARY KEY,
  conference_id INTEGER REFERENCES conferences(id) ON DELETE CASCADE,
  call_id VARCHAR(100),
  extension_id INTEGER REFERENCES extensions(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  muted BOOLEAN DEFAULT FALSE
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users Table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Extension Registration Status (for tracking online/offline)
CREATE TABLE IF NOT EXISTS extension_registrations (
  id SERIAL PRIMARY KEY,
  extension_id INTEGER REFERENCES extensions(id) ON DELETE CASCADE,
  contact_uri VARCHAR(255) NOT NULL,
  expires INTEGER NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(extension_id)
);

CREATE INDEX IF NOT EXISTS idx_extension_registrations_extension ON extension_registrations(extension_id);
