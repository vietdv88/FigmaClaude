# Triển khai PD Point

Ứng dụng chạy trong **1 container Docker**: giao diện + API Node + cơ sở dữ liệu SQLite (lưu trong volume `/data`).
Đẩy lên Docker host nào cũng chạy được.

```
Trình duyệt ──► container chamdiem-pd :8080
                 ├─ giao diện (Vue, đã build)
                 ├─ API /api/*  (phân quyền theo vai trò + dự án)
                 └─ /data/chamdiem.db  (SQLite — volume)
```

---

## 1. Tạo Google Client ID (một lần)

1. Vào <https://console.cloud.google.com/> → tạo (hoặc chọn) một project.
2. **APIs & Services › OAuth consent screen**
   - User type: **External** (để Gmail cá nhân đăng nhập được).
   - Điền tên app "PD Point", email hỗ trợ.
   - Bấm **Publish app** (hoặc thêm từng Gmail vào *Test users* nếu chưa publish).
3. **APIs & Services › Credentials › Create credentials › OAuth client ID**
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: địa chỉ app, ví dụ `https://chamdiem.congty.vn`
     (thêm `http://localhost:8080` nếu muốn chạy thử trên máy).
   - *Authorized redirect URIs*: **không cần**. App dùng nút "Đăng nhập bằng Google" dạng popup.
4. Copy **Client ID** (dạng `xxxx.apps.googleusercontent.com`).

> Không cần Client Secret. Google bắt buộc origin dùng **https**, trừ `localhost`.
> Chỉ cho tài khoản Google Workspace của công ty (vd `@software.misa.com.vn`) đăng nhập: ở bước 2 chọn User type **Internal** (project phải thuộc tổ chức Workspace đó). Dùng cả Gmail cá nhân thì chọn **External**.
> Khi dùng thật: **tắt `OPEN_DEMO`** (xóa dòng trong `.env`) — nếu không, ai mở app cũng vào được không cần đăng nhập.

## 2. Cấu hình `.env`

```bash
cd chamdiem-app
cp .env.example .env
```

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `APP_URL` | ✓ | Địa chỉ người dùng truy cập, ví dụ `https://chamdiem.congty.vn`. Dùng cho link mời; khi là https thì cookie đăng nhập được bật cờ `secure`. |
| `MISA_ID_CLIENT_ID`, `MISA_ID_CLIENT_SECRET` | ✓* | Đăng nhập bằng **MISA ID** (id.misa.vn) — đội MISA ID cấp. *Cần MISA ID hoặc Google (hoặc cả hai) |
| `MISA_ID_REDIRECT_URI` | | Địa chỉ quay về sau khi đăng nhập, mặc định `APP_URL/api/auth/misa/callback` — phải đăng ký đúng địa chỉ này với MISA ID |
| `MISA_ID_USER_CLAIM` | | Thông tin MISA ID dùng để nhận diện nhân viên, mặc định `email,preferred_username` (lấy cái đầu tiên có giá trị) |
| `GOOGLE_CLIENT_ID` | ✓* | Đăng nhập bằng Google — Client ID ở bước 1 (bỏ trống nếu chỉ dùng MISA ID). |
| `SESSION_SECRET` | ✓ | Chuỗi ngẫu nhiên dài: `openssl rand -hex 32`. Đổi chuỗi này thì mọi người phải đăng nhập lại. |
| `ADMIN_EMAILS` | ✓ | Gmail Quản trị đầu tiên (cách nhau dấu phẩy). Đăng nhập lần đầu sẽ tự thành Quản trị. |
| `HOST_PORT` | | Cổng trên máy host (mặc định 8080). |
| `SEED` | | Dữ liệu khi DB trống: `sample` (dữ liệu mẫu hiện có, mặc định) hoặc `empty`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | | Gửi email mời. Bỏ trống thì app hiện link mời để Quản trị tự gửi qua chat / email. |

