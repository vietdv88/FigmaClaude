// Danh sách account khớp với phần trước "@" trong FIGMA_EMAILS của playwright-figma-login,
// vì đó chính là key (email) trong file cookies.enc lưu trên GitHub.
const ACCOUNTS = [
  { id: 'designer', label: 'designer' },
  { id: 'figmadev', label: 'figmadev' },
  { id: 'figmadev_dn', label: 'figmadev_dn' },
  { id: 'figmadev_hcsn', label: 'figmadev_hcsn' },
];

// Cấu hình cố định — playwright-figma-login ghi cookie (đã mã hóa AES-256-CBC) đè lên
// file này mỗi lần chạy. Passphrase giống hệt config.enc/github-store.ts để giải mã được.
//
// raw.githubusercontent.com trả thẳng nội dung file (không phải trang HTML như github.com/blob),
// đây là domain được firewall công ty duyệt mở.
const CONFIG = {
  cookiesUrl: 'https://raw.githubusercontent.com/vietdv88/Figma/refs/heads/main/cookies.enc',
  passphrase: 'F1gm@L0g1nT00l-2026-M1SA',
};

const FIGMA_COOKIE_DOMAINS = ['figma.com', '.figma.com', 'www.figma.com'];

// Cache toàn bộ cookie của mọi tài khoản trong chrome.storage.local (sống qua việc
// đóng/mở lại popup) — đổi tài khoản không phải tải lại GitHub, chỉ đọc cache.
const CACHE_KEY = 'figmaAccountCache';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 phút

let currentBundle = null; // { fetchedAt, updatedAt, accounts } — accounts: { [id]: { cookies } }

function setStatus(message, kind) {
  const el = document.getElementById('status');
  el.textContent = '';
  el.className = kind || '';
  if (kind === 'loading') {
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    el.appendChild(spinner);
  }
  el.appendChild(document.createTextNode(message));
}

function setAccountsDisabled(disabled) {
  document.querySelectorAll('#accounts button').forEach((btn) => {
    btn.disabled = disabled;
  });
}

