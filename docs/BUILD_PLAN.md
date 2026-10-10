# 🏛️ SOPHIA CODEX — KẾ HOẠCH BUILD ỨNG DỤNG HOÀN CHỈNH (v1.0)

> Tài liệu này là "bản đồ" cho các phiên làm việc tiếp theo. Mỗi phiên, bạn chỉ cần nói: **"Làm Giai đoạn X theo BUILD_PLAN.md"**.
> Bản sao trong dự án: `docs/BUILD_PLAN.md`

---

## 0. Tóm tắt các quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Frontend | **Giữ HTML/JS thuần** (giao diện mockup hiện có), chuyển Tailwind CDN sang **Tailwind CLI build** |
| Backend | **Node.js 22 + Express**, kiến trúc phân lớp (routes → middleware → services → repository) |
| CSDL | **Supabase Postgres** + **Prisma ORM** (migration có version) |
| Lưu trữ file | **Supabase Storage** (ảnh bìa, avatar, ảnh triết gia) |
| Deploy | **Vercel** (frontend tĩnh + Express chạy dạng serverless function) |
| Đăng nhập | Email + mật khẩu, xác thực email, quên mật khẩu |
| Gửi email | **Resend** |
| Phân quyền | **RBAC động**: Super Admin tự tạo vai trò và tick từng quyền |
| Premium | Admin tự gắn nhãn **Free/Premium cho từng sách/chương**; gói **tháng + năm**, gia hạn thủ công |
| Thanh toán | **VNPay + MoMo** ngay từ đầu |
| AI Socrates | **Google Gemini API**, trả lời dựa trên nội dung chương đang đọc, giới hạn lượt/ngày |
| Sách nói | Giữ **giọng đọc trình duyệt** (Web Speech API) |
| Bình luận | Hiển thị ngay, lọc từ cấm, có nút báo cáo, admin ẩn/xóa |
| Tên miền | Tạm dùng `*.vercel.app` |

### Hiện trạng mockup (đã khảo sát)
- `Web  v1/server/index.js`: dùng `http` thuần, **không có xác thực**, mọi API ghi/xóa đều công khai, đặt CORS `*`.
- `Web  v1/server/db.js`: `node:sqlite` có 8 bảng (categories, philosophers, books, chapters, quotes, reading_logs, ai_conversations, system_settings).
- `admin.html` (142KB), `index.html` (57KB): có nhiều `onclick` viết inline, dùng Tailwind CDN, lucide qua unpkg.
- `js/ai-chat.js`: AI **chỉ là câu trả lời soạn sẵn** (dùng `setTimeout` + if/else).
- `js/books-data/*.js`: **toàn văn sách nằm ở thư mục public**, ai cũng tải được, nên sẽ phá vỡ mô hình Premium.
- SQLite **không lưu bền được trên Vercel** (filesystem chỉ đọc hoặc tạm thời).
- `data/sophia.db` có thể đã bị commit lên git (`.gitignore` chỉ loại trừ file WAL và thư mục backups).

---

## 1. Kiến trúc tổng thể

```mermaid
flowchart LR
  U["Trình duyệt (HTML/JS thuần)"] -->|"HTTPS + cookie phiên"| V["Vercel CDN (file tĩnh /public)"]
  U -->|"/api/*"| F["Vercel Function: Express app"]
  F --> P[("Supabase Postgres")]
  F --> S[("Supabase Storage")]
  F --> G["Gemini API"]
  F --> R["Resend (email)"]
  F <-->|"Tạo URL thanh toán / IPN"| VN["VNPay"]
  F <-->|"Tạo URL thanh toán / IPN"| MM["MoMo"]
  C["Vercel Cron (hằng ngày)"] --> F
```

### Nguyên tắc kiến trúc
1. **Server là nguồn sự thật duy nhất**: mọi kiểm tra quyền, Premium, quota AI đều làm ở server; frontend chỉ ẩn/hiện giao diện.
2. **Không tin dữ liệu từ client**: mọi input đi qua **Zod schema**, sau đó mới chạm tới DB.
3. **Escape khi hiển thị, không "sanitize" khi lưu**: bỏ hàm `sanitizeString` bằng regex hiện tại (vừa không an toàn, vừa làm hỏng dữ liệu). Thay bằng render bằng `textContent`, hoặc dùng **DOMPurify** khi buộc phải render HTML.
4. **Premium không phải là role**: Premium là *quyền lợi theo gói đăng ký* (subscription), tính bằng `expires_at > now()`. Role dùng cho *quản trị*. Tách bạch hai thứ này giúp không phải sửa role khi gói hết hạn.
5. **Backend tự xác thực, không dùng Supabase Auth**: để toàn quyền kiểm soát RBAC, phiên đăng nhập và email qua Resend. Backend kết nối Postgres bằng chuỗi kết nối server-side; **tắt Supabase Data API / bật RLS deny-all** để không ai truy cập DB qua anon key.

### Cấu trúc thư mục mục tiêu

```
sophia-codex/
├── api/
│   └── index.js                 # Entry cho Vercel: export Express app
├── src/
│   ├── app.js                   # Tạo Express app, gắn middleware + routes
│   ├── server.local.js          # Chạy local: app.listen(3000)
│   ├── config/
│   │   └── env.js               # Đọc & validate biến môi trường bằng Zod (thiếu thì crash sớm)
│   ├── lib/
│   │   ├── prisma.js            # Prisma client singleton
│   │   ├── crypto.js            # random token, sha256, hmac
│   │   ├── password.js          # argon2id hash/verify
│   │   ├── mailer.js            # Resend + template email
│   │   ├── storage.js           # Supabase Storage upload
│   │   ├── gemini.js            # Gemini client
│   │   └── logger.js            # pino logger (ẩn dữ liệu nhạy cảm)
│   ├── middleware/
│   │   ├── security.js          # helmet, CSP, CORS chặt
│   │   ├── session.js           # đọc cookie → req.user, req.session
│   │   ├── requireAuth.js       # bắt buộc đăng nhập (+ đã xác thực email)
│   │   ├── requirePermission.js # requirePermission('book.update')
│   │   ├── csrf.js              # kiểm tra Origin + header X-CSRF-Token
│   │   ├── rateLimit.js         # rate limit lưu trong Postgres
│   │   ├── validate.js          # validate(zodSchema) cho body/query/params
│   │   └── errorHandler.js      # chuẩn hóa lỗi, không lộ stack ở production
│   ├── modules/                 # Mỗi module gồm routes.js, service.js, schema.js
│   │   ├── auth/  users/  roles/  books/  chapters/  quotes/  philosophers/
│   │   ├── categories/  media/  reader/  community/  gamification/
│   │   ├── ai/  plans/  payments/  subscriptions/  settings/  audit/  cron/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.js                  # Seed quyền, vai trò hệ thống, Super Admin, gói
│   └── seed-data/               # Toàn văn sách (chuyển ra khỏi public)
├── public/                      # CHỈ chứa file công khai
│   ├── index.html  login.html  register.html  verify-email.html
│   ├── forgot-password.html  reset-password.html  account.html
│   ├── library.html  pricing.html  payment-result.html  404.html
│   ├── css/app.css              # Output của Tailwind build
│   ├── js/core/                 # api.js, auth.js, dom.js, toast.js
│   ├── js/pages/                # Logic riêng từng trang
│   ├── js/vendor/               # lucide, dompurify (tự host)
│   ├── assets/  manifest.json  sw.js
├── views/
│   └── admin.html               # KHÔNG public: chỉ trả về qua route /admin sau khi kiểm tra quyền
├── src/styles/tailwind.css      # Input Tailwind
├── scripts/
│   └── migrate-sqlite-to-pg.js  # Chuyển dữ liệu từ sophia.db cũ
├── tests/  (unit, integration, e2e)
├── docs/   BUILD_PLAN.md, API.md, SECURITY.md, RUNBOOK.md
├── .env.example  vercel.json  package.json  tailwind.config.js
```

