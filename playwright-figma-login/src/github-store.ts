import * as crypto from 'crypto';

export interface CookieRow {
  domain: string;
  expirationDate?: number;
  hostOnly: boolean;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string | null;
  secure: boolean;
  session: boolean;
  storeId: null;
  value: string;
}

// Cùng passphrase với config.enc (encrypt-config.js) để đồng bộ cơ chế mã hóa AES-256-CBC.
const _KEY = crypto.createHash('sha256').update('F1gm@L0g1nT00l-2026-M1SA').digest();

// Bọc quanh nội dung mã hóa để bên đọc (extension) chỉ cần tìm đúng 2 marker này trong
// trang GitHub và cắt phần ở giữa — không cần biết/phụ thuộc cấu trúc JSON nội bộ mà GitHub
// dùng để hiển thị file (có thể đổi bất cứ lúc nào). Giữ nguyên trên 1 dòng (không newline)
// để chắc chắn marker + nội dung luôn nằm liền mạch trong 1 "dòng" khi GitHub render file.
// Tránh các ký tự <, >, & vì GitHub tự escape chúng thành </>/& khi nhúng
// JSON vào trang (chống XSS) — dùng '@' để chắc chắn khớp nguyên văn khi extension tìm lại.
const MARKER_START = '@@FIGMA_COOKIES_V1_START@@';
const MARKER_END   = '@@FIGMA_COOKIES_V1_END@@';

function encrypt(plain: string): string {
  const iv     = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', _KEY, iv);
  let enc = cipher.update(plain, 'utf8', 'base64');
  enc    += cipher.final('base64');
  return iv.toString('hex') + ':' + enc;
}

function decrypt(raw: string): string {
  const sep     = raw.indexOf(':');
  const iv      = Buffer.from(raw.slice(0, sep), 'hex');
  const enc     = raw.slice(sep + 1);
  const decipher = crypto.createDecipheriv('aes-256-cbc', _KEY, iv);
  let dec = decipher.update(enc, 'base64', 'utf8');
  dec    += decipher.final('utf8');
  return dec;
}

interface GitHubContentResponse {
  sha?: string;
  content?: string;
}

function githubConfig() {
  return {
    token:    process.env.GITHUB_TOKEN ?? '',
    repo:     process.env.GITHUB_REPO ?? '',
    branch:   process.env.GITHUB_BRANCH ?? 'main',
    filePath: process.env.GITHUB_FILE_PATH ?? 'cookies.enc',
  };
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'figma-login-tool',
    'Content-Type': 'application/json',
  };
}

/**
 * Đọc cookie đã lưu từ lần chạy trước trên GitHub (nếu có) — dùng để quyết định tài khoản
 * nào có thể bỏ qua bước đăng nhập lại. Trả về {} nếu chưa cấu hình GitHub, file chưa tồn
 * tại, hoặc không đọc/giải mã được (coi như chưa có cookie, sẽ đăng nhập lại tất cả).
 */
export async function fetchCookiesFromGitHub(): Promise<Record<string, CookieRow[]>> {
  const { token, repo, branch, filePath } = githubConfig();
  if (!token || !repo) return {};

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const res = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers: githubHeaders(token) });
  if (!res.ok) {
    if (res.status === 404) return {};
    throw new Error(`[GitHub] Loi doc file cu (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as GitHubContentResponse;
  if (!data.content) return {};
  const fileContent = Buffer.from(data.content, 'base64').toString('utf8');

  const start = fileContent.indexOf(MARKER_START);
  const end   = fileContent.indexOf(MARKER_END);
  if (start === -1 || end === -1) return {};

  const plain   = decrypt(fileContent.slice(start + MARKER_START.length, end));
  const payload = JSON.parse(plain) as { accounts?: Record<string, CookieRow[]> };
  return payload.accounts ?? {};
}

/**
 * Test nhanh 1 session Figma còn hoạt động hay không bằng 1 HTTP request thật (không mở
 * Chrome) — gắn cookie vào header, gọi 1 trang cần đăng nhập, coi là còn sống nếu không bị
 * redirect về /login. Đây là trang nội bộ không công khai của Figma nên có thể đổi hành vi
 * bất cứ lúc nào; sai (false negative) chỉ khiến tool đăng nhập lại không cần thiết, không
 * gây hại gì thêm.
 */
export async function isSessionValid(cookies: CookieRow[]): Promise<boolean> {
  if (!cookies.length) return false;
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  try {
    const res = await fetch('https://www.figma.com/files/recent', {
      headers: { Cookie: cookieHeader },
      redirect: 'manual',
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location') ?? '';
      return !location.includes('/login');
    }
    return res.status === 200;
  } catch {
    return false;
  }
}

/**
 * Ghi đè 1 file duy nhất trên GitHub (repo/path lấy từ config) chứa cookie
 * của tất cả tài khoản đăng nhập thành công trong lần chạy này. Nội dung được
 * mã hóa AES trước khi commit.
 */
export async function saveCookiesToGitHub(cookiesByEmail: Record<string, CookieRow[]>): Promise<void> {
  const { token, repo, branch, filePath } = githubConfig();

  if (!token || !repo) {
    console.error('[GitHub] Thieu GITHUB_TOKEN hoac GITHUB_REPO trong config, bo qua buoc luu cookie.');
    return;
  }

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const payload = {
    updatedAt: now.toISOString(),
    accounts: cookiesByEmail,
  };
  const encrypted = encrypt(JSON.stringify(payload, null, 2));
  const fileContent = MARKER_START + encrypted + MARKER_END;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = githubHeaders(token);

  console.log(`[GitHub] Kiem tra file "${filePath}" tren ${repo}...`);
  let sha: string | undefined;
  const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, { headers });
  if (getRes.ok) {
    sha = ((await getRes.json()) as GitHubContentResponse).sha;
  } else if (getRes.status !== 404) {
    throw new Error(`[GitHub] Loi kiem tra file (${getRes.status}): ${await getRes.text()}`);
  }

  const accountCount = Object.keys(cookiesByEmail).length;
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Cap nhat cookie Figma (${accountCount} tai khoan) - ${now.toISOString()}`,
      content: Buffer.from(fileContent, 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    throw new Error(`[GitHub] Loi ghi file (${putRes.status}): ${await putRes.text()}`);
  }

  console.log(`[GitHub] Da luu cookie cua ${accountCount} tai khoan vao "${filePath}" (nhanh ${branch}).`);
  console.log(`[GitHub] URL: https://github.com/${repo}/blob/${branch}/${filePath}`);
}
