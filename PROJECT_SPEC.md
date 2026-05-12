# PROJECT_SPEC.md — METFLIX

This file mirrors the working specification in
`DETAILFORAI.MD/PROJECT_SPEC.md`, applied to the METFLIX platform. For the
operating manual (how to run, what's seeded, env reference, API surface),
see [README.md](./README.md).

## 1. Project

**METFLIX** — modern cinematic streaming MVP for movies and series.
Dark theme (black / blue / emerald), Next.js + NestJS + PostgreSQL, Docker
Compose. Designed to host ~1,000 early users with room to grow.

## 2. Roles

```
user    — registered visitors
admin   — fixed dev credentials (id: admin / password: 1234)
```

The fixed admin is for development / demo only.

## 3. MVP features

- Auth: register, login, admin-login, JWT, role + auth guards
- Browse: hero, featured carousels, trending, continue watching, my list
- Movie & series detail pages with My List, watch entry, trailer
- Watch page with HTML5 player, progress save (throttled), resume, next episode
- Watchlist / My List
- Watch history / Continue Watching
- Self-hosted notifications module (broadcast + targeted)
- Admin dashboard, content CRUD (movies, series, seasons, episodes), users, notifications
- Pagination on every list endpoint
- Health check

Not in MVP: payments / subscriptions, category / year / language / rating filters,
multi-profile, DRM, full CDN/HLS pipeline, recommendation engine, mobile app,
parental control, advanced search.

## 4. Data model (raw SQL — see `apps/api/src/database/schema.ts`)

```
users, profiles
movies
series, seasons, episodes
watchlists
watch_histories
notifications, notification_reads
admin_activity_logs
```

Status enums: `draft | published | archived` for content;
`active | suspended` for users; six notification types.

## 5. UI

```
Background     #050814
Surface        #0B1020
Surface soft   #111827
Primary blue   #0EA5E9
Deep blue      #1D4ED8
Emerald accent #00FF9C
Text           #F8FAFC
Text muted     #94A3B8
```

- User shell: cinematic, glassmorphic accents, smooth motion.
- Admin shell: same theme family, emerald accent rail, distinctly "console-like".
- Page transitions, card hover scale, skeleton shimmer for loading.

## 6. Acceptance criteria

The MVP is considered done when:

1. `docker compose up -d --build` brings up Postgres, API, web.
2. Web opens at http://localhost:3000.
3. API at http://localhost:4000/api with `/api/health` returning `ok: true`.
4. A user can register, log in, browse, view detail, open watch.
5. A user can add to My List, see Continue Watching, see Notifications.
6. The fixed admin login (id `admin`, password `1234`) opens the admin console.
7. The admin can CRUD movies, series, seasons, episodes, and send notifications.
8. Code builds with TypeScript strict.

All of these are met by the current implementation.