SMTP Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=<gmail>`, `SMTP_PASS=<App password>`
(tạo App password trong tài khoản Google › Bảo mật › Xác minh 2 bước › Mật khẩu ứng dụng).

## 3. Chạy

### Cách A — build và chạy ngay trên Docker host (có mã nguồn)

```bash
cd chamdiem-app
docker compose up -d --build
docker compose logs -f          # xem log khởi động
```

### Cách B — build image, đẩy lên registry, host chỉ cần kéo về

```bash
# Trên máy build — đứng ở GỐC monorepo (image cần cả mds-ui)
docker build -f chamdiem-app/Dockerfile -t registry.congty.vn/chamdiem-pd:1.0 .
docker push registry.congty.vn/chamdiem-pd:1.0

# Trên Docker host
docker volume create chamdiem-data
docker run -d --name chamdiem-pd --restart unless-stopped \
  -p 8080:8080 -v chamdiem-data:/data --env-file .env \
  registry.congty.vn/chamdiem-pd:1.0
```

Kiểm tra: `curl http://localhost:8080/api/health` → `{"ok":true}`.

### Cách C — máy chủ không dùng Docker (đang dùng: `10.1.39.11`)

Máy chủ nội bộ không tải được image từ Docker Hub → chạy trực tiếp bằng Node.js 24 như một dịch vụ systemd.

| | |
|---|---|
| Node.js 24 | `/opt/node24` (riêng cho app, không đụng Node của hệ thống) |
| Mã nguồn | `/opt/pdpoint` (`dist/`, `server/`, `src/store/`) |
| Cấu hình | `/opt/pdpoint/.env` (quyền 600 — có mật khẩu SMTP, SESSION_SECRET) |
| Dữ liệu | `/opt/pdpoint/data/` (SQLite + `archive/`) — **sao lưu thư mục này** |
| Dịch vụ | `pdpoint.service` — tự chạy khi khởi động máy, tự bật lại khi lỗi |
| Địa chỉ | `http://pdpoint.sdcthin.local` (cổng 80) · `https://pdpoint.sdcthin.local` (cổng 443) — DNS nội bộ trỏ về 10.1.39.11 |
| Cổng | 80 + 443 (đã mở trên `ufw`; dịch vụ có `AmbientCapabilities=CAP_NET_BIND_SERVICE` để chạy cổng thấp không cần root) |
| Chứng chỉ https | `/opt/pdpoint/tls/cert.pem` + `key.pem` — hiện là **chứng chỉ tạm tự ký** (trình duyệt cảnh báo). Có chứng chỉ IT cấp → thay 2 file, đặt `APP_URL=https://…` và `HTTPS_REDIRECT=1` trong `.env`, `sudo systemctl restart pdpoint` |

**Cập nhật phiên bản** (từ máy có mã nguồn): `cd chamdiem-app && ./scripts/deploy.sh` — build giao diện, đẩy code, cài thư viện, khởi động lại. Không đụng dữ liệu và `.env`. Nên cài SSH key (`ssh-copy-id ansible@10.1.39.11`) để khỏi gõ mật khẩu nhiều lần.

```bash
sudo systemctl status pdpoint          # trạng thái
sudo journalctl -u pdpoint -f          # xem log
sudo systemctl restart pdpoint         # khởi động lại (sau khi sửa .env)
```

Cài đặt lần đầu (đã làm): tải Node 24 từ nodejs.org vào `/opt/node24` → tạo `/opt/pdpoint` → `./scripts/deploy.sh` → tạo `.env` → tạo `/etc/systemd/system/pdpoint.service` (`ExecStart=/opt/node24/bin/node server/index.js`, `WorkingDirectory=/opt/pdpoint`, `User=ansible`, `Restart=always`) → `sudo systemctl enable --now pdpoint` → `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`.

## 4. HTTPS (bắt buộc khi dùng thật)

