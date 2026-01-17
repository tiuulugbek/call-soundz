# SIP Trunk Ulanish - Qo'llanma

## Bell.uz SIP Trunk Ulash

### 1. Ma'lumotlar

- **Provider**: bell.uz
- **DID Number**: 998785553322
- **Trunk Username**: 998785553322
- **Trunk Password**: [sizning parolingiz]
- **SIP Server**: bell.uz (yoki provider tomonidan berilgan)
- **SIP Port**: 5060 (default)

### 2. SIP Trunk Konfiguratsiyasi

#### Backend da SIP Trunk Manager yaratish

SIP trunk manager quyidagi vazifalarni bajaradi:
- Bell.uz SIP serveriga ulanish
- DID numberlarni qabul qilish
- Qo'ng'iroqlarni routing qilish (Extension/IVR/Queue)
- Outbound qo'ng'iroqlarni yuborish

### 3. Qadamlar

#### Qadam 1: SIP Stack O'rnatish

```bash
cd /root/pbx-system
npm install sip.js --save
# yoki
npm install pjsua2 --save
```

#### Qadam 2: SIP Trunk Manager Yaratish

`backend/src/sip/trunk/manager.js` - SIP trunk boshqaruvi

#### Qadam 3: DID Routing

`backend/src/sip/routing/did-router.js` - DID number routing

#### Qadam 4: Call Handler

`backend/src/sip/handlers/call-handler.js` - Qo'ng'iroq boshqaruvi

### 4. SIP Trunk Ulanish Oqimi

```
Tashqi qo'ng'iroq → Bell.uz SIP Server → PBX SIP Trunk Manager → 
DID Router → Extension/IVR/Queue → Call Handler → RTP Media
```

### 5. Konfiguratsiya

`.env` faylga qo'shish:
```
SIP_TRUNK_PROVIDER=bell.uz
SIP_TRUNK_HOST=sip.bell.uz
SIP_TRUNK_PORT=5060
SIP_DOMAIN=call.soundz.uz
```

### 6. Test Qilish

1. DID number yaratish (admin panel)
2. SIP trunk ulanishini test qilish
3. Test qo'ng'iroq qilish
4. Routing tekshirish

## Keyingi Qadamlar

1. ✅ SIP Stack o'rnatish
2. ✅ SIP Trunk Manager yaratish
3. ✅ DID Router yaratish
4. ✅ Call Handler yaratish
5. ✅ RTP Media handling
6. ✅ Test qilish
