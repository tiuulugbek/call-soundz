const dgram = require('dgram');

// Test UDP packet yuborish
const client = dgram.createSocket('udp4');

const testMessage = `REGISTER sip:call.soundz.uz SIP/2.0\r
Via: SIP/2.0/UDP test:5060;branch=z9hG4bK-test123\r
From: <sip:1002@call.soundz.uz>;tag=test123\r
To: <sip:1002@call.soundz.uz>\r
Call-ID: test-call-id-123\r
CSeq: 1 REGISTER\r
Contact: <sip:1002@test:5060>\r
Max-Forwards: 70\r
Content-Length: 0\r
\r
`;

const serverPort = 5060;
const serverHost = '127.0.0.1'; // Localhost test

console.log(`Testing UDP socket on ${serverHost}:${serverPort}`);
console.log(`Sending test REGISTER message...`);

client.send(testMessage, serverPort, serverHost, (err) => {
  if (err) {
    console.error('Error sending message:', err);
    client.close();
    return;
  }
  console.log('✅ Test message sent successfully!');
  console.log(`Check server logs: pm2 logs pbx-system --lines 20`);
  
  setTimeout(() => {
    client.close();
    console.log('Test completed.');
    process.exit(0);
  }, 1000);
});
