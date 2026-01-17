# Foydalanuvchi Qo'llanmasi - PBX System

## Kirish

**URL**: https://call.soundz.uz
**Login**: admin / admin123

## Dashboard

Dashboard sahifasida quyidagi statistikalar ko'rsatiladi:
- **Jami Qo'ng'iroqlar** - Barcha qo'ng'iroqlar soni
- **Faol Qo'ng'iroqlar** - Hozirgi vaqtda davom etayotgan qo'ng'iroqlar
- **Extensions** - Jami extensionlar soni
- **Online Extensions** - Online bo'lgan extensionlar

Statistikalar har 30 sekundda avtomatik yangilanadi.

## Extensions Boshqaruvi

### Extension Yaratish

1. **Extensions** sahifasiga o'ting
2. **"+ Extension Qo'shish"** tugmasini bosing
3. Quyidagi ma'lumotlarni kiriting:
   - **Username**: Extension username (masalan: 1001)
   - **Password**: Extension paroli
   - **Display Name**: Ko'rinadigan ism (ixtiyoriy)
   - **Email**: Email manzil (ixtiyoriy)

4. Extension yaratilgandan keyin **SIP Account** ma'lumotlari ko'rsatiladi:
   - Username: Extension username
   - Password: Extension paroli
   - Server: call.soundz.uz
   - Port: 5060
   - Transport: UDP

### Extension Ko'rish

**👁️** tugmasini bosing - Extension barcha ma'lumotlari ko'rsatiladi:
- Username, Display Name, Email
- Status (Enabled/Disabled)
- Online/Offline holati
- Call Forward sozlamalari
- Voicemail va Recording sozlamalari

### Extension Tahrirlash

**✏️** tugmasini bosing va quyidagilarni o'zgartirishingiz mumkin:
- Display Name
- Email
- Enabled/Disabled holati

### Extension O'chirish

**🗑️** tugmasini bosing va tasdiqlang.

## Calls (Qo'ng'iroqlar)

Calls sahifasida barcha qo'ng'iroqlar ro'yxati ko'rsatiladi:
- **Qayerdan** - Qo'ng'iroq qayerdan kelgan
- **Qayerga** - Qo'ng'iroq qayerga ketgan
- **Yo'nalish** - inbound/outbound/internal
- **Holat** - ringing/answered/completed/failed
- **Davomiylik** - Qo'ng'iroq davomiyligi
- **Boshlangan** - Qo'ng'iroq boshlangan vaqt

**👁️** tugmasini bosib qo'ng'iroq detallarini ko'rishingiz mumkin.

## Recordings (Yozib Olish)

Recordings sahifasida barcha recordinglar ro'yxati:
- **Fayl Nomi** - Recording fayl nomi
- **Davomiylik** - Recording davomiyligi
- **Hajm** - Fayl hajmi
- **Yaratilgan** - Yaratilgan vaqt

**⬇️** tugmasini bosib recordingni yuklab olishingiz mumkin.
**🗑️** tugmasini bosib recordingni o'chirishingiz mumkin.

## IVR Menus

IVR (Interactive Voice Response) menularni boshqarish:

### IVR Yaratish

1. **IVR** sahifasiga o'ting
2. **"+ IVR Qo'shish"** tugmasini bosing
3. Ma'lumotlarni kiriting:
   - **IVR nomi**: Menu nomi
   - **Tavsif**: Menu tavsifi (ixtiyoriy)
   - **Timeout**: Kutish vaqti (sekund)
   - **Max attempts**: Maksimal urinishlar soni

### IVR Tahrirlash va O'chirish

**✏️** - Tahrirlash
**🗑️** - O'chirish

## Queues (Call Queues)

Call queuelarni boshqarish:

### Queue Yaratish

1. **Queues** sahifasiga o'ting
2. **"+ Queue Qo'shish"** tugmasini bosing
3. Ma'lumotlarni kiriting:
   - **Queue nomi**: Queue nomi
   - **Tavsif**: Queue tavsifi
   - **Strategy**: ringall/leastrecent/fewestcalls/random
   - **Timeout**: Kutish vaqti (sekund)
   - **Max Wait**: Maksimal kutish vaqti (sekund)

### Queue Ko'rish

**👁️** tugmasini bosib queue detallarini ko'rishingiz mumkin:
- Queue nomi va tavsifi
- Strategy
- Status
- Queue members ro'yxati

### Queue Tahrirlash

**✏️** tugmasini bosib queue sozlamalarini o'zgartirishingiz mumkin.

## Statistics

Statistics sahifasida batafsil statistikalar:
- Jami qo'ng'iroqlar
- Bugungi qo'ng'iroqlar
- Bugungi davomiylik

## SIP Telefon Sozlash

Extension yaratilgandan keyin SIP telefon sozlamalari:

```
Account Name: [Extension Username]
Username: [Extension Username]
Password: [Extension Password]
Domain: call.soundz.uz
Server: call.soundz.uz
Port: 5060
Transport: UDP
```

## Tezkor Amallar

Dashboard sahifasida **Tezkor Amallar** bo'limi:
- **+ Extension Qo'shish** - Tezkor extension yaratish
- **Qo'ng'iroqlarni Ko'rish** - Calls sahifasiga o'tish
- **Extensions Ro'yxati** - Extensions sahifasiga o'tish

## Logout

Yuqori o'ng burchakdagi **Logout** tugmasini bosib chiqishingiz mumkin.

## Yordam

Muammo bo'lsa:
1. Browser console ni tekshiring (F12)
2. PM2 loglarni ko'ring: `pm2 logs pbx-system`
3. Administratorga murojaat qiling
