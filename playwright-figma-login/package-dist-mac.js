/**
 * Tạo thư mục dist-package-mac/ để phân phối cho macOS (Apple Silicon):
 *   bundle.js + playwright-core + config.enc + node (arm64) + run.sh
 */
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist-package-mac');

// Xóa dist-package-mac cũ
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST);

// 1. Bundle code (ngoại trừ playwright-core, chromium-bidi)
console.log('[1/6] Bundling code...');
execSync(
  'npx esbuild src/figma-login.ts --bundle --platform=node --outfile=dist-package-mac/bundle.js --external:playwright-core --external:chromium-bidi --log-level=warning',
  { cwd: ROOT, stdio: 'inherit' }
);

// 2. Mã hóa .env → config.enc (nếu có .env); nếu không thì dùng config.enc hiện có
if (fs.existsSync(path.join(ROOT, '.env'))) {
  console.log('[2/6] Encrypting config from .env...');
  execSync('node encrypt-config.js', { cwd: ROOT, stdio: 'inherit' });
} else if (fs.existsSync(path.join(ROOT, 'config.enc'))) {
  console.log('[2/6] Dùng config.enc hiện có (không có .env)...');
} else {
  console.error('[ERR] Không tìm thấy .env hoặc config.enc!');
  process.exit(1);
}

// 3. Copy playwright-core (bắt buộc vì cần đọc file tại runtime)
console.log('[3/6] Copying playwright-core...');
const playwrightSrc  = path.join(ROOT, 'node_modules', 'playwright-core');
const playwrightDest = path.join(DIST, 'node_modules', 'playwright-core');
if (!fs.existsSync(playwrightSrc)) {
  console.error('[ERR] Không tìm thấy node_modules/playwright-core. Chạy "npm install" trước.');
  process.exit(1);
}
fs.mkdirSync(path.join(DIST, 'node_modules'), { recursive: true });
copyDir(playwrightSrc, playwrightDest);

// 4. Copy config.enc
console.log('[4/6] Copying config files...');
fs.copyFileSync(path.join(ROOT, 'config.enc'), path.join(DIST, 'config.enc'));

// 5. Copy Node runtime macOS (arm64) đã bundle sẵn trong repo
console.log('[5/6] Copying Node.js runtime (darwin-arm64)...');
const nodeMacSrc = path.join(ROOT, 'node-mac-arm64');
if (fs.existsSync(nodeMacSrc)) {
  fs.copyFileSync(nodeMacSrc, path.join(DIST, 'node'));
  fs.chmodSync(path.join(DIST, 'node'), 0o755);
  console.log('   node (arm64) included.');
} else {
  console.warn('   [WARN] node-mac-arm64 not found — users will need Node.js installed.');
}

// 6. Tạo run.sh
console.log('[6/6] Creating run.sh...');
const sh = `#!/usr/bin/env bash
# Figma Auto Login + Cookie Sync to GitHub (macOS / Apple Silicon)
cd "$(dirname "$0")"

echo ""
echo " ================================================"
echo "   Figma Auto Login + Cookie Sync to GitHub"
echo " ================================================"
echo ""

# -- Bo co lock tai xuong (Gatekeeper) tren binary node kem theo --
xattr -d com.apple.quarantine "./node" 2>/dev/null || true

# -- Dung node co san trong thu muc (khong can cai Node.js) --
NODE_CMD="./node"
if [ ! -x "./node" ]; then
  if command -v node >/dev/null 2>&1; then
    NODE_CMD="node"
  else
    echo "[LOI] Khong tim thay node. Vui long giai nen lai tu file zip."
    read -p "Nhan Enter de dong..." _
    exit 1
  fi
fi

# -- Node kem theo chi build cho Apple Silicon (arm64) --
if [ "$NODE_CMD" = "./node" ] && [ "$(uname -m)" != "arm64" ]; then
  echo "[LOI] Node kem theo chi ho tro Apple Silicon (arm64). May ban la $(uname -m)."
  echo "      Vui long cai Node.js tai https://nodejs.org roi chay lai."
  read -p "Nhan Enter de dong..." _
  exit 1
fi

# -- Kiem tra node_modules --
if [ ! -f "node_modules/playwright-core/package.json" ]; then
  echo "[LOI] Thieu node_modules/playwright-core"
  echo ""
  echo " Vui long giai nen lai tu file zip, giu nguyen cau truc thu muc."
  read -p "Nhan Enter de dong..." _
  exit 1
fi

# -- Kiem tra Chrome --
CHROME_OK=0
if [ -e "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then CHROME_OK=1; fi
if [ -e "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then CHROME_OK=1; fi
if [ "$CHROME_OK" != "1" ]; then
  echo "[LOI] Khong tim thay Google Chrome. Tai va cai dat tai: https://www.google.com/chrome"
  read -p "Nhan Enter de dong..." _
  exit 1
fi

# -- Kiem tra file config --
if [ ! -f "config.enc" ]; then
  echo "[LOI] Khong tim thay file config.enc"
  read -p "Nhan Enter de dong..." _
  exit 1
fi

# -- Chay chinh --
"$NODE_CMD" bundle.js
EXIT_CODE=$?

echo ""
if [ "$EXIT_CODE" -eq 0 ]; then
  echo " ================================================"
  echo "   HOAN THANH! Cookie da duoc luu vao GitHub"
  echo " ================================================"
else
  echo " ================================================"
  echo "   CO LOI XAY RA - Ma loi: $EXIT_CODE"
  echo "   Kiem tra thong bao phia tren de biet chi tiet"
  echo " ================================================"
fi

read -p "Nhan Enter de dong..." _
exit $EXIT_CODE
`;
fs.writeFileSync(path.join(DIST, 'run.sh'), sh);
fs.chmodSync(path.join(DIST, 'run.sh'), 0o755);
// run.command: cùng nội dung, nhưng double-click trong Finder sẽ tự mở Terminal và chạy
fs.writeFileSync(path.join(DIST, 'run.command'), sh);
fs.chmodSync(path.join(DIST, 'run.command'), 0o755);

// Nén thành ZIP (dùng zip CLI của macOS để giữ nguyên quyền thực thi +x)
console.log('\nNén thành figma-login-mac.zip...');
const zipPath = path.join(ROOT, 'figma-login-mac.zip');
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
execSync(`zip -r -X -q "${zipPath}" "${path.basename(DIST)}"`, { cwd: ROOT, stdio: 'inherit' });

// Thống kê
const files  = countFiles(DIST);
const sizeMB = (dirSize(DIST) / 1024 / 1024).toFixed(1);
const zipMB  = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`\n✅ dist-package-mac/ — ${files} files, ${sizeMB} MB`);
console.log(`✅ figma-login-mac.zip — ${zipMB} MB`);
console.log('   Nội dung: run.command  run.sh  bundle.js  node  node_modules/playwright-core  config.enc');

// ── helpers ──────────────────────────────────────────────────────────────────
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    n += e.isDirectory() ? countFiles(p) : 1;
  }
  return n;
}
function dirSize(dir) {
  let s = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    s += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return s;
}
