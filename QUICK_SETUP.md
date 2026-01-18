# ⚡ Tezkor O'rnatish

PostgreSQL o'rnatilgan va ishlayapti. Faqat database va user yaratish kerak.

## 1-qadam: Database va User Yaratish

Windows CMD yoki PowerShell da quyidagi buyruqni bajaring:

```cmd
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
.\setup-db-password.bat
```

Bu skript sizdan PostgreSQL postgres user parolini so'raydi. Agar o'rnatishda parol bergan bo'lsangiz, shu parolni kiriting. Agar berilmagan bo'lsa, "postgres" ni kiriting.

## 2-qadam: Avtomatik Migration va Admin User

`setup-db-password.bat` skripti quyidagilarni avtomatik bajaradi:
1. Database yaratadi (soundzcalldb)
2. User yaratadi (soundzuz_user)
3. Migrationlarni ishga tushiradi
4. Admin user yaratadi

## 3-qadam: Server ni Ishga Tushirish

```cmd
npm start
```

yoki development mode:

```cmd
npm run dev
```

## PostgreSQL Paroli Qanday Topish?

Agar parolni bilmasangiz:

1. **pgAdmin orqali**: Start Menu → PostgreSQL → pgAdmin 4
2. **Services orqali**: PostgreSQL servisini to'xtatib, qayta ishga tushiring (ba'zi hollarda parol qayta so'raladi)
3. **Yangi o'rnatish**: Agar parolni topa olmasangiz, PostgreSQL ni qayta o'rnating

## Yoki Manuel Qadamlar:

```powershell
# PowerShell da
$env:POSTGRES_PASSWORD = "your_password_here"
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
node setup-database.js
npm run migrate
npm run create-admin
npm start
```
