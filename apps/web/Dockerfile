# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /repo

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm install --no-audit --no-fund --workspaces --include-workspace-root

COPY packages/shared-types ./packages/shared-types
COPY apps/web ./apps/web

WORKDIR /repo/apps/web
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /app

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
