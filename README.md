# Sophia Codex (Sopia Codex)

> **Thư Viện Triết Học Toàn Văn & Chiêm Nghiệm Thông Minh**

Dự án ứng dụng web triết học Sophia Codex tích hợp thư viện sách kinh điển, chiêm nghiệm Socrates AI, audio narration, hệ thống ghi chú và trang quản trị Admin Studio với cơ sở dữ liệu SQLite / PostgreSQL. Toàn bộ dự án đã được tinh gọn và đồng bộ thống nhất tại thư mục gốc.

---

## 📁 Cấu Trúc Dự Án (Hợp Nhất)

```
├── api/                     # Serverless Function API (Vercel)
├── assets/                  # Ảnh bìa SVG & tài nguyên đồ họa
├── css/                     # Stylesheet & Tailwind CSS
├── data/                    # SQLite Database (sophia.db) & seeds
├── docs/                    # Tài liệu kiến trúc và hướng dẫn vận hành
├── js/                      # Frontend JavaScript logic (Admin, AI, Audio, Reader)
├── prisma/                  # Prisma ORM Schema & seed scripts
├── public/                  # Static assets & giao diện phát hành
├── scripts/                 # Test suites (E2E, Admin, Production) & build scripts
├── server/                  # SQLite database engine & REST API handlers
├── src/                     # Core backend Express server & middleware
├── tests/                   # Unit & Integration test suites (Vitest)
├── admin.html               # Giao diện Quản Trị Admin Studio
├── index.html               # Giao diện Độc Giả chính
├── Chay_Website.bat         # Script 1-click khởi chạy máy chủ trên Windows
├── DEPLOY.md                # Hướng dẫn chi tiết triển khai lên Vercel
├── package.json             # Cấu hình dự án & scripts kiểm thử
├── sw.js                    # Service Worker (PWA Offline)
├── manifest.json            # Web App Manifest
├── vercel.json              # Cấu hình xuất bản Vercel
├── tham khảo/               # Tư liệu tham khảo
└── README.md                # Tài liệu dự án
```

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local)

1. **Cách 1: Khởi chạy 1-Click (Windows):**
   Nhấp đúp chuột vào file `Chay_Website.bat`. Trình duyệt sẽ tự động mở trang web và khởi chạy server local.

2. **Cách 2: Khởi chạy qua dòng lệnh:**
   ```bash
   npm start
   # hoặc: node src/server.local.js
   ```

3. **Mở trình duyệt:**
   - Cổng Độc giả: [http://localhost:3000](http://localhost:3000)
   - Cổng Quản trị Admin: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🧪 Kiểm Thử Hệ Thống (Automated Test Suites)

Toàn bộ hệ thống được bảo đảm chất lượng với các bộ test tự động:
```bash
npm test                             # Unit & Integration tests (Vitest)
node scripts/test-e2e.js             # Kiểm thử End-to-End API & Độc Giả (33/33 PASS)
node scripts/test-admin-e2e.js       # Kiểm thử Quản Trị Admin Studio (62/62 PASS)
node scripts/test-production-ready.js # Kiểm thử bảo mật & chuẩn Production (29/29 PASS)
```

---

## ☁️ Triển Khai Lên Vercel

Dự án đã được cấu hình tối ưu ở thư mục gốc:
1. Đẩy mã nguồn lên GitHub repository.
2. Trên Vercel Dashboard, import repository **`tienphuxuandoi8-prog/sopia-codex`**.
3. Vercel tự động nhận diện `vercel.json` và build toàn bộ ứng dụng từ thư mục gốc.

---

## 🔑 Tài Khoản Mặc Định
- **Quản Trị Viên (Admin Studio):** `admin@sophiacodex.vn` / `Admin@Sophia2026!`
- **Độc Giả Mẫu:** `docgia@sophiacodex.vn` / `Docgia@Sophia2026!`

---

## 📜 Giấy Phép
Dự án được phát hành theo giấy phép MIT.