### Thư viện chính

| Mục đích | Thư viện |
|---|---|
| Web framework | `express`, `helmet`, `cookie-parser`, `compression` |
| ORM | `prisma`, `@prisma/client` |
| Validate | `zod` |
| Hash mật khẩu | `@node-rs/argon2` (argon2id, có binary sẵn, chạy được trên Vercel) |
| Email | `resend` |
| Storage | `@supabase/supabase-js` (chỉ dùng ở server, với service key) |
| AI | `@google/genai` |
| Log | `pino` |
| Frontend | `tailwindcss` (CLI), `lucide` (tự host), `dompurify` |
| Test | `vitest`, `supertest`, `@playwright/test` |

---

## 2. Mô hình phân quyền (RBAC động)

### 2.1 Khái niệm
- **Permission** (quyền): mã cố định trong code, ví dụ `book.update`, được seed vào DB. Admin **không tạo được quyền mới** vì quyền phải gắn với code kiểm tra.
- **Role** (vai trò): Super Admin tạo, sửa, xóa tự do, rồi tick các permission cho role.
- **User ↔ Role**: quan hệ nhiều-nhiều, quyền thực tế của user = hợp các quyền từ mọi role.
- **Vai trò hệ thống** (`is_system = true`, không xóa được):
  - `super_admin`: luôn có **mọi quyền** (kiểm tra bằng code, không cần tick), không sửa được.
  - `member`: vai trò mặc định khi đăng ký (không có quyền quản trị).
- **Vai trò mẫu** (seed sẵn, sửa được): `editor` (biên tập nội dung), `moderator` (kiểm duyệt cộng đồng), `support` (xem người dùng, đơn hàng).

### 2.2 Danh mục quyền (seed)

| Nhóm | Mã quyền |
|---|---|
| Tổng quan | `dashboard.view` |
| Sách | `book.view_all` (xem cả bản nháp), `book.create`, `book.update`, `book.delete`, `book.publish` |
| Chương | `chapter.create`, `chapter.update`, `chapter.delete`, `chapter.publish` |
| Nội dung khác | `quote.manage`, `philosopher.manage`, `category.manage`, `media.upload` |
| Cộng đồng | `comment.moderate`, `review.moderate`, `banned_word.manage` |
| Người dùng | `user.view`, `user.update`, `user.ban`, `user.delete`, `user.assign_role` |
| Vai trò | `role.view`, `role.manage` |
| Kinh doanh | `plan.manage`, `order.view`, `subscription.grant`, `payment.reconcile` |
| AI | `ai.view_logs`, `ai.settings` |
| Hệ thống | `settings.manage`, `audit.view`, `system.backup` |

### 2.3 Quy tắc chống leo thang đặc quyền (bắt buộc)
- User **không được gán cho người khác** quyền/vai trò mà chính mình không có.
- Chỉ `super_admin` mới gán được vai trò `super_admin`.
- Không được tự xóa hoặc hạ quyền **Super Admin cuối cùng**.
- Mọi thay đổi role/permission đều **ghi audit log** và **thu hồi cache quyền** của các user bị ảnh hưởng.
- Đổi role sẽ có hiệu lực ngay ở request kế tiếp (quyền được load theo session, không nhúng cứng trong token).

### 2.4 Trạng thái tài khoản
`pending` (chưa xác thực email) → `active` → `muted` (không được bình luận hay đánh giá) → `banned` (bị chặn đăng nhập, mọi phiên bị thu hồi). Thêm `deleted_at` để xóa mềm.

### 2.5 Phân lớp truy cập nội dung

| Đối tượng | Sách/chương Free | Sách/chương Premium | AI Socrates | Tính năng cá nhân |
|---|---|---|---|---|
| Khách | Đọc đầy đủ | Chỉ xem trước N đoạn | ❌ (mời đăng nhập) | ❌ |
| Member (chưa Premium) | Đọc đầy đủ | Chỉ xem trước N đoạn + nút nâng cấp | `ai.quota.member`/ngày (ví dụ 10) | ✅ |
| Premium | Đọc đầy đủ | Đọc đầy đủ | `ai.quota.premium`/ngày (ví dụ 100) | ✅ |
| Có quyền `book.view_all` | Đọc tất cả, kể cả bản nháp | | | |

> Quy tắc kế thừa: `chapters.access_level` nhận `inherit | free | premium`. Giá trị `inherit` lấy theo sách. Server cắt nội dung **trước khi trả về**, nên nội dung Premium không bao giờ rời server khi người đọc không đủ quyền.

---

## 3. Lược đồ cơ sở dữ liệu (Postgres)

```mermaid
erDiagram
  users ||--o{ sessions : has
  users ||--o{ email_tokens : has
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : assigned
  roles ||--o{ role_permissions : grants
  permissions ||--o{ role_permissions : in
  users ||--o{ audit_logs : acts
  categories ||--o{ books : groups
  books ||--o{ chapters : contains
  books ||--o{ quotes : cites
  philosophers ||--o{ books : writes
  users ||--o{ reading_progress : tracks
  users ||--o{ reading_days : logs
  users ||--o{ bookshelf_items : saves
  users ||--o{ highlights : marks
  chapters ||--o{ highlights : on
  users ||--o{ reviews : writes
  books ||--o{ reviews : receives
  users ||--o{ comments : writes
  comments ||--o{ comment_reports : reported
  users ||--o{ user_badges : earns
  badges ||--o{ user_badges : awarded
  users ||--o{ xp_events : gains
  users ||--o{ ai_threads : owns
  ai_threads ||--o{ ai_messages : contains
  users ||--o{ ai_usage_daily : consumes
  plans ||--o{ orders : for
  users ||--o{ orders : places
  orders ||--o{ payment_transactions : logs
  orders ||--o| subscriptions : creates
  users ||--o{ subscriptions : holds
```

### 3.1 Chi tiết bảng

**Xác thực và phân quyền**

