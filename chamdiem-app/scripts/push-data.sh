#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  Đẩy TOÀN BỘ dữ liệu PD Point từ máy này lên máy chủ (ghi đè dữ liệu máy chủ):
#    cd chamdiem-app && ./scripts/push-data.sh [đường-dẫn-file.db]
#  Mặc định lấy bản chụp mới nhất trong server/data/transfer/ (tạo bằng:
#    sqlite3 server/data/chamdiem.db ".backup 'server/data/transfer/chamdiem-<ngày>.db'")
#  Việc làm: sao lưu thư mục data trên máy chủ → dừng dịch vụ → thay chamdiem.db
#  (xóa -wal/-shm cũ) → bật lại dịch vụ → kiểm tra. Giữ nguyên .env và data/archive/.
#  Chỉ hỏi mật khẩu SSH 1 lần (dùng chung kết nối) + mật khẩu sudo khi dừng / bật dịch vụ.
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail
HOST="${DEPLOY_HOST:-ansible@10.1.39.11}"
DIR="${DEPLOY_DIR:-/opt/pdpoint}"
cd "$(dirname "$0")/.."

SNAP="${1:-$(ls -t server/data/transfer/*.db 2>/dev/null | head -1)}"
[ -f "$SNAP" ] || { echo "✗ Không thấy file dữ liệu: $SNAP"; exit 1; }
echo "▸ Dữ liệu sẽ đẩy: $SNAP ($(sqlite3 "$SNAP" 'select count(*) from docs') bản ghi)"
sqlite3 "$SNAP" "select '   ' || kind || ': ' || count(*) from docs group by kind order by kind"

SSH_OPTS=(-o ControlMaster=auto -o ControlPath="/tmp/pdpoint-push-%r@%h" -o ControlPersist=120)
TS=$(date +%Y%m%d-%H%M%S)

echo "▸ Tải file lên $HOST:/tmp"
scp "${SSH_OPTS[@]}" "$SNAP" "$HOST:/tmp/pdpoint-import-$TS.db"

echo "▸ Sao lưu dữ liệu cũ → $DIR/data-backup-$TS, thay dữ liệu, khởi động lại"
ssh -t "${SSH_OPTS[@]}" "$HOST" "set -e
  sudo systemctl stop pdpoint
  cp -a $DIR/data $DIR/data-backup-$TS
  cp /tmp/pdpoint-import-$TS.db $DIR/data/chamdiem.db
  rm -f $DIR/data/chamdiem.db-wal $DIR/data/chamdiem.db-shm /tmp/pdpoint-import-$TS.db
  sudo systemctl start pdpoint
  sleep 2
  systemctl is-active pdpoint
  curl -s http://localhost/api/health || true; echo
  echo '   Bản sao lưu dữ liệu cũ: $DIR/data-backup-$TS'"
ssh -O exit "${SSH_OPTS[@]}" "$HOST" 2>/dev/null || true
echo "✓ Xong — mở http://pdpoint.sdcthin.local để kiểm tra"
echo "  Khôi phục lại dữ liệu cũ nếu cần: ssh $HOST \"sudo systemctl stop pdpoint && rm -rf $DIR/data && mv $DIR/data-backup-$TS $DIR/data && sudo systemctl start pdpoint\""
