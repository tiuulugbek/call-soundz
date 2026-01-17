#!/usr/bin/env node

const dgram = require('dgram');
const config = require('./backend/src/config/config');

console.log('=== Bell.uz Trunk Connection Test ===\n');

const trunkServer = config.sip.trunk.server || 'bell.uz';
const trunkPort = config.sip.trunk.port || 5060;
const trunkUsername = config.sip.trunk.username || '99785553322';

console.log('Trunk Configuration:');
console.log('  Server:', trunkServer);
console.log('  Port:', trunkPort);
console.log('  Username:', trunkUsername);
console.log('');

// Test trunk registration
const client = dgram.createSocket('udp4');

const branch = 'z9hG4bK' + Math.random().toString(36).substring(2, 15);
const callId = Math.random().toString(36).substring(2, 15) + '@' + config.sip.server.domain;
const fromTag = Math.random().toString(36).substring(2, 15);
const toTag = Math.random().toString(36).substring(2, 15);

const registerRequest = `REGISTER sip:${trunkServer} SIP/2.0\r
Via: SIP/2.0/UDP ${config.sip.server.domain}:${config.sip.server.port};branch=${branch}\r
Max-Forwards: 70\r
From: <sip:${trunkUsername}@${trunkServer}>;tag=${fromTag}\r
To: <sip:${trunkUsername}@${trunkServer}>;tag=${toTag}\r
Call-ID: ${callId}\r
CSeq: 1 REGISTER\r
Contact: <sip:${trunkUsername}@${config.sip.server.domain}:${config.sip.server.port}>\r
Expires: 3600\r
Content-Length: 0\r
\r
`;

console.log('Sending REGISTER request to', trunkServer + ':' + trunkPort + '...');
console.log('Request preview:', registerRequest.substring(0, 150) + '...\n');

client.send(registerRequest, trunkPort, trunkServer, (err) => {
    if (err) {
        console.error('❌ Error sending REGISTER:', err.message);
        client.close();
        process.exit(1);
    } else {
        console.log('✅ REGISTER request sent successfully');
        console.log('Waiting for response...\n');
    }
});

client.on('message', (msg, rinfo) => {
    console.log('✅ Response received from:', rinfo.address + ':' + rinfo.port);
    console.log('Response:');
    console.log('─'.repeat(60));
    console.log(msg.toString());
    console.log('─'.repeat(60));
    
    const response = msg.toString();
    const statusLine = response.split('\r\n')[0];
    const statusCode = parseInt(statusLine.split(' ')[1]);
    
    if (statusCode >= 200 && statusCode < 300) {
        console.log('\n✅ Registration successful! (Status:', statusCode + ')');
    } else if (statusCode === 401 || statusCode === 407) {
        console.log('\n⚠️  Authentication required (Status:', statusCode + ')');
        console.log('   This is normal - trunk may require digest authentication');
    } else {
        console.log('\n❌ Registration failed (Status:', statusCode + ')');
    }
    
    client.close();
    setTimeout(() => process.exit(0), 500);
});

client.on('error', (err) => {
    console.error('❌ Socket error:', err.message);
    client.close();
    process.exit(1);
});

setTimeout(() => {
    if (!client.closed) {
        console.log('\n⚠️  No response received within 5 seconds');
        console.log('   Possible reasons:');
        console.log('   - Trunk server is not reachable');
        console.log('   - Firewall blocking connection');
        console.log('   - Server is not responding');
        client.close();
        process.exit(1);
    }
}, 5000);
