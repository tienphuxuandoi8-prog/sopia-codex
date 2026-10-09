# RUNBOOK CẬP NHẬT VÀ VẬN HÀNH DỰ ÁN SOPHIA CODEX

Tài liệu này cung cấp các hướng dẫn chi tiết về vận hành, bảo trì và xử lý sự cố trong quá trình triển khai dự án Sophia Codex.

## 1. Thiết lập Cơ Sở Dữ Liệu Supabase
Để cài đặt và kết nối tới Supabase, thực hiện các bước sau:
- **Lấy Connection String**: Đăng nhập vào Supabase Dashboard, chọn dự án của bạn. Vào `Settings` -> `Database` và copy chuỗi kết nối PostgreSQL (URI).
- **Tắt Supabase Data API**: Để đảm bảo an toàn và chỉ cho phép ứng dụng Node.js gọi DB, vào `Settings` -> `API` và vô hiệu hóa "Data API" (PostgREST) nếu không sử dụng.
- **Cấu hình Direct URL**: Trong môi trường Vercel hoặc server, sử dụng `DIRECT_URL` để thiết lập cho Prisma (dùng cho migrations) và `DATABASE_URL` (dùng connection pooling) để ứng dụng hoạt động tối ưu.

## 2. Khởi tạo & Chạy Migration
Prisma được sử dụng để quản lý schema của CSDL.
- **Cập nhật Schema & Chạy Migration**:
  - Môi trường phát triển: Chạy `npx prisma migrate dev` để tạo file migration mới và áp dụng lên CSDL.
  - Môi trường Production: Chạy lệnh `npm run db:migrate` (được mapping tới `npx prisma migrate deploy` trong package.json) trong quá trình build/deploy.
- **Khởi tạo dữ liệu (Seeding)**:
  - Chạy `npm run db:seed` để tạo tài khoản Super Admin ban đầu và các dữ liệu danh mục cần thiết.

## 3. Chuyển đổi dữ liệu cũ (SQLite sang PostgreSQL)
Nếu hệ thống cũ dùng SQLite, quá trình chuyển đổi sẽ được thực hiện bằng script tự động:
- Đảm bảo file database SQLite cũ được đặt đúng đường dẫn.
- Chạy lệnh: `node scripts/migrate-sqlite-to-pg.js`
- Script này sẽ đọc và nạp toàn bộ dữ liệu sách, người dùng và các thông tin khác từ SQLite sang database Supabase/PostgreSQL.

## 4. Cấu hình Vercel
Các bước triển khai lên Vercel:
- **Biến môi trường**: Truy cập Vercel Dashboard của dự án, vào `Settings` -> `Environment Variables`. Thêm các biến bắt buộc:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `JWT_SECRET`
  - `SESSION_SECRET`
  - Các cấu hình cổng thanh toán...
- **Thiết lập Cron Job**: Tạo file `vercel.json` ở thư mục gốc và khai báo cron jobs nếu có (VD: Dọn dẹp session cũ, gửi email báo cáo...).

## 5. Kiểm thử Sandbox VNPay & MoMo
Khi tích hợp thanh toán, dùng môi trường Sandbox để kiểm thử:
- **VNPay Sandbox**:
  - Chọn ngân hàng: `NCB`
  - Số thẻ: `9704198526191432198`
  - Tên chủ thẻ: `NGUYEN VAN A`
  - Ngày phát hành: `07/15`
  - Mã OTP: `123456`
- **MoMo Sandbox**:
  - Dùng app MoMo test hoặc các thông tin thẻ test được cấp trên portal MoMo Developer.

## 6. Quy trình Sao lưu & Phục hồi khẩn cấp
- **Sao lưu (Backup)**:
  - Mở Terminal, sử dụng `pg_dump` để dump dữ liệu:
    ```bash
    pg_dump "postgres://[user]:[password]@[host]:[port]/[dbname]" > backup.sql
    ```
- **Phục hồi (Restore)**:
  - Trong trường hợp sự cố, import lại dữ liệu bằng `psql`:
    ```bash
    psql "postgres://[user]:[password]@[host]:[port]/[dbname]" < backup.sql
    ```
- *Lưu ý: Supabase Dashboard cũng hỗ trợ tính năng Point-in-Time Recovery (PITR) cho các gói trả phí.*
