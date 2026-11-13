#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  Đẩy PD Point lên máy chủ (không dùng Docker) — chạy từ máy có mã nguồn:
#    cd chamdiem-app && ./scripts/deploy.sh            (mặc định ansible@10.1.39.11)
#    DEPLOY_HOST=user@ip ./scripts/deploy.sh
#  Việc làm: build giao diện → rsync code lên /opt/pdpoint → cài thư viện máy chủ → khởi động lại dịch vụ.
#  KHÔNG đụng tới dữ liệu (/opt/pdpoint/data) và file cấu hình (/opt/pdpoint/.env) trên máy chủ.
#  Cài đặt lần đầu (Node 24, dịch vụ systemd, tường lửa, .env): xem DEPLOY.md mục "Máy chủ không dùng Docker".
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail
HOST="${DEPLOY_HOST:-ansible@10.1.39.11}"
DIR="${DEPLOY_DIR:-/opt/pdpoint}"
NODE_BIN="${DEPLOY_NODE_BIN:-/opt/node24/bin}"
cd "$(dirname "$0")/.."

echo "▸ Build giao diện"
npx vite build >/dev/null

echo "▸ Đẩy code lên $HOST:$DIR"
rsync -az --delete dist/ "$HOST:$DIR/dist/"
rsync -az --delete --exclude node_modules --exclude data --exclude .env server/ "$HOST:$DIR/server/"
ssh "$HOST" "mkdir -p $DIR/src/store"
rsync -az src/store/scoring.js src/store/aiExtract.js src/store/aiComplexity.js src/store/aiAva.js src/store/baScoring.js src/store/importCore.js src/store/seed-real.json "$HOST:$DIR/src/store/"

echo "▸ Cài thư viện máy chủ + khởi động lại"
ssh -t "$HOST" "cd $DIR/server && PATH=$NODE_BIN:\$PATH npm ci --omit=dev --no-audit --no-fund >/dev/null && sudo systemctl restart pdpoint && sleep 2 && systemctl --no-pager --lines=5 status pdpoint | head -12"
echo "✓ Xong"
