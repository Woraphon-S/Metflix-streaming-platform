# CLAUDE.md — METFLIX

Working notes for Claude / future contributors on this codebase.

## Project context

METFLIX is a modern streaming-platform MVP (movies + series), modeled after the spec in
`DETAILFORAI.MD/PROJECT_SPEC.md` and `DETAILFORAI.MD/CLAUDE.md`. The platform name is
**METFLIX**, and everything is wired around that. The full project setup, env, demo
credentials, and API surface live in [README.md](./README.md).

## Working principles

- Think in modules. Backend = NestJS module per domain. Frontend = `components` (reusable),
  `features`/`services` (domain), `app/...` (routes).
- DTOs validate every POST/PATCH. Controllers are thin. Services own business logic.
- Every admin write goes through `AdminLogService` so the audit log stays complete.
- Pagination on every list endpoint. No `SELECT` without `LIMIT`.
- No ORM. All DB access goes through `DatabaseService` (`pg.Pool`) with raw parameterised
  SQL. Use `$1`, `$2`, … placeholders — never string-concat user input into SQL.
- No third-party notification service — the notifications module is self-hosted, with a
  structure ready for a WebSocket gateway.
- Never commit `.env`. Use `.env.example` as the source of truth for variable shape.
- Don't expose `password_hash` in any response.

## Roles

- `user` — registered visitors. Can browse, save to My List, save progress.
- `admin` — has access to `/admin/*` UI + `/api/admin/*` endpoints. Locked behind the
  fixed dev credentials `id: admin` / `password: 1234` for the MVP.

## Adding a new domain (recipe)

1. Add `CREATE TABLE` / `CREATE INDEX` / trigger entries to `apps/api/src/database/schema.ts`
   (always wrap in `IF NOT EXISTS` so the schema is reapplied safely on every boot).
2. Add a typed row interface in `apps/api/src/database/types.ts`.
3. Create `apps/api/src/modules/<name>/<name>.module.ts` + `service` + `controller` + `dto/`.
   Inject `DatabaseService` and write parameterised SQL inline in the service.
4. If the resource has admin writes, import `AdminModule` and inject `AdminLogService`.
5. Register the module in `apps/api/src/app.module.ts`.
6. Add a client in `apps/web/src/services/<name>.service.ts`.
7. Add a page under `apps/web/src/app/` and wrap with `AuthGuard` if needed.

## Things to avoid

- Hard-coded secrets (the only exception is the documented dev admin).
- Heavy logic in controllers.
- ORMs / query builders. Use the `DatabaseService` `query` / `queryOne` / `execute` /
  `withTransaction` helpers with raw SQL.
- String-concatenating values into SQL — always use `$1`, `$2`, … placeholders.
- Streaming large video files directly through NestJS — the schema is built so video URLs
  point at a CDN.
- `any` types and magic strings — use the type unions in `database/types.ts` and the
  shared types in `packages/shared-types`.
