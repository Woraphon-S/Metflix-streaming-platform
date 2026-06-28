# METFLIX

> Modern cinematic streaming platform for movies and series — built as an MVP with Next.js, NestJS, PostgreSQL, and Docker.

METFLIX delivers a Netflix-style browsing experience with a focused dark cinematic UI (black / blue / emerald), a JWT-authenticated REST API, a self-hosted notification module, and a full admin console for managing the catalog.

---

## Tech stack

| Layer       | Stack                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Frontend    | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · TanStack Query · Zustand · React Hook Form + Zod |
| Backend     | NestJS 10 · TypeScript · raw SQL via `pg` (no ORM) · JWT (bcryptjs) · class-validator |
| Database    | PostgreSQL 16                                                                  |
| Infra       | Docker · Docker Compose                                                        |
| Monorepo    | npm workspaces (`apps/*`, `packages/*`)                                        |

---

## Folder structure

```
metflix/
├── apps/
│   ├── api/                 NestJS REST API
│   │   └── src/
│   │       ├── common/      Guards, filters, decorators, DTOs
│   │       ├── database/    Pool-based DatabaseService + SQL schema + row types
│   │       ├── db/          seed.ts (runs on container start)
│   │       ├── modules/     auth, users, movies, series, seasons, episodes,
│   │       │                watchlist, watch-history, notifications, admin, health
│   │       └── main.ts
│   └── web/                 Next.js App Router frontend
│       └── src/
│           ├── app/         Pages (browse, login, register, admin, watch, …)
│           ├── components/  UI primitives, layout, cards, hero, carousel, player
│           ├── services/    API clients (axios)
│           ├── stores/      Zustand auth store
│           └── lib/         cn(), formatters
├── packages/
│   └── shared-types/        Type definitions shared by web + api consumers
├── docker-compose.yml
└── README.md
```

---

## Quick start (Docker — recommended)

The fastest path. Brings up Postgres, the API, and the web app, applies the SQL schema, and seeds demo content automatically on first boot.

```bash
# 1. (optional) create a .env at the repo root to override the compose defaults

# 2. Build and start everything
docker compose up -d --build

# 3. Tail logs (optional)
docker compose logs -f
```

URLs:

| Service  | URL                          |
| -------- | ---------------------------- |
| Web      | http://localhost:3000        |
| API      | http://localhost:4000/api    |
| Health   | http://localhost:4000/api/health |
| Postgres | localhost:5432 (user/pass `metflix` / `metflix`) |

Stop & remove containers:

```bash
docker compose down            # keep data
docker compose down -v         # also wipe Postgres volume
```

---

## Local dev (without Docker)

You'll need Node 20+ and a running Postgres on port 5432. Then:

```bash
# Install all workspaces
npm install

# Create a .env at the repo root with at least:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/metflix
# JWT_SECRET=change_me_to_a_long_random_string

# Build the API first so dist/db/seed.js exists, then seed
npm run build:api
npm run db:seed

# Start API + Web in parallel (schema is auto-applied on API boot)
npm run dev
```

---

## Demo credentials

### Fixed dev admin (per project spec)

```
id:       admin
password: 1234
```

Use the **Admin** tab on the login page. This account is wired with role `admin` and
unlocks the admin console under `/admin`. **For development / demo only — do not deploy as-is.**

### Demo user (seeded)

```
email:    demo@metflix.local
password: demo1234
```

You can also register your own account at `/register`.

---

## What's included

### User experience

- **Browse** — hero banner, "Continue watching", featured movies / series carousels, trending row, full catalog grid
- **Movie detail** — backdrop hero, metadata, add to My List, play
- **Series detail** — season switcher, full episode list, season auto-next
- **Watch page** — `<video>` player with progress save (throttled), resume from last position, next-episode button for series
- **My List** — saved movies + series
- **Notifications** — system messages, mark read / mark all read, unread badge on navbar
- **Profile** — edit display name + avatar URL, view watch stats

### Admin console

- **Dashboard** — totals, recent movies/series, recent admin activity log
- **Movies** — list, search, create / edit / delete (with status: draft / published / archived)
- **Series** — list, expand to manage seasons & episodes, full CRUD
- **Users** — list with email search
- **Notifications** — broadcast to all users, or target a specific user by ID
- Sidebar navigation, admin-only route guard

### Backend

- **Auth** — `POST /auth/register`, `POST /auth/login`, `POST /auth/admin-login`, `GET /auth/me`
- **JWT** — stateless, secret from `JWT_SECRET`, default 7d
- **Guards** — `JwtAuthGuard`, `RolesGuard`, `@Public()` and `@Roles('admin')` decorators
- **Validation** — global `ValidationPipe`, DTO `whitelist`, `class-validator`
- **Pagination** — every list endpoint (`page`, `pageSize`, `search`)
- **Notifications module** — fully self-hosted (no third-party); structure ready for WebSocket upgrade
- **Admin activity log** — every admin write records to `admin_activity_logs`
- **Health** — `/api/health` checks Postgres connectivity

---

## API surface

