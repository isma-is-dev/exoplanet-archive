# ---- Builder ----
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN NX_DAEMON=false NX_NO_CLOUD=true pnpm exec nx build api && \
    NX_DAEMON=false NX_NO_CLOUD=true pnpm exec nx build web

# ---- Runner ----
FROM node:22-alpine AS runner

RUN apk add --no-cache nginx supervisor

# API
WORKDIR /app/api
COPY --from=builder /app/dist/apps/api ./
RUN npm install --omit=dev --ignore-scripts

# Angular static files
COPY --from=builder /app/dist/apps/web/browser /usr/share/nginx/html

# Configs
COPY apps/web/nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

# Cache dir
RUN mkdir -p /app/api/data

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