async function clearFigmaCookies() {
  const found = [];
  for (const domain of FIGMA_COOKIE_DOMAINS) {
    const cookies = await chrome.cookies.getAll({ domain });
    found.push(...cookies);
  }
  const seen = new Set();
  for (const c of found) {
    const key = `${c.domain}|${c.path}|${c.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // Figma chi chay tren HTTPS, luon dung https:// de khop voi host_permissions
    // du cookie co co "secure:false" trong du lieu export.
    const url = 'https://' + c.domain.replace(/^\./, '') + c.path;
    await chrome.cookies.remove({ url, name: c.name });
  }
}

function mapSameSite(sameSite) {
  switch (sameSite) {
    case 'no_restriction':
      return 'no_restriction';
    case 'lax':
      return 'lax';
    case 'strict':
      return 'strict';
    default:
      return 'unspecified';
  }
}

function isFigmaCookie(c) {
  const domain = (c.domain || '').replace(/^\./, '').toLowerCase();
  return domain === 'figma.com' || domain.endsWith('.figma.com');
}

async function applyCookies(cookies) {
  let skipped = 0;
  let expired = 0;
  let failed = 0;
  const nowSec = Date.now() / 1000;

  for (const c of cookies) {
    if (!isFigmaCookie(c)) {
      skipped++;
      console.warn('Bo qua cookie khong thuoc figma.com:', c.domain, c.name);
      continue;
    }
    // Cookie da het han (luu tu luc session cu) thi chrome.cookies.set se tu choi
    // set (hoac set xong roi xoa ngay) — bao truoc thay vi de loi am tham.
    if (!c.session && typeof c.expirationDate === 'number' && c.expirationDate <= nowSec) {
      expired++;
      console.warn('Cookie da het han, bo qua:', c.name, new Date(c.expirationDate * 1000));
      continue;
    }
    const domainForUrl = c.domain.replace(/^\./, '');
    const detail = {
      // Cung ly do nhu tren: luon dung https:// bat ke co "secure" cua cookie.
      url: 'https://' + domainForUrl + c.path,
      name: c.name,
      value: c.value,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: mapSameSite(c.sameSite),
    };
    if (!c.hostOnly) detail.domain = c.domain;
    if (!c.session && c.expirationDate) detail.expirationDate = c.expirationDate;

    const result = await chrome.cookies.set(detail);
    if (!result) {
      failed++;
      console.warn('Khong the set cookie', c.name, detail);
    }
  }
  return { skipped, expired, failed };
}

async function getCachedBundle() {
  try {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const bundle = stored[CACHE_KEY];
    if (!bundle) return null;
    if (Date.now() - bundle.fetchedAt > CACHE_TTL_MS) {
      await chrome.storage.local.remove(CACHE_KEY);
      return null;
    }
    return bundle;
  } catch (err) {
    console.warn('Khong doc duoc cache:', err);
    return null;
  }
}

async function setCachedBundle(accounts, updatedAt) {
  const bundle = { fetchedAt: Date.now(), updatedAt, accounts };
  try {
    await chrome.storage.local.set({ [CACHE_KEY]: bundle });
  } catch (err) {
    console.warn('Khong luu duoc cache:', err);
  }
  return bundle;
}

async function clearCachedBundle() {
  try {
    await chrome.storage.local.remove(CACHE_KEY);
  } catch (err) {
    console.warn('Khong xoa duoc cache:', err);
  }
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveAesKey(passphrase) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(passphrase));
  return crypto.subtle.importKey('raw', hash, { name: 'AES-CBC' }, false, ['decrypt']);
}

// File cookies.enc có dạng "ivHex:base64Ciphertext" (AES-256-CBC), cùng cơ chế mã hóa
// với config.enc bên playwright-figma-login.
async function decryptCookiesFile(raw) {
  const sep = raw.indexOf(':');
  if (sep === -1) throw new Error('Sai dinh dang file (thieu dau ":")');
  const iv = hexToBytes(raw.slice(0, sep));
  const cipherBytes = base64ToBytes(raw.slice(sep + 1));
  const key = await deriveAesKey(CONFIG.passphrase);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, cipherBytes);
  return new TextDecoder().decode(plainBuf);
}

function formatUpdatedAt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });
}

// playwright-figma-login (github-store.ts) tự bọc nội dung file cookies.enc bằng 2 marker
// cố định này trước khi commit. Tìm đúng marker trong nội dung tải về và cắt phần ở giữa —
// vừa là bước kiểm tra file đúng định dạng mong đợi, vừa để code này vẫn dùng được nguyên
// vẹn nếu sau này phải đổi lại nguồn tải về trang HTML của github.com/blob thay vì file thô.
const MARKER_START = '@@FIGMA_COOKIES_V1_START@@';
const MARKER_END = '@@FIGMA_COOKIES_V1_END@@';

function extractCookiesPayload(text) {
  const start = text.indexOf(MARKER_START);
  const end = text.indexOf(MARKER_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      'Không tìm thấy marker cookie trong dữ liệu tải về — file cookies.enc có thể chưa được ghi bằng bản playwright-figma-login mới, hoặc đang ghi dở.',
    );
  }
  return text.slice(start + MARKER_START.length, end);
}

async function fetchAllAccountsFromServer() {
  try {
    const res = await fetch(CONFIG.cookiesUrl, { cache: 'no-store' });
    if (!res.ok) {
      return { error: `Lỗi HTTP ${res.status} khi tải file cookie từ GitHub.` };
    }
    const body = await res.text();

    let raw;
    try {
      raw = extractCookiesPayload(body).trim();
    } catch (err) {
      return { error: err.message };
    }

    let plain;
    try {
      plain = await decryptCookiesFile(raw);
    } catch (err) {
      return { error: `Không giải mã được file cookie (có thể đang ghi dở, thử lại sau): ${err.message}` };
    }

    let data;
    try {
      data = JSON.parse(plain);
    } catch (err) {
      return { error: 'Dữ liệu cookie sau khi giải mã bị lỗi định dạng JSON.' };
    }

    if (!data.accounts || typeof data.accounts !== 'object') {
      return { error: 'File cookie không có dữ liệu tài khoản hợp lệ.' };
    }

    const accounts = {};
    for (const [email, cookies] of Object.entries(data.accounts)) {
      accounts[email.split('@')[0]] = { cookies };
    }
    return { accounts, updatedAt: data.updatedAt };
  } catch (err) {
    return { error: `Không tải được file cookie: ${err.message}` };
  }
}

// Tải cookie của mọi tài khoản (dùng cache nếu còn hạn) rồi lưu vào currentBundle.
async function ensureBundle({ force = false } = {}) {
  if (!force) {
    const cached = await getCachedBundle();
    if (cached) {
      currentBundle = cached;
      return { fromCache: true };
    }
  }

  setAccountsDisabled(true);
  setStatus('Đang tải file cookie từ GitHub...', 'loading');
  const result = await fetchAllAccountsFromServer();
  setAccountsDisabled(false);

  if (result.error) {
    currentBundle = null;
    return { error: result.error };
  }
  currentBundle = await setCachedBundle(result.accounts, result.updatedAt);
  return { fromCache: false };
}

function renderAccountButtons(buttons) {
  const updatedLabel = currentBundle ? formatUpdatedAt(currentBundle.updatedAt) : '';
  ACCOUNTS.forEach((acc) => {
    const btn = buttons[acc.id];
    const tsEl = getOrCreateTimestampLabel(btn);
    const entry = currentBundle && currentBundle.accounts[acc.id];
    if (!entry) {
      tsEl.textContent = 'Chưa có cookie';
    } else {
      tsEl.textContent = updatedLabel ? `Cập nhật: ${updatedLabel}` : 'Đã có cookie';
    }
  });
}

async function applyAccount(accountId) {
  if (!currentBundle) {
    setStatus('Dữ liệu tài khoản chưa sẵn sàng, thử bấm lại sau vài giây.', 'error');
    return;
  }

  const entry = currentBundle.accounts[accountId];
  if (!entry) {
    setStatus(
      'Chưa có cookie nào được lưu cho tài khoản này — cần chạy lại playwright-figma-login cho tài khoản đó.',
      'error',
    );
    return;
  }
  const cookies = entry.cookies;
  if (!Array.isArray(cookies) || cookies.length === 0) {
    setStatus('Không có cookie nào cho tài khoản này.', 'error');
    return;
  }

  setAccountsDisabled(true);
  try {
    setStatus('Đang xoá cookie Figma cũ...', 'loading');
    await clearFigmaCookies();

    setStatus(`Đang nạp ${cookies.length} cookie...`, 'loading');
    const { skipped, expired, failed } = await applyCookies(cookies);
    const applied = cookies.length - skipped - expired - failed;

    if (applied === 0) {
      // Khong co cookie nao thuc su duoc set (toan bo da het han/bi tu choi)
      // → chac chan khong dang nhap duoc, khong duoc bao "success" gia.
      setStatus(
        `❌ Không nạp được cookie nào cho "${accountId}" — toàn bộ cookie đã hết hạn hoặc bị trình duyệt từ chối. ` +
          `Cần chạy lại playwright-figma-login để lấy cookie mới cho tài khoản này.`,
        'error',
      );
      return;
    }

    if (expired > 0 || failed > 0) {
      // Van set duoc phan lon cookie nhung mot so da het han/bi tu choi — co the van dang nhap
      // duoc, nhung neu mo figma.com van thay form login thi day la ly do.
      setStatus(
        `⚠️ Đã nạp ${applied}/${cookies.length} cookie cho "${accountId}" ` +
          `(${expired + failed} cookie hết hạn/bị từ chối). Nếu mở figma.com vẫn thấy form đăng nhập, ` +
          `báo admin để chạy lại playwright-figma-login lấy cookie mới.`,
        'warning',
      );
      return;
    }

    const skippedNote = skipped > 0 ? ` (bỏ qua ${skipped} cookie ngoài figma.com)` : '';
    setStatus(`✅ Đã đăng nhập bằng "${accountId}"${skippedNote}. Mở tab figma.com để dùng.`, 'success');
  } catch (err) {
    setStatus(`Lỗi: ${err.message}`, 'error');
  } finally {
    setAccountsDisabled(false);
  }
}

function getOrCreateTimestampLabel(btn) {
  let tsEl = btn.querySelector('.ts');
  if (!tsEl) {
    tsEl = document.createElement('span');
    tsEl.className = 'ts';
    btn.appendChild(tsEl);
  }
  tsEl.textContent = '';
  return tsEl;
}

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('accounts');
  const refreshBtn = document.getElementById('refresh');
  const buttons = {};

  ACCOUNTS.forEach((acc) => {
    const btn = document.createElement('button');
    btn.textContent = acc.label;
    btn.addEventListener('click', () => applyAccount(acc.id));
    list.appendChild(btn);
    buttons[acc.id] = btn;

    const tsEl = getOrCreateTimestampLabel(btn);
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    tsEl.appendChild(spinner);
    tsEl.appendChild(document.createTextNode('Đang tải...'));
  });

  async function load({ force = false } = {}) {
    const result = await ensureBundle({ force });
    if (result.error) {
      setStatus(`Không tải được dữ liệu tài khoản: ${result.error}`, 'error');
      // Van render de nut hien "Chua co cookie" thay vi ket qua "Dang tai..." treo mai.
      renderAccountButtons(buttons);
      return;
    }
    renderAccountButtons(buttons);
    setStatus(
      result.fromCache
        ? 'Chọn một tài khoản để đăng nhập (dữ liệu đang lấy từ cache).'
        : 'Chọn một tài khoản để đăng nhập.',
    );
  }

  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    await clearCachedBundle();
    await load({ force: true });
    refreshBtn.disabled = false;
  });

  load();
});
