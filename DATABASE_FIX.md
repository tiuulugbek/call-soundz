# Database Muammosini Hal Qilish

## Muammo

Database parol autentifikatsiyasi ishlamayapti:
```
password authentication failed for user "soundzuz_user"
```

## Yechim

### 1. Database va Userni Yaratish

```bash
cd /root/pbx-system
sudo ./setup-database.sh
```

Bu skript:
- PostgreSQL user yaratadi
- Database yaratadi
- Barcha kerakli privilegelarni beradi
- Connection test qiladi

### 2. Qo'lda Yaratish (agar skript ishlamasa)

```bash
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS soundzcalldb;
DROP USER IF EXISTS soundzuz_user;

CREATE USER soundzuz_user WITH PASSWORD 'Soundz&2026';
CREATE DATABASE soundzcalldb OWNER soundzuz_user;

GRANT ALL PRIVILEGES ON DATABASE soundzcalldb TO soundzuz_user;
\c soundzcalldb
GRANT ALL ON SCHEMA public TO soundzuz_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO soundzuz_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO soundzuz_user;
\q
EOF
```

### 3. Connection Test

```bash
# PGPASSWORD bilan test
export PGPASSWORD='Soundz&2026'
psql -h localhost -U soundzuz_user -d soundzcalldb -c "SELECT NOW();"

# Yoki Node.js bilan
node test-db-connection.js
```

### 4. Migrationlar

```bash
npm run migrate
```

### 5. Admin User

```bash
npm run create-admin -- admin admin123 admin@call.soundz.uz
```

## Muammo Sabablari

1. **User yaratilmagan** - PostgreSQL da `soundzuz_user` mavjud emas
2. **Parol noto'g'ri** - Parol `Soundz&2026` to'g'ri o'rnatilmagan
3. **Privilegeler yo'q** - User database ga kirish huquqi yo'q

## Tekshirish

```bash
# User mavjudligini tekshirish
sudo -u postgres psql -c "\du" | grep soundzuz_user

# Database mavjudligini tekshirish
sudo -u postgres psql -c "\l" | grep soundzcalldb

# Connection test
export PGPASSWORD='Soundz&2026'
psql -h localhost -U soundzuz_user -d soundzcalldb -c "SELECT 1;"
```

## PostgreSQL Sozlamalari

Agar hali ham muammo bo'lsa, PostgreSQL konfiguratsiyasini tekshiring:

```bash
# pg_hba.conf ni tekshirish
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -v "^#"

# Local connections uchun 'md5' yoki 'scram-sha-256' bo'lishi kerak
# Masalan:
# local   all             all                                     md5
# host    all             all             127.0.0.1/32            md5

# PostgreSQL ni qayta yuklash
sudo systemctl restart postgresql
```

## Keyingi Qadamlar

1. ✅ Database va user yaratish
2. ✅ Connection test
3. ✅ Migrationlar
4. ✅ Admin user
5. ✅ Dasturni qayta ishga tushirish

```bash
pm2 restart pbx-system
```