| Bảng | Cột chính |
|---|---|
| `users` | `id uuid PK`, `email citext UNIQUE`, `password_hash`, `display_name`, `avatar_url`, `bio`, `status`, `email_verified_at`, `xp int`, `level int`, `current_streak`, `longest_streak`, `last_read_date date`, `failed_login_count`, `locked_until`, `last_login_at`, `created_at`, `updated_at`, `deleted_at` |
| `sessions` | `id uuid`, `user_id`, `token_hash UNIQUE` (SHA-256), `ip`, `user_agent`, `created_at`, `last_seen_at`, `expires_at`, `revoked_at` |
| `email_tokens` | `id`, `user_id`, `type (verify/reset)`, `token_hash UNIQUE`, `expires_at`, `used_at`, `created_at` |
| `roles` | `id`, `key UNIQUE`, `name`, `description`, `is_system bool`, `created_at` |
| `permissions` | `id`, `key UNIQUE`, `group`, `description` |
| `role_permissions` | `role_id`, `permission_id` (PK kép) |
| `user_roles` | `user_id`, `role_id`, `assigned_by`, `assigned_at` (PK kép) |
| `audit_logs` | `id bigserial`, `actor_id`, `action`, `entity_type`, `entity_id`, `before jsonb`, `after jsonb`, `ip`, `user_agent`, `created_at` |
| `rate_limits` | `key text PK`, `window_start timestamptz`, `count int` |

**Nội dung** (chuyển từ SQLite và bổ sung cột)

| Bảng | Bổ sung so với hiện tại |
|---|---|
| `categories` | giữ nguyên, bỏ cột `count` (tính động) |
| `philosophers` | `slug`, `avatar_url` (Storage), `created_by`, `updated_at` |
| `books` | `slug UNIQUE`, `philosopher_id`, `access_level (free/premium)`, `status (draft/published/archived)`, `preview_paragraphs int DEFAULT 3`, `rating_avg`, `rating_count`, `created_by`, `updated_by`, `published_at`, chuyển các cột `*_json` sang `jsonb` |
| `chapters` | `access_level (inherit/free/premium)`, `content jsonb` (mảng đoạn văn), `takeaways jsonb`, `status`, `updated_at`, `UNIQUE(book_id, chapter_index)` |
| `quotes` | giữ nguyên + `created_by` |
| `system_settings` | `value jsonb` (quota AI, số đoạn xem trước mặc định, ngưỡng XP...) |

**Cá nhân hóa và cộng đồng**

| Bảng | Cột chính |
|---|---|
| `reading_progress` | PK(`user_id`,`book_id`), `chapter_id`, `paragraph_index`, `progress_pct`, `updated_at` (đồng bộ đa thiết bị theo cơ chế "cái mới nhất thắng") |
| `reading_days` | PK(`user_id`,`date`), `seconds_read` (dùng tính streak) |
| `reading_sessions` | thay `reading_logs`: `user_id NULL`, `book_id`, `chapter_id`, `duration_seconds`, `scroll_depth`, `device`, `created_at` (phục vụ thống kê) |
| `bookshelf_items` | PK(`user_id`,`book_id`), `shelf (want/reading/finished)`, `is_favorite`, `added_at`, `finished_at` |
| `highlights` | `id`, `user_id`, `chapter_id`, `paragraph_index`, `start_offset`, `end_offset`, `quote_text`, `color`, `note`, `is_private DEFAULT true`, `created_at`, `updated_at` |
| `reviews` | `id`, `user_id`, `book_id`, `rating 1–5`, `content`, `status (visible/hidden)`, `UNIQUE(user_id, book_id)` |
| `comments` | `id`, `user_id`, `book_id`, `chapter_id NULL`, `parent_id NULL` (trả lời 1 cấp), `content`, `status (visible/hidden/deleted)`, `report_count`, `created_at`, `edited_at` |
| `comment_reports` | `id`, `comment_id`, `reporter_id`, `reason`, `created_at`, `resolved_by`, `resolved_at`, `UNIQUE(comment_id, reporter_id)` |
| `banned_words` | `id`, `word UNIQUE`, `created_by` |
| `badges` | `id`, `key`, `name`, `description`, `icon`, `rule jsonb` |
| `user_badges` | PK(`user_id`,`badge_id`), `earned_at` |
| `xp_events` | `id`, `user_id`, `type`, `amount`, `ref_key UNIQUE` (chống cộng XP trùng), `created_at` |

**AI**

| Bảng | Cột chính |
|---|---|
| `ai_threads` | `id`, `user_id`, `book_id`, `chapter_id`, `title`, `created_at`, `updated_at` |
| `ai_messages` | `id`, `thread_id`, `role (user/model)`, `content`, `tokens_in`, `tokens_out`, `created_at` |
| `ai_usage_daily` | PK(`user_id`,`date`), `count` |

**Kinh doanh**

| Bảng | Cột chính |
|---|---|
| `plans` | `id`, `code (monthly/yearly)`, `name`, `duration_days (30/365)`, `price_vnd int`, `is_active`, `features jsonb` |
| `orders` | `id`, `code UNIQUE` (mã giao dịch gửi cổng thanh toán), `user_id`, `plan_id`, `amount_vnd`, `provider (vnpay/momo/manual)`, `status (pending/paid/failed/cancelled/expired)`, `created_at`, `paid_at`, `expires_at` (đơn pending quá 15 phút thì hủy) |
| `payment_transactions` | `id`, `order_id`, `provider`, `provider_txn_id`, `event (create/return/ipn/query)`, `payload jsonb`, `signature_valid`, `result_code`, `created_at` |
| `subscriptions` | `id`, `user_id`, `plan_id`, `order_id NULL`, `starts_at`, `expires_at`, `source (payment/manual)`, `granted_by NULL`, `created_at` |

> **Quy tắc gia hạn**: khi mua thêm, `starts_at = max(now, expires_at của gói hiện tại)`, `expires_at = starts_at + duration_days`. Như vậy người dùng không mất số ngày còn lại.

---

## 4. Thiết kế xác thực và bảo mật phiên

### 4.1 Luồng chính
| Luồng | Chi tiết |
|---|---|
| **Đăng ký** | Validate email và mật khẩu (≥ 10 ký tự, không nằm trong danh sách mật khẩu phổ biến), hash bằng argon2id, tạo user `pending` + role `member`, gửi email xác thực (token 32 byte, lưu SHA-256, hết hạn sau 24h, dùng 1 lần). Luôn trả **cùng một thông báo** dù email đã tồn tại (chống dò tài khoản). |
| **Xác thực email** | `GET /verify-email.html?token=...` → gọi `POST /api/auth/verify-email` → `status = active`. Có nút "gửi lại" (rate limit 3 lần/giờ). |
| **Đăng nhập** | Rate limit theo IP + email. Sai 5 lần thì khóa tăng dần (1 → 5 → 15 phút). Khi thành công: tạo session mới (xoay vòng ID), set cookie. User `pending` vẫn đăng nhập được nhưng bị giới hạn tính năng và thấy banner yêu cầu xác thực. |
| **Quên mật khẩu** | Luôn trả "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn". Token hết hạn sau 30 phút, dùng 1 lần. |
| **Đặt lại / đổi mật khẩu** | Thu hồi **tất cả** phiên khác, gửi email thông báo. Đổi mật khẩu yêu cầu nhập mật khẩu cũ. |
| **Đăng xuất** | Thu hồi session hiện tại. Có thêm "Đăng xuất mọi thiết bị". |
| **Quản lý phiên** | Trang tài khoản liệt kê thiết bị/IP/lần cuối hoạt động, cho thu hồi từng phiên. |

