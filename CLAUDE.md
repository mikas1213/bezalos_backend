# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # rm -rf dist && tsc — compile src/ → dist/
npm start       # nodemon dist/server.js (requires a prior build)
```

There is no test suite. After changes, build and manually verify the affected endpoints.

**Production (PM2 cluster mode):**

```bash
npm run build
pm2 start ecosystem.config.js
pm2 logs bezalos.lt
```

Environment variables are loaded from `.env_bezalos` (not `.env`).

## Architecture

This is a Node.js/Express/TypeScript REST API for the **bezalos.lt** platform (Lithuanian fitness/nutrition app). PostgreSQL for data, AWS S3+CloudFront for media, Stripe for payments, SendGrid for email, Anthropic SDK for AI, Socket.IO for real-time.

### JS → TS migration in progress

- **`src/`** — new TypeScript code; this is where all new features go
- **`routes/`, `controllers/`, `services/`, `repositories/` (root level)** — legacy JavaScript; will be gradually refactored into `src/features/`

The entry point is `src/server.ts`, which mounts both TS feature routers (via DI container) and legacy JS routers (via `require`).

### Feature-based module structure (`src/features/`)

Each feature owns its full vertical slice:

```
src/features/<domain>/
  <Name>Controller.ts   — express handlers (calls service, returns HTTP response)
  <Name>Service.ts      — business logic
  <Name>Repository.ts   — raw SQL via Database class
  <Name>Routes.ts       — express Router factory (receives deps as args)
  <Name>Schema.ts       — Zod schemas for validation
  types.ts              — domain types
  index.ts              — barrel export
```

Client-facing features: `src/features/client/{virtuve,likes,comments}`
Admin features: `src/features/admin/virtuve`
Shared features: `src/features/{auth,tags,seo,sitemap}`

### Dependency injection

A hand-rolled DI container (`src/container/Container.ts`) with no decorators. All services are registered as singletons in `src/container/index.ts`. To add a new service:

1. Write the class with constructor-injected dependencies
2. Add `container.register('ServiceName', ServiceClass, ['Dep1', 'Dep2'], true)` in `src/container/index.ts`
3. Add the type to `src/container/types.ts` (`ContainerRegistry` interface)
4. Resolve in `src/server.ts` via `container.resolve('ServiceName')`

### Database access

`src/common/config/db.ts` exports a `Database` class (pg Pool wrapper):

- `db.query<T>(sql, params)` — returns `T[]`
- `db.queryOne<T>(sql, params)` — returns `T | null`
- `db.transaction(async (client) => { ... })` — wraps in BEGIN/COMMIT/ROLLBACK

All repositories receive `Database` as a constructor dependency. Write raw parameterized SQL — no ORM.

### Error handling

Throw `AppError` static factory methods from anywhere in the stack; the global error handler in `src/common/middleware/globalErrorHandler.ts` catches them:

```ts
throw AppError.notFound('Not found');
throw AppError.unauthorized('...');
throw AppError.forbidden('...');
throw AppError.conflict('...');
throw AppError.badRequest('...');
throw AppError.validation({ field: ['message'] });
```

Wrap async controller methods with `catchAsync` (`src/common/utils/catchAsync.ts`) to forward thrown errors to `next()`.

### Request validation

Use the `validate` middleware with a Zod schema:

```ts
router.post('/', validate(MySchema), controller.create);
```

`validate` throws `AppError.validation(...)` automatically on failure, which produces a structured `{ errors: { field: ['msg'] } }` JSON response.

### Auth middleware (`AuthMiddleware`)

- `authMiddleware.protect()` — verifies Bearer JWT, sets `req.user = { id, role }`
- `authMiddleware.protect({ required: false })` — optional auth
- `authMiddleware.restrictTo(...roles)` — role-based guard (role numbers from `src/common/config/roles.ts`)
- `authMiddleware.isSubscription(opts, ...types)` — subscription gate
- `authMiddleware.isCourse()` — course purchase gate

### Error messages

User-facing error messages are in **Lithuanian**. Keep this consistent when adding new features.

### Real-time

`global.io` (Socket.IO server instance) is available globally. Use room-based events — clients join rooms via `socket.on('joinRoom', roomId)`.
