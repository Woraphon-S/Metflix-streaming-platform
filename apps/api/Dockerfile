# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm install --no-audit --no-fund --workspaces --include-workspace-root

COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

WORKDIR /repo/apps/api
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /app

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["sh", "-c", "node dist/db/seed.js && node dist/main.js"]
