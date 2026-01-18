// SIP Status Check Script
// Bu skript SIP trunk, DID number va Extension ulanish holatini tekshiradi

require('dotenv').config();
const pool = require('./backend/src/database/connection');
const DIDNumber = require('./backend/src/database/models/DIDNumber');
const Extension = require('./backend/src/database/models/Extension');

async function checkStatus() {
  console.log('==========================================');
  console.log('SIP Status Check');
  console.log('==========================================\n');

  try {
    // 1. Database ulanishini tekshirish
    console.log('[1] Database ulanishini tekshiryapman...');
    await pool.query('SELECT NOW()');
    console.log('✓ Database ulanishi OK\n');

    // 2. DID Numbers ni tekshirish
    console.log('[2] DID Numbers ni tekshiryapman...');
    const didNumbers = await DIDNumber.findAll();
    console.log(`   Topilgan DID Numbers: ${didNumbers.length}`);
    
    if (didNumbers.length === 0) {
      console.log('   ⚠ DID Numbers topilmadi!');
      console.log('   DID Number yaratish kerak.\n');
    } else {
      for (const did of didNumbers) {
        console.log(`   - Number: ${did.number}`);
        console.log(`     Provider: ${did.provider || 'N/A'}`);
        console.log(`     Enabled: ${did.enabled ? 'Yes' : 'No'}`);
        console.log(`     Route Type: ${did.routeType || 'N/A'}`);
        console.log(`     Trunk Username: ${did.trunkUsername || 'N/A'}`);
        console.log(`     Trunk Password: ${did.trunkPassword ? '***' : 'N/A'}`);
        console.log('');
      }
    }

    // 3. Extensions ni tekshirish
    console.log('[3] Extensions ni tekshiryapman...');
    const extensions = await Extension.findAll();
    console.log(`   Topilgan Extensions: ${extensions.length}`);
    
    if (extensions.length === 0) {
      console.log('   ⚠ Extensions topilmadi!');
      console.log('   Extension yaratish kerak.\n');
    } else {
      for (const ext of extensions) {
        console.log(`   - Username: ${ext.username}`);
        console.log(`     Display Name: ${ext.display_name || 'N/A'}`);
        console.log(`     Enabled: ${ext.enabled ? 'Yes' : 'No'}`);
        console.log('');
      }
    }

    // 4. SIP Trunk Manager holatini tekshirish
    console.log('[4] SIP Trunk Manager holatini tekshiryapman...');
    try {
      const SIPTrunkManager = require('./backend/src/sip/trunk/manager');
      const trunkManager = global.sipTrunkManager;
      
      if (!trunkManager) {
        console.log('   ⚠ SIP Trunk Manager initialized emas!');
      } else {
        console.log('   ✓ SIP Trunk Manager initialized');
        const trunksCount = trunkManager.trunks ? trunkManager.trunks.size : 0;
        console.log(`   Active Trunks: ${trunksCount}`);
        
        if (trunksCount > 0) {
          for (const [didId, trunkInfo] of trunkManager.trunks.entries()) {
            console.log(`   - DID ID: ${didId}`);
            console.log(`     Registered: ${trunkInfo.registered ? 'Yes' : 'No'}`);
            console.log(`     Contact URI: ${trunkInfo.contactUri || 'N/A'}`);
            console.log(`     Expires At: ${trunkInfo.expiresAt || 'N/A'}`);
            console.log('');
          }
        }
      }
    } catch (error) {
      console.log('   ✗ SIP Trunk Manager xatosi:', error.message);
    }

    // 5. SIP Registrar holatini tekshirish
    console.log('[5] SIP Registrar holatini tekshiryapman...');
    try {
      const registrar = global.sipRegistrar;
      
      if (!registrar) {
        console.log('   ⚠ SIP Registrar initialized emas!');
      } else {
        console.log('   ✓ SIP Registrar initialized');
        console.log(`   Port: ${registrar.port || 'N/A'}`);
        
        if (registrar.registrations) {
          const regCount = registrar.registrations.size || 0;
          console.log(`   Registered Extensions: ${regCount}`);
          
          if (regCount > 0) {
            for (const [extensionId, reg] of registrar.registrations.entries()) {
              console.log(`   - Extension ID: ${extensionId}`);
              console.log(`     Contact: ${reg.contact || 'N/A'}`);
              console.log(`     Expires: ${reg.expires || 'N/A'}`);
              console.log('');
            }
          }
        }
      }
    } catch (error) {
      console.log('   ✗ SIP Registrar xatosi:', error.message);
    }

    // 6. .env sozlamalarini tekshirish
    console.log('[6] Environment sozlamalarini tekshiryapman...');
    console.log(`   SIP_DOMAIN: ${process.env.SIP_DOMAIN || 'N/A'}`);
    console.log(`   SIP_PORT: ${process.env.SIP_PORT || 'N/A'}`);
    console.log(`   TRUNK_SERVER: ${process.env.TRUNK_SERVER || 'N/A'}`);
    console.log(`   TRUNK_USERNAME: ${process.env.TRUNK_USERNAME || 'N/A'}`);
    console.log(`   TRUNK_PASSWORD: ${process.env.TRUNK_PASSWORD ? '***' : 'N/A'}\n`);

    console.log('==========================================');
    console.log('Status Check Yakunlandi');
    console.log('==========================================\n');

    console.log('API Endpoints:');
    console.log('  GET http://185.137.152.229:3005/api/v1/sip-status/trunks');
    console.log('  GET http://185.137.152.229:3005/api/v1/sip-status/extensions');
    console.log('  GET http://185.137.152.229:3005/api/v1/sip-status/server');
    console.log('  GET http://185.137.152.229:3005/api/v1/did-numbers\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Xatolik:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkStatus();