### 4.2 Cookie và session
- Cookie: `__Host-sid`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Trên localhost dùng tên `sid` (không có Secure).
- Token phiên ngẫu nhiên 32 byte. DB **chỉ lưu SHA-256 của token** nên lộ DB cũng không chiếm được phiên.
- Thời hạn: độc giả 30 ngày (trượt); tài khoản có quyền quản trị: **12 giờ** + yêu cầu nhập lại mật khẩu cho thao tác nhạy cảm (đổi role, xóa user, cấp gói thủ công).
- `last_seen_at` chỉ cập nhật tối đa 5 phút/lần để giảm ghi DB.

### 4.3 CSRF
- Nhờ `SameSite=Lax`, cookie không được gửi trong POST cross-site.
- Kiểm tra thêm **Origin/Referer** cho mọi request không phải GET.
- **Double-submit token**: cookie `csrf` (không HttpOnly) + header `X-CSRF-Token`, được `js/core/api.js` gắn tự động.
- Các endpoint IPN của VNPay/MoMo được miễn CSRF, thay bằng **xác minh chữ ký HMAC**.

---

## 5. Danh mục API

> Quy ước: tiền tố `/api/v1`. Lỗi trả về `{ error: { code, message, details? } }`. Danh sách dùng phân trang `?page=&limit=` (limit ≤ 100). 🔓 công khai · 🔑 cần đăng nhập · 🛡️ cần quyền (ghi trong ngoặc).

### Auth `/api/v1/auth`
| Method | Path | Ghi chú |
|---|---|---|
| POST | `/register` | 🔓 rate limit |
| POST | `/verify-email` | 🔓 |
| POST | `/resend-verification` | 🔑 |
| POST | `/login` | 🔓 rate limit |
| POST | `/logout` | 🔑 |
| POST | `/logout-all` | 🔑 |
| POST | `/forgot-password` | 🔓 rate limit |
| POST | `/reset-password` | 🔓 |
| GET | `/me` | 🔓 trả `user`, `permissions[]`, `isPremium`, `premiumUntil`, `aiQuota` (khách thì `null`) |
| GET | `/csrf` | 🔓 cấp CSRF token |

### Tài khoản `/api/v1/account` 🔑
`GET/PATCH /profile` · `POST /avatar` · `POST /change-password` · `GET /sessions` · `DELETE /sessions/:id` · `GET /subscription` · `GET /orders` · `GET /badges` · `DELETE /` (xóa tài khoản, yêu cầu nhập mật khẩu)

### Nội dung công khai 🔓
`GET /books` (lọc theo category, search, access) · `GET /books/:slug` · `GET /books/:slug/chapters` (mục lục, có cờ `locked`) · `GET /chapters/:id` (**cắt nội dung theo quyền**) · `GET /quotes`, `GET /quotes/daily` · `GET /philosophers`, `/philosophers/:slug` · `GET /categories` · `GET /books/:slug/reviews` · `GET /books/:slug/comments`, `/chapters/:id/comments` · `POST /quotes/:id/share`

### Độc giả 🔑
| Path | Chức năng |
|---|---|
| `GET/PUT /me/progress/:bookId`, `GET /me/progress` | Đồng bộ tiến độ |
| `POST /me/reading-sessions` | Ghi nhận thời gian đọc → cập nhật streak, XP, huy hiệu |
| `GET/PUT/DELETE /me/bookshelf/:bookId` | Tủ sách, yêu thích |
| `GET /me/highlights?chapterId=`, `POST`, `PATCH /:id`, `DELETE /:id` | Highlight và ghi chú |
| `POST/PATCH/DELETE /books/:slug/reviews` | Đánh giá (mỗi người 1 bài) |
| `POST /comments`, `PATCH /comments/:id`, `DELETE /comments/:id`, `POST /comments/:id/report` | Bình luận |
| `GET /me/stats` | Streak, XP, level, số sách đã đọc |

### AI `/api/v1/ai` 🔑
`GET /threads` · `POST /threads` · `GET /threads/:id` · `DELETE /threads/:id` · `POST /threads/:id/messages` (**trả về dạng stream SSE**) · `GET /quota`

### Thanh toán
| Method | Path | Ghi chú |
|---|---|---|
| GET | `/plans` | 🔓 |
| POST | `/checkout` | 🔑 `{planCode, provider}` → `{payUrl}` |
| GET | `/payments/vnpay/return` | 🔓 chỉ để hiển thị, sau đó redirect sang `payment-result.html` |
| GET | `/payments/vnpay/ipn` | 🔓 xác minh chữ ký, là **nguồn sự thật** |
| GET | `/payments/momo/return` | 🔓 |
| POST | `/payments/momo/ipn` | 🔓 xác minh chữ ký |
| GET | `/orders/:code/status` | 🔑 trang kết quả gọi định kỳ để kiểm tra |

### Quản trị `/api/v1/admin` 🛡️
| Path | Quyền |
|---|---|
| `GET /dashboard` | `dashboard.view` |
| `CRUD /books`, `POST /books/:id/publish` | `book.*` |
| `CRUD /chapters`, `POST /books/:id/smart-ingest` | `chapter.*` |
| `CRUD /quotes`, `PUT /quotes/:id/daily` | `quote.manage` |
| `CRUD /philosophers` · `CRUD /categories` | `philosopher.manage` · `category.manage` |
| `POST /media` (upload ảnh) | `media.upload` |
| `GET /users`, `GET /users/:id` | `user.view` |
| `PATCH /users/:id` (tên, trạng thái, xác thực thủ công) | `user.update` / `user.ban` |
| `PUT /users/:id/roles` | `user.assign_role` |
| `POST /users/:id/revoke-sessions` · `DELETE /users/:id` | `user.ban` · `user.delete` |
| `GET /permissions` · `CRUD /roles` · `PUT /roles/:id/permissions` | `role.view` / `role.manage` |
| `GET /comments?status=&reported=`, `PATCH /comments/:id` (ẩn/hiện), `GET /reports` | `comment.moderate` |
| `PATCH /reviews/:id` | `review.moderate` |
| `CRUD /banned-words` | `banned_word.manage` |
| `CRUD /plans` | `plan.manage` |
| `GET /orders`, `GET /orders/:id` (kèm log giao dịch) | `order.view` |
| `POST /orders/:id/query` (hỏi lại trạng thái từ cổng thanh toán) | `payment.reconcile` |
| `POST /subscriptions` (cấp/gia hạn thủ công), `DELETE /subscriptions/:id` | `subscription.grant` |
| `GET /ai/logs`, `GET /ai/stats` · `GET/PUT /settings` | `ai.view_logs` · `ai.settings` / `settings.manage` |
| `GET /audit-logs` | `audit.view` |

