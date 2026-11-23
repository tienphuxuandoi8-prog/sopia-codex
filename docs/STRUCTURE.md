# CẤU TRÚC KIẾN TRÚC THÔNG TIN & URL TREE (STRUCTURE.MD)
**Dự án:** Sophia Codex (`https://www.vusitien.click`)  
**Khung kiến trúc:** 4 Tầng Phân Cấp Silo & Topic Cluster Hub-and-Spoke  
**Tiêu chuẩn định tuyến:** Clean URLs Rewrite via Vercel Engine  
**Cập nhật:** 2026-11-12 (Wave 2 Expansion: 24 Clean URLs)

---

## 1. SƠ ĐỒ PHÂN TẦNG KIẾN TRÚC WEBSITE (4 TIERS ARCHITECTURE)

```mermaid
graph TD
    Root["TẦNG 1: ROOT DOMAIN<br/>https://www.vusitien.click/"] --> Hub1["TẦNG 2: THƯ VIỆN KINH ĐIỂN<br/>/thu-vien"]
    Root --> Hub2["TẦNG 2: BLOG PHÂN TÍCH<br/>/blog"]
    Root --> Hub3["TẦNG 2: TIỆN ÍCH & CHÍNH SÁCH<br/>/pricing.html | /privacy | /terms"]

    Hub1 --> Book1["TẦNG 3: KINH ĐIỂN ĐÔNG TÂY<br/>/kinh-dien/dao-duc-kinh"]
    Hub1 --> Book2["TẦNG 3: KINH ĐIỂN ĐÔNG TÂY<br/>/kinh-dien/suy-tuong"]
    Hub1 --> Book3["TẦNG 3: KINH ĐIỂN ĐÔNG TÂY<br/>/kinh-dien/cong-hoa"]
    Hub1 --> Book4["TẦNG 3: KINH ĐIỂN ĐÔNG TÂY<br/>/kinh-dien/zarathustra"]
    Hub1 --> Book5["TẦNG 3: KINH ĐIỂN ĐÔNG TÂY<br/>/kinh-dien/ban-ve-tu-do"]

    Hub1 --> Phil1["TẦNG 3: HỒ SƠ THỰC THỂ TRIẾT GIA<br/>/triet-gia/marcus-aurelius"]
    Hub1 --> Phil2["TẦNG 3: HỒ SƠ THỰC THỂ TRIẾT GIA<br/>/triet-gia/socrates"]
    Hub1 --> Phil3["TẦNG 3: HỒ SƠ THỰC THỂ TRIẾT GIA<br/>/triet-gia/lao-tzu"]
    Hub1 --> Phil4["TẦNG 3: HỒ SƠ THỰC THỂ TRIẾT GIA<br/>/triet-gia/nietzsche"]
    Hub1 --> Phil5["TẦNG 3: HỒ SƠ THỰC THỂ TRIẾT GIA<br/>/triet-gia/john-stuart-mill"]

    Hub2 --> Post1["TẦNG 4: TOPIC CLUSTER ĐẠO GIA<br/>/blog/dao-duc-kinh-triet-ly-vo-vi..."]
    Hub2 --> Post2["TẦNG 4: TOPIC CLUSTER ĐẠO GIA (WAVE 2)<br/>/blog/triet-ly-vo-vi-quan-tri-nang-luong..."]
    Hub2 --> Post3["TẦNG 4: TOPIC CLUSTER KHẮC KỶ<br/>/blog/nghe-thuat-khac-ky-trong-doi-song-so"]
    Hub2 --> Post4["TẦNG 4: TOPIC CLUSTER KHẮC KỶ (WAVE 2)<br/>/blog/khac-ky-tri-chung-overthinking..."]
    Hub2 --> Post5["TẦNG 4: TOPIC CLUSTER KHẮC KỶ (TÌNH YÊU)<br/>/blog/marcus-aurelius-nghe-thuat-yeu-thuong..."]
    Hub2 --> Post6["TẦNG 4: TOPIC CLUSTER PLATO<br/>/blog/an-du-hang-dong-plato..."]
    Hub2 --> Post7["TẦNG 4: TOPIC CLUSTER NIETZSCHE<br/>/blog/y-chi-hung-cuong-amor-fati..."]
    Hub2 --> Post8["TẦNG 4: TOPIC CLUSTER MILL<br/>/blog/nguyen-ly-gay-hai..."]

    Post1 -. "Internal Link" .-> Book1
    Post2 -. "Internal Link" .-> Book1
    Post3 -. "Internal Link" .-> Book2
    Post4 -. "Internal Link" .-> Book2
    Post5 -. "Internal Link" .-> Book2
    Post6 -. "Internal Link" .-> Book3
    Post7 -. "Internal Link" .-> Book4
    Post8 -. "Internal Link" .-> Book5
```

---

## 2. PHÂN BỔ TÀI NGUYÊN THU THẬP (CRAWL BUDGET ALLOCATION)

| Tầng nội dung | Số lượng URLs | Tần suất cập nhật (`changefreq`) | Trọng số ưu tiên (`priority`) | Mục tiêu chiến lược |
| :--- | :---: | :---: | :---: | :--- |
| **Trang chủ & Hubs** | 3 | Hàng ngày (`daily`) | 1.0 - 0.9 | Nhận diện thương hiệu & điều hướng trung tâm |
| **Kinh điển Toàn văn** | 5 | Hàng tuần (`weekly`) | 0.9 | Nguồn sơ cấp (Primary Canonical Works), giữ chân người đọc |
| **Thực thể Triết gia** | 5 | Hàng tháng (`monthly`) | 0.8 | Entity Grounding (Wikidata, Wikipedia `sameAs`) |
| **Topic Cluster Blogs** | 8 | Hàng tuần (`weekly`) | 0.8 | Đón Long-tail Keywords & Chiếm Featured Snippet Top 0 |
| **Trang phụ trợ** | 3 | Định kỳ (`weekly` / `yearly`) | 0.8 - 0.3 | Minh bạch pháp lý, bảng giá và điều khoản dịch vụ |

---

## 3. NGUYÊN TẮC LIÊN KẾT NỘI BỘ (INTERNAL LINKING SILO)

1. **Mối quan hệ Hub-and-Spoke 2 chiều:**
   - Mỗi bài blog vệ tinh (Spoke) phân tích sâu về một tư tưởng triết học **bắt buộc phải có ít nhất 02 link nội bộ** trỏ về bản dịch tác phẩm kinh điển tương ứng (Hub).
   - Tác phẩm kinh điển (Hub) có widget dẫn dắt sang các bài phân tích ứng dụng thực tế và mời gọi đối thoại cùng **Socrates AI**.
2. **Cơ chế Không cụt dòng (No Dead-ends):**
   - 100% các trang bài viết và chương sách đều có thanh điều hướng chân trang (Next / Previous Chapter) và nút CTA mở nhanh khung đối thoại Socrates AI, đảm bảo người dùng và bot không bao giờ gặp điểm cụt.
