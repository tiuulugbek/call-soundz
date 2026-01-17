const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique call ID
 */
function generateCallId() {
  return uuidv4();
}

/**
 * Generate SIP tag
 */
function generateTag() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Generate branch parameter for Via header
 */
function generateBranch() {
  return 'z9hG4bK' + crypto.randomBytes(8).toString('hex');
}

/**
 * Normalize phone number
 */
function normalizePhoneNumber(number) {
  if (!number) return '';
  // Remove all non-digit characters
  let normalized = number.replace(/\D/g, '');
  // Add country code if missing
  if (normalized.startsWith('998')) {
    return normalized;
  } else if (normalized.startsWith('8')) {
    return '998' + normalized.substring(1);
  } else if (normalized.length === 9) {
    return '998' + normalized;
  }
  return normalized;
}

/**
 * Extract username from SIP URI
 */
function extractUsernameFromUri(uri) {
  if (!uri) return null;
  const match = uri.match(/sip:([^@]+)@/);
  return match ? match[1] : null;
}

/**
 * Extract domain from SIP URI
 */
function extractDomainFromUri(uri) {
  if (!uri) return null;
  const match = uri.match(/sip:[^@]+@([^;>]+)/);
  return match ? match[1].split(';')[0] : null;
}

/**
 * Format SIP URI
 */
function formatSipUri(username, domain, params = {}) {
  let uri = `sip:${username}@${domain}`;
  const paramStrings = [];
  if (params.transport) paramStrings.push(`transport=${params.transport}`);
  if (params.user) paramStrings.push(`user=${params.user}`);
  if (paramStrings.length > 0) {
    uri += ';' + paramStrings.join(';');
  }
  return uri;
}

/**
 * Calculate MD5 hash for SIP Digest Authentication
 */
function calculateMD5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Generate SIP Digest Authentication response
 */
function generateDigestResponse(username, realm, password, method, uri, nonce, nc, cnonce, qop) {
  const ha1 = calculateMD5(`${username}:${realm}:${password}`);
  const ha2 = calculateMD5(`${method}:${uri}`);
  const response = calculateMD5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
  return response;
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration in seconds to HH:MM:SS
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



/**
 * Parse SIP message string into structured object
 */
function parseSipMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid SIP message');
  }

  const lines = message.split(/\r?\n/);
  const result = {
    firstLine: lines[0],
    headers: {},
    body: ''
  };

  let bodyStartIndex = -1;

  // Find empty line separating headers and body
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      bodyStartIndex = i + 1;
      break;
    }
  }

  // Parse headers
  for (let i = 1; i < (bodyStartIndex > 0 ? bodyStartIndex - 1 : lines.length); i++) {
    const line = lines[i];
    if (!line || line.trim() === '') continue;

    // Handle continuation lines (start with space or tab)
    if (line.match(/^\s/)) {
      // Continuation of previous header
      const headerKeys = Object.keys(result.headers);
      if (headerKeys.length > 0) {
        const lastHeader = headerKeys[headerKeys.length - 1];
        result.headers[lastHeader] += ' ' + line.trim();
      }
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const headerName = line.substring(0, colonIndex).trim();
      const headerValue = line.substring(colonIndex + 1).trim();
      
      // Handle multi-value headers (comma-separated)
      if (result.headers[headerName]) {
        result.headers[headerName] += ', ' + headerValue;
      } else {
        result.headers[headerName] = headerValue;
      }
    }
  }

  // Parse body
  if (bodyStartIndex > 0 && bodyStartIndex < lines.length) {
    result.body = lines.slice(bodyStartIndex).join('\r\n');
  }

  // Parse first line to determine method/response
  const firstLineParts = result.firstLine.split(' ');
  if (firstLineParts[0].startsWith('SIP/')) {
    // Response
    result.type = 'response';
    result.statusCode = parseInt(firstLineParts[1]);
    result.statusText = firstLineParts.slice(2).join(' ');
  } else {
    // Request
    result.type = 'request';
    result.method = firstLineParts[0];
    result.uri = firstLineParts[1];
    result.version = firstLineParts[2];
  }

  return result;
}

/**
 * Extract URI from SIP header value
 */
function extractUri(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }

  // Try to extract URI from angle brackets: <sip:user@domain>
  const angleMatch = header.match(/<([^>]+)>/);
  if (angleMatch) {
    return angleMatch[1];
  }

  // Try to extract URI from quoted string: "Display Name" sip:user@domain
  const quotedMatch = header.match(/["']([^"']+)["']\s*(sip:[^\s;]+)/);
  if (quotedMatch && quotedMatch[2]) {
    return quotedMatch[2];
  }

  // Try to extract sip: URI directly
  const sipMatch = header.match(/(sip:[^\s;>]+)/);
  if (sipMatch) {
    return sipMatch[1];
  }

  // Fallback: return first part before space
  const parts = header.trim().split(/\s+/);
  return parts[0] || null;
}

module.exports = {
  generateCallId,
  generateTag,
  generateBranch,
  normalizePhoneNumber,
  extractUsernameFromUri,
  extractDomainFromUri,
  formatSipUri,
  calculateMD5,
  generateDigestResponse,
  sleep,
  formatDuration,
  parseSipMessage,
  extractUri
};
