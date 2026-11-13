# ═══════════════════════════════════════════════════════════════════════════
#  PD Point — 1 container: giao diện (Vite build) + API Node + SQLite
#  Build từ thư mục GỐC monorepo (cần cả mds-ui):
#    docker build -f chamdiem-app/Dockerfile -t chamdiem-pd .
#  Hoặc: cd chamdiem-app && docker compose up -d --build
# ═══════════════════════════════════════════════════════════════════════════

# ── 1. Build giao diện ──
FROM node:24-slim AS web
WORKDIR /src
COPY mds-ui ./mds-ui
COPY chamdiem-app/package.json chamdiem-app/package-lock.json ./chamdiem-app/
RUN cd chamdiem-app && npm ci --no-audit --no-fund
COPY chamdiem-app ./chamdiem-app
RUN cd chamdiem-app && npx vite build

# ── 2. Máy chủ ──
FROM node:24-slim
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data NODE_NO_WARNINGS=1
WORKDIR /app
COPY chamdiem-app/server/package.json chamdiem-app/server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev --no-audit --no-fund
COPY chamdiem-app/server ./server
# Dùng chung công thức điểm + dữ liệu mẫu ban đầu với giao diện
COPY chamdiem-app/src/store/scoring.js chamdiem-app/src/store/aiExtract.js chamdiem-app/src/store/seed-real.json ./src/store/
COPY --from=web /src/chamdiem-app/dist ./dist
RUN mkdir -p /data && chown -R node:node /data /app
USER node
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://localhost:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