```
POST   /api/auth/register                 # public
POST   /api/auth/login                    # public
POST   /api/auth/admin-login              # public (id + password)
GET    /api/auth/me                       # auth

GET    /api/users/me                      # auth
PATCH  /api/users/me                      # auth

GET    /api/movies                        # public
GET    /api/movies/:id                    # auth
POST   /api/admin/movies                  # admin
GET    /api/admin/movies                  # admin
GET    /api/admin/movies/:id              # admin
PATCH  /api/admin/movies/:id              # admin
DELETE /api/admin/movies/:id              # admin

GET    /api/series                        # public
GET    /api/series/:id                    # auth
POST   /api/admin/series                  # admin
GET    /api/admin/series                  # admin
PATCH  /api/admin/series/:id              # admin
DELETE /api/admin/series/:id              # admin

POST   /api/admin/seasons                 # admin
PATCH  /api/admin/seasons/:id             # admin
DELETE /api/admin/seasons/:id             # admin

GET    /api/episodes/:id                  # auth
GET    /api/episodes/:id/next             # auth
POST   /api/admin/episodes                # admin
PATCH  /api/admin/episodes/:id            # admin
DELETE /api/admin/episodes/:id            # admin

GET    /api/watchlist                     # auth
GET    /api/watchlist/:type/:id/status    # auth
POST   /api/watchlist/:type/:id           # auth   (type = movie | series)
DELETE /api/watchlist/:type/:id           # auth

GET    /api/watch-history/continue        # auth
GET    /api/watch-history/:type/:id       # auth   (type = movie | episode)
POST   /api/watch-history/progress        # auth

GET    /api/notifications                 # auth
GET    /api/notifications/unread-count    # auth
PATCH  /api/notifications/:id/read        # auth
POST   /api/notifications/read-all        # auth
POST   /api/admin/notifications           # admin

GET    /api/admin/dashboard               # admin
GET    /api/admin/users                   # admin
GET    /api/admin/activity-logs           # admin

GET    /api/health                        # public
```

All admin routes require a JWT with `role: admin`. Regular users hitting `/api/admin/*`
get a 403 from `RolesGuard`.

---

## Environment variables

Set these in a `.env` file at the repo root:

| Variable                  | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`            | Postgres connection string (read by `pg.Pool`)               |
| `JWT_SECRET`              | Signs/verifies JWTs. Use a long random string in production. |
| `JWT_EXPIRES_IN`          | Token lifetime (default `7d`)                                |
| `CORS_ORIGIN`             | Comma-separated allowed origins                              |
| `ADMIN_DEV_ID`            | Dev admin id (default `admin`)                               |
| `ADMIN_DEV_PASSWORD`      | Dev admin password (default `1234`)                          |
| `API_PORT` / `WEB_PORT`   | Service ports                                                |
| `NEXT_PUBLIC_API_BASE_URL`| Base URL the browser uses to call the API                    |

---

## Theme

The cinematic theme is defined in `apps/web/tailwind.config.ts` and `globals.css`:

| Token            | Value     |
| ---------------- | --------- |
| Background       | `#050814` |
| Surface          | `#0B1020` |
| Surface soft     | `#111827` |
| Primary blue     | `#0EA5E9` |
| Deep blue        | `#1D4ED8` |
| Emerald accent   | `#00FF9C` |
| Text             | `#F8FAFC` |
| Text muted       | `#94A3B8` |

The user-facing surface is glassmorphic + cinematic; the admin sidebar is intentionally distinct (emerald accents) so admins always know what mode they're in, while keeping the same theme family.

---

## Seeded content

The seed (`apps/api/src/db/seed.ts`) plants:

- The fixed admin user (`admin@metflix.local`, password `1234`)
- A demo user (`demo@metflix.local`, password `demo1234`)
- 6 published movies with Unsplash poster/backdrop art and a public sample MP4 (`BigBuckBunny.mp4`) as the video source
- 3 published series with multiple seasons and episodes, each linked to the same sample MP4
- A welcome system notification

Seeds are idempotent — re-running upserts without duplicates.

---

## Useful commands

```bash
# Workspace root
npm run dev               # API + web in parallel
npm run build             # build both
npm run db:seed           # seed sample data (build the API first)
npm run docker:up         # docker compose up -d --build
npm run docker:down       # docker compose down
npm run docker:logs       # follow logs

# Inside apps/api
npm run start:dev         # NestJS in watch mode (also applies SQL schema)
npm run build             # compile TS -> dist/

# Inside apps/web
npm run dev               # Next.js in dev
npm run build && npm start
```

---

## Known limitations (intentional for MVP)

- **Video delivery is mocked** — every title points at a public MP4. The schema and player are ready to swap in HLS / CDN URLs; the API just hands out `videoUrl` as metadata.
- **No category / year / language / rating filters yet** — out of scope for MVP.
- **No subscription / payment, no multi-profile, no DRM, no parental control, no recommendation engine.**
- **Fixed dev admin** (`id: admin` / `password: 1234`) is hardcoded by design per the project spec. Treat the project as demo software until a production auth flow is added.
- **Token storage is `localStorage`** for demo simplicity. Move to httpOnly cookies before production.
- **No WebSocket yet** — notifications are polled (`/notifications/unread-count` every 30s). The module is structured so a gateway can be added without DB changes.

---

## Next steps

1. Swap the placeholder MP4s for HLS streams served via a CDN / object storage. The data model already separates metadata from delivery.
2. Add a `NotificationsGateway` (NestJS `@WebSocketGateway`) and replace the navbar polling with a subscription.
3. Move auth to httpOnly refresh + access cookies; add CSRF protection for state-changing requests.
4. Introduce categories, languages, and maturity-rating filters when the catalog grows.
5. Add Redis for browse-page caching and a job queue (notifications fan-out, view-count batching).
6. Add unit + e2e tests (Jest + Playwright).

---

## License

This is a demo / training project. No license file is included — treat it as proprietary by default if reused.
