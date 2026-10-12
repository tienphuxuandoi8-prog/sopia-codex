# HƯỚNG DẪN DEPLOY SOPHIA CODEX LÊN VERCEL

Dự án **Sophia Codex** đã được tối ưu hóa toàn diện để xuất bản trực tiếp từ thư mục gốc lên Vercel:
- `package.json` (Node.js engine >= 22/24)
- `vercel.json` (Cấu hình tự động điều hướng Static Frontend & Serverless REST API)
- `api/index.js` (Serverless Function Handler)

---

## CÁCH 1: DEPLOY TỰ ĐỘNG QUA GITHUB (KHUYẾN NGHỊ)

1. Đẩy mã nguồn mới nhất lên GitHub:
   ```bash
   git add .
   git commit -m "feat: consolidate project to root and ensure 100% test pass"
   git push origin main
   ```
2. Nếu dự án đã liên kết với Vercel:
   Vercel sẽ tự động kích hoạt tiến trình Build & Deploy ngay khi nhận được commit mới!
3. Nếu liên kết mới lần đầu:
   - Truy cập [https://vercel.com](https://vercel.com) -> Đăng nhập.
   - Bấm **"Add New..."** -> **"Project"** -> Chọn repository `sopia-codex`.
   - Giữ nguyên thiết lập mặc định (Root Directory để trống hoặc `./`), bấm **"Deploy"**.

---

## CÁCH 2: DEPLOY QUA VERCEL CLI

1. Cài đặt và đăng nhập Vercel:
   ```bash
   npx vercel login
   ```
2. Triển khai bản Production:
   ```bash
   npx vercel --prod
   ```

---

## 🔑 QUẢN TRỊ VIÊN & ĐỘC GIẢ
- **Tài khoản Admin:** `admin@sophiacodex.vn` (Mật khẩu bí mật do Quản trị viên nắm giữ)
- **Độc giả:** Người dùng đăng ký tài khoản độc lập tại `/register.html`
- Đường dẫn Admin Studio: `https://<ten-mien-vercel>/admin.html` (Chỉ tài khoản Quản trị mới được phép truy cập)