Đặt container sau reverse proxy có chứng chỉ. Ví dụ **Caddy** (tự xin chứng chỉ Let's Encrypt):

```
chamdiem.congty.vn {
  reverse_proxy localhost:8080
}
```

Nginx thì nhớ tắt buffer cho kênh realtime `/api/events`:

```nginx
location / {
  proxy_pass http://127.0.0.1:8080;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_buffering off;            # cần cho cập nhật realtime (SSE)
  proxy_read_timeout 1h;
}
```

## 4b. Đăng nhập bằng MISA ID

Luồng: mở app → **Đăng nhập bằng MISA ID** → id.misa.vn đăng nhập → quay về app (OpenID Connect, Authorization Code + PKCE;
máy chủ PD Point tự kiểm tra chữ ký token, issuer `https://id.misa.com.vn`, aud, nonce, thời hạn).

Cần đội MISA ID cấp / xác nhận:
1. Đăng ký client **PD Point** (confidential, Authorization Code + PKCE) → `MISA_ID_CLIENT_ID`, `MISA_ID_CLIENT_SECRET`.
2. Redirect URI: `https://<địa chỉ app>/api/auth/misa/callback`.
3. Scope `openid profile` (+ `email` nếu cấp được) và claim nào nhận diện nhân viên (email công ty / tên đăng nhập).

Nhân viên MISA đăng nhập lần đầu (chưa có trong danh sách) → tài khoản **Hoạt động nhưng chưa thuộc dự án nào** (không thấy dữ liệu)
cho tới khi Quản trị thêm vào dự án / phân bộ phận. Quản trị cũng có thể thêm trước bằng **Tài khoản MISA ID** trong màn Người dùng.

## 5. Bắt đầu sử dụng

1. Quản trị (Gmail trong `ADMIN_EMAILS`) mở app → **Đăng nhập bằng Google**.
2. Vào **Người dùng** → **Mời người dùng** (hoặc sửa người có sẵn): nhập **Gmail**, bộ phận (PO / BA / PD), dự án → **Lưu & gửi lời mời**.
   - Có SMTP: email mời được gửi tự động.
   - Chưa có SMTP: app hiện link mời, bấm **Sao chép** rồi gửi cho người đó.
3. Người được mời mở link → đăng nhập Google **đúng Gmail đó**. Đó là nhận lời mời; trạng thái chuyển **Hoạt động** và có ngay đúng quyền đã phân lúc mời (bộ phận, quản lý trực tiếp, dự án tham gia, dự án phụ trách). Vai trò trong từng dự án mặc định Thành viên — đổi trong form Sửa dự án.
   - Chọn nhầm tài khoản Google khác → app báo "Lời mời được gửi tới …" và cho chọn lại (không tạo yêu cầu chờ duyệt thừa).
   - Máy dùng chung đang đăng nhập người khác → mở link mời vẫn hiện trang đăng nhập để đổi tài khoản.
4. Ai đăng nhập khi **chưa được mời** (Gmail không có trong danh sách Người dùng) → app báo **“Bạn không có quyền truy cập”**, không vào được và không tạo tài khoản. Quản trị thêm / mời người đó trước.
5. Nghỉ việc → mở người dùng → tick **Khóa quyền truy cập** (hoặc **Gỡ quyền truy cập**). Có hiệu lực ngay, kể cả khi họ đang mở app.

Trạng thái tài khoản: **Chưa mời** → **Đã mời** → **Hoạt động** · **Đã khóa**. Người dùng chỉ thấy các dự án mình được thêm vào (Quản trị thấy tất cả).

## 6. Sao lưu và khôi phục

Toàn bộ dữ liệu nằm trong volume `chamdiem-data` (file `chamdiem.db` cùng các file `-wal`, `-shm`).

```bash
# Sao lưu (an toàn khi đang chạy: copy cả thư mục /data)
docker cp chamdiem-pd:/data ./backup-$(date +%F)

# Khôi phục
docker compose down
docker run --rm -v chamdiem-data:/data -v "$PWD/backup-2026-10-07:/b" node:24-slim sh -c "cp -a /b/. /data/"
docker compose up -d
```

### Thời gian lưu dữ liệu

App chỉ giữ công việc của **24 tháng gần nhất** (đổi bằng `RETENTION_MONTHS`, `0` = không dọn). Mỗi ngày máy chủ tự dọn:

- Xóa công việc cũ hơn mốc (theo Ngày hoàn thành; chưa có thì theo ngày kết thúc vòng lặp / ngày tạo) cùng lịch sử điểm của chúng, và vòng lặp đã kết thúc trước mốc không còn công việc.
- **Giữ lại** bản chốt điểm từng tháng (điểm chính thức), thông số tháng, dự án, người dùng.
- Trước khi xóa, dữ liệu được nén lưu ở `/data/archive/<ngày>-truoc-<mốc>.json.gz` — sao lưu thư mục `/data` là có luôn file lưu trữ.

## 7. Cập nhật phiên bản

```bash
git pull
docker compose up -d --build     # dữ liệu trong volume được giữ nguyên
```

⚠️ **Không** chạy `docker compose down -v`: lệnh này xóa luôn volume dữ liệu.

## 8. Phát triển trên máy

```bash
# Terminal 1 — máy chủ (DEV_LOGIN=1: đăng nhập thử bằng email, không cần Google)
cd chamdiem-app/server && npm install
cd .. && ADMIN_EMAILS=admin@gmail.com npm run server      # http://localhost:8080

# Terminal 2 — giao diện (Vite, chuyển /api sang cổng 8080)
cd chamdiem-app && npm run dev:api                        # http://localhost:3010
```

Chỉ chạy `npm run dev` mà không bật máy chủ → app vào **chế độ demo** (dữ liệu lưu trong trình duyệt, có ô "Đăng nhập với").
`DEV_LOGIN` tự tắt khi `NODE_ENV=production` (image Docker luôn là production).

## Phân quyền

**Vai trò trong từng dự án** — đặt khi thêm / sửa dự án (cột vai trò cạnh mỗi thành viên):

| Vai trò dự án | Quyền |
|---|---|
| Quản trị | Xem và sửa mọi công việc trong dự án; tạo vòng lặp, giao việc, nhập Excel; sửa thông tin và thành viên dự án |
| Thành viên | Xem công việc của mọi người; chỉ cập nhật công việc của mình (PD: nhóm thiết kế · BA: nghiệp vụ + đánh giá) |
| Hạn chế | Chỉ xem, không cập nhật được gì |

Mặc định khi thêm người: PO → Quản trị, BA / PD → Thành viên. PO tạo dự án tự động là Quản trị của dự án đó.

**Vai trò hệ thống:**

| Vai trò | Quyền |
|---|---|
| Quản trị (hệ thống) | Toàn quyền: người dùng, mọi dự án, hệ số, ngày nghỉ lễ; chốt / mở chốt điểm mọi PD |
| PO | Tạo dự án mới |
| Quản lý trực tiếp (bất kỳ ai) | Xem công việc, điểm của người mình quản lý (ở mọi dự án); nhập ngày làm thực tế / effort / điểm kỳ vọng; **chốt / mở chốt điểm tháng** của PD mình quản lý |

**Gán quản lý:** màn Người dùng → mở người dùng → mục **Quản lý trực tiếp** → **Thêm quản lý** (chọn từ danh sách người dùng, được nhiều người).
**Dự án phụ trách:** trong mục **Dự án được tham gia**, tick **Dự án phụ trách** cạnh dự án (1 người phụ trách được nhiều dự án).

**Phạm vi xem:** mỗi người chỉ thấy công việc, điểm và thành viên của các dự án mình tham gia, công việc của chính mình,
và công việc của người mình quản lý trực tiếp. Điểm kỳ vọng / tỷ lệ đạt / thông số tháng của PD chỉ hiện với chính PD đó, quản lý trực tiếp của họ và Quản trị.

**Chốt điểm theo từng PD:** menu **Chốt điểm** (hiện với người đang quản lý trực tiếp PD và Quản trị) — mỗi tháng 1 tab; tick người cần chốt → **Chốt điểm** → điền số ngày nghỉ lễ, ngày làm thực tế, effort, điểm kỳ vọng level. Máy chủ tự chụp bảng điểm lúc chốt;
công việc của PD đó có Ngày hoàn thành trong tháng bị khóa cho tới khi mở chốt. BA không tính điểm.

Mọi quyền được kiểm tra ở máy chủ. Gọi thẳng API mà không đủ quyền sẽ bị từ chối (403), và máy chủ chỉ trả về dữ liệu trong phạm vi được xem.
