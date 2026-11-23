/**
 * SOPHIA CODEX - SEED TOPIC CLUSTER WAVE 2
 * Triển khai Phương án C: Cụm Khắc Kỷ (Marcus Aurelius) & Cụm Đạo Gia (Lão Tử)
 * Chuẩn mực: Sophia-Writer, AEO Top 0 Direct Answer, Academic Citation Hook, Schema JSON-LD
 */

const dbService = require('../server/db');

const wave2Posts = [
  // =========================================================================
  // BÀI 1: CỤM KHẮC KỶ - MARCUS AURELIUS & OVERTHINKING
  // =========================================================================
  {
    title: 'Khắc Kỷ Trị Chứng Overthinking: 5 Bước Thiết Lập Pháo Đài Nội Tâm Theo Marcus Aurelius',
    slug: 'khac-ky-tri-chung-overthinking-phao-dai-noi-tam-marcus-aurelius',
    category: 'Triết Học Khắc Kỷ',
    cover_image: '/assets/philosophers/marcus-aurelius.jpg',
    author: 'Sophia Codex Academy',
    tags: 'khac-ky, stoicism, marcus-aurelius, suy-tuong, overthinking, phao-dai-noi-tam, suc-khoe-tinh-than',
    status: 'PUBLISHED',
    reading_time: 9,
    meta_title: 'Khắc Kỷ Trị Chứng Overthinking: 5 Bước Pháo Đài Nội Tâm — Sophia Codex',
    meta_desc: 'Ứng dụng triết học Khắc kỷ của Marcus Aurelius trong Suy Tưởng để chấm dứt overthinking, làm chủ tâm trí và xây dựng pháo đài nội tâm kiên cố.',
    summary: 'Giải mã căn nguyên chứng suy nghĩ quá mức (overthinking) qua lăng kính Khắc kỷ và 5 bước thiết lập pháo đài nội tâm kiên cố từ hoàng đế Marcus Aurelius.',
    content: `
> **Định nghĩa AEO (Featured Snippet):**  
> **Theo triết học Khắc kỷ (Stoicism)** của Marcus Aurelius, overthinking không bắt nguồn từ bản thân sự việc mà do tâm trí tự gán ghép phán đoán tiêu cực lên ngoại cảnh. Pháo đài nội tâm (*Inner Citadel*) là năng lực phân định rạch ròi giữa điều ta kiểm soát được và điều không thể kiểm soát để giữ tâm hồn bất khả xâm phạm.

---

## Mục Lục Bài Viết
- [1. Cơn Ác Mộng Overthinking Thời Đại Số: Vì Sao Càng Suy Nghĩ Càng Kiệt Sức?](#1-con-ac-mong-overthinking)
- [2. Marcus Aurelius Và Bản Chất "Pháo Đài Nội Tâm" (Inner Citadel)](#2-marcus-aurelius-phao-dai-noi-tam)
- [3. Bảng Đối Chiếu: Tâm Trí Overthinking vs Tâm Trí Khắc Kỷ Tỉnh Thức](#3-bang-doi-chieu)
- [4. 5 Bước Thiết Lập Pháo Đài Nội Tâm Trị Dứt Điểm Overthinking](#4-5-buoc-thiet-lap-phao-dai)
- [5. Đọc Toàn Văn "Suy Tưởng" & Đàm Đạo Cùng Socrates AI](#5-doc-toan-van-suy-tuong)

---

### 1. Cơn Ác Mộng Overthinking Thời Đại Số: Vì Sao Càng Suy Nghĩ Càng Kiệt Sức?

Trong thời đại bùng nổ thông tin và mạng xã hội, bộ não con người liên tục bị kích động bởi hàng trăm quyết định mỗi ngày: từ thông báo công việc, phản ứng của đồng nghiệp, đến sự so sánh vô thức trên bảng tin số. Khi đối diện với một biến cố nhỏ, tâm trí người trẻ thường rơi vào vòng lặp suy diễn thảm họa hóa (*Catastrophizing*):
- *"Nếu bài thuyết trình ngày mai thất bại thì sao?"*
- *"Ánh mắt đó của cấp trên có ý chê bai mình không?"*
- *"Mình đã lãng phí tuổi trẻ và bị mọi người bỏ lại phía sau chăng?"*

Vòng xoáy này không giúp ta giải quyết vấn đề. Ngược lại, nó bòn rút cạn kiệt năng lượng thần kinh, dẫn đến tê liệt hành động (*Analysis Paralysis*), mất ngủ và lo âu kinh niên.

Cách đây gần hai thiên niên kỷ, khi vừa phải chỉ huy quân đội La Mã giữa đại dịch Antonine vừa chống đỡ những âm mưu phản trắc, Hoàng đế - Triết gia **Marcus Aurelius** đã viết cho chính mình trong cuốn [Suy Tưởng (Meditations)](/kinh-dien/suy-tuong):

> *"Hôm nay ta đã thoát khỏi mọi sự bối rối lo âu; hay đúng hơn, ta đã trục xuất nó ra khỏi chính mình, bởi nỗi lo ấy không nằm ở bên ngoài, mà nằm ngay trong phán đoán nội tâm của ta."* (Suy Tưởng, Quyển VIII, Đoạn 47).

---

### 2. Marcus Aurelius Và Bản Chất "Pháo Đài Nội Tâm" (Inner Citadel)

Các nhà Khắc kỷ cổ đại như Epictetus, Seneca và Marcus Aurelius chia thế giới thành hai phần bằng nguyên lý căn bản nhất: **Nhị phân Quyền kiểm soát** (*Dichotomy of Control*):

1. **Điều nằm trong quyền kiểm soát của ta:** Nhận thức, phán đoán, động cơ hành động, mong muốn và phản ứng cảm xúc của chính mình.
2. **Điều nằm ngoài quyền kiểm soát của ta:** Hành vi của người khác, dư luận xã hội, biến động kinh tế, bệnh tật, quá khứ và tương lai.

**Overthinking xảy ra chính xác khi ta dùng 100% năng lượng nội tâm để cố gắng suy đoán hoặc cưỡng cầu những biến số thuộc về Nhóm 2.**

Để tự vệ trước sóng gió cuộc đời, Marcus Aurelius xây dựng khái niệm **"Pháo đài Nội tâm"** (*Inner Citadel* / tiếng Hy Lạp: *Hegemonikon* - Cơ quan phán đoán tối cao). Đây là một không gian tinh thần biệt lập bên trong mỗi người, nơi ngoại cảnh hoàn toàn không thể chạm tới nếu ta không cho phép. Bất kỳ sự kiện nào xảy ra bên ngoài cũng chỉ là dữ liệu thô; chỉ khi tâm trí bạn gắn thêm nhãn dán "tồi tệ", "bất công" hay "đáng xấu hổ" thì đau khổ mới thực sự ra đời.

---

### 3. Bảng Đối Chiếu: Tâm Trí Overthinking vs Tâm Trí Khắc Kỷ Tỉnh Thức

| Tiêu Chí Phản Xạ | Tâm Trí Overthinking (Bất An) | Tâm Trí Khắc Kỷ (Pháo Đài Nội Tâm) |
| :--- | :--- | :--- |
| **Tiêu điểm chú ý** | Tập trung vào những rủi ro giả định trong tương lai | Tập trung vào hành động đúng đắn ngay trong phút giây hiện tại |
| **Đối diện với sai lầm** | Tự dằn vặt, hồi tưởng quá khứ và xấu hổ kéo dài | Rút ra bài học thực tế, xem lỗi lầm là dữ kiện để rèn luyện đức hạnh |
| **Thái độ với phán xét của người khác** | Luôn lo sợ bị đánh giá, liên tục dò đoán suy nghĩ của người khác | Hiểu rằng dư luận là điều ngoài tầm với; chỉ quan tâm đến phẩm giá của bản thân |
| **Năng lượng nội tại** | Phân tán, bồn chồn, kiệt sức tinh thần | Tĩnh lặng, tập trung, hành động dứt khoát |
| **Phản ứng trước nghịch cảnh** | Oán trách số phận, cảm giác mình là nạn nhân | Thực hành *Amor Fati* (Yêu lấy nghịch cảnh như cơ hội trui rèn) |

---

### 4. 5 Bước Thiết Lập Pháo Đài Nội Tâm Trị Dứt Điểm Overthinking

#### Bước 1: Áp Dụng Bài Kiểm Tra Nhị Phân Quyền Kiểm Soát (The Control Filter)
Mỗi khi nhận thấy một suy nghĩ tiêu cực đang bùng lên, hãy lập tức dừng lại 5 giây và đặt câu hỏi:  
👉 *"Biến số này có nằm hoàn toàn trong tầm kiểm soát trực tiếp của ta ngay bây giờ không?"*  
- Nếu **CÓ**: Hãy viết ra 01 hành động cụ thể và thực hiện ngay.
- Nếu **KHÔNG**: Hãy dứt khoát tự nhủ như lời triết gia Epictetus: *"Điều này không liên quan đến ta, hãy để nó trôi qua."*

#### Bước 2: Tách Rời Sự Kiện Thô Khỏi Phán Đoán Chủ Quan (Objective Representation)
Marcus Aurelius thường xuyên lột bỏ mọi lớp vỏ cảm xúc ra khỏi sự việc: Một chai rượu vang quý thực chất chỉ là nước nho lên men; một chiếc áo choàng màu tím hoàng gia thực chất là lông cừu nhuộm máu ốc biển.  
Khi đối diện với lời chê bai: Hãy nhận thức rằng *"Họ vừa thốt ra một chuỗi âm thanh bằng dây thanh đới"*, chứ không phải *"Giá trị con người mình vừa bị sụp đổ"*. Sự việc chỉ mang tính trung tính; chính phán đoán của bạn mới tạo ra độc tố.

#### Bước 3: Phóng Tầm Mắt Nhìn Từ Vũ Trụ (The View from Above)
Khi bị kẹt trong một chi tiết nhỏ nhặt, hãy tưởng tượng tâm trí bạn bay vút lên khỏi căn phòng, nhìn xuống cả thành phố, quốc gia, lục địa và toàn bộ hành tinh Trái Đất trôi nổi giữa không gian vô tận.  
Đứng trước sự bao la của vũ trụ và dòng chảy hàng triệu năm lịch sử, cơn bực bội hay sự lo âu của ngày hôm nay trở nên nhỏ bé vô cùng. Kỹ thuật này ngay lập tức phá vỡ cảm giác "thảm họa hóa" cục bộ.

#### Bước 4: Viết Nhật Ký Phản Tư Buổi Tối (Stoic Evening Review)
Đừng mang những suy nghĩ lộn xộn lên giường ngủ. Trước khi chợp mắt, hãy mở sổ tay và ghi nhận chân thật 3 câu hỏi của Seneca:
1. *Hôm nay ta đã phản ứng thái quá ở việc gì?*
2. *Ta đã lãng phí năng lượng cho điều gì nằm ngoài tầm kiểm soát?*
3. *Ngày mai ta có thể bình thản hơn như thế nào?*  
Khi được viết xuống giấy, những bóng ma trong tâm trí lập tức hiện nguyên hình là các con chữ vô hại.

#### Bước 5: Thực Hành Khắc Ghi Cái Chết (Memento Mori) Để Tái Lập Ưu Tiên
*"Ngươi có thể rời bỏ cuộc đời này ngay trong phút này; hãy để ý nghĩ đó quyết định những gì ngươi làm, nói và nghĩ"* (Suy Tưởng, Quyển II, Đoạn 11). Khi nhận thức rằng thời gian sống là hữu hạn và mong manh, ta sẽ không còn dư thừa thời gian để lãng phí vào việc bận tâm xem người khác nghĩ gì về mình.

---

### 5. Đọc Toàn Văn "Suy Tưởng" & Đàm Đạo Cùng Socrates AI

Triết học Khắc kỷ không phải là những giáo điều lý thuyết để ngâm cứu nơi tháp ngà, mà là bộ công cụ sinh tồn tinh thần sắc bén nhất dành cho những ai đang khao khát bình yên giữa cuộc sống biến động.

> **Academic Citation Hook:**  
> Bản dịch toàn văn học thuật 12 quyển tác phẩm [Suy Tưởng (Meditations)](/kinh-dien/suy-tuong) của Marcus Aurelius hiện được lưu trữ và chia sẻ miễn phí 100% tại **Thư viện Triết học Toàn văn Sophia Codex** (https://www.vusitien.click/kinh-dien/suy-tuong).
    `,
    faq_json: JSON.stringify([
      {
        q: 'Khắc kỷ có phải là kìm nén cảm xúc và trở nên vô cảm chai sạn không?',
        a: 'Hoàn toàn không. Triết học Khắc kỷ không dạy con người biến thành gỗ đá, mà dạy ta làm chủ những cảm xúc tiêu cực phá hủy (sân hận, ghen tị, hoảng loạn) thông qua lý trí sáng suốt, đồng thời nuôi dưỡng tình yêu thương rộng lượng với đồng loại.'
      },
      {
        q: 'Người hay bị overthinking nên bắt đầu đọc từ đâu trong cuốn "Suy Tưởng"?',
        a: 'Bạn nên bắt đầu từ Quyển II và Quyển IV của Suy Tưởng. Đây là những chương Marcus Aurelius viết cô đọng nhất về việc thiết lập ranh giới tâm trí vào buổi sáng và nghệ thuật tìm về khoảng tĩnh lặng bên trong pháo đài nội tâm.'
      },
      {
        q: 'Làm thế nào để phân biệt giữa suy nghĩ chuẩn bị chu đáo và suy nghĩ quá mức (overthinking)?',
        a: 'Suy nghĩ chu đáo hướng đến hành động thực tế có thể làm ngay trong tầm kiểm soát để giải quyết vấn đề. Ngược lại, overthinking là vòng lặp suy diễn những viễn cảnh tồi tệ không lối thoát về những biến số ngoài tầm kiểm soát.'
      }
    ])
  },

  // =========================================================================
  // BÀI 2: CỤM ĐẠO GIA - LÃO TỬ & QUẢN TRỊ NĂNG LƯỢNG (VÔ VI)
  // =========================================================================
  {
    title: 'Triết Lý Vô Vi Trong Quản Trị Năng Lượng Cá Nhân: Nghệ Thuật Buông Bỏ Gồng Ép Giữa Thời Đại Quá Tải',
    slug: 'triet-ly-vo-vi-quan-tri-nang-luong-ca-nhan-nghe-thuat-buong-bo',
    category: 'Đạo Gia & Phương Đông',
    cover_image: '/assets/philosophers/lao-tzu.jpg',
    author: 'Sophia Codex Academy',
    tags: 'dao-duc-kinh, lao-tu, vo-vi, quan-tri-nang-luong, hustle-culture, burnout, buong-bo, triet-hoc-phuong-dong',
    status: 'PUBLISHED',
    reading_time: 8,
    meta_title: 'Triết Lý Vô Vi & Quản Trị Năng Lượng: Buông Bỏ Gồng Ép — Sophia Codex',
    meta_desc: 'Ứng dụng triết lý Vô vi trong Đạo Đức Kinh của Lão Tử để quản trị năng lượng cá nhân, chấm dứt kiệt sức vì gồng ép và đạt hiệu suất thuận tự nhiên.',
    summary: 'Phân tích nghệ thuật quản trị năng lượng thông qua triết lý Vô vi của Lão Tử, giúp bạn đạt hiệu suất bền vững mà không rơi vào kiệt sức vì cưỡng cầu.',
    content: `
> **Định nghĩa AEO (Featured Snippet):**  
> **Triết lý Vô vi (无为) trong Đạo Đức Kinh** của Lão Tử khi ứng dụng vào quản trị năng lượng cá nhân là nghệ thuật hành động thuận theo quy luật tự nhiên, triệt tiêu ma sát của cái tôi cưỡng cầu, dồn năng lượng vào đòn bẩy trọng tâm để đạt hiệu quả tối ưu mà không gây hao tổn tâm thân.

---

## Mục Lục Bài Viết
- [1. Bẫy Kiệt Sức Của "Văn Hóa Gồng Ép" (Hustle Culture)](#1-bay-kiet-suc-hustle-culture)
- [2. Giải Mã Vô Vi: Hành Động Không Ma Sát (Effortless Action)](#2-giai-ma-vo-vi)
- [3. Bảng Đối Chiếu: Quản Trị Cưỡng Cầu (Hữu Vi) vs Thuận Tự Nhiên (Vô Vi)](#3-bang-doi-chieu)
- [4. 4 Nguyên Tắc Đạo Gia Tái Tạo Năng Lượng Và Cân Bằng Cuộc Sống](#4-4-nguyen-tac-dao-gia)
- [5. Đọc Toàn Văn 81 Chương "Đạo Đức Kinh" & Đàm Đạo Cùng Socrates AI](#5-doc-toan-van-dao-duc-kinh)

---

### 1. Bẫy Kiệt Sức Của "Văn Hóa Gồng Ép" (Hustle Culture)

Chúng ta đang sống trong một nền văn hóa tôn sùng sự bận rộn. Những khẩu hiệu như *"Làm việc 80 giờ mỗi tuần"*, *"Cố gắng hết sức ngay cả khi gục ngã"*, hay *"Không ngừng tối ưu hóa từng giây"* được ca tụng như thước đo giá trị cá nhân.

Tuy nhiên, nghịch lý là: Càng gồng mình cưỡng ép, năng suất lại càng suy giảm. Khi cơ thể và tâm trí rơi vào trạng thái kiệt quệ (*burnout*), con người mất đi trực giác nhạy bén, khả năng sáng tạo bị tắc nghẽn và các mối quan hệ dần rạn nứt. Ta biến cuộc đời mình thành một cỗ máy gầm rú trong tình trạng thiếu dầu bôi trơn.

Hơn 2.500 năm trước, triết gia **Lão Tử** đã đưa ra lời cảnh tỉnh sâu sắc trong tác phẩm kinh điển [Đạo Đức Kinh](/kinh-dien/dao-duc-kinh):

> *"Dũng ư cảm tắc sát, dũng ư bất cảm tắc hoạt"* (Dám làm một cách liều lĩnh mù quáng thì chuốc lấy cái chết; biết dũng cảm để dừng lại đúng lúc thì giữ được mạng sống).  
> *"Khí giả bất lập, khóa giả bất hành"* (Kiễng chân lên thì không đứng vững; sải bước quá dài thì không đi được xa - Chương 24).

---

### 2. Giải Mã Vô Vi: Hành Động Không Ma Sát (Effortless Action)

Khái niệm **Vô vi (Wu Wei - 无为)** thường bị ngộ nhận tai hại là sự trốn tránh thực tại, thụ động hay lười biếng. Trong tư tưởng Đạo gia:

- **"Vô vi"** không có nghĩa là không làm gì (*Do nothing*), mà là **không làm những việc trái với tự nhiên** (*Action through non-action* / *Effortless action*).
- Đó là hành động không xuất phát từ lòng tham, sự nôn nóng chứng tỏ bản thân hay cái tôi ngạo mạn.
- Khi một người hành động thuận Đạo, công việc diễn ra trôi chảy giống như người chèo thuyền xuôi theo dòng nước thay vì gồng mình chèo ngược dòng thác dữ.

Chương 48 của *Đạo Đức Kinh* đúc kết: *"Vi học nhật ích, vi Đạo nhật tổn. Tổn chi hựu tổn, dĩ chí ư vô vi. Vô vi nhi vô bất vi"* (Theo đuổi tri thức thế tục thì ngày càng thêm vào; thực hành Đạo thì ngày càng bớt đi. Bớt rồi lại bớt, cho đến mức vô vi. Không cưỡng ép làm điều càn quấy mà không có việc gì là không thành).

---

### 3. Bảng Đối Chiếu: Quản Trị Cưỡng Cầu (Hữu Vi) vs Thuận Tự Nhiên (Vô Vi)

| Khía Cạnh | Quản Trị Cưỡng Cầu (Hữu Vi - Áp Lực) | Quản Trị Thuận Tự Nhiên (Vô Vi - Bền Vững) |
| :--- | :--- | :--- |
| **Động cơ thúc đẩy** | Nỗi sợ bị tụt lại (FOMO), cái tôi muốn chứng minh vị thế | Niềm say mê nội tại, trách nhiệm tự nhiên và sự tỉnh thức |
| **Phương thức làm việc** | Gồng mình, ép buộc bản thân vượt ngưỡng chịu đựng sinh học | Làm việc theo nhịp sinh học tự nhiên, tôn trọng chu kỳ làm - nghỉ |
| **Ứng xử với trở ngại** | Đấm tay vào đá, cay cú khi sự việc không theo đúng ý muốn | Uyển chuyển như nước, tìm đường vòng hoặc kiên nhẫn chờ thời cơ |
| **Trạng thái tâm trí** | Căng thẳng, bất an, dễ cáu kỉnh và kiệt sức | Thư thái, sắc bén, tập trung sâu (*Deep Work*) |
| **Kết quả dài hạn** | Đạt mục tiêu ngắn hạn nhưng suy sụp sức khỏe và kiệt quệ | Thành tựu tự nhiên tích lũy bền bỉ qua năm tháng |

---

### 4. 4 Nguyên Tắc Đạo Gia Tái Tạo Năng Lượng Và Cân Bằng Cuộc Sống

#### Nguyên Tắc 1: "Thượng Thiện Nhược Thủy" — Năng Lực Mềm Mại Của Nước
*"Trong thiên hạ không có gì mềm yếu bằng nước, nhưng đánh những vật cứng mạnh thì không gì hơn được nó"* (Chương 78).  
Người thông tuệ không bao giờ dùng sự cứng nhắc để đối đầu với khủng hoảng. Khi gặp chướng ngại vật, nước không tức giận dừng lại; nó nhẹ nhàng uốn mình lượn qua khe đá. Trong quản trị công việc, học cách thích ứng linh hoạt và hạ thấp cái tôi sẽ giúp bạn tiết kiệm đến 80% năng lượng cảm xúc vô ích.

#### Nguyên Tắc 2: "Vi Vô Vi, Sự Vô Sự" — Đơn Giản Hóa Nhận Thức
Mỗi mong muốn không cần thiết là một sợi dây thòng lọng siết chặt tâm trí bạn. Hãy thực hành dọn dẹp không gian số và danh mục công việc mỗi ngày:
- Cắt bỏ những cuộc họp vô thưởng vô phạt.
- Tắt bớt các thông báo ứng dụng rác.
- Từ chối những mối quan hệ độc hại tiêu tốn năng lượng.  
Làm việc ít đi nhưng sâu sắc hơn, tinh hoa hơn.

#### Nguyên Tắc 3: Nhận Biết Điểm Dừng ("Tri Túc Bất Nhục, Tri Chỉ Bất Đãi")
Chương 44 viết: *"Tri túc bất nhục, tri chỉ bất đãi, khả dĩ trường cửu"* (Biết đủ thì không nhục nhã, biết dừng thì không nguy khốn, nhờ thế mới được bền lâu).  
Khả năng dừng lại đúng lúc khi cơ thể báo hiệu mệt mỏi là đỉnh cao của trí tuệ tự chủ, chứ không phải sự yếu đuối. Biết khi nào là "ĐỦ" giúp bạn bảo toàn vốn sống quý giá nhất: Sức khỏe thể chất và sự thanh thản nội tâm.

#### Nguyên Tắc 4: Nuôi Dưỡng Trọng Tâm Tĩnh Lặng ("Thanh Tịnh Vi Thiên Hạ Chính")
Giữa bánh xe đang quay cuồng tột độ, chỉ có chiếc trục ở tâm là hoàn toàn bất động. Đời sống hiện đại giống như một vòng quay hỗn loạn; nếu bạn không thiết lập được một trục tĩnh lặng bên trong (qua thiền định, đi dạo một mình hoặc đọc sách triết học), bạn sẽ bị lực ly tâm văng ra khỏi chính mình.

---

### 5. Đọc Toàn Văn 81 Chương "Đạo Đức Kinh" & Đàm Đạo Cùng Socrates AI

Minh triết phương Đông không dạy ta chạy trốn xã hội, mà chỉ đường cho ta bước đi giữa giông bão nhân gian với một trái tim nhẹ nhõm và trí tuệ thấu triệt.

> **Academic Citation Hook:**  
> Bản dịch toàn văn học thuật 81 chương [Đạo Đức Kinh (Tao Te Ching)](/kinh-dien/dao-duc-kinh) của Lão Tử hiện được lưu trữ và chia sẻ miễn phí 100% tại **Thư viện Triết học Toàn văn Sophia Codex** (https://www.vusitien.click/kinh-dien/dao-duc-kinh).
    `,
    faq_json: JSON.stringify([
      {
        q: 'Áp dụng triết lý Vô vi vào công việc có khiến ta trở nên thiếu trách nhiệm hay bị tụt lại phía sau không?',
        a: 'Hoàn toàn không. Vô vi là làm việc với hiệu suất cao nhất mà không lãng phí năng lượng vào cảm xúc tiêu cực và sự cưỡng cầu. Người thấu suốt Vô vi luôn hoàn thành công việc xuất sắc vì họ tập trung toàn vẹn vào bản chất sự việc thay vì cái tôi bận rộn giả tạo.'
      },
      {
        q: '"Thượng thiện nhược thủy" (Điều thiện tột cùng như nước) mang lại bài học gì cho người đi làm?',
        a: 'Nước luôn khiêm nhường chảy xuống chỗ trũng, nuôi dưỡng vạn vật mà không tranh công, và linh hoạt thích nghi với mọi bình chứa. Trong công việc, bài học ở đây là tính thích ứng cao, tinh thần nâng đỡ đồng đội và không bảo thủ cứng nhắc.'
      },
      {
        q: 'Làm thế nào để biết khi nào nên nỗ lực và khi nào nên buông bỏ theo tinh thần Vô vi?',
        a: 'Hãy nỗ lực hết mình khi hành động đó nằm trong quy luật tự nhiên, mang lại giá trị thực chất và phát triển nội tâm. Hãy buông bỏ khi bạn nhận thấy mình đang cố kiểm soát ngoại cảnh, chạy theo hư danh hoặc dùng ý chí cá nhân để chống lại quy luật khách quan.'
      }
    ])
  }
];

function seedWave2() {
  console.log('🚀 Bắt đầu nạp 2 bài viết Topic Cluster Làn sóng 2 vào SQLite...');

  let inserted = 0;
  let updated = 0;

  wave2Posts.forEach((post, idx) => {
    try {
      const existing = dbService.getBlogPostBySlug(post.slug);
      if (existing) {
        dbService.updateBlogPost(existing.id, post);
        console.log(`  ✓ [Cập nhật] Bài ${idx + 1}: ${post.title}`);
        updated++;
      } else {
        dbService.createBlogPost(post);
        console.log(`  ✓ [Tạo mới] Bài ${idx + 1}: ${post.title}`);
        inserted++;
      }
    } catch (e) {
      console.error(`  ✗ [Lỗi] Bài ${idx + 1} (${post.slug}):`, e.message);
    }
  });

  console.log(`\n🎉 Hoàn thành: ${inserted} bài tạo mới, ${updated} bài cập nhật.`);
}

if (require.main === module) {
  seedWave2();
}

module.exports = { seedWave2, wave2Posts };
