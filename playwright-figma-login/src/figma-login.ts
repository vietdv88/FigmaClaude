import { chromium, Browser, BrowserContext, Page } from 'playwright-core';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { saveCookiesToGitHub, fetchCookiesFromGitHub, isSessionValid, CookieRow } from './github-store';

// pkg exe → thư mục chứa exe
// bundle.js → __dirname = thư mục chứa bundle.js (cùng chỗ config.enc)
// ts-node src/figma-login.ts → __dirname = src/, config.enc ở ..
const ROOT = (process as any).pkg
  ? path.dirname(process.execPath)
  : fs.existsSync(path.join(__dirname, 'config.enc'))
    ? __dirname
    : path.resolve(__dirname, '..');

// ── Lock file ──────────────────────────────────────────────────────────────
const LOCK_FILE       = path.join(ROOT, 'figma-login.lock');
const LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút

function acquireLock(): void {
  if (fs.existsSync(LOCK_FILE)) {
    const stats = fs.statSync(LOCK_FILE);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < LOCK_TIMEOUT_MS) {
      const startedAt = new Date(stats.mtimeMs).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      console.error(`\n[LOI] Chuong trinh dang duoc chay boi nguoi khac (bat dau luc ${startedAt}).`);
      console.error('Vui long doi cho den khi hoan thanh roi thu lai.');
      process.exit(1);
    }
    // Lock cũ (> 30 phút) → coi như stale, xóa và tiếp tục
    console.log('[WARN] Phat hien lock file cu (> 30 phut), bo qua va tiep tuc...');
    fs.unlinkSync(LOCK_FILE);
  }
  fs.writeFileSync(LOCK_FILE, new Date().toISOString(), 'utf8');
}

function releaseLock(): void {
  try { if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE); } catch {}
}

// ── Config ─────────────────────────────────────────────────────────────────
const _KEY = crypto.createHash('sha256').update('F1gm@L0g1nT00l-2026-M1SA').digest();

function loadConfig(): void {
  const encPath = path.join(ROOT, 'config.enc');
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(encPath)) {
    const raw   = fs.readFileSync(encPath, 'utf8').trim();
    const colon = raw.indexOf(':');
    const iv    = Buffer.from(raw.slice(0, colon), 'hex');
    const enc   = raw.slice(colon + 1);
    const dec   = crypto.createDecipheriv('aes-256-cbc', _KEY, iv);
    let plain   = dec.update(enc, 'base64', 'utf8');
    plain      += dec.final('utf8');
    const parsed = dotenv.parse(plain);
    for (const [k, v] of Object.entries(parsed)) process.env[k] = v;
  } else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    console.error('Khong tim thay config.enc hoac .env!');
    process.exit(1);
  }
}

loadConfig();

// ── Accounts ───────────────────────────────────────────────────────────────
interface Account {
  email: string;
  password: string;
  totpSecret: string;
}

interface LoginResult {
  account: Account;
  cookies: CookieRow[];
  success: boolean;
  error?: string;
}

