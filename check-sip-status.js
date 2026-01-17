#!/usr/bin/env node

const dgram = require('dgram');
const config = require('./backend/src/config/config');

console.log('=== SIP Connection Diagnostic Tool ===\n');

// Test 1: SIP Registrar Port
console.log('1. SIP Registrar Port (5060/UDP):');
const client1 = dgram.createSocket('udp4');
client1.bind(0, () => {
    const testMessage = Buffer.from('OPTIONS sip:call.soundz.uz SIP/2.0\r\nVia: SIP/2.0/UDP 127.0.0.1:5060\r\nFrom: <sip:test@call.soundz.uz>;tag=test\r\nTo: <sip:test@call.soundz.uz>\r\nCall-ID: test@call.soundz.uz\r\nCSeq: 1 OPTIONS\r\nContent-Length: 0\r\n\r\n');
    
    client1.send(testMessage, 5060, '127.0.0.1', (err) => {
        if (err) {
            console.log('  ❌ Cannot send to port 5060:', err.message);
        } else {
            console.log('  ✅ Port 5060 is accessible locally');
        }
    });
    
    client1.on('message', (msg, rinfo) => {
        console.log('  ✅ Received response from server:', rinfo.address + ':' + rinfo.port);
        console.log('  Response preview:', msg.toString().substring(0, 100));
        client1.close();
    });
    
    setTimeout(() => {
        if (!client1.closed) {
            console.log('  ⚠️  No response received (server may not be running or not responding)');
            client1.close();
        }
    }, 2000);
});

// Test 2: Check server configuration
console.log('\n2. Server Configuration:');
console.log('  SIP Domain:', config.sip.server.domain);
console.log('  SIP Host:', config.sip.server.host);
console.log('  SIP Port:', config.sip.server.port);
console.log('  Trunk Server:', config.sip.trunk.server);
console.log('  Trunk Port:', config.sip.trunk.port);
console.log('  Trunk Username:', config.sip.trunk.username);

// Test 3: DNS Resolution
console.log('\n3. DNS Resolution:');
const dns = require('dns');
dns.resolve4(config.sip.server.domain, (err, addresses) => {
    if (err) {
        console.log('  ❌ Cannot resolve', config.sip.server.domain + ':', err.message);
    } else {
        console.log('  ✅', config.sip.server.domain, 'resolves to:', addresses.join(', '));
    }
});

dns.resolve4(config.sip.trunk.server, (err, addresses) => {
    if (err) {
        console.log('  ❌ Cannot resolve', config.sip.trunk.server + ':', err.message);
    } else {
        console.log('  ✅', config.sip.trunk.server, 'resolves to:', addresses.join(', '));
    }
    
    setTimeout(() => process.exit(0), 3000);
});
