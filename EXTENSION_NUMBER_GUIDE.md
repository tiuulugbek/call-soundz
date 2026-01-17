# Extension va Nomer Ulash - Qo'llanma

## Extension Nima?

**Extension** - bu ichki telefon raqami. Masalan: 1001, 1002, 1003 va hokazo.

## Nomer Ulash Kerakmi?

### ❌ Extension Yaratishda Nomer Kerak Emas

Extension yaratishda **faqat**:
- Username (masalan: 1001)
- Password
- Display Name (ixtiyoriy)
- Email (ixtiyoriy)

Bu yetarli! Extension yaratilgandan keyin u **ichki raqam** sifatida ishlaydi.

### ✅ DID Number - Tashqi Nomer Ulash

Agar **tashqi telefon raqam** (masalan: +998901234567) ulashni xohlasangiz:

1. **DID Number yaratish**:
   - DID Numbers sahifasiga o'ting
   - Yangi DID qo'shing
   - Raqamni kiriting (masalan: 998901234567)
   - Provider: bell.uz

2. **DID ni Extension ga ulash**:
   - DID routing sozlamalarida
   - Route Type: `extension`
   - Route Target: Yaratilgan extension ID

## Misol

### 1. Extension Yaratish

```
Username: 1001
Password: secure123
Display Name: John Doe
```

Bu extension **ichki raqam** sifatida ishlaydi:
- Boshqa extensionlar 1001 ga qo'ng'iroq qilishi mumkin
- SIP telefon orqali ulanish mumkin

### 2. DID Number Ulash (Ixtiyoriy)

Agar tashqi raqam kerak bo'lsa:

```
DID Number: 998901234567
Provider: bell.uz
Route Type: extension
Route Target: 1001 (yoki extension ID)
```

Endi tashqi raqamdan qo'ng'iroq qilinganda 1001 extensionga ulanadi.

## Xulosa

- ✅ **Extension yaratish** - ichki raqam, nomer kerak emas
- ⚠️ **DID Number** - tashqi raqam ulash uchun (ixtiyoriy)
- 📞 **SIP telefon** - extension username/password bilan ulanadi

## Qadamlar

1. **Extension yaratish** (nomer kerak emas)
2. **SIP telefon sozlash** (extension username/password)
3. **DID Number ulash** (agar tashqi raqam kerak bo'lsa)
