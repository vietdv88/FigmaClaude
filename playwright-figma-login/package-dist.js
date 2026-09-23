/**
 * Tạo thư mục dist-package/ để phân phối:
 *   bundle.js + playwright-core + config.enc + run.bat
 */
const { execSync } = require('child_process');
const fs     = require('fs');
const path   = require('path');
const AdmZip = require('adm-zip');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist-package');

// Xóa dist-package cũ
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST);

// 1. Bundle code (ngoại trừ playwright-core)
console.log('[1/5] Bundling code...');
execSync(
  'npx esbuild src/figma-login.ts --bundle --platform=node --outfile=dist-package/bundle.js --external:playwright-core --external:chromium-bidi --log-level=warning',
  { cwd: ROOT, stdio: 'inherit' }
);

// 2. Mã hóa .env → config.enc (nếu có .env); nếu không thì dùng config.enc hiện có
if (fs.existsSync(path.join(ROOT, '.env'))) {
  console.log('[2/5] Encrypting config from .env...');
  execSync('node encrypt-config.js', { cwd: ROOT, stdio: 'inherit' });
} else if (fs.existsSync(path.join(ROOT, 'config.enc'))) {
  console.log('[2/5] Dùng config.enc hiện có (không có .env)...');
} else {
  console.error('[ERR] Không tìm thấy .env hoặc config.enc!');
  process.exit(1);
}

// 3. Copy playwright-core (bắt buộc vì cần đọc file tại runtime)
console.log('[3/5] Copying playwright-core...');
const playwrightSrc  = path.join(ROOT, 'node_modules', 'playwright-core');
const playwrightDest = path.join(DIST, 'node_modules', 'playwright-core');
fs.mkdirSync(path.join(DIST, 'node_modules'), { recursive: true });
copyDir(playwrightSrc, playwrightDest);

// 4. Copy file config + node.exe
console.log('[4/5] Copying config files + node.exe...');
fs.copyFileSync(path.join(ROOT, 'config.enc'), path.join(DIST, 'config.enc'));
const nodeExeSrc = path.join(ROOT, 'node.exe');
if (fs.existsSync(nodeExeSrc)) {
  fs.copyFileSync(nodeExeSrc, path.join(DIST, 'node.exe'));
  console.log('   node.exe included.');
} else {
  console.warn('   [WARN] node.exe not found — users will need Node.js installed.');
}

// 5. Tạo run.bat
console.log('[5/5] Creating run.bat...');
const bat = `@echo off
chcp 65001 > nul
title Figma Cookie Collector

echo.
echo  ================================================
echo    Figma Auto Login + Cookie Sync to GitHub
echo  ================================================
echo.

cd /d "%~dp0"

REM -- Dung node.exe co san trong thu muc (khong can cai Node.js) --
set NODE_CMD=node.exe
if not exist "node.exe" (
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo [LOI] Khong tim thay node.exe. Vui long giai nen lai tu file zip.
        goto :DONE
    )
    set NODE_CMD=node
)

REM -- Kiem tra node_modules (duong dan giai nen qua dai se thieu file) --
if not exist "node_modules\\playwright-core\\package.json" (
    echo [LOI] Thieu node_modules\\playwright-core
    echo.
    echo  Nguyen nhan: Windows gioi han 260 ky tu trong duong dan.
    echo  Cach sua   : Giai nen vao thu muc ngan hon, vi du C:\\figma-login\\
    goto :DONE
)

REM -- Kiem tra Chrome (tranh dung ProgramFiles x86 trong for loop) --
set CHROME_OK=0
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set CHROME_OK=1
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" set CHROME_OK=1
set PFX86=%ProgramFiles(x86)%
if exist "%PFX86%\\Google\\Chrome\\Application\\chrome.exe" set CHROME_OK=1
if %CHROME_OK%==0 (
    echo [LOI] Khong tim thay Google Chrome. Tai va cai dat tai: https://www.google.com/chrome
    goto :DONE
)

REM -- Kiem tra file config --
if not exist "config.enc" (
    echo [LOI] Khong tim thay file config.enc
    goto :DONE
)

REM -- Chay chinh --
%NODE_CMD% bundle.js
set EXIT_CODE=%errorlevel%

echo.
if %EXIT_CODE% equ 0 (
    echo  ================================================
    echo    HOAN THANH! Cookie da duoc luu vao GitHub
    echo  ================================================
) else (
    echo  ================================================
    echo    CO LOI XAY RA - Ma loi: %EXIT_CODE%
    echo    Kiem tra thong bao phia tren de biet chi tiet
    echo  ================================================
)

:DONE
echo.
pause
`;
fs.writeFileSync(path.join(DIST, 'run.bat'), bat);

// Nén thành ZIP
console.log('\nNén thành figma-login.zip...');
const zipPath = path.join(ROOT, 'figma-login.zip');
const zip = new AdmZip();
zip.addLocalFolder(DIST);
zip.writeZip(zipPath);

// Thống kê
const files  = countFiles(DIST);
const sizeMB = (dirSize(DIST) / 1024 / 1024).toFixed(1);
const zipMB  = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`\n✅ dist-package/ — ${files} files, ${sizeMB} MB`);
console.log(`✅ figma-login.zip — ${zipMB} MB`);
console.log('   Nội dung: run.bat  bundle.js  node_modules/playwright-core  config.enc');

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
