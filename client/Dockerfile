# ── Client Dockerfile (multi-stage) ───────────────────────────────────
# Build context: repo root (required by npm workspaces / lockfile)
#
# Stage 1: Install deps + build with Vite
# Stage 2: Serve static bundle with nginx
# ──────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy workspace manifests + lockfile
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY shared/package.json shared/

# Install all deps (devDeps needed for tsc + vite build)
RUN npm ci --workspace=client --workspace=shared --ignore-scripts

# Copy source
COPY client/ client/
COPY shared/ shared/

# VITE_API_URL is replaced at build time by Vite's import.meta.env transform.
# Default works for local docker-compose (browser → localhost:5000).
ARG VITE_API_URL=http://localhost:5000/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build --workspace=client

# ── Stage 2: Serve ────────────────────────────────────────────────────
FROM nginx:stable-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config with SPA fallback
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from Stage 1
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
