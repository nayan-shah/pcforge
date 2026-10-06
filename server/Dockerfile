# ── Server Dockerfile ─────────────────────────────────────────────────
# Build context: repo root (required by npm workspaces / lockfile)
#
# Base image bundles Chromium + Node 22 — matches playwright ^1.52.0
# in server/package.json.
# ──────────────────────────────────────────────────────────────────────

FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# 1. Copy workspace manifests + lockfile (layer-cached unless deps change)
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY shared/package.json shared/

# 2. Install production deps for server & shared workspaces only
RUN npm ci --workspace=server --workspace=shared --ignore-scripts \
    && npx playwright install --with-deps chromium

# 3. Copy application source
COPY server/ server/
COPY shared/ shared/

# 4. Run as the built-in non-root user provided by the Playwright image
USER pwuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server/src/index.js"]
