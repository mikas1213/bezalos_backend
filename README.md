# Bezalos — Backend API

REST API serveris skirtas **bezalos.lt** platformai. Sukurtas su Node.js + Express + TypeScript, naudoja PostgreSQL duomenų bazę, AWS S3 medijų saugojimui ir Stripe mokėjimams.

---

## Technologijų stack'as

| Kategorija | Technologija |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Kalba | TypeScript |
| Duomenų bazė | PostgreSQL (`pg`) |
| Autentikacija | JWT (access + refresh token) |
| Failų saugojimas | AWS S3 + CloudFront (signed URLs) |
| Mokėjimai | Stripe |
| El. paštas | SendGrid |
| AI | Anthropic SDK (Claude) |
| Real-time | Socket.IO |
| Process manager | PM2 (cluster mode) |

---

## Projekto struktūra

```
backend/
├── src/
│   ├── server.ts                  # Entry point
│   ├── container/                 # DI konteineris
│   ├── common/
│   │   ├── config/                # CORS, leistini origins
│   │   ├── middleware/            # Logger, rate limiter, error handler
│   │   └── utils/                 # Pagalbinės funkcijos
│   └── features/                  # Feature-based moduliai
│       ├── auth/                  # Autentikacija ir autorizacija
│       ├── tags/                  # Žymos
│       ├── seo/                   # SEO meta duomenys
│       ├── sitemap/               # Sitemap generavimas
│       ├── admin/
│       │   └── virtuve/           # Admin: vaizdo įrašų valdymas
│       └── client/
│           ├── virtuve/           # Vaizdo įrašai (klientui)
│           ├── likes/             # Patikimai
│           └── comments/          # Komentarai
├── routes/                        # Legacy JS maršrutai
│   ├── profileRoutes.js
│   ├── mailerRoutes.js
│   ├── paymentRoutes.js
│   ├── servicesRoutes.js
│   ├── promotionRoutes.js
│   ├── recipesRoutes.js
│   ├── likesRoutes.js
│   └── adminRoutes/
│       ├── adminPromotionsRoutes.js
│       ├── adminServicesRoutes.js
│       ├── adminRecipesRoutes.js
│       ├── customersRoutes.js
│       └── nutritionPlansRoutes.js
├── controllers/                   # Legacy JS kontroleriai
├── services/                      # Legacy JS servisai
├── repositories/                  # Duomenų bazės sluoksnis
├── middleware/                    # Validators, rate limiter
├── config/                        # Roles, CORS options
├── utils/                         # Helpers, email, payments
├── ecosystem.config.js            # PM2 konfigūracija
├── tsconfig.json
└── package.json
```

---

## API maršrutai

### Autentikacija — `/api/v1/auth`
| Metodas | Kelias | Aprašymas |
|---|---|---|
| POST | `/register` | Naujo vartotojo registracija |
| POST | `/login` | Prisijungimas (JWT) |
| POST | `/logout` | Atsijungimas |
| GET | `/refresh` | Access token atnaujinimas |

### Vartotojo profilis — `/api/v1/profile`
| Metodas | Kelias | Aprašymas |
|---|---|---|
| GET | `/` | Profilio duomenys |
| PATCH | `/` | Profilio atnaujinimas |

### Receiptai — `/api/v1/recipes`
| Metodas | Kelias | Aprašymas |
|---|---|---|
| GET | `/` | Visų receptų sąrašas |
| GET | `/:id` | Konkretus receptas |
| POST | `/` | Naujas receptas |

### Paslaugos — `/api/v1/services`
| Metodas | Kelias | Aprašymas |
|---|---|---|
| GET | `/` | Paslaugų sąrašas |
| POST | `/` | Nauja paslauga |

### Mokėjimai — `/api/v1/payments`
Stripe integracij — prenumeratų ir vienkartinių mokėjimų apdorojimas.

### El. paštas — `/api/v1/mailer`
SendGrid pagrindu — automatiniai pranešimai, patvirtinimai.

### Vaizdo įrašai — `/api/v1/virtuve`
Vaizdo pamokų srautas per CloudFront signed URLs.

### Patikimai — `/api/v1/like` ir `/api/v1/likes`
Receptų ir turinio patikimų sistema.

### Komentarai — `/api/v1/comments`
Komentarų kūrimas, skaitymas.

### Žymos — `/api/v1/tags`
Turinio žymėjimo sistema.

### Akcijos — `/api/v1/promo`
Reklamų ir nuolaidų valdymas.

### Admin — `/api/v1/admin`
Apsaugotas admin skydelis: vartotojai, paslaugos, receptai, akcijos, mitybos planai, vaizdo įrašai.

### Kita
| Kelias | Aprašymas |
|---|---|
| `GET /sitemap.xml` | SEO sitemap |
| `GET /seo` | Meta duomenys |
| `GET /api/v1/config` | Socket.IO URL konfigūracija |

---

## Saugumas

- **Helmet** — HTTP antraščių apsauga
- **CORS** — tik leistini origins
- **Rate limiting** — 375 req / 15 min (auth/refresh: 1000), admin maršrutai neribojami
- **HPP** — HTTP parameter pollution prevencija
- **XSS sanitizer** — įvesties valymas
- **bcrypt** — slaptažodžių hash'avimas
- **JWT** — access + refresh token schema
- **Zod** — schemų validacija

---

## Aplinkos kintamieji

Konfigūracija saugoma `.env_bezalos` faile. Reikalingi kintamieji:

```env
PORT=3003
NODE_ENV=production

# Duomenų bazė
DATABASE_URL=

# JWT
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
CLOUDFRONT_DOMAIN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# SendGrid
SENDGRID_API_KEY=

# Socket
SOCKET_URL=
```

---

## Paleidimas

### Reikalavimai
- Node.js 18+
- PostgreSQL
- AWS S3 bucket + CloudFront distribucija

### Įdiegimas

```bash
npm install
```

### Kūrimo režimas

```bash
npm run build    # Sukompiliuoja TypeScript → dist/
npm start        # Paleidžia dist/server.js su nodemon
```

### Produkcinė aplinka (PM2)

```bash
npm run build
pm2 start ecosystem.config.js
pm2 logs bezalos.lt
pm2 monit
```

PM2 paleidžia serverį **cluster** režimu (visais CPU branduoliais), su automatiniais restartais ir logų rinkimu.

---

## Real-time (Socket.IO)

Serveris palaiko WebSocket ryšius per Socket.IO:

- Klientai prisijungia per `websocket` arba `polling` transportą
- Palaikoma kambarių (`room`) sistema — naudojama real-time pranešimams
- CORS konfigūruotas pagal `allowedOrigins` sąrašą

---

## Rolės

| Rolė | Kodas |
|---|---|
| `user` | `2324` |
| `admin` | `1213` |

---

## Logai

PM2 surinks logus į:

```
logs/combined.log   # Visi logai
logs/out.log        # stdout
logs/error.log      # Klaidos
```
