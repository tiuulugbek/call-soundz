// Trunk Status Check Script
// Bu skript trunk ulanish holatini batafsil tekshiradi

require('dotenv').config();
const http = require('http');

const baseUrl = 'http://localhost:3005';
const username = 'admin';
const password = 'admin123';

async function login() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({ username, password });
    
    const options = {
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success && result.token) {
            resolve(result.token);
          } else {
            reject(new Error('Login failed'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

async function apiRequest(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3005,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkTrunkStatus() {
  console.log('==========================================');
  console.log('Trunk Ulanish Holati');
  console.log('==========================================\n');

  try {
    // Login
    console.log('[1] Login qilish...');
    const token = await login();
    console.log('✓ Login muvaffaqiyatli!\n');

    // SIP Server Status
    console.log('[2] SIP Server Holati...');
    const serverStatus = await apiRequest('/api/v1/sip-status/server', token);
    if (serverStatus.success) {
      const data = serverStatus.data;
      console.log('  Registrar:');
      console.log(`    Running: ${data.registrar.running ? 'Yes' : 'No'}`);
      console.log(`    Port: ${data.registrar.port || 'N/A'}`);
      console.log('  Trunk Manager:');
      console.log(`    Running: ${data.trunkManager.running ? 'Yes' : 'No'}`);
      console.log(`    Trunks Count: ${data.trunkManager.trunksCount || 0}\n`);
    }

    // DID Numbers
    console.log('[3] DID Numbers...');
    const didNumbers = await apiRequest('/api/v1/did-numbers', token);
    if (didNumbers.success) {
      const dids = didNumbers.data;
      if (dids.length === 0) {
        console.log('  ⚠ DID Numbers topilmadi!\n');
      } else {
        for (const did of dids) {
          console.log(`  DID Number: ${did.number}`);
          console.log(`    Provider: ${did.provider || 'N/A'}`);
          console.log(`    Enabled: ${did.enabled ? 'Yes' : 'No'}`);
          console.log(`    Trunk Username: ${did.trunk_username || '⚠ YO\'Q (MAJBURIY!)'}`);
          console.log(`    Trunk Password: ${did.trunk_password ? '***' : '⚠ YO\'Q (MAJBURIY!)'}`);
          console.log(`    Route Type: ${did.route_type || 'N/A'}\n`);
          
          if (!did.trunk_username || !did.trunk_password) {
            console.log('    ⚠ MUAMMO: Trunk username va password yo\'q!');
            console.log('    Trunk ulanishi uchun ularni qo\'shish kerak.\n');
          }
        }
      }
    }

    // Trunk Status
    console.log('[4] Trunk Registration Holati...');
    const trunkStatus = await apiRequest('/api/v1/sip-status/trunks', token);
    if (trunkStatus.success) {
      const trunks = trunkStatus.data;
      if (trunks.length === 0) {
        console.log('  ⚠ Registered trunks topilmadi!\n');
        console.log('  Sabablar:');
        console.log('    1. DID Number da trunk_username/trunk_password yo\'q');
        console.log('    2. SIP Trunk Manager initialized emas');
        console.log('    3. Trunk registration muvaffaqiyatsiz\n');
      } else {
        for (const trunk of trunks) {
          console.log(`  DID: ${trunk.number}`);
          console.log(`    Provider: ${trunk.provider}`);
          console.log(`    Registered: ${trunk.registered ? '✅ YES' : '❌ NO'}`);
          console.log(`    Contact URI: ${trunk.contactUri || 'N/A'}`);
          console.log(`    Expires At: ${trunk.expiresAt || 'N/A'}\n`);
        }
      }
    }

    console.log('==========================================');
    console.log('Xulosa:');
    console.log('==========================================\n');
    
    // Xulosa
    const dids = didNumbers.success ? didNumbers.data : [];
    const trunks = trunkStatus.success ? trunkStatus.data : [];
    const trunkManagerRunning = serverStatus.success ? serverStatus.data.trunkManager.running : false;

    if (!trunkManagerRunning) {
      console.log('❌ SIP Trunk Manager initialized emas!');
      console.log('   Server ni qayta ishga tushiring.\n');
    }

    if (dids.length > 0) {
      const didWithCredentials = dids.filter(d => d.trunk_username && d.trunk_password);
      if (didWithCredentials.length === 0) {
        console.log('❌ DID Number da trunk_username/trunk_password yo\'q!');
        console.log('   Web Dashboard yoki API orqali qo\'shing.\n');
      }
    }

    if (trunks.length === 0) {
      console.log('❌ Trunk registration muvaffaqiyatsiz!');
      console.log('   Sabablari yuqorida ko\'rsatilgan.\n');
    } else {
      const registered = trunks.filter(t => t.registered);
      if (registered.length > 0) {
        console.log(`✅ ${registered.length} trunk registered!`);
      } else {
        console.log('⚠ Trunks topildi, lekin registered emas!');
      }
    }

    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Xatolik:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTrunkStatus();
