# Figma Quick Login — Chrome Extension

Thay thế thao tác "copy cookie rồi dán vào Cookie Editor" bằng 1 cú bấm. Popup liệt kê 4 tài
khoản Figma dùng chung (`designer`, `figmadev`, `figmadev_dn`, `figmadev_hcsn`), bấm vào tài
khoản nào thì extension tự lấy cookie mới nhất của tài khoản đó và nạp thẳng vào Chrome bằng
`chrome.cookies.set`.

Kiến trúc:

```
playwright-figma-login  →  cookies.enc (file mã hóa AES-256-CBC, commit đè lên GitHub
                            repo vietdv88/Figma mỗi lần chạy)
                                   │  GET raw.githubusercontent.com (public, không cần token)
                                   ▼
                    Extension (popup.js) giải mã bằng WebCrypto  →  chrome.cookies.set(...)
```

Không còn Google Doc / Apps Script / API_TOKEN — extension chỉ cần fetch trực tiếp file
`cookies.enc` (public) từ GitHub rồi tự giải mã bằng passphrase đã có sẵn trong `popup.js`
(cùng passphrase với `config.enc` bên `playwright-figma-login`).

## 1. Cài extension (Developer mode / unpacked)

1. Gửi cả thư mục `figma-quick-login-extension` cho người dùng (không cần chỉnh sửa gì trước).
2. Người dùng mở Chrome, vào `chrome://extensions`.
3. Bật **Developer mode** (góc trên bên phải).
4. Bấm **Load unpacked**, chọn thư mục `figma-quick-login-extension` (thư mục chứa
   `manifest.json`).
5. Extension xuất hiện trên thanh công cụ — ghim lại (pin) cho dễ bấm.

> Đây là cách nhanh nhất, không cần đưa lên Chrome Web Store. Nhược điểm: mỗi lần Chrome tự
> update lớn có thể nhắc "extension chạy ở developer mode", không ảnh hưởng hoạt động, chỉ là
> cảnh báo.

## 2. Dùng

1. Bấm icon extension.
2. Bấm vào tên tài khoản muốn dùng (`designer` / `figmadev` / `figmadev_dn` /
   `figmadev_hcsn`).
3. Extension xoá cookie Figma cũ trong trình duyệt, nạp cookie mới của tài khoản đã chọn.
4. Mở tab `https://www.figma.com` — đã ở trạng thái đăng nhập, không cần thao tác gì thêm.

Nút **Tải lại** ở góc trên xoá cache (mặc định cache 15 phút) và tải lại `cookies.enc` mới
nhất — dùng khi vừa chạy lại `playwright-figma-login` và muốn lấy cookie mới ngay.

## Lưu ý bảo mật

- Cookie là session thật của tài khoản Figma dùng chung trong công ty — chỉ nên gửi thư mục
  extension này cho máy/nhân viên được phép dùng các tài khoản đó.
- `cookies.enc` nằm trên repo GitHub **public** (`vietdv88/Figma`) nhưng đã được mã hóa
  AES-256-CBC trước khi commit — không phải JSON cookie thô.
- Passphrase giải mã nằm cứng trong `popup.js` (và trong `github-store.ts` bên
  `playwright-figma-login`) — ai đọc được source (kể cả từ repo public) đều giải mã được, nên
  đây chỉ là lớp che tối thiểu (obfuscation), không phải mã hóa chống lại người có quyền đọc
  source. Lớp bảo vệ thật sự là: chỉ phát tán extension + không để lộ repo source ra ngoài phạm
  vi cần thiết.
- Muốn thu hồi cookie đang lưu: chạy lại `playwright-figma-login` để ghi đè `cookies.enc` bằng
  session mới (session cũ vẫn còn hiệu lực cho tới khi Figma tự hết hạn hoặc bị đăng xuất chủ
  động), hoặc đổi mật khẩu/2FA của tài khoản Figma tương ứng.