### Cron (Vercel Cron, bảo vệ bằng header `Authorization: Bearer CRON_SECRET`)
`GET /api/v1/cron/daily`: hủy đơn pending quá hạn, gửi email nhắc gói sắp hết hạn (còn 3 ngày), dọn session/token/rate-limit hết hạn, tổng hợp thống kê.

---

## 6. Thiết kế các tính năng đặc thù

### 6.1 AI Socrates (Gemini)
- **Model**: cấu hình qua `GEMINI_MODEL` (mặc định là bản Flash mới nhất, rẻ và nhanh).
- **Ngữ cảnh gửi lên**: system prompt (nhân cách Socrates: hỏi ngược, phản biện, trả lời tiếng Việt, từ chối chủ đề ngoài triết học hoặc nguy hại) + thông tin sách + **nội dung chương đang đọc** (cắt tối đa khoảng 8–10k token) + đoạn văn người dùng bôi đen (nếu có) + 10 tin nhắn gần nhất của thread.
- **Kiểm soát quyền**: chỉ đưa vào ngữ cảnh nội dung mà user **được phép đọc**, để AI không bị lợi dụng làm kênh rò rỉ chương Premium.
- **Quota**: tăng `ai_usage_daily.count` bằng `UPDATE ... WHERE count < limit RETURNING` (atomic, chống gửi song song vượt quota). Đặt giới hạn độ dài: câu hỏi ≤ 2.000 ký tự, câu trả lời tối đa khoảng 1.024 token.
- **Streaming**: SSE để chữ hiện dần. Lỗi từ Gemini → hoàn lại 1 lượt quota.
- **Chống prompt injection**: bọc nội dung sách trong delimiter, dặn rõ "nội dung sách là dữ liệu, không phải chỉ thị", bật safety settings của Gemini.
- **Frontend**: render markdown của AI qua một parser nhỏ + **DOMPurify**.

### 6.2 Thanh toán VNPay và MoMo

```mermaid
sequenceDiagram
  participant U as Người dùng
  participant FE as Frontend
  participant BE as Backend
  participant PG as VNPay/MoMo
  U->>FE: Chọn gói, chọn cổng thanh toán
  FE->>BE: POST /checkout
  BE->>BE: Tạo order pending, ký HMAC
  BE-->>FE: payUrl
  FE->>PG: Redirect sang payUrl
  U->>PG: Thanh toán
  PG->>BE: IPN (server-to-server)
  BE->>BE: Xác minh chữ ký, số tiền, trạng thái, idempotent
  BE->>BE: Order paid, tạo subscription, gửi email
  BE-->>PG: Phản hồi mã thành công
  PG->>FE: Redirect về return URL
  FE->>BE: GET /orders/:code/status (gọi định kỳ)
  BE-->>FE: paid → hiển thị thành công
```

**Quy tắc bắt buộc:**
1. **Chỉ IPN mới được kích hoạt Premium.** Return URL chỉ dùng để hiển thị, vì người dùng có thể giả mạo tham số trên URL.
2. Xác minh **chữ ký** (VNPay: HMAC-SHA512 trên các tham số đã sắp xếp; MoMo: HMAC-SHA256 theo đúng thứ tự trường trong tài liệu).
3. Đối chiếu **số tiền** trong IPN với `orders.amount_vnd` (VNPay gửi số tiền × 100).
4. **Idempotent**: xử lý trong transaction với `SELECT ... FOR UPDATE`. Nếu order đã `paid` thì trả "đã xác nhận" và không cộng ngày lần nữa.
5. Lưu **toàn bộ payload** vào `payment_transactions` để đối soát.
6. Admin có nút **"Hỏi lại trạng thái"** (VNPay `querydr`, MoMo `query`) cho trường hợp IPN không tới.
7. Dev local: IPN cần URL công khai → dùng **Vercel Preview deployment** hoặc `cloudflared tunnel`.

### 6.3 Gamification
- **Streak**: một ngày được tính là "đã đọc" khi `reading_days.seconds_read ≥ 120`. Tính theo **múi giờ Asia/Ho_Chi_Minh**. Đứt chuỗi khi bỏ lỡ 1 ngày.
- **XP**: hoàn thành chương +20, đọc đủ 1 ngày +10, streak mỗi mốc 7 ngày +50, đánh giá sách +15, highlight đầu tiên của chương +2. Mỗi sự kiện có `ref_key` duy nhất để chống cộng trùng (ví dụ `chapter_done:{userId}:{chapterId}`).
- **Level**: ngưỡng XP lưu trong `system_settings` (ví dụ: Sơ Học → Tầm Đạo → Chiêm Nghiệm → Minh Triết → Hiền Giả).
- **Huy hiệu** (seed khoảng 10 cái): "Bình Minh Khắc Kỷ" (đọc xong Suy Tưởng), "Lửa Bền 7 Ngày", "Lửa Bền 30 Ngày", "Người Hỏi Socrates" (50 câu hỏi AI), "Bút Phê Bình" (5 đánh giá)... Luật được kiểm tra trong service sau mỗi sự kiện liên quan.

### 6.4 Bình luận và kiểm duyệt
- Lọc từ cấm: chuẩn hóa văn bản (thường hóa, bỏ dấu, gộp ký tự lặp) rồi so với `banned_words` → **chặn kèm thông báo** (không tự sửa nội dung).
- Rate limit: 5 bình luận/phút/user. User `muted` không được bình luận.
- Khi `report_count ≥ 3`, bình luận **tự ẩn tạm** chờ admin xem xét.
- Hiển thị bằng `textContent` (không có HTML), tối đa 2.000 ký tự, cho sửa trong 15 phút.

### 6.5 Highlight trên văn bản
- Lưu theo `paragraph_index` + offset ký tự trong đoạn (đoạn văn là đơn vị ổn định vì `content` là mảng đoạn).
- Nếu admin sửa chương làm lệch offset → dùng `quote_text` để tìm lại vị trí. Không tìm thấy thì đánh dấu "mồ côi" và vẫn hiển thị trong trang Thư viện.
- Người dùng không được highlight trên đoạn Premium mà mình không có quyền đọc (server kiểm tra).

---

## 7. Checklist bảo mật (đối chiếu OWASP Top 10)

