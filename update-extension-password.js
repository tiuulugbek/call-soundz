// Extension parolini yangilash skripti
require('dotenv').config();
const Extension = require('./backend/src/database/models/Extension');

async function updateExtensionPassword() {
  try {
    const username = '1001';
    const password = '123456';

    console.log('==========================================');
    console.log('Extension Parolni Yangilash');
    console.log('==========================================\n');

    // Extension ni topish
    const extension = await Extension.findByUsername(username);

    if (!extension) {
      console.log(`✗ Extension ${username} topilmadi!`);
      console.log('\nYangi extension yaratish kerak.');
      process.exit(1);
    }

    console.log(`✓ Extension ${username} topildi`);
    console.log(`  ID: ${extension.id}`);
    console.log(`  Username: ${extension.username}`);
    console.log(`  Enabled: ${extension.enabled}`);
    console.log(`  Has Password: ${!!extension.password}\n`);

    // Parolni yangilash
    console.log(`Parolni yangilash: ${password}...`);
    
    // Extension updatePassword metodini chaqirish
    const updated = await Extension.updatePassword(extension.id, password);

    if (updated) {
      console.log(`✓ Extension ${username} paroli yangilandi!\n`);
      console.log('Endi MicroSIP da ulanish mumkin.');
      console.log('\nMicroSIP Sozlamalari:');
      console.log(`  Login: ${username}`);
      console.log(`  Parol: ${password}`);
      console.log(`  Domain: 185.137.152.229`);
      console.log(`  Port: 5060\n`);
    } else {
      console.log(`✗ Extension ${username} paroli yangilanmadi!`);
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Xatolik:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateExtensionPassword();
