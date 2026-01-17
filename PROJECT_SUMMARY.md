# PBX System - Project Summary

## Yaratilgan Fayllar va Struktura

### Asosiy Fayllar

1. **package.json** - Node.js dependencies va scripts
2. **.env.example** - Environment variables template
3. **README.md** - Asosiy dokumentatsiya
4. **DEPLOYMENT.md** - Deployment qo'llanmasi
5. **QUICK_START.md** - Tez boshlash qo'llanmasi
6. **INSTALL.sh** - Avtomatik o'rnatish skripti
7. **ecosystem.config.js** - PM2 konfiguratsiyasi
8. **nginx.conf.example** - Nginx konfiguratsiya namunasi
9. **.gitignore** - Git ignore qoidalari

### Backend Struktura

```
backend/
├── server.js                    # Entry point
├── src/
│   ├── config/
│   │   └── config.js            # Asosiy konfiguratsiya
│   ├── database/
│   │   ├── connection.js        # PostgreSQL connection
│   │   ├── migrations/
│   │   │   ├── 001_create_tables.sql  # Database schema
│   │   │   └── run.js           # Migration runner
│   │   └── models/
│   │       ├── Extension.js     # Extension model
│   │       ├── Call.js          # Call model
│   │       ├── DIDNumber.js     # DID number model
│   │       ├── Recording.js     # Recording model
│   │       ├── IVR.js           # IVR model
│   │       └── Queue.js         # Queue model
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   └── helpers.js           # Helper functions
│   ├── api/
│   │   ├── app.js               # Express app
│   │   ├── websocket.js         # WebSocket manager
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authentication
│   │   │   └── validation.js    # Request validation
│   │   └── routes/
│   │       ├── auth.js          # Authentication routes
│   │       ├── extensions.js    # Extension routes
│   │       ├── calls.js         # Call routes
│   │       ├── did-numbers.js   # DID routes
│   │       ├── recordings.js    # Recording routes
│   │       ├── ivr.js           # IVR routes
│   │       ├── queues.js        # Queue routes
│   │       └── stats.js         # Statistics routes
│   ├── sip/
│   │   └── core/
│   │       └── registrar.js     # SIP Registrar
│   ├── call/
│   │   └── manager.js          # Call manager
│   └── scripts/
│       └── create-admin.js      # Admin user creation script
```

## Implementatsiya Qilingan Funksiyalar

### ✅ Database
- [x] PostgreSQL connection
- [x] Database schema (9 jadval)
- [x] Migration system
- [x] Models (Extension, Call, DIDNumber, Recording, IVR, Queue)

### ✅ REST API
- [x] Authentication (JWT)
- [x] Extensions management
- [x] Calls management
- [x] DID numbers management
- [x] Recordings management
- [x] IVR management
- [x] Queues management
- [x] Statistics endpoints
- [x] Request validation
- [x] Error handling

### ✅ SIP Core
- [x] SIP Registrar (basic implementation)
- [x] Extension registration handling
- [x] SIP message parsing
- [ ] SIP Proxy (to be implemented)
- [ ] Call handling (INVITE, BYE, etc.) (to be implemented)

### ✅ Features
- [x] Extension management
- [x] Call routing structure
- [x] IVR structure
- [x] Queue structure
- [ ] Voicemail (structure ready, implementation pending)
- [ ] Conference (structure ready, implementation pending)
- [ ] Call recording (structure ready, implementation pending)

### ✅ Infrastructure
- [x] Logging (Winston)
- [x] WebSocket (Socket.IO)
- [x] PM2 configuration
- [x] Nginx configuration
- [x] Deployment scripts
- [x] Documentation

## Qolgan Ishlar

### SIP Implementation
- [ ] Full SIP stack implementation
- [ ] SIP Proxy
- [ ] Call dialog management
- [ ] RTP handling
- [ ] Media codec support
- [ ] Bell.uz trunk integration

### Media Engine
- [ ] RTP handler
- [ ] Audio codec conversion
- [ ] Echo cancellation
- [ ] DTMF detection
- [ ] Audio mixing (conference)

### Call Features
- [ ] Complete call routing
- [ ] Call transfer
- [ ] Call forwarding
- [ ] Call hold/resume
- [ ] Call recording implementation
- [ ] Voicemail implementation
- [ ] Conference implementation

### Frontend
- [ ] React dashboard
- [ ] Real-time monitoring UI
- [ ] Extension management UI
- [ ] Call monitoring UI
- [ ] Statistics dashboard

## Database Schema

1. **extensions** - SIP extensions
2. **did_numbers** - DID numbers va routing
3. **calls** - Call Detail Records (CDR)
4. **recordings** - Call recordings
5. **ivr_menus** - IVR menus
6. **queues** - Call queues
7. **queue_members** - Queue members
8. **voicemails** - Voicemail messages
9. **conferences** - Conference rooms
10. **conference_participants** - Conference participants
11. **system_settings** - System settings
12. **users** - Admin users
13. **extension_registrations** - Extension registration status

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login

