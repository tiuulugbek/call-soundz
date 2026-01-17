# Password Cache Muammosi - Yechim

## ❌ Muammo

**Holat:**
- Server restart qilinganda password cache tozalanadi
- Extension password cache'da yo'qoladi
- MicroSIP'da register ishlamayapti (online'dan offline'ga o'tadi)

**Loglarda ko'rinadiki:**
```
❌ SIP password not available for extension 1002
❌ Could not retrieve password for extension 1002
❌ Authentication failed for 1002
```

**Muammo sababi:**
- Server restart qilinganda in-memory `sipPasswordCache` tozalanadi
- Password cache faqat extension yaratilganda yoki password o'zgartirilganda saqlanadi
- Server restart qilinganda password cache'dan o'chib ketadi

## 🔧 Yechim - Hozirgi Vaqt Uchun

### Qadam 1: Extension Password'ni Qayta O'rnatish

1. **Admin Panel → Extensions**
2. **Extension 1002 ni tanlang**
3. **✏️ Tahrirlash** tugmasini bosing
4. **Password** maydoniga yangi password kiriting (kamida 6 belgi, masalan: `test123456`)
5. **Saqlash** tugmasini bosing

**Natija:** Password SIP cache'ga saqlanadi va autentifikatsiya uchun ishlatiladi.

### Qadam 2: MicroSIP Password'ni Yangilash

1. **MicroSIP'da account'ni oching**
2. **Пароль (Password)** maydoniga qayta o'rnatilgan password'ni kiriting
3. **Сохранить (Save)** tugmasini bosing
4. **Регистр (Register)** tugmasini bosing

**Natija:** MicroSIP registered bo'lishi kerak.

## 🚨 Uzoq Muddathli Yechim

**Muammo:**
- Server har restart qilinganda password cache tozalanadi
- Har safar password'ni qayta o'rnatish kerak

**Yechim - Server Ishga Tushganda Password'larni Avtomatik Yuklash:**

1. **Database'dan barcha extension'larni yuklash**
2. **Password'larni cache'ga saqlash**

**Implementatsiya:**
```javascript
// Server ishga tushganda extension password'larni yuklash
async loadExtensionPasswords() {
  try {
    const extensions = await Extension.findAll();
    for (const ext of extensions) {
      if (ext.password) {
        SIPRegistrar.setExtensionPassword(ext.username, ext.password);
      }
    }
    logger.info(`Loaded ${extensions.length} extension passwords into cache`);
  } catch (error) {
    logger.error('Error loading extension passwords:', error);
  }
}
```

**Lekin:** Hozirgi implementatsiyada extension password database'da hashlangan (bcrypt), shuning uchun plain password'ni cache'ga saqlash kerak.

## 📋 Keyingi Qadamlar

1. **Hozirgi vaqt uchun:**
   - Extension 1002 password'ni qayta o'rnating
   - MicroSIP'da password'ni yangilang
   - Register qiling

2. **Keyingi versiyada:**
   - Server ishga tushganda password'larni avtomatik yuklash
   - Yoki Redis yoki boshqa persistent cache ishlatish

## 🎯 Test Qilish

### Test 1: Password Qayta O'rnatish

1. **Admin Panel → Extensions → 1002 → ✏️ Tahrirlash**
2. **Password maydoniga yangi password kiriting**
3. **Saqlash tugmasini bosing**

**Tekshirish:**
```bash
pm2 logs pbx-system | grep "Stored SIP password.*1002"
```

**Kutilyotgan natija:**
```
[SIP] Stored SIP password in cache for 1002
[Extension] Password cached for 1002
```

### Test 2: MicroSIP Register

1. **MicroSIP'da password'ni yangilang**
2. **Register tugmasini bosing**

**Tekshirish:**
```bash
pm2 logs pbx-system | grep "Extension 1002 registered"
```

**Kutilyotgan natija:**
```
Extension 1002 registered from 152.53.229.176:XXXXX
```

## 📞 Yordam

Agar muammo davom etsa:

1. **Server loglarini tekshiring:**
   ```bash
   pm2 logs pbx-system --lines 100 | grep "password\|1002\|authentication"
   ```

2. **Password cache holatini tekshiring:**
   ```bash
   pm2 logs pbx-system | grep "Stored SIP password\|Password cached"
   ```

3. **Extension password qayta o'rnatilganligini** tekshiring

4. **MicroSIP password to'g'riligini** tekshiring

## 🎉 Xulosa

**Muammo:**
- Server restart qilinganda password cache tozalanadi
- Extension password cache'da yo'qoladi

**Yechim:**
- Extension password'ni qayta o'rnatish kerak (hozirgi vaqt uchun)
- Keyingi versiyada server ishga tushganda password'larni avtomatik yuklash

**Endi Extension 1002 password'ni qayta o'rnating va MicroSIP'da Register qiling!**
