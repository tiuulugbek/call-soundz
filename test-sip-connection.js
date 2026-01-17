const dgram = require('dgram');

// Test SIP REGISTER request
const client = dgram.createSocket('udp4');

const sipMessage = `REGISTER sip:call.soundz.uz SIP/2.0\r
Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds\r
From: <sip:1001@call.soundz.uz>;tag=1928301774\r
To: <sip:1001@call.soundz.uz>\r
Call-ID: a84b4c76e66710\r
CSeq: 1 REGISTER\r
Contact: <sip:1001@192.168.1.100:5060>\r
Expires: 3600\r
Content-Length: 0\r
\r
`;

console.log('Sending SIP REGISTER request to call.soundz.uz:5060...');
console.log('Message:', sipMessage);

client.send(sipMessage, 5060, 'call.soundz.uz', (err) => {
    if (err) {
        console.error('Error sending:', err);
        client.close();
    } else {
        console.log('Message sent successfully');
    }
});

client.on('message', (msg, rinfo) => {
    console.log('\n=== Response Received ===');
    console.log('From:', rinfo.address + ':' + rinfo.port);
    console.log('Response:', msg.toString());
    client.close();
});

client.on('error', (err) => {
    console.error('Client error:', err);
    client.close();
});

setTimeout(() => {
    console.log('\nTimeout - no response received');
    client.close();
    process.exit(0);
}, 5000);
