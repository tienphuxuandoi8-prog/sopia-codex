# HƯỚNG DẪN DEPLOY SOPHIA CODEX LÊN VERCEL (BƯỚC 7)

Dự án **Sophia Codex** đã được cấu hình sẵn sàng 100% cho Vercel với:
- `package.json` (Node.js engine >= 22/24)
- `vercel.json` (Cấu hình điều hướng Static Frontend & Serverless REST API)
- `api/index.js` (Serverless Function Handler)

---

## CÁCH 1: DEPLOY QUA VERCEL CLI (NHANH NHẤT - 1 PHÚT)

1. Mở terminal tại thư mục `Web  v1`:
   ```bash
   cd "Web  v1"
   ```
2. Cài đặt Vercel CLI (nếu chưa có):
   ```bash
   npm install -g vercel
   ```
3. Đăng nhập và đẩy dự án lên:
   ```bash
   vercel login
   vercel --prod
   ```
4. Vercel sẽ tự động build và trả về đường link công khai:
   👉 `https://sophia-codex.vercel.app`

---

## CÁCH 2: DEPLOY QUA GITHUB (TỰ ĐỘNG CẬP NHẬT MỖI KHI ĐỔI CODE)

1. Khởi tạo Git và đẩy mã nguồn lên GitHub repository của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: Sophia Codex Fullstack with SQLite & Admin Studio"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/sophia-codex.git
   git push -u origin main
   ```
2. Truy cập [https://vercel.com](https://vercel.com) -> Đăng nhập.
3. Bấm **"Add New..."** -> **"Project"** -> Chọn repository `sophia-codex`.
4. Bấm **"Deploy"**. Vercel sẽ tự động hoàn tất trong 30 giây!
