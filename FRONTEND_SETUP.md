# Frontend (Admin Panel) O'rnatish

## Yaratilgan Fayllar

1. `frontend/public/index.html` - Asosiy HTML sahifa
2. `frontend/public/css/style.css` - CSS stillar
3. `frontend/public/js/app.js` - JavaScript kod

## O'zgarishlar

Backend `app.js` ga static files support qo'shildi:
```javascript
app.use(express.static('frontend/public'));
```

## PM2 ni Qayta Ishga Tushirish

```bash
cd /root/pbx-system
pm2 restart pbx-system
```

## Tekshirish

Browser da oching:
```
https://call.soundz.uz
```

Login ma'lumotlari:
- Username: `admin`
- Password: `admin123`

## Funksiyalar

### ✅ Mavjud
- Login sahifasi
- Dashboard (statistikalar)
- Extensions ro'yxati
- Calls ro'yxati
- Menu navigatsiya

### ⏳ Keyingi Versiyalarda
- Extension yaratish/tahrirlash
- Call detallari
- Recordings
- IVR boshqaruvi
- Queues boshqaruvi
- Real-time updates (WebSocket)

## Struktura

```
frontend/
└── public/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```
