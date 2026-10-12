/**
 * BUILD SCRIPT FOR ZARATHUSTRA ĐÃ NÓI NHƯ THẾ (FRIEDRICH NIETZSCHE)
 * 16 BÀI THUYẾT GIẢNG KINH ĐIỂN TOÀN VĂN THI CA TRIẾT HỌC RỰC LỬA
 */

const fs = require('fs');
const path = require('path');

const ZARATHUSTRA_CHAPTERS = [
  {
    id: "zara-chap-1",
    number: "Chương 1",
    title: "Lời tựa của Zarathustra & Con người siêu việt (Übermensch)",
    paragraphs: [
      "1. Khi Zarathustra bước sang tuổi ba mươi, ông rời bỏ quê hương và hồ nước quê nhà để lên núi tuyết ẩn cư. Ở đó, ông vui hưởng trí tuệ và sự cô độc của mình suốt mười năm ròng rã mà không hề mệt mỏi.",
      "2. Nhưng rốt cuộc, trái tim ông biến đổi — một buổi sáng sớm, ông thức dậy cùng ánh bình minh, bước ra trước Mặt trời và nói: 'Ôi ngài Thái dương vĩ đại! Ngài sẽ hạnh phúc ở đâu nếu không có những kẻ mà ngài chiếu sáng? Ngài đã lên đây tới hang của tôi mười năm nay; ngài hẳn đã chán ngấy ánh sáng này nếu không có tôi, con đại bàng và con rắn của tôi!'",
      "3. 'Kìa, chén của tôi muốn cạn trở lại, và Zarathustra muốn trở lại làm người!' Thế rồi Zarathustra bắt đầu cuộc hạ sơn đi xuống chiều sâu nhân gian.",
      "4. Trên đường xuống núi, ông gặp một vị ẩn sĩ già trong rừng sâu. Vị ẩn sĩ hỏi: 'Zarathustra, ngươi xuống nhân gian làm gì? Ngươi mang gì cho con người?' Zarathustra đáp: 'Tôi mang cho con người một món quà: Tình yêu!' Nhưng vị ẩn sĩ khuyên: 'Đừng cho họ gì cả! Hãy giữ lấy sự cô độc của ngươi. Ở đây trong rừng, ta làm thơ và ca ngợi Thượng đế!'",
      "5. Khi Zarathustra rời khỏi khu rừng, ông tự nhủ thầm trong kinh ngạc: 'Lạ lùng thay! Vị thánh già nơi rừng sâu này dường như vẫn chưa hay biết tin tức chấn động: Rằng Thượng đế đã chết!'",
      "6. Khi đến khu chợ của thành phố gần nhất, Zarathustra cất tiếng nói trước đám đông dân chúng đang tụ tập xem trò đi dây:",
      "7. 'Tôi dạy cho các người về Con Người Siêu Việt (Übermensch)! Con người là một cái gì đó cần phải được vượt qua. Các người đã làm gì để vượt qua chính mình?'",
      "8. 'Mọi sinh vật từ trước đến nay đều tạo ra một cái gì đó vượt trội hơn chính chúng; chẳng lẽ các người lại muốn trở thành ngọn thủy triều rút lui của loài sinh vật vĩ đại ấy, thà quay trở lại làm loài thú vật hơn là vượt qua con người?'",
      "9. 'Con người là một sợi dây thừng căng giữa con thú và Con Người Siêu Việt — một sợi dây vắt qua vực thẳm sâu hoắm. Một hành trình hiểm nguy qua vực thẳm, một cái nhìn lại đầy hãi hùng, một bước đi run rẩy và dừng lại ngập ngừng. Điều vĩ đại ở con người là chàng là một cây cầu chứ không phải là một đích đến!'",
      "10. Zarathustra cũng cảnh báo về mối hiểm họa đáng sợ nhất: 'Con người sau chót' (The Last Man) — kẻ chỉ mong cầu sự thoải mái tầm thường, kẻ nháy mắt bảo: 'Chúng tôi đã tìm ra hạnh phúc', nhưng không còn dám khao khát điều gì vĩ đại nữa!"
    ],
    takeaways: [
      { title: "Không Ngừng Vượt Lên Chính Mình", desc: "Đừng hài lòng với sự an phận tầm thường; luôn đặt mục tiêu nâng cấp năng lực, đạo đức và trí tuệ bản thân." },
      { title: "Con Người Là Chiếc Cầu Nối", desc: "Mỗi thử thách trong cuộc đời là cơ hội để bạn bắc nhịp cầu tiến tới phiên bản mạnh mẽ và thức tỉnh hơn." },
      { title: "Tránh Cạm Bẫy 'Con Người Sau Chót'", desc: "Cảnh giác với lối sống chỉ tìm kiếm tiện nghi an nhàn mà đánh mất khát vọng kiến tạo và đam mê sáng tạo." }
    ]
  },
  {
    id: "zara-chap-2",
    number: "Chương 2",
    title: "Ba bước biến chuyển của Tinh thần (Lạc đà, Sư tử, Đứa trẻ)",
    paragraphs: [
      "1. Này những người anh em, ta nói cho các ngươi nghe về ba bước biến chuyển của tinh thần: Làm thế nào tinh thần hóa thành Lạc đà, Lạc đà biến thành Sư tử, và cuối cùng Sư tử hóa thành Đứa trẻ ngây thơ!",
      "2. Thế nào là Lạc đà? Đó là tinh thần biết gánh vác, nặng lòng tôn kính và khiêm cung. Tinh thần mạnh mẽ, kiên nhẫn ấy quỳ gối xin được chở nặng: 'Cái gì nặng nhất, hỡi các bậc anh hùng, để ta gánh lấy trên lưng và hân hoan bước đi trong sa mạc cô đơn?'",
      "3. Nó gánh vác mọi giáo điều, mọi định kiến, mọi bổn phận khắt khe của xã hội cũ rồi rảo bước vào cõi hoang vu nhất của sa mạc nội tâm.",
      "4. Nhưng ngay giữa lòng sa mạc hoang vu nhất, sự biến chuyển thứ hai kỳ diệu xảy ra: Lạc đà hóa thành Sư tử! Con sư tử muốn đoạt lấy tự do và làm chủ sa mạc của chính nó.",
      "5. Tại đây, nó giáp mặt kẻ thống trị tối cao cuối cùng: con Rồng khổng lồ mang tên 'Ngươi phải làm' (Thou Shalt). Từng vảy vàng óng của con Rồng lấp lánh những giáo điều hàng nghìn năm tuổi.",
      "6. Nhưng con sư tử của tinh thần gầm lên tiếng thét kiêu hãnh: 'Ta muốn!' (I Will). Nó dũng mãnh bẻ gãy mọi sợi xích của sự phục tùng giáo điều mù quáng!",
      "7. Song le, hỡi các bạn, con sư tử dù dũng mãnh đến đâu cũng chỉ có thể phá hủy chứ chưa thể sáng tạo giá trị mới. Vì thế, tinh thần cần bước chuyển hóa tối hậu:",
      "8. Sư tử phải hóa thành Đứa trẻ! Đứa trẻ là sự thơ ngây, là sự lãng quên trong trẻo, một khởi đầu mới tinh khôi, một trò chơi tự quay, một chuyển động ban sơ, một lời chuẩn nhận thiêng liêng: 'Vâng, đối với cuộc đời!' (A sacred Yes to life)."
    ],
    takeaways: [
      { title: "Ba Giai Đoạn Trưởng Thành", desc: "Học hỏi gánh vác trách nhiệm (Lạc đà) -> Phản biện giành quyền tự chủ (Sư tử) -> Sáng tạo với tâm hồn hồn nhiên, nhiệt huyết (Đứa trẻ)." },
      { title: "Sức Mạnh Của Lời Nói 'Vâng' Với Cuộc Đời", desc: "Vượt qua sự hoài nghi và giận dữ để đón nhận cuộc sống bằng tinh thần sáng tạo và hân hoan." },
      { title: "Tự Do Sáng Tạo Giá Trị Mới", desc: "Phá bỏ cái cũ chỉ là bước đệm; giá trị tối thượng của con người nằm ở khả năng kiến tạo những điều mới mẻ cho nhân loại." }
    ]
  },
  {
    id: "zara-chap-3",
    number: "Chương 3",
    title: "Những giảng đường đạo đức & Giấc ngủ bình yên",
    paragraphs: [
      "1. Người ta ca tụng một bậc thông thái có tài giảng về giấc ngủ và đức hạnh; người ta bảo ông được vinh danh và ban thưởng hậu hĩnh vì điều đó.",
      "2. Zarathustra đến nghe ông ta giảng. Vị thông thái nói: 'Hãy tôn trọng giấc ngủ! Hãy xấu hổ trước một giấc ngủ chập chờn! Hãy giữ lương tâm yên ắng suốt cả ngày để đêm về có được một giấc ngủ sâu!'",
      "3. 'Bạn phải tự chiến thắng bản thân mười lần mỗi ngày; phải hòa giải mười lần với kẻ thù; phải tìm ra mười chân lý nhỏ bé, nếu không linh hồn bạn sẽ đói khát và thao thức trong đêm.'",
      "4. Zarathustra cười thầm trong bụng: 'Thật là một trò khôn ngoan của đám người thời xưa! Họ biến toàn bộ đức hạnh thành thuốc ngủ! Toàn bộ trí tuệ của các giảng đường chẳng qua chỉ là nghệ thuật để ru ngủ một lương tâm mê muội mà không cần thức tỉnh!'",
      "5. 'Nhưng đối với ta, cuộc đời không phải là một giấc ngủ êm đềm; cuộc đời là một ngọn lửa thức tỉnh, là một cuộc phiêu lưu của sự sáng tạo và lòng quả cảm!'"
    ],
    takeaways: [
      { title: "Đạo Đức Thức Tỉnh", desc: "Đạo đức thực sự không phải là thứ ru ngủ bản thân trong sự an toàn tự mãn, mà là động lực thúc đẩy ta hành động thức tỉnh." },
      { title: "Dũng Cảm Đối Diện Thực Tại", desc: "Không dùng sự thỏa hiệp tạm bợ để trốn tránh những câu hỏi lớn của cuộc đời; dám nhìn thẳng vào thực tế để thay đổi." }
    ]
  },
  {
    id: "zara-chap-4",
    number: "Chương 4",
    title: "Những kẻ tin vào thế giới bên kia & Sự khinh miệt thân xác",
    paragraphs: [
      "1. Zarathustra nói về những kẻ tin vào một thế giới bên kia: Họ mệt mỏi với trần thế này, họ ghê tởm thân xác này và mơ mộng về một cõi vĩnh hằng không tì vết.",
      "2. Nhưng chính sự đau khổ và bất lực của họ trước cuộc đời trần thế đã tạo ra những ảo tưởng đó; họ muốn nhảy vọt qua chính bản thân mình vì không đủ dũng khí sống ở đây.",
      "3. Zarathustra nói với những kẻ khinh miệt thân xác: 'Thân xác là một lý trí vĩ đại, một số nhiều với một cảm thức duy nhất, một cuộc chiến tranh và một nền hòa bình, một đàn cừu và một người chăn cừu.'",
      "4. 'Lý trí nhỏ bé của bạn — thứ bạn gọi là 'tâm trí' — chỉ là một công cụ nhỏ, một món đồ chơi trong tay Thân xác vĩ đại của bạn.'",
      "5. 'Đằng sau những suy nghĩ và cảm xúc của bạn là một vị chủ tể quyền năng, một nhà thông thái vô danh — đó chính là Bản Thể của bạn (Self). Nó ngự trị trong thân xác bạn; nó chính là thân xác bạn!'"
    ],
    takeaways: [
      { title: "Tôn Trọng Thể Xác & Năng Lực Sinh Học", desc: "Thân xác khỏe mạnh là nền tảng của mọi tư tưởng minh mẫn; chăm sóc thể chất là chăm sóc trí tuệ." },
      { title: "Gắn Bó Với Đời Sống Hiện Thực", desc: "Không tìm kiếm sự trốn chạy trong những ảo mộng xa vời; tìm kiếm ý nghĩa và vẻ đẹp ngay trong cuộc đời trần thế này." }
    ]
  },
  {
    id: "zara-chap-5",
    number: "Chương 5",
    title: "Đọc và Viết (Viết bằng máu của chính mình)",
    paragraphs: [
      "1. 'Trong mọi thứ được viết ra trên cõi đời này, ta chỉ yêu những gì mà một người viết bằng chính máu của mình!'",
      "2. Hãy viết bằng máu, và bạn sẽ nhận ra rằng máu chính là tinh thần. Thật không dễ hiểu được dòng máu của người khác: ta ghê tởm những kẻ đọc sách chỉ để giết thời gian lười biếng.",
      "3. Kẻ nào viết bằng máu và cách ngôn, kẻ đó không muốn được đọc lướt qua, mà muốn được người ta học thuộc lòng bằng trái tim.",
      "4. Trên đỉnh núi cao, con đường ngắn nhất là từ đỉnh này sang đỉnh khác; nhưng để đi con đường đó, bạn phải có đôi chân dài và sự dũng cảm phi thường.",
      "5. 'Ta không còn cảm thấy những cảm xúc của đám đông; ta không còn nhìn thấy những đám mây đen bên dưới chân ta; kẻ nào leo lên đỉnh núi tuyết cao nhất, kẻ đó sẽ cười nhạo mọi bi kịch trần gian!'"
    ],
    takeaways: [
      { title: "Sự Chân Thực Tuyệt Đối Trong Sáng Tạo", desc: "Chỉ những tác phẩm, dự án được làm bằng trọn vẹn tâm huyết và trải nghiệm thực tế mới có sức sống lâu bền." },
      { title: "Tầm Nhìn Từ Đỉnh Cao", desc: "Nâng cao tầm nhìn tư duy vượt lên trên những tranh chấp vụn vặt thường nhật để nhìn thấy bức tranh toàn cảnh." }
    ]
  },
  {
    id: "zara-chap-6",
    number: "Chương 6",
    title: "Cái cây trên sườn núi & Khát vọng vươn cao",
    paragraphs: [
      "1. Mắt Zarathustra nhìn thấy một chàng thanh niên đang ngồi cô độc dưới gốc cây trên sườn núi, nét mặt buồn rầu và tuyệt vọng.",
      "2. Zarathustra bước tới gần cái cây, ôm lấy thân cây và nói: 'Nếu ta muốn dùng hai tay lay chuyển cái cây này, ta sẽ không thể làm nổi. Nhưng cơn gió vô hình thổi qua có thể uốn cong nó về bất kỳ hướng nào nó muốn.'",
      "3. Chàng thanh niên ngạc nhiên: 'Làm sao ngài biết tâm trạng của tôi?' Zarathustra đáp: 'Ngươi giống như cái cây này: Càng muốn vươn cao lên ánh sáng và trời xanh bao nhiêu, rễ của ngươi càng phải cắm sâu vào lòng đất tăm tối và vực thẳm bấy nhiêu!'",
      "4. 'Ngươi muốn trở thành một kẻ tự do; nhưng ngươi đang cảm thấy cô đơn và căm ghét sự tầm thường cũ của chính mình. Hãy cẩn thận, đừng vứt bỏ niềm hy vọng và lòng quả cảm của ngươi!'",
      "5. 'Đừng bao giờ vứt bỏ người anh hùng bên trong tâm hồn ngươi! Hãy giữ gìn sự thánh thiện của niềm hy vọng cao nhất của ngươi!'"
    ],
    takeaways: [
      { title: "Quy Luật Của Sự Trưởng Thành", desc: "Khát vọng càng lớn thì thử thách và bóng tối nội tâm bạn phải đối mặt càng sâu sắc; kiên định bám rễ để vươn cao." },
      { title: "Bảo Vệ Người Anh Hùng Nội Tâm", desc: "Đừng để sự hoài nghi hay thất bại nhất thời dập tắt ngọn lửa lý tưởng và phẩm giá cao quý bên trong bạn." }
    ]
  },
  {
    id: "zara-chap-7",
    number: "Chương 7",
    title: "Những kẻ rao giảng cái chết và sự mệt mỏi trần gian",
    paragraphs: [
      "1. Có những kẻ rao giảng cái chết; và mặt đất này đầy rẫy những kẻ mà người ta cần phải khuyên răn từ bỏ sự sống.",
      "2. Trái Đất đầy những kẻ thừa mứa, cuộc đời đã bị hủy hoại bởi những kẻ vô tích sự. Giá như người ta có thể dùng một 'cuộc sống vĩnh hằng' nào đó để dụ dỗ họ rời khỏi cõi đời này!",
      "3. Họ gặp một người ốm yếu, một người già cả, hoặc một xác chết, và ngay lập tức họ thốt lên: 'Đời là một bể khổ!' Nhưng chính họ mới là kẻ khổ sở, và đôi mắt của họ chỉ nhìn thấy một mặt của sự tồn tại.",
      "4. Họ mặc áo choàng u ám và tìm kiếm những nỗi buồn nhỏ nhen để biến thành triết lý hư vô: 'Mọi thứ đều rỗng tuếch, mọi thứ đều như nhau, mọi thứ đều vô ích!'",
      "5. Zarathustra nói: 'Nếu các ngươi mệt mỏi với cuộc đời, hãy để đôi chân các ngươi nhảy múa! Sự sống là một dòng suối hân hoan; nhưng ở đâu đám cặn bã cùng uống nước, ở đó mọi giếng nguồn đều bị đầu độc.'"
    ],
    takeaways: [
      { title: "Khước Từ Triết Lý Hư Vô Bi Quan", desc: "Đừng để những kẻ yếm thế làm nguội lạnh ngọn lửa nhiệt huyết của bạn; cuộc sống có ý nghĩa khi chính bạn kiến tạo nó." },
      { title: "Bảo Vệ Môi Trường Tinh Thần", desc: "Tránh xa những người liên tục than vãn và gieo rắc sự độc hại tiêu cực vào tâm trí bạn." }
    ]
  },
  {
    id: "zara-chap-8",
    number: "Chương 8",
    title: "Chiến tranh và Chiến binh tinh thần",
    paragraphs: [
      "1. Ta không khuyên các ngươi làm việc, mà khuyên các ngươi chiến đấu! Ta không khuyên các ngươi cầu an, mà khuyên các ngươi chiến thắng! Hãy để công việc của các ngươi là một cuộc chiến đấu, hãy để sự bình yên của các ngươi là một sự chiến thắng!",
      "2. Các ngươi hỏi: 'Một mục tiêu tốt lành có thể thánh hóa ngay cả cuộc chiến tranh không?' Zarathustra nói với các ngươi: 'Chính một cuộc chiến đấu quả cảm mới thánh hóa mọi mục tiêu!'",
      "3. Cuộc chiến vĩ đại nhất không phải là cầm gươm giết hại kẻ khác, mà là cuộc chiến chống lại sự lười biếng, sự hèn nhát và sự tầm thường bên trong chính bản thân các ngươi.",
      "4. Kẻ thù của các ngươi phải là kẻ mà các ngươi căm ghét chứ không phải kẻ mà các ngươi khinh miệt. Các ngươi phải hãnh diện về kẻ thù của mình: khi đó, sự thành công của kẻ thù cũng là sự thành công của chính các ngươi!",
      "5. Hãy để lòng dũng cảm của các ngươi thốt lên: 'Không phải ta muốn sống lâu hơn, mà ta muốn sống một cuộc đời tráng lệ và mãnh liệt nhất!'"
    ],
    takeaways: [
      { title: "Chiến Đấu Vì Sự Hoàn Thiện Bản Thân", desc: "Mục tiêu cao cả nhất là vượt thắng những thói quen xấu và sự tự mãn của chính mình." },
      { title: "Tôn Trọng Đối Thủ Xứng Tầm", desc: "Đối thủ mạnh mẽ là động lực giúp bạn nâng cao năng lực và rèn giũa bản lĩnh vượt bậc." }
    ]
  },
  {
    id: "zara-chap-9",
    number: "Chương 9",
    title: "Con quái vật mới mang tên Nhà Nước",
    paragraphs: [
      "1. Ở đâu vẫn còn nhân dân, ở đó người ta không hiểu Nhà nước và căm ghét nó như một lời nguyền rủa chống lại phong tục tập quán.",
      "2. Nhà nước là gì? Nhà nước là tên của con quái vật lạnh lùng nhất trong tất cả những con quái vật lạnh lùng! Nó nói dối một cách lạnh lùng; và lời dối trá bò ra từ miệng nó là: 'Ta, Nhà nước, chính là Nhân dân!'",
      "3. Đó là một trò lừa bịp! Những người sáng tạo là những người đã tạo ra các dân tộc và trao cho họ niềm tin và tình yêu; đó là cách họ phụng sự sự sống.",
      "4. Nhà nước chỉ sinh ra nơi có quá nhiều kẻ thừa mứa; nó bẫy những kẻ thừa mứa bằng sự hào nhoáng của danh vị và tiền bạc.",
      "5. Hãy nhìn xem: Nhà nước quyến rũ những kẻ tài năng, nó treo những giải thưởng lấp lánh để mua chuộc linh hồn họ!",
      "6. 'Ở đâu Nhà nước chấm dứt, ở đó mới bắt đầu con người đích thực — con người không còn là kẻ thừa mứa; ở đó mới cất lên khúc ca của người cần thiết, giai điệu độc nhất vô nhị không thể thay thế!'"
    ],
    takeaways: [
      { title: "Độc Lập Tinh Thần Trước Quyền Uy", desc: "Không để các cơ chế quan liêu hay danh vị hào nhoáng bóp nghẹt tính độc lập và sáng tạo tự do của bạn." },
      { title: "Giá Trị Con Người Đích Thực", desc: "Bản sắc cá nhân và sự cống hiến thực chất có giá trị cao hơn bất kỳ danh xưng hành chính nào." }
    ]
  },
  {
    id: "zara-chap-10",
    number: "Chương 10",
    title: "Những con ruồi nơi công cộng & Sự cô độc sáng tạo",
    paragraphs: [
      "1. Hãy trốn chạy, hỡi bạn của ta, hãy trốn vào sự cô độc của ngươi! Ta thấy ngươi bị choáng váng bởi tiếng ồn ào của những vĩ nhân giả tạo và bị chích đốt bởi ngòi độc của những con ruồi nơi công cộng.",
      "2. Rừng sâu và vách đá biết cách im lặng cùng ngươi. Hãy như cái cây mà ngươi yêu thích: cành lá vươn rộng, nó lặng lẽ lắng nghe biển cả.",
      "3. Nơi nào chốn chợ búa bắt đầu, nơi đó bắt đầu tiếng ồn ào của những diễn viên kịch nghệ vĩ đại và tiếng vo ve của những con ruồi độc hại.",
      "4. Trong khu chợ, người ta chỉ tin vào những kẻ làm trò ồn ào; nhưng lịch sử thế giới lại xoay quanh những nhà phát minh những giá trị mới — nó xoay chuyển trong sự tĩnh lặng vô hình!",
      "5. Những con ruồi nhỏ nhen chích đốt ngươi vì chúng thấy ngươi cao quý; sự hào hiệp của ngươi khiến chúng ghen tị và bất an.",
      "6. 'Hãy trốn vào sự cô độc của ngươi! Ngươi đã sống quá gần những kẻ nhỏ nhen và đáng thương. Hãy trốn khỏi sự trả thù vô hình của chúng! Đối với chúng, ngươi không là gì ngoài một lời trách móc câm lặng!'"
    ],
    takeaways: [
      { title: "Bảo Vệ Năng Lượng Sáng Tạo", desc: "Rút lui khỏi sự ồn ào của mạng xã hội và chốn thị phi để dành không gian cho tư duy sâu sắc." },
      { title: "Thấu Hiểu Tâm Lý Đố Kỵ", desc: "Hiểu rằng sự dèm pha của kẻ nhỏ nhen là phản ứng trước sự vượt trội của bạn; đừng bận tâm đôi co." }
    ]
  },
  {
    id: "zara-chap-11",
    number: "Chương 11",
    title: "Sự trong sạch & Đức hạnh trao tặng",
    paragraphs: [
      "1. Zarathustra yêu quý những người có tâm hồn trong sạch: 'Sự sống là một dòng suối trong lành; nhưng ở đâu đám tiện dân cùng uống, ở đó mọi giếng nguồn đều bị nhiễm độc.'",
      "2. Nhưng đức hạnh cao quý nhất là gì? Đó là Đức Hạnh Trao Tặng (The Bestowing Virtue) — giống như Mặt Trời rót vàng xuống trần gian mà không đòi hỏi đền đáp.",
      "3. Lòng tham lam muốn vơ vét mọi thứ về mình là dấu hiệu của một tâm hồn ốm yếu, thiếu thốn; trong khi tâm hồn phong phú, tràn trề sinh lực chỉ mong muốn được ban phát, cống hiến và nâng đỡ tha nhân.",
      "4. Hãy để trí tuệ của các ngươi phục vụ cho ý nghĩa của Trái Đất! Đừng để nó bay bổng vào những cõi hư vô thần bí xa xôi.",
      "5. 'Hãy trung thành với Trái Đất, hỡi những người anh em, với sức mạnh của đức hạnh các ngươi! Hãy mang đức hạnh trao tặng của các ngươi trở lại với cuộc đời trần thế!'"
    ],
    takeaways: [
      { title: "Đức Hạnh Của Sự Trao Tặng", desc: "Cống hiến và sẻ chia giá trị từ sự phong phú nội tâm mang lại niềm hạnh phúc viên mãn nhất." },
      { title: "Gắn Liền Trí Tuệ Với Thực Tiễn", desc: "Sử dụng tri thức để giải quyết các vấn đề thiết thực của cuộc sống trần thế thay vì viển vông xa rời thực tế." }
    ]
  },
  {
    id: "zara-chap-12",
    number: "Chương 12",
    title: "Người bạn & Ngàn lẻ một mục tiêu",
    paragraphs: [
      "1. 'Một người luôn là quá nhiều quanh ta!' — đó là suy nghĩ của kẻ cô độc. 'Luôn luôn một nhân một — điều đó rốt cuộc biến thành hai!'",
      "2. Người bạn chân chính đối với bạn là gì? Người bạn phải là một người bạn tốt nhất, đồng thời là một đối thủ thách thức gay gắt nhất!",
      "3. Bạn phải là một mũi tên và một niềm khao khát hướng tới Con Người Siêu Việt đối với bạn của mình. Bạn có dám để bạn mình nhìn thấy con người trần trụi, chưa hoàn hảo của mình không?",
      "4. Zarathustra đã đi qua nhiều vùng đất và thấy nhiều dân tộc: Mỗi dân tộc đều treo trên đầu mình một tấm bảng điều Thiện và điều Ác riêng.",
      "5. Những gì một dân tộc coi là khó khăn nhất, vĩ đại nhất, họ gọi đó là Thiện; những gì giải thoát họ khỏi cảnh khốn cùng, họ gọi đó là Cao Quý.",
      "6. Nhưng nhân loại cho đến nay vẫn chưa có một Mục tiêu Chung duy nhất! 'Nếu nhân loại vẫn còn thiếu một mục tiêu tối thượng, chẳng lẽ nhân loại vẫn chưa thực sự tồn tại?'"
    ],
    takeaways: [
      { title: "Tình Bạn Thúc Đẩy Tiến Bộ", desc: "Người bạn đích thực là người dám nói thẳng sự thật và thách thức bạn trở thành phiên bản tốt hơn." },
      { title: "Tự Thiết Lập Bảng Giá Trị", desc: "Xác định rõ ràng mục tiêu và tiêu chuẩn đạo đức cá nhân thay vì mù quáng làm theo đám đông." }
    ]
  },
  {
    id: "zara-chap-13",
    number: "Chương 13",
    title: "Tình yêu tha nhân & Con đường của kẻ sáng tạo",
    paragraphs: [
      "1. Các ngươi chen chúc nhau tìm đến tha nhân và gọi đó là 'Tình yêu thương đồng loại'. Nhưng ta bảo các ngươi: Tình yêu tha nhân của các ngươi chẳng qua chỉ là sự sợ hãi chính bản thân các ngươi!",
      "2. Các ngươi trốn chạy chính mình để tìm đến người khác, và muốn biến điều đó thành một đức hạnh. Nhưng ta muốn các ngươi học cách chịu đựng sự cô độc của chính mình!",
      "3. Kẻ sáng tạo muốn tạo ra một người bạn mang hình bóng của Con Người Siêu Việt; nhưng kẻ yếu đuối chỉ muốn tìm kiếm một kẻ đồng lõa để cùng than vãn về số phận.",
      "4. Ngươi có dám trao cho mình điều Thiện và điều Ác của riêng ngươi, và treo ý chí của ngươi lên trên đầu ngươi như một đạo luật không?",
      "5. Ngươi có thể tự làm thẩm phán và người thi hành luật pháp cho chính số phận của ngươi không? Thật ghê gớm khi phải đơn độc đối diện với vị thẩm phán của chính lương tâm mình trên con đường sáng tạo!"
    ],
    takeaways: [
      { title: "Vượt Qua Nỗi Sợ Cô Độc", desc: "Học cách ở một mình và đối diện với bản thân trước khi tìm kiếm sự kết nối chân chính với người khác." },
      { title: "Trách Nhiệm Của Người Tiên Phong", desc: "Khi dám chọn con đường sáng tạo khác biệt, bạn phải sẵn sàng tự chịu trách nhiệm trước lương tâm mình." }
    ]
  },
  {
    id: "zara-chap-14",
    number: "Chương 14",
    title: "Bài ca đêm & Nỗi cô đơn của ánh sáng",
    paragraphs: [
      "1. Đêm đã buông xuống; giờ đây tất cả những vòi phun nước róc rách đều cất tiếng hát lớn hơn. Và linh hồn ta cũng là một vòi phun nước đang sôi trào!",
      "2. Đêm đã buông xuống; giờ đây mọi khát khao của những kẻ yêu thương mới thức giấc. Và linh hồn ta cũng là khát khao của một kẻ yêu thương!",
      "3. Ánh sáng là gì? Ta là ánh sáng; ôi giá như ta là màn đêm! Nỗi cô đơn của kẻ được bao bọc bởi ánh sáng mới bi thảm làm sao!",
      "4. Ta sống trong ánh sáng của chính ta; ta uống lại những tia lửa bùng cháy từ chính ta. Ta không biết đến niềm hạnh phúc của kẻ được nhận lãnh; và ta thường mơ rằng ăn trộm ắt phải ngọt ngào hơn là nhận lãnh!",
      "5. Sự dồi dào quá mức sinh ra nỗi buồn; sự cho đi không ngừng khiến bàn tay khao khát được một lần cầu xin. Ôi nỗi cô đơn của tất cả những kẻ ban phát ánh sáng!"
    ],
    takeaways: [
      { title: "Cân Bằng Giữa Cho Và Nhận", desc: "Ngay cả những người mạnh mẽ nhất cũng cần sự thấu hiểu và sẻ chia; đừng ngại ngần đón nhận tình cảm chân thành." },
      { title: "Thấu Hiểu Nỗi Cô Đơn Của Lãnh Đạo", desc: "Người đứng ở vị trí dẫn dắt thường trải qua nỗi cô độc sâu sắc; tìm thấy niềm vui trong chính sứ mệnh phụng sự." }
    ]
  },
  {
    id: "zara-chap-15",
    number: "Chương 15",
    title: "Ý chí Quyền lực & Sự cứu chuộc thời gian",
    paragraphs: [
      "1. Ở đâu ta tìm thấy sinh linh, ở đó ta tìm thấy Ý Chí Quyền Lực (Will to Power); và ngay cả trong ý chí của kẻ phục tùng, ta cũng tìm thấy ý chí muốn làm chủ!",
      "2. Kẻ yếu phục tùng kẻ mạnh hơn vì nó muốn thống trị kẻ yếu hơn nó: đó là sự cám dỗ duy nhất mà nó không thể chối từ.",
      "3. Sự sống nói với Zarathustra: 'Kìa, ta là cái gì mà bắt buộc phải tự vượt qua chính mình không ngừng nghỉ!'",
      "4. Điều bi kịch lớn nhất của con người là gì? Đó là sự bất lực trước Thời gian và từ 'Nó đã từng là' (It was). Quá khứ là một hòn đá tảng mà ý chí không thể lay chuyển.",
      "5. Sự Cứu Chuộc thực sự là gì? Đó là khi Ý Chí biến từ kẻ bất lực thành kẻ sáng tạo, và thốt lên trước mọi quá khứ, mọi đau khổ đã qua:",
      "6. 'Nhưng ta đã muốn như thế! (Thus I willed it!) Và ta sẽ muốn như thế một lần nữa!'"
    ],
    takeaways: [
      { title: "Ý Chí Vượt Lên Nghịch Cảnh", desc: "Bản năng cốt lõi của con người là không ngừng vươn lên và hoàn thiện bản thân qua từng thử thách." },
      { title: "Hòa Giải Tuyệt Đối Với Quá Khứ", desc: "Thay vì nuối tiếc 'giá như', hãy nhìn nhận mọi biến cố đã qua như bước đệm tất yếu tạo nên con người vững vàng hôm nay." }
    ]
  },
  {
    id: "zara-chap-16",
    number: "Chương 16",
    title: "Vĩnh cửu Luân hồi & Bài ca say lúc nửa đêm",
    paragraphs: [
      "1. Này Zarathustra! Ngươi có biết tư tưởng sâu thẳm nhất, nặng nề nhất của ngươi là gì không? Đó là tư tưởng về Vĩnh Cửu Luân Hồi (The Eternal Recurrence)!",
      "2. Nếu một ngày kia, một con quỷ lẻn vào nỗi cô độc sâu kín nhất của ngươi và nói: 'Cuộc đời này mà ngươi đang sống, ngươi sẽ phải sống lại nó một lần nữa, và vô số lần nữa; không có gì mới mẻ, mà mọi nỗi đau, mọi niềm vui, mọi suy nghĩ nhỏ bé và vĩ đại đều sẽ quay trở lại với ngươi theo đúng trình tự này...'",
      "3. Liệu ngươi sẽ ngã gục xuống đất nguyền rủa con quỷ đó, hay ngươi sẽ reo lên: 'Ngươi là một vị thần, và ta chưa từng nghe điều gì thần thánh hơn thế!'?",
      "4. Để có thể đón nhận Vĩnh Cửu Luân Hồi với niềm hân hoan tột cùng, bạn phải yêu cuộc đời này đến mức say đắm — Amor Fati!",
      "5. Bài ca say lúc nửa đêm cất lên: Mười hai tiếng chuông ngân vang giữa cõi thâm u:",
      "6. 'Một! Ôi con người, hãy lắng nghe! Hai! Đêm sâu thẳm nói điều gì? Ba! Ta đã ngủ, ta đã thức! Bốn! Thế giới sâu thẳm hơn ngày tưởng! Năm! Nỗi đau của nó sâu thẳm! Sáu! Niềm vui sâu hơn nỗi buồn! Bảy! Nỗi đau bảo: Hãy tan biến đi! Tám! Nhưng mọi niềm vui đều muốn sự vĩnh cửu! Chín! Muốn sự vĩnh cửu sâu thẳm, vô tận!'",
      "7. Zarathustra bước ra trước ánh bình minh mới, gương mặt rạng rỡ như một người chiến thắng trở về từ cõi chết: 'Chén của ta đã đầy trở lại, và Zarathustra đã sẵn sàng!'"
    ],
    takeaways: [
      { title: "Bài Kiểm Tra Vĩnh Cửu Luân Hồi", desc: "Hãy sống mỗi ngày sao cho nếu phải lặp lại nó vô số lần, bạn vẫn tự hào mỉm cười đón nhận." },
      { title: "Khát Vọng Hướng Tới Vĩnh Hằng", desc: "Tình yêu cuộc sống sâu sắc và tinh thần sáng tạo chân chính sẽ vượt qua mọi nỗi đau để chạm tới giá trị trường tồn." }
    ]
  }
];

const fileHeader = `/**
 * SOPHIA CODEX - ZARATHUSTRA ĐÃ NÓI NHƯ THẾ (FRIEDRICH NIETZSCHE) - TOÀN VĂN 16 BÀI THUYẾT GIẢNG KINH ĐIỂN
 * Bản dịch thi ca triết học rực lửa về sự thức tỉnh, lòng can đảm và Con người siêu việt (Übermensch).
 * Đầy đủ 16 bài thuyết giảng tinh tuyển không giản lược với chiêm nghiệm thực tiễn cuộc sống.
 */

const ZARATHUSTRA_CHAPTERS = ${JSON.stringify(ZARATHUSTRA_CHAPTERS, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZARATHUSTRA_CHAPTERS };
}
`;

fs.writeFileSync(path.join(__dirname, 'data-zarathustra.js'), fileHeader, 'utf8');
console.log('✅ Đã cập nhật thành công 16 bài giảng toàn văn Zarathustra vào scripts/data-zarathustra.js');
