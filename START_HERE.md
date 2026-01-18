# 🚀 Ishga Tushirish - Bu Yerdan Boshlang!

Call Soundz PBX tizimi o'rnatilgan, faqat PostgreSQL database sozlamalari kerak.

## ⚡ Tezkor Ishga Tushirish (3 qadam)

### 1. Database va User Yaratish

Windows CMD yoki PowerShell da:

```cmd
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz
.\setup-db-password.bat
```

Bu skript sizdan PostgreSQL parolini so'raydi va quyidagilarni avtomatik bajaradi:
- ✅ Database yaratadi
- ✅ User yaratadi  
- ✅ Migrationlarni ishga tushiradi
- ✅ Admin user yaratadi

### 2. Server ni Ishga Tushirish

```cmd
npm start
```

### 3. Brauzerda Ochish

http://localhost:3005

---

## 🔐 PostgreSQL Paroli Qanday Topish?

### Variant A: O'rnatishda berilgan parol
PostgreSQL o'rnatilganda berilgan parolni ishlating.

### Variant B: pgAdmin orqali
1. Start Menu → PostgreSQL → pgAdmin 4
2. pgAdmin ochilganda, o'rnatilganda berilgan parol kerak

### Variant C: Parolni bilmasangiz
```powershell
# PowerShell da (Administrator huquqlari bilan)
# PostgreSQL parolini yangilash
cd "C:\Program Files\PostgreSQL\16\bin"  # (versiya o'zgarishi mumkin)
.\psql.exe -U postgres -d postgres
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

---

## 📝 Manuel Qadamlar (Parolni bilasangiz)

```powershell
# PowerShell da
cd C:\Users\AzzaPRO\Desktop\call.soundz.uz

# PostgreSQL parolini o'rnating
$env:POSTGRES_PASSWORD = "sizning_parolingiz"

# Database yaratish
node setup-database.js

# Migrationlar
npm run migrate

# Admin user
npm run create-admin

# Server ishga tushirish
npm start
```

---

## ✅ O'rnatilgan

- ✅ Repository klon qilindi
- ✅ npm packages o'rnatildi (493 packages)
- ✅ Kerakli papkalar yaratildi
- ✅ .env fayli sozlandi (Windows yo'llari)
- ✅ Backend kodlari moslashtirildi
- ✅ Setup skriptlari yaratildi

## ⏳ Qolgan

- ⏳ PostgreSQL database sozlash (parol kerak)
- ⏳ Database migrationlar
- ⏳ Admin user yaratish
- ⏳ Server ishga tushirish

---

## 📞 Yordam

Muammo bo'lsa:
- `QUICK_SETUP.md` - Tezkor o'rnatish
- `WINDOWS_SETUP.md` - Batafsil yo'riqnoma
- `SETUP_COMPLETE.md` - To'liq xulosa

---

## 🎯 API Endpoints (Ishga tushgandan keyin)

- **Web Dashboard**: http://localhost:3005
- **API Base**: http://localhost:3005/api/v1
- **WebSocket**: ws://localhost:3005
- **Admin Login**: username=`admin`, password=`admin123` (yoki yaratilganda berilgan)