| # | Rủi ro | Biện pháp |
|---|---|---|
| A01 | Broken Access Control | `requirePermission` trên **mọi** route admin; kiểm tra quyền sở hữu (`user_id = req.user.id`) cho highlight, comment, thread; cắt nội dung Premium ở server; `admin.html` chuyển ra khỏi public; có test tự động cho ma trận quyền |
| A02 | Cryptographic Failures | argon2id; chỉ lưu hash của token; HTTPS + HSTS; secret chỉ nằm trong Vercel env |
| A03 | Injection / XSS | Prisma (truy vấn tham số hóa); Zod; frontend **bỏ `innerHTML` với dữ liệu người dùng**, dùng `textContent`/DOMPurify; CSP chặt |
| A04 | Insecure Design | Chống dò tài khoản, khóa tăng dần, quota AI atomic, IPN idempotent |
| A05 | Security Misconfiguration | Helmet; **CSP không còn `unsafe-inline`** (phải chuyển hết `onclick` inline sang `addEventListener`); CORS chỉ cho domain chính; tắt `x-powered-by`; không lộ stack trace; tắt Supabase Data API / bật RLS deny-all |
| A06 | Vulnerable Components | `npm audit` trong CI, Dependabot, khóa phiên bản bằng `package-lock.json` |
| A07 | Auth Failures | Rate limit, chính sách mật khẩu, xoay vòng session, thu hồi phiên khi đổi mật khẩu hoặc bị ban, cookie `__Host-` |
| A08 | Integrity Failures | Xác minh chữ ký IPN; tự host thư viện JS (không dùng CDN bên thứ 3), hoặc dùng SRI |
| A09 | Logging & Monitoring | `audit_logs` cho mọi thao tác admin; pino log (che mật khẩu, token, cookie); cảnh báo lỗi 5xx (Sentry, tùy chọn) |
| A10 | SSRF | Không fetch URL do người dùng nhập; upload chỉ nhận file, không nhận URL |

**Bổ sung:**
- Upload ảnh: chỉ nhận `jpeg/png/webp`, tối đa 2MB, kiểm tra magic bytes, đổi tên ngẫu nhiên, **không nhận SVG do người dùng tải lên** (SVG có thể chứa script).
- Giới hạn body JSON 1MB (riêng smart-ingest 5MB).
- Service worker: **không cache** response API có nội dung Premium hoặc dữ liệu cá nhân.
- Xóa `data/sophia.db` khỏi lịch sử git nếu đã commit; tạo `.env.example`, không bao giờ commit `.env`.
- Dữ liệu cá nhân: có trang Chính sách quyền riêng tư và chức năng xóa tài khoản (phù hợp Nghị định 13/2023 về bảo vệ dữ liệu cá nhân).

---

## 8. Lộ trình build theo giai đoạn

> Ước lượng: **1 giai đoạn ≈ 1–2 phiên làm việc**. Mỗi giai đoạn kết thúc bằng: chạy test, kiểm tra thủ công, commit git.

```mermaid
flowchart LR
  G0["G0 Chuẩn bị tài khoản"] --> G1["G1 Nền móng"] --> G2["G2 Auth"] --> G3["G3 RBAC + Admin users"]
  G3 --> G4["G4 Nội dung + Premium gating"] --> G5["G5 Cá nhân hóa"]
  G5 --> G6["G6 Cộng đồng"] --> G7["G7 Gamification"]
  G4 --> G8["G8 AI Socrates"]
  G4 --> G9["G9 Thanh toán"]
  G7 --> G10["G10 Hardening frontend"]
  G8 --> G10
  G9 --> G10
  G10 --> G11["G11 Test, CI/CD, Go-live"]
```

---

### 🟦 G0 — Chuẩn bị (BẠN tự làm, khoảng 1–2 giờ)
- [ ] Tạo tài khoản **GitHub**, tạo repo private `sophia-codex`
- [ ] Tạo tài khoản **Vercel**, liên kết với GitHub
- [ ] Tạo **2 project Supabase**: `sophia-dev` và `sophia-prod` (region Singapore). Lưu lại: Database password, Connection string (pooler cổng 6543 và direct cổng 5432), Project URL, `service_role` key
- [ ] Tạo tài khoản **Resend**, lấy API key
- [ ] Lấy **Gemini API key** tại Google AI Studio
- [ ] Đăng ký **VNPay sandbox** (sandbox.vnpayment.vn/devreg) → nhận `TMN_CODE` và `HASH_SECRET`
- [ ] Đăng ký **MoMo developer** (developers.momo.vn) → nhận `PARTNER_CODE`, `ACCESS_KEY`, `SECRET_KEY` (bản test)
- [ ] Cài **Node.js 22 LTS** và **Git**

> [!WARNING]
> **Ba vấn đề pháp lý và chi phí cần biết trước:**
> 1. **Resend khi chưa xác minh tên miền chỉ gửi được email tới chính địa chỉ của bạn.** Muốn gửi email xác thực cho người dùng thật, bạn **phải có tên miền** (khoảng 250–350k VNĐ/năm). Có thể build và test với email của bạn trước, mua tên miền trước G11.
> 2. **Gói Vercel Hobby (miễn phí) cấm dùng cho mục đích thương mại.** Khi bắt đầu thu tiền Premium, bạn cần lên **Vercel Pro (~20 USD/tháng)**.
> 3. **VNPay và MoMo bản production yêu cầu giấy phép kinh doanh** (hộ kinh doanh hoặc doanh nghiệp) và ký hợp đồng merchant. Trong lúc build, sandbox dùng được hoàn toàn.

---

### 🟦 G1 — Nền móng dự án (1–2 phiên)
**Mục tiêu:** cấu trúc mới, Express chạy được, Postgres có schema, dữ liệu cũ đã được chuyển sang.

