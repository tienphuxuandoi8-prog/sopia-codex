# Sophia Codex (Sopia Codex)

> **Thư Viện Triết Học Toàn Văn & Chiêm Nghiệm Thông Minh**

Dự án ứng dụng web triết học Sophia Codex tích hợp thư viện sách kinh điển, chiêm nghiệm Socrates AI, audio narration, hệ thống ghi chú và trang quản trị Admin Studio với cơ sở dữ liệu SQLite.

---

## 📁 Cấu Trúc Dự Án

```
├── Web  v1/                     # Mã nguồn chính của ứng dụng
│   ├── api/                     # Serverless Function API (Vercel)
│   ├── assets/                  # Ảnh bìa SVG, assets
│   ├── css/                     # Stylesheet & Tailwind CSS config
│   ├── data/                    # SQLite Database (sophia.db)
│   ├── js/                      # Frontend JavaScript logic
│   │   └── books-data/          # Dữ liệu nội dung các tác phẩm triết học
│   ├── scripts/                 # Build & test scripts
│   ├── server/                  # Backend HTTP & REST API server
│   ├── admin.html               # Giao diện Quản Trị Admin Studio
│   ├── DEPLOY.md                # Hướng dẫn deploy lên Vercel
│   ├── index.html               # Giao diện Độc Giả chính
│   ├── manifest.json            # PWA manifest
│   ├── package.json             # Cấu hình dự án & dependencies
│   ├── sw.js                    # Service Worker
│   └── vercel.json              # Cấu hình Vercel deployment
├── tham khảo/                   # Hình ảnh thiết kế & tài liệu tham khảo
└── README.md                    # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local)

1. **Di chuyển vào thư mục ứng dụng:**
   ```bash
   cd "Web  v1"
   ```

2. **Khởi động server:**
   ```bash
   npm start
   # hoặc: node server/index.js
   ```

3. **Mở trình duyệt:**
   - Độc giả: [http://localhost:3000](http://localhost:3000)
   - Admin Studio: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## ☁️ Hướng Dẫn Deploy Lên Vercel

1. Truy cập [https://vercel.com](https://vercel.com) và chọn **"Add New..."** -> **"Project"**.
2. Chọn repository **`tienphuxuandoi8-prog/sopia-codex`**.
3. **Quan trọng:** Tại mục **Root Directory**, bấm **Edit** và chọn thư mục `Web  v1`.
4. Bấm **Deploy**. Vercel sẽ tự động build và xuất bản trang web!

Chi tiết đầy đủ: xem tại [Web  v1/DEPLOY.md](Web%20%20v1/DEPLOY.md).

---

## 🔑 Tài Khoản Mặc Định
- **Quản Trị Viên (Admin Studio):** `admin@sophiacodex.vn` / `Admin@Sophia2026!`
- **Độc Giả Mẫu:** `docgia@sophiacodex.vn` / `Docgia@Sophia2026!`

---

## 📜 Giấy Phép
Dự án được phát hành theo giấy phép MIT.