### Extensions
- `GET /api/v1/extensions` - List extensions
- `POST /api/v1/extensions` - Create extension
- `GET /api/v1/extensions/:id` - Get extension
- `PUT /api/v1/extensions/:id` - Update extension
- `DELETE /api/v1/extensions/:id` - Delete extension
- `GET /api/v1/extensions/:id/status` - Get status
- `POST /api/v1/extensions/:id/password` - Change password

### Calls
- `GET /api/v1/calls` - List calls (CDR)
- `GET /api/v1/calls/active` - Active calls
- `GET /api/v1/calls/:id` - Get call
- `POST /api/v1/calls` - Initiate call
- `POST /api/v1/calls/:callId/transfer` - Transfer call
- `POST /api/v1/calls/:callId/hold` - Hold call
- `POST /api/v1/calls/:callId/resume` - Resume call
- `POST /api/v1/calls/:callId/hangup` - Hangup call
- `POST /api/v1/calls/:callId/record` - Start recording
- `POST /api/v1/calls/:callId/record/stop` - Stop recording

### DID Numbers
- `GET /api/v1/did-numbers` - List DID numbers
- `POST /api/v1/did-numbers` - Create DID
- `GET /api/v1/did-numbers/:id` - Get DID
- `PUT /api/v1/did-numbers/:id` - Update DID
- `DELETE /api/v1/did-numbers/:id` - Delete DID
- `PUT /api/v1/did-numbers/:id/route` - Update routing

### Recordings
- `GET /api/v1/recordings` - List recordings
- `GET /api/v1/recordings/:id` - Get recording
- `GET /api/v1/recordings/:id/download` - Download recording
- `DELETE /api/v1/recordings/:id` - Delete recording

### IVR
- `GET /api/v1/ivr-menus` - List IVR menus
- `POST /api/v1/ivr-menus` - Create IVR
- `GET /api/v1/ivr-menus/:id` - Get IVR
- `PUT /api/v1/ivr-menus/:id` - Update IVR
- `DELETE /api/v1/ivr-menus/:id` - Delete IVR
- `POST /api/v1/ivr-menus/:id/greeting` - Upload greeting

### Queues
- `GET /api/v1/queues` - List queues
- `POST /api/v1/queues` - Create queue
- `GET /api/v1/queues/:id` - Get queue
- `PUT /api/v1/queues/:id` - Update queue
- `DELETE /api/v1/queues/:id` - Delete queue
- `POST /api/v1/queues/:id/members` - Add member
- `DELETE /api/v1/queues/:id/members/:memberId` - Remove member
- `GET /api/v1/queues/:id/stats` - Queue statistics

### Statistics
- `GET /api/v1/stats/dashboard` - Dashboard stats
- `GET /api/v1/stats/calls` - Call statistics
- `GET /api/v1/stats/extensions` - Extension statistics

## Deployment

### Server Requirements
- Ubuntu 20.04+ / CentOS 8+
- Node.js 18+
- PostgreSQL 14+
- Nginx
- 4GB+ RAM
- 2+ CPU cores

### Quick Install
```bash
cd /var/www/call.soundz.uz
./INSTALL.sh
```

### Manual Install
1. Install dependencies: `npm install --production`
2. Setup database: Create DB and run migrations
3. Configure environment: Copy `.env.example` to `.env`
4. Run migrations: `npm run migrate`
5. Create admin: `npm run create-admin`
6. Start with PM2: `pm2 start ecosystem.config.js`
7. Configure Nginx: Copy `nginx.conf.example`
8. Open firewall: `ufw allow 5060/udp`

## Xavfsizlik

- ✅ JWT authentication
- ✅ Password encryption (bcrypt)
- ✅ Rate limiting
- ✅ Input validation (Joi)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Helmet.js security headers
- ✅ CORS configuration

## Keyingi Qadamlar

1. **SIP Stack** - To'liq SIP implementatsiyasi
2. **Media Engine** - RTP va codec support
3. **Call Features** - To'liq call management
4. **Frontend** - React dashboard
5. **Testing** - Unit va integration testlar
6. **Monitoring** - Advanced monitoring va alerting

## Eslatmalar

- ⚠️ acoustic.uz konfiguratsiyasiga tegmaslik kerak
- ⚠️ Database credentials: soundzuz_user / Soundz&2026
- ⚠️ SIP port: 5060 UDP
- ⚠️ RTP ports: 10000-20000 UDP
- ⚠️ Production da JWT_SECRET ni o'zgartirish kerak

## Support

Muammo bo'lsa:
1. Loglarni tekshiring: `pm2 logs pbx-system`
2. Database connection: `psql -U soundzuz_user -d soundzcalldb`
3. Port status: `netstat -ulnp | grep 5060`
4. Nginx logs: `/var/log/nginx/error.log`
