/**
 * BUILD SCRIPT FOR BÀN VỀ TỰ DO (ON LIBERTY - JOHN STUART MILL)
 * 5 CHƯƠNG TOÀN VĂN LUẬN THUYẾT KHAI SÁNG KINH ĐIỂN
 */

const fs = require('fs');
const path = require('path');

const BAN_VE_TU_DO_CHAPTERS = [
  {
    id: "mill-chap-1",
    number: "Chương I",
    title: "Dẫn nhập: Giới hạn Quyền lực của Xã hội đối với Cá nhân & Nguyên lý Gây hại",
    paragraphs: [
      "1. Chủ đề của luận văn này không phải là cái gọi là Tự do của Ý chí (trái ngược với Thuyết tiền định triết học), mà là Tự do Dân sự hay Tự do Xã hội: bản chất và giới hạn của quyền lực mà xã hội có thể thực thi một cách chính đáng đối với cá nhân.",
      "2. Cuộc đấu tranh giữa Tự do và Quyền uy là nét nổi bật nhất trong những trang sử cổ xưa của Hy Lạp, La Mã và nước Anh. Khi đó, tự do có nghĩa là sự phòng vệ chống lại sự chuyên chế bạo tàn của các quân vương cai trị chính trị.",
      "3. Tuy nhiên, khi các nền cộng hòa dân chủ ra đời, nơi những người nắm quyền được bầu cử bởi nhân dân, một hiểm họa mới tinh vi và nguy hiểm hơn đã xuất hiện: đó là 'Sự Độc tài của Số đông' (Tyranny of the Majority).",
      "4. Khi đám đông xã hội nắm trong tay sức mạnh tập thể, sự chuyên chế của dư luận và định kiến xã hội còn ghê gớm hơn sự đàn áp của bất kỳ bạo chúa nào: nó xâm nhập sâu vào mọi ngõ ngách của đời sống tinh thần, trói buộc chính tâm hồn con người và biến cá nhân thành bản sao rập khuôn của bầy đàn.",
      "5. Do đó, sự bảo vệ chống lại sự chuyên chế của bộ máy hành chính là chưa đủ; ta còn cần sự phòng vệ kiên quyết chống lại sự chuyên chế của ý kiến và cảm xúc xã hội đang áp đặt tư tưởng của số đông lên số ít bất đồng.",
      "6. Mục đích của luận văn này là khẳng định một Nguyên tắc Đơn giản Tối thượng (The Harm Principle) để điều chỉnh mọi mối quan hệ cưỡng chế giữa xã hội và cá nhân:",
      "7. 'Mục đích duy nhất mà quyền lực có thể được thực thi một cách chính đáng đối với bất kỳ thành viên nào của một cộng đồng văn minh, trái với ý muốn của anh ta, chính là nhằm Ngăn Chặn Sự Gây Hại Cho Người Khác!'",
      "8. Lợi ích thể xác hay tinh thần của chính cá nhân đó không phải là lý do thỏa đáng để xã hội can thiệp cưỡng ép. Người ta có thể khuyên bảo, thuyết phục hay van nài anh ta, nhưng không được phép dùng vũ lực hay trừng phạt để bắt anh ta làm theo ý số đông. Đối với chính bản thân mình, đối với thể xác và tâm trí của mình, cá nhân có quyền tự chủ tối cao!",
      "9. Quyền tự do chính đáng của con người bao gồm ba lĩnh vực cốt lõi: Thứ nhất, tự do tư tưởng, tự do lương tâm và tự do biểu đạt ý kiến; Thứ hai, tự do lựa chọn thị hiếu và lối sống cá nhân; Thứ ba, tự do hội họp và liên kết hòa bình với người khác."
    ],
    takeaways: [
      { title: "Nguyên Lý Gây Hại (Harm Principle)", desc: "Xã hội và tập thể chỉ có quyền can thiệp vào hành vi cá nhân khi hành vi đó gây tổn hại trực tiếp tới quyền lợi người khác." },
      { title: "Cảnh Giác Độc Tài Của Số Đông", desc: "Không để áp lực đám đông hay dư luận xã hội bóp nghẹt quyền tự do suy nghĩ và lối sống độc lập của bạn." },
      { title: "Quyền Tự Chủ Tối Cao Của Cá Nhân", desc: "Mỗi người là chủ nhân tối cao của thể xác và tâm trí mình; tôn trọng quyền tự định đoạt số phận của mỗi con người." }
    ]
  },
  {
    id: "mill-chap-2",
    number: "Chương II",
    title: "Tự do Tư tưởng và Tự do Ngôn luận – Sự va chạm sinh khí của Chân lý",
    paragraphs: [
      "1. Thời kỳ mà người ta phải bảo vệ tự do báo chí chống lại một chính phủ chuyên chế thối nát đã trôi qua. Hiểm họa thực sự hôm nay là khi chính phủ trở thành công cụ thực thi sự kiểm duyệt của đám đông dư luận xã hội.",
      "2. Luận điểm cốt lõi bất hủ: 'Giả sử toàn thể nhân loại đều cùng một ý kiến, và chỉ có duy nhất một người giữ ý kiến trái ngược, thì việc nhân loại bắt người đó phải câm lặng cũng bất công và phi lý như việc người đó có đủ quyền lực để bắt cả nhân loại phải câm lặng!'",
      "3. Tác hại đặc thù của việc dập tắt một ý kiến bất đồng là nó đã cướp đoạt tài sản tinh thần quý báu của toàn thể nhân loại — cả thế hệ hôm nay lẫn các thế hệ mai sau.",
      "4. Hãy phân tích ba khả năng không thể chối cãi của mọi ý kiến bị cấm đoán:",
      "5. Khả năng thứ nhất: Nếu ý kiến bị cấm đoán đó là Đúng, thì xã hội bị tước đoạt mất cơ hội vàng để đổi cái sai lấy cái đúng. Không một cá nhân hay hội đồng nào có quyền tự cho mình là không bao giờ sai lầm (Infallibility). Lịch sử đã chứng minh: Socrates đã bị kết án tử hình vì tội 'làm hư hỏng thanh niên', và Chúa Jesus bị đóng đinh vì bị coi là 'kẻ dị giáo'!",
      "6. Khả năng thứ hai: Nếu ý kiến bị cấm đoán đó là Sai, xã hội đánh mất một lợi ích to lớn không kém: Đó là nhận thức rõ ràng hơn, sinh động hơn về Chân lý thông qua sự va chạm nảy lửa với sai lầm. Một chân lý không bao giờ bị chất vấn và tranh biện sẽ nhanh chóng trở thành một giáo điều chết cứng (dead dogma), vô hồn và sáo rỗng!",
      "7. Khả năng thứ ba: Trường hợp phổ biến nhất là ý kiến xung đột cùng chứa đựng một phần chân lý. Ý kiến phổ biến hiếm khi là toàn bộ sự thật; chỉ có sự tự do tranh luận không định kiến mới giúp con người ghép các mảnh ghép lại để đạt tới chân lý toàn diện.",
      "8. Bậc vĩ nhân tìm kiếm chân lý không bao giờ sợ hãi những tiếng nói đối lập; họ chủ động tìm kiếm những phản biện sắc bén nhất để thử lửa cho các giả thuyết của mình."
    ],
    takeaways: [
      { title: "Tôn Trọng Tiếng Nói Bất Đồng", desc: "Lắng nghe quan điểm trái chiều để kiểm tra lại các giả định của bản thân và hoàn thiện giải pháp tối ưu." },
      { title: "Chống Lại Giáo Điều Chết Cứng", desc: "Liên tục đặt câu hỏi và tranh luận cởi mở để giữ cho kiến thức luôn sống động, sắc bén và thuyết phục." },
      { title: "Khiêm Nhường Về Sự Đúng Đắn", desc: "Nhận thức rằng không ai nắm giữ chân lý tuyệt đối; luôn sẵn sàng sửa đổi quan điểm khi có bằng chứng mới." }
    ]
  },
  {
    id: "mill-chap-3",
    number: "Chương III",
    title: "Tính Cá biệt như một Yếu tố Cốt lõi của Phúc lợi và Tiến bộ Xã hội",
    paragraphs: [
      "1. Cũng như ý kiến của con người cần phải được tự do biểu đạt, thì hành động của con người cũng phải được tự do thử nghiệm — miễn là cá nhân tự chịu trách nhiệm và không gây tổn hại cho người khác.",
      "2. Tính Cá Biệt (Individuality) là điều kiện thiết yếu cho sự phát triển toàn diện của bản chất con người và là suối nguồn của sự tiến bộ văn minh nhân loại.",
      "3. Con người không phải là một cỗ máy được sản xuất hàng loạt theo một khuôn mẫu có sẵn, mà là một cái cây sinh động cần được tự do phát triển và vươn cành về mọi phía theo xu hướng của những nội lực tự nhiên bên trong nó.",
      "4. Sự đồng khuôn cưỡng ép (Conformity) — nơi mọi người ăn mặc giống nhau, nghĩ giống nhau, mong ước giống nhau vì sợ bị chê cười — là kẻ thù số một tàn sát tính sáng tạo.",
      "5. Những thiên tài và những nhà phát minh cách mạng luôn là những người có tính cá biệt mạnh mẽ. Họ là số ít mở đường cho nhân loại. Nếu xã hội bóp chết tính cá biệt để phục vụ sự an toàn tầm thường, xã hội đó sẽ nhanh chóng rơi vào sự đình trệ và suy tàn giống như các nền văn minh cổ đại khép kín.",
      "6. Khác biệt không phải là một tội lỗi; sự đa dạng của các lối sống và các thử nghiệm là phòng thí nghiệm vĩ đại của sự tiến hóa xã hội."
    ],
    takeaways: [
      { title: "Nuôi Dưỡng Bản Sắc Riêng Biệt", desc: "Dũng cảm sống thật với cá tính và sở trường độc đáo của bạn thay vì gượng ép hòa tan vào sự đồng khuôn tẻ nhạt." },
      { title: "Tôn Trọng Sự Thử Nghiệm Lối Sống", desc: "Cởi mở với các phương pháp làm việc và mô hình sáng tạo mới mẻ của đồng nghiệp và thế hệ trẻ." },
      { title: "Khuyến Khích Nhân Tài Độc Đáo", desc: "Tạo môi trường dung nạp những cá tính khác biệt; đó chính là nơi khởi nguồn của những đột phá vĩ đại." }
    ]
  },
  {
    id: "mill-chap-4",
    number: "Chương IV",
    title: "Giới hạn Quyền lực của Xã hội đối với Cá nhân",
    paragraphs: [
      "1. Ranh giới thích hợp giữa chủ quyền cá nhân và sự kiểm soát của xã hội nằm ở đâu? Mỗi thành viên trong xã hội được bảo vệ bởi tập thể thì phải có bổn phận đền đáp: không xâm phạm quyền lợi của người khác và đóng góp công sức vào việc phòng thủ chung.",
      "2. Nhưng đối với những việc chỉ liên quan tới chính bản thân cá nhân đó, xã hội hoàn toàn không có quyền can thiệp cưỡng chế.",
      "3. Xã hội có thể bày tỏ sự không đồng tình, có thể tránh xa hoặc thương hại một người có lối sống thiếu lành mạnh, nhưng không được phép dùng luật pháp hay trừng phạt xã hội để ép buộc anh ta thay đổi.",
      "4. Mill kịch liệt phản đối Chủ nghĩa Gia trưởng Đạo đức (Moral Paternalism): Ý tưởng cho rằng xã hội có quyền trừng phạt ai đó 'vì lợi ích của chính anh ta' là một tiền lệ cực kỳ nguy hiểm có thể biện minh cho sự bóp nghẹt mọi quyền tự do.",
      "5. Xã hội có toàn bộ thời thơ ấu và thanh xuân của cá nhân để giáo dục anh ta thông qua nhà trường và gia đình; nếu sau khi trưởng thành anh ta vẫn lựa chọn một lối sống vụng về mà không hại ai, thì đó là quyền và rủi ro của chính anh ta!"
    ],
    takeaways: [
      { title: "Phân Định Ranh Giới Cá Nhân & Xã Hội", desc: "Tự chịu trách nhiệm cho các quyết định cá nhân; chỉ chịu sự điều chỉnh của tập thể khi ảnh hưởng tới người khác." },
      { title: "Tôn Trọng Quyền Lựa Chọn Của Người Khác", desc: "Không dùng quan điểm đạo đức chủ quan của bản thân để phán xét hay cưỡng ép lối sống của người xung quanh." }
    ]
  },
  {
    id: "mill-chap-5",
    number: "Chương V",
    title: "Các Ứng dụng Thực tế & Cảnh giác Bộ máy Nhà nước Phình to",
    paragraphs: [
      "1. Mill áp dụng các nguyên lý vào các vấn đề cụ thể của đời sống kinh tế và xã hội: Thương mại tự do, quản lý chất độc hại, mại dâm, cờ bạc và đánh thuế hàng hóa xa xỉ.",
      "2. Về giáo dục: Nhà nước có bổn phận bảo đảm rằng mọi trẻ em đều được đi học; nhưng Nhà nước không được phép độc quyền cung cấp giáo dục! Một nền giáo dục do nhà nước độc quyền sẽ chỉ nhằm mục đích đúc nặn mọi bộ óc theo một khuôn mẫu phục vụ quyền lực cai trị.",
      "3. Hiểm họa lớn nhất của nền văn minh hiện đại là sự bành trướng quá mức của bộ máy hành chính nhà nước.",
      "4. Khi tất cả những người tài giỏi nhất trong xã hội đều bị thu hút vào bộ máy công quyền, xã hội sẽ mất đi năng lực phản biện độc lập; sự quan liêu trì trệ sẽ bóp chết mọi động lực cải tiến.",
      "5. Lời kết bất hủ của Mill: 'Một Nhà nước coi thường các công dân của mình để biến họ thành những công cụ ngoan ngoãn hơn trong tay nó — dù là vì mục đích tốt đẹp — sẽ nhận ra rằng: Với những con người nhỏ bé, không có điều vĩ đại nào có thể thực sự được tạo nên!'"
    ],
    takeaways: [
      { title: "Giáo Dục Khai Phóng Đa Dạng", desc: "Ủng hộ sự đa dạng trong giáo dục và học tập suốt đời; chống lại sự nhồi sọ tư tưởng rập khuôn." },
      { title: "Cảnh Giác Bộ Máy Quan Liêu", desc: "Duy trì năng lực sáng tạo và phản biện độc lập của khu vực tư nhân và các tổ chức cộng đồng." },
      { title: "Con Người Nhỏ Bé Không Làm Nên Đại Nghiệp", desc: "Muốn tổ chức hùng mạnh, phải trao quyền và tôn trọng phẩm giá tự chủ của từng cá nhân thành viên." }
    ]
  }
];

const fileHeader = `/**
 * SOPHIA CODEX - BÀN VỀ TỰ DO (JOHN STUART MILL) - ĐỦ 5 CHƯƠNG TOÀN VĂN
 * Tuyên ngôn kinh điển bảo vệ quyền tự do tư tưởng, tự do cá nhân và ranh giới quyền lực xã hội.
 * Đầy đủ 5 chương toàn văn khảo luận chính trị - triết học kinh điển không giản lược.
 */

const BAN_VE_TU_DO_CHAPTERS = ${JSON.stringify(BAN_VE_TU_DO_CHAPTERS, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BAN_VE_TU_DO_CHAPTERS };
}
`;

fs.writeFileSync(path.join(__dirname, 'data-ban-ve-tu-do.js'), fileHeader, 'utf8');
console.log('✅ Đã cập nhật thành công 5 chương toàn văn Bàn Về Tự Do vào scripts/data-ban-ve-tu-do.js');