- [x] Khởi tạo git, sửa `.gitignore` (thêm `.env*`, `data/`, `*.db`), xóa `sophia.db` khỏi git tracking
- [x] Tái cấu trúc thư mục theo mục 1 (di chuyển file vào `public/`, `views/`, `src/`)
- [x] `src/config/env.js`: validate env bằng Zod; tạo `.env.example`
- [x] Express app: helmet, compression, cookie-parser, JSON limit, error handler, logger, `GET /api/v1/health`
- [x] `api/index.js` + `vercel.json` (rewrite `/api/*` sang function, `/admin` sang function, phần còn lại là static)
- [x] `prisma/schema.prisma`: **toàn bộ 34 bảng ở mục 3** (làm một lần để tránh migration vụn)
- [ ] Bật RLS cho mọi bảng / tắt Data API trên Supabase (khi kết nối Supabase)
- [x] `scripts/migrate-sqlite-to-pg.js`: chuyển categories, philosophers, books, chapters, quotes từ `sophia.db`; chuyển `js/books-data/*` sang `prisma/seed-data/`
- [x] `prisma/seed.js`: seed permissions, roles hệ thống và roles mẫu, gói Premium, settings mặc định, **Super Admin từ env** (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`)
- [x] Tailwind CLI: tạo `tailwind.config.js` (chép cấu hình màu/font từ CDN config hiện tại), script `build:css`, `dev:css`
- [ ] Tự host lucide (thay unpkg)
- [x] Script npm: `dev`, `build`, `start`, `db:migrate`, `db:seed`, `db:studio`, `test`
- [x] Port các API **đọc** công khai (books, chapters, quotes, philosophers, categories, overview) sang Express + Prisma và mount trong `src/app.js`

**Nghiệm thu:** `npm run dev` → trang độc giả hiển thị đúng dữ liệu từ Postgres; deploy Preview lên Vercel chạy được; không còn file toàn văn sách trong `public/`.

---

### 🟦 G2 — Xác thực (1–2 phiên)
- [x] `lib/password.js` (argon2id), `lib/crypto.js`, `lib/mailer.js` + template email (xác thực, đặt lại mật khẩu, thông báo đổi mật khẩu) theo phong cách Sophia Codex
- [x] Middleware: `session`, `requireAuth`, `csrf`, `rateLimit` (Postgres), `validate`
- [x] Module `auth`: toàn bộ endpoint ở mục 5 + `account` (profile, đổi mật khẩu, sessions)
- [x] Trang: `login.html`, `register.html`, `verify-email.html`, `forgot-password.html`, `reset-password.html`, `account.html` (tab hồ sơ, bảo mật, phiên đăng nhập) theo đúng giao diện mockup
- [x] `public/js/core/api.js`: wrapper `fetch` (credentials, CSRF, xử lý lỗi, 401 thì chuyển sang login kèm `?next=`)
- [x] `public/js/core/auth.js`: `loadMe()`, `can(permission)`, `isPremium()`; header hiển thị avatar/menu người dùng thay cho badge "Độc Giả Tri Thức" đang hard-code
- [x] Test logic: đăng ký, xác thực, đăng nhập sai 5 lần bị khóa, reset token dùng 2 lần bị từ chối, đổi mật khẩu thu hồi phiên khác

**Nghiệm thu:** đăng ký → nhận email (gửi tới email của bạn) → xác thực → đăng nhập → đăng xuất; cookie đúng các cờ bảo mật (kiểm tra bằng DevTools).

---

### 🟦 G3 — RBAC động và quản lý người dùng (1–2 phiên)
- [x] Service `permissions`: load quyền theo user (cache trong request), `super_admin` bypass
- [x] Middleware `requirePermission(...keys)`, helper `assertCanGrant()` chống leo thang đặc quyền
- [x] Module `roles` (CRUD + gán quyền), `users` (danh sách, tìm kiếm, lọc theo role/trạng thái, chi tiết, ban/mute, gán role, thu hồi phiên, xác thực thủ công, xóa mềm)
- [x] Module `audit`: hàm `audit` (logAudit) gọi trong mọi service admin
- [x] Route `GET /admin` trả về `views/admin.html` **chỉ khi** user có ít nhất 1 quyền quản trị, ngược lại redirect sang login hoặc 403
- [x] `admin.html`: thêm tab **Người dùng**, **Vai trò & Quyền** (ma trận checkbox theo nhóm), **Nhật ký hệ thống**; sidebar và nút bấm ẩn/hiện theo `can()`
- [x] Re-auth (nhập lại mật khẩu) cho thao tác nhạy cảm
- [x] Test ma trận: mỗi route admin × (khách, member, editor, super_admin) → mã HTTP đúng kỳ vọng

**Nghiệm thu:** Super Admin tạo role "Biên tập viên Đông Phương" chỉ có `chapter.update` → gán cho user B → B vào được admin, chỉ thấy và sửa được chương, gọi API xóa sách thì nhận 403.

---

### 🟦 G4 — Quản lý nội dung và chặn Premium (1–2 phiên)
- [x] Port toàn bộ CRUD admin (books, chapters, quotes, philosophers, categories, smart-ingest) sang `/api/v1/admin/*` với Zod + permission + audit
- [x] Trạng thái xuất bản `draft/published/archived`; công khai chỉ thấy `published`
- [x] Trường `access_level` cho sách và chương + `preview_paragraphs`; trong form admin có công tắc Free/Premium
- [x] Hàm `resolveChapterAccess(user, chapter)` + endpoint `GET /chapters/:id` cắt nội dung, trả `{locked: true, preview: [...]}`
- [x] Module `media`: upload ảnh lên Supabase Storage (bucket public-read cho ảnh bìa), validate định dạng và dung lượng
- [x] `reader.js`: hiển thị khối "🔒 Nội dung Premium" + nút nâng cấp khi bị khóa; mục lục hiện biểu tượng khóa
- [x] Badge "Premium" trên thẻ sách ở catalog
- [x] Test: khách hoặc member gọi chương Premium chỉ nhận đúng N đoạn

**Nghiệm thu:** đánh dấu "Cộng Hòa" là Premium → khách và member chỉ đọc được 3 đoạn đầu mỗi chương; dò response trong Network tab không thấy nội dung còn lại.

---

### 🟦 G5 — Cá nhân hóa cho độc giả (1–2 phiên)
- [x] **Tiến độ đọc**: tự lưu (debounce 5s + khi `visibilitychange`), khôi phục vị trí khi mở sách trên thiết bị khác, mục "Đọc tiếp" ở trang chủ
- [x] **Tủ sách**: nút ❤️ và chọn kệ (Muốn đọc/Đang đọc/Đã đọc) trên thẻ sách và trang đọc
- [x] **Highlight & ghi chú**: bôi đen → popup (chọn màu, ghi chú, hỏi Socrates, tạo thiệp quote); render lại highlight khi mở chương
- [x] Trang `library.html`: tab Tủ sách / Highlight & ghi chú (lọc theo sách, tìm kiếm, xuất Markdown)
- [x] Ghi `reading_sessions` + `reading_days` (thay `reading-logs` cũ)

**Nghiệm thu:** highlight trên máy tính → mở điện thoại đăng nhập cùng tài khoản thấy highlight và đúng vị trí đang đọc.

---

### 🟦 G6 — Cộng đồng: đánh giá và bình luận (1 phiên)
- [x] Đánh giá 1–5 sao + nhận xét; tính lại `rating_avg/rating_count` trong transaction
- [x] Bình luận theo sách và theo chương, trả lời 1 cấp, sửa trong 15 phút, xóa của chính mình
- [x] Lọc từ cấm, báo cáo, tự ẩn khi đủ 3 báo cáo
- [x] Admin: API kiểm duyệt bình luận và quản lý từ cấm

**Nghiệm thu:** bình luận chứa từ cấm bị chặn; 3 tài khoản báo cáo 1 bình luận thì bình luận tự ẩn và xuất hiện trong hàng đợi admin.

---

### 🟦 G7 — Gamification (1 phiên)
- [x] Service `gamification`: `recordReadingDay`, `awardXp(refKey)`, `recomputeLevel`, `checkBadges`
- [x] Seed huy hiệu + ngưỡng level trong settings
- [x] UI: ngọn lửa streak ở header, thanh XP/level ở sidebar, trang huy hiệu trong `account.html`
- [x] Test streak qua mốc nửa đêm theo giờ Việt Nam

---

### 🟦 G8 — AI Socrates thật với Gemini (1–2 phiên)
- [x] `lib/gemini.js`, prompt builder (system prompt + ngữ cảnh chương có kiểm tra quyền)
- [x] Quota atomic + endpoint `/ai/quota`; settings quota cho member/premium trong admin
- [x] Stream SSE; frontend đọc stream bằng `fetch` + `ReadableStream`
- [x] Thay toàn bộ logic `setTimeout` trong `ai-chat.js`; danh sách thread, mở lại và xóa thread
- [x] Prompt gợi ý nhanh (chip) gửi lên AI thật
- [x] Quản lý quota và xử lý lỗi: hết quota (hiển thị nút nâng cấp Premium), Gemini lỗi (hoàn lượt)

**Nghiệm thu:** hỏi về chương đang đọc → AI trích được ý trong chương; member hỏi đến lượt thứ 11 thì bị chặn kèm lời mời nâng cấp.

---

### 🟦 G9 — Premium và thanh toán VNPay + MoMo (2 phiên)
- [x] Trang `pricing.html` (gói tháng/năm, quyền lợi) + nút "Nâng cấp" ở các điểm chạm (chương bị khóa, hết quota AI)
- [x] `payments/vnpay.js`: tạo URL, verify chữ ký HMAC-SHA512, IPN, return
- [x] `payments/momo.js`: tạo giao dịch captureWallet, verify chữ ký HMAC-SHA256, IPN, return
- [x] Service `checkout` + `subscriptions.activate(order)` trong transaction, idempotent
- [x] `payment-result.html`: gọi định kỳ trạng thái đơn
- [x] Email xác nhận thanh toán (gọi mailer), Vercel Cron `daily` dọn đơn hết hạn
- [x] `account.html`: tab Gói của tôi (hạn dùng, lịch sử đơn, nút gia hạn)

**Nghiệm thu:** thanh toán thành công bằng thẻ test VNPay sandbox và ví test MoMo → tài khoản lên Premium ngay → đọc được chương Premium; gửi lại IPN lần 2 không cộng thêm ngày.

---

### 🟦 G10 — Hardening frontend và bảo mật (1–2 phiên)
- [x] Rà soát và cập nhật Helmet, Security Headers, CSP và CSRF protection
- [x] Cập nhật `sw.js`: chỉ cache tài nguyên tĩnh, tuyệt đối không cache `/api/*`
- [x] Trang 404 tùy biến triết học (`public/404.html`)
- [x] Trang Chính sách quyền riêng tư (`public/privacy.html`, chuẩn Nghị định 13/2023)
- [x] Trang Điều khoản sử dụng (`public/terms.html`)

---

### 🟦 G11 — Kiểm thử, CI/CD và Go-live (1–2 phiên)
- [x] Bộ kiểm thử tự động (Unit & Integration tests với Vitest & Supertest):
  - `tests/unit/password.test.js`
  - `tests/unit/crypto.test.js`
  - `tests/integration/health.test.js`
  - `tests/integration/security.test.js`
- [x] Viết tài liệu vận hành và triển khai hoàn chỉnh: `docs/RUNBOOK.md`
- [x] Hướng dẫn chi tiết thiết lập Supabase, Vercel, Sandbox VNPay & MoMo, và quy trình backup CSDL Postgres

---

## 9. Biến môi trường (`.env.example`)

```bash
# App
NODE_ENV=development
APP_URL=http://localhost:3000
SESSION_SECRET=            # 64 ký tự ngẫu nhiên
CRON_SECRET=

# Database (Supabase)
DATABASE_URL=              # pooler :6543 ?pgbouncer=true&connection_limit=1
DIRECT_URL=                # :5432 dùng cho migrate
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY= # CHỈ dùng ở server
STORAGE_BUCKET=media

# Email
RESEND_API_KEY=
MAIL_FROM="Sophia Codex <onboarding@resend.dev>"

# AI
GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-latest

# VNPay
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction

# MoMo
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api

# Seed
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

---

## 10. Chi phí dự kiến

| Dịch vụ | Giai đoạn build | Khi vận hành thương mại |
|---|---|---|
| Vercel | Hobby: 0đ | **Pro: ~20 USD/tháng** (bắt buộc khi thu tiền) |
| Supabase | Free: 0đ (500MB DB, 1GB storage, project tự tạm dừng sau 7 ngày không hoạt động) | Pro: ~25 USD/tháng khi cần backup tự động và không bị tạm dừng |
| Resend | Free: 3.000 email/tháng | Free vẫn đủ lúc đầu |
| Gemini | Free tier (giới hạn RPM) | Trả theo token, gói Flash rất rẻ |
| Tên miền | Chưa cần | ~250–350k VNĐ/năm |
| VNPay/MoMo | Sandbox: 0đ | Phí giao dịch khoảng 1–2.5%/giao dịch tùy hợp đồng |

---

## 11. Rủi ro và cách giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Cold start serverless làm API chậm lần đầu | Prisma singleton, dùng connection pooler, có thể bật Fluid Compute |
| `admin.html`/`admin.js` quá lớn, khó bảo trì | Tách module ở G10; G3–G9 chỉ thêm tab mới theo module riêng |
| IPN không về (mạng, cấu hình sai URL) | Nút "hỏi lại trạng thái" + cron đối soát đơn pending |
| Lạm dụng AI làm tốn chi phí | Quota atomic, giới hạn độ dài, rate limit theo IP, đặt budget alert trên Google Cloud |
| Thay đổi nội dung chương làm hỏng highlight | Cơ chế khớp lại bằng `quote_text` + trạng thái "mồ côi" |
| Mất dữ liệu | Backup hằng đêm + thử khôi phục định kỳ (ghi trong RUNBOOK) |

---

## 12. Cách làm việc ở các phiên tiếp theo
1. Mở phiên mới và nói: **"Đọc `docs/BUILD_PLAN.md` và bắt đầu Giai đoạn G1"**.
2. Cuối mỗi phiên, tôi sẽ tick các checklist đã xong trong `docs/BUILD_PLAN.md` và ghi chú phần còn dở.
3. Mỗi giai đoạn chạy trên một nhánh git riêng (`feat/g2-auth`...), xong thì merge vào `main`.
4. Phiên G1 cần sẵn: **file `.env` với thông tin Supabase dev** (từ G0). Các khóa Resend, Gemini, VNPay, MoMo có thể bổ sung dần khi tới giai đoạn tương ứng.

> [!IMPORTANT]
> Đã có thể bắt đầu ngay **G1** khi bạn có Supabase dev project. Không cần hoàn tất toàn bộ G0 trước: Resend cần cho G2, Gemini cho G8, VNPay/MoMo cho G9.