function loadAccounts(): Account[] {
  const emails    = (process.env.FIGMA_EMAILS    ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const passwords = (process.env.FIGMA_PASSWORDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const secrets   = (process.env.FIGMA_2FA_SECRETS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (!emails.length) { console.error('Thieu FIGMA_EMAILS trong config'); process.exit(1); }
  if (passwords.length !== emails.length || secrets.length !== emails.length) {
    console.error('So luong FIGMA_EMAILS / FIGMA_PASSWORDS / FIGMA_2FA_SECRETS phai bang nhau.');
    process.exit(1);
  }
  return emails.map((email, i) => ({ email, password: passwords[i], totpSecret: secrets[i] }));
}

const accounts = loadAccounts();

const sameSiteMap: Record<string, string> = { Strict: 'strict', Lax: 'lax', None: 'no_restriction' };

// ── Login từng tài khoản (chạy song song) ─────────────────────────────────
async function loginAccount(browser: Browser, account: Account): Promise<LoginResult> {
  const { email, password, totpSecret } = account;
  const tag = `[${email.split('@')[0]}]`;
  let context: BrowserContext | null = null;

  try {
    context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page: Page = await context.newPage();

    console.log(`${tag} Truy cap figma.com/login...`);
    const loginResponse = await page.goto('https://www.figma.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Bu tru lech dong ho he thong bang gio server (header Date) de OTP luon dung,
    // ke ca khi dong ho may chay tool bi sai/lech mui gio.
    let clockDriftMs = 0;
    const serverDateHeader = loginResponse?.headers()['date'];
    if (serverDateHeader) {
      const serverTimeMs = new Date(serverDateHeader).getTime();
      if (!Number.isNaN(serverTimeMs)) {
        clockDriftMs = serverTimeMs - Date.now();
        if (Math.abs(clockDriftMs) > 5000) {
          console.log(`${tag} [WARN] Dong ho may lech ~${Math.round(clockDriftMs / 1000)}s so voi server, da tu bu tru.`);
        }
      }
    }

    console.log(`${tag} Dien email va password...`);
    await page.locator('input[type="email"], input[name="email"]').first().fill(email);
    await page.locator('input[type="password"], input[name="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    const bodyText = (await page.locator('body').textContent()) ?? '';
    if (bodyText.toLowerCase().includes('authentication code') || bodyText.toLowerCase().includes('recovery code')) {
      console.log(`${tag} Man 2FA - generate OTP...`);
      authenticator.options = { epoch: Date.now() + clockDriftMs };
      const otp = authenticator.generate(totpSecret);

      const otpBoxes = page.getByRole('textbox');
      const boxCount = await otpBoxes.count();
      console.log(`${tag} [DEBUG] OTP=${otp}, tim thay ${boxCount} o nhap.`);

      if (boxCount === otp.length) {
        // Man hinh dung nhieu o rieng, moi o 1 chu so (vd: 6 o cho ma 6 so)
        for (let i = 0; i < otp.length; i++) {
          await otpBoxes.nth(i).fill(otp[i]);
        }
      } else {
        // Man hinh dung 1 o nhap chung ca ma
        await otpBoxes.first().fill(otp);
      }
      await page.waitForTimeout(300);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {});
    }

    const finalUrl = page.url();
    if (!finalUrl.includes('/login')) {
      console.log(`${tag} Dang nhap thanh cong!`);
      const rawCookies = await context.cookies();
      const cookies: CookieRow[] = rawCookies.map(c => {
        const isSession = !c.expires || c.expires <= 0;
        const row: CookieRow = {
          domain:   c.domain,
          hostOnly: !c.domain.startsWith('.'),
          httpOnly: c.httpOnly,
          name:     c.name,
          path:     c.path,
          sameSite: c.sameSite ? (sameSiteMap[c.sameSite] ?? c.sameSite.toLowerCase()) : null,
          secure:   c.secure,
          session:  isSession,
          storeId:  null,
          value:    c.value,
        };
        if (!isSession) row.expirationDate = c.expires;
        return row;
      });
      console.log(`${tag} Lay duoc ${cookies.length} cookies.`);
      return { account, cookies, success: true };
    } else {
      const errMsg = await page.locator('[role="alert"], [class*="error"]').first()
        .textContent({ timeout: 2000 }).catch(() => '');
      const msg = errMsg?.trim() || `Dang nhap that bai (URL: ${finalUrl})`;
      console.error(`${tag} THAT BAI: ${msg}`);
      return { account, cookies: [], success: false, error: msg };
    }
  } catch (err: any) {
    console.error(`${tag} LOI: ${err?.message ?? err}`);
    return { account, cookies: [], success: false, error: err?.message ?? String(err) };
  } finally {
    await context?.close();
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  acquireLock();
  let browser: Browser | null = null;
  try {
    // Bước 1: Đọc cookie đã lưu lần trước + test nhanh (1 request, không mở Chrome) xem
    // còn dùng được không — tài khoản nào còn sống thì bỏ qua, đỡ phải đăng nhập lại.
    console.log('Kiem tra cookie hien co tren GitHub...');
    const existing = await fetchCookiesFromGitHub().catch((err) => {
      console.warn(`[WARN] Khong doc duoc cookie cu tren GitHub (${err.message}), se dang nhap lai tat ca.`);
      return {} as Record<string, CookieRow[]>;
    });

    const reused: Record<string, CookieRow[]> = {};
    const toRelogin: Account[] = [];
    for (const acc of accounts) {
      const tag = `[${acc.email.split('@')[0]}]`;
      const cached = existing[acc.email];
      if (cached && (await isSessionValid(cached))) {
        console.log(`${tag} Cookie cu van con hoat dong, bo qua dang nhap lai.`);
        reused[acc.email] = cached;
      } else {
        console.log(`${tag} Cookie cu da het han hoac chua co, can dang nhap lai.`);
        toRelogin.push(acc);
      }
    }

    // Bước 2: Chỉ mở Chrome + đăng nhập lại đúng những tài khoản cần làm mới cookie
    let results: LoginResult[] = [];
    if (toRelogin.length > 0) {
      console.log(`\nKhoi dong Chrome, dang nhap ${toRelogin.length}/${accounts.length} tai khoan...\n`);
      browser = await chromium.launch({ channel: 'chrome', headless: false, slowMo: 100 });
      results = await Promise.all(toRelogin.map((a) => loginAccount(browser!, a)));
    } else {
      console.log('\nTat ca cookie hien co deu con hoat dong, khong can dang nhap lai tai khoan nao.\n');
    }

    // Bước 3: Ghi đè GitHub bằng cookie mới (vừa đăng nhập) + cookie cũ còn dùng được
    const successful = results.filter((r) => r.success);
    const cookiesByEmail: Record<string, CookieRow[]> = { ...reused };
    for (const r of successful) cookiesByEmail[r.account.email] = r.cookies;

    if (Object.keys(cookiesByEmail).length > 0) {
      console.log(`\n[GitHub] Luu ${Object.keys(cookiesByEmail).length} tai khoan...\n`);
      await saveCookiesToGitHub(cookiesByEmail);
    }

    // Tổng kết
    const failed = results.filter((r) => !r.success);
    const okCount = Object.keys(cookiesByEmail).length;
    console.log('\n' + '='.repeat(60));
    console.log(
      `HOAN THANH: ${okCount}/${accounts.length} tai khoan co cookie hop le ` +
        `(${Object.keys(reused).length} tai su dung lai, ${successful.length} vua dang nhap moi).`,
    );
    if (failed.length > 0) {
      console.log(`THAT BAI (${failed.length}): ${failed.map((r) => r.account.email.split('@')[0]).join(', ')}`);
    }
    console.log('='.repeat(60));

    process.exitCode = failed.length > 0 ? 1 : 0;
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    if (msg.includes('chrome') || msg.includes('Chromium') || msg.includes('executable')) {
      console.error('\n[LOI] Khong tim thay Google Chrome. Cai dat tai: https://www.google.com/chrome');
    } else {
      console.error('\n[LOI]', msg);
    }
    process.exitCode = 1;
  } finally {
    releaseLock();
    await browser?.close();
  }
}

process.on('uncaughtException', (err) => {
  console.error('\n[LOI KHOI DONG]', err.message ?? err);
  releaseLock();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n[LOI KHONG XU LY DUOC]', reason);
  releaseLock();
  process.exit(1);
});

main();
