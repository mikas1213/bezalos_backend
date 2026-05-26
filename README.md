# Bezalos — Backend API

REST API server for the **bezalos.lt** platform. Built with Node.js, Express, and TypeScript, using PostgreSQL for data persistence, AWS S3 for media storage, and Stripe for payments.

> **Note:** This project is currently being migrated from JavaScript to TypeScript. New features and modules are written in TypeScript (`src/`), while older parts of the codebase (`routes/`, `controllers/`, `services/`) are still in JavaScript and will be gradually refactored.

---

## Tech Stack

| Category        | Technology                        |
| --------------- | --------------------------------- |
| Runtime         | Node.js                           |
| Framework       | Express 4                         |
| Language        | TypeScript                        |
| Database        | PostgreSQL (`pg`)                 |
| Authentication  | JWT (access + refresh token)      |
| File Storage    | AWS S3 + CloudFront (signed URLs) |
| Payments        | Stripe                            |
| Email           | SendGrid                          |
| AI              | Anthropic SDK (Claude)            |
| Real-time       | Socket.IO                         |
| Process Manager | PM2 (cluster mode)                |

---

## Project Structure

```
backend/
├── src/
│   ├── server.ts                  # Entry point
│   ├── container/                 # DI container
│   ├── common/
│   │   ├── config/                # CORS, allowed origins
│   │   ├── middleware/            # Logger, rate limiter, error handler
│   │   └── utils/                 # Utility functions
│   └── features/                  # Feature-based modules
│       ├── auth/                  # Authentication & authorization
│       ├── tags/                  # Tags
│       ├── seo/                   # SEO metadata
│       ├── sitemap/               # Sitemap generation
│       ├── admin/
│       │   └── virtuve/           # Admin: video management
│       └── client/
│           ├── virtuve/           # Videos (client-facing)
│           ├── likes/             # Likes
│           └── comments/          # Comments
├── routes/                        # Legacy JS routes
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
├── controllers/                   # Legacy JS controllers
├── services/                      # Legacy JS services
├── repositories/                  # Database layer
├── middleware/                    # Validators, rate limiter
├── config/                        # Roles, CORS options
├── utils/                         # Helpers, email, payments
├── ecosystem.config.js            # PM2 configuration
├── tsconfig.json
└── package.json
```

---

## API Routes

### Authentication — `/api/v1/auth`

| Method | Path        | Description          |
| ------ | ----------- | -------------------- |
| POST   | `/register` | Register a new user  |
| POST   | `/login`    | Login (JWT)          |
| POST   | `/logout`   | Logout               |
| GET    | `/refresh`  | Refresh access token |

### User Profile — `/api/v1/profile`

| Method | Path | Description      |
| ------ | ---- | ---------------- |
| GET    | `/`  | Get profile data |
| PATCH  | `/`  | Update profile   |

### Recipes — `/api/v1/recipes`

| Method | Path   | Description         |
| ------ | ------ | ------------------- |
| GET    | `/`    | List all recipes    |
| GET    | `/:id` | Get a single recipe |
| POST   | `/`    | Create a recipe     |

### Services — `/api/v1/services`

| Method | Path | Description      |
| ------ | ---- | ---------------- |
| GET    | `/`  | List services    |
| POST   | `/`  | Create a service |

### Payments — `/api/v1/payments`

Stripe integration — handles subscriptions and one-time payments.

### Email — `/api/v1/mailer`

SendGrid-based — automated notifications and confirmations.

### Videos — `/api/v1/virtuve`

Video lesson streaming via CloudFront signed URLs.

### Likes — `/api/v1/like` and `/api/v1/likes`

Like system for recipes and content.

### Comments — `/api/v1/comments`

Create and read comments.

### Tags — `/api/v1/tags`

Content tagging system.

### Promotions — `/api/v1/promo`

Promotional offers and discount management.

### Admin — `/api/v1/admin`

Protected admin panel: users, services, recipes, promotions, nutrition plans, videos.

### Other

| Path                 | Description          |
| -------------------- | -------------------- |
| `GET /sitemap.xml`   | SEO sitemap          |
| `GET /seo`           | Meta data            |
| `GET /api/v1/config` | Socket.IO URL config |

---

## Security

- **Helmet** — HTTP header protection
- **CORS** — restricted to allowed origins only
- **Rate limiting** — per-route request throttling
- **HPP** — HTTP parameter pollution prevention
- **XSS sanitizer** — input sanitization
- **bcrypt** — password hashing
- **JWT** — access + refresh token scheme
- **Zod** — schema validation

---

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL
- AWS S3 bucket + CloudFront distribution

### Install

```bash
npm install
```

### Development

```bash
npm run build    # Compile TypeScript → dist/
npm start        # Run dist/server.js with nodemon
```

### Production (PM2)

```bash
npm run build
pm2 start ecosystem.config.js
pm2 logs bezalos.lt
pm2 monit
```

PM2 runs the server in **cluster mode** (all CPU cores), with automatic restarts and log aggregation.

---

## Real-time (Socket.IO)

The server supports WebSocket connections via Socket.IO:

- Clients connect via `websocket` or `polling` transport
- Room-based system for real-time notifications
- CORS configured against the `allowedOrigins` list

---

## Logs

PM2 writes logs to:

```
logs/combined.log   # All logs
logs/out.log        # stdout
logs/error.log      # Errors
```
