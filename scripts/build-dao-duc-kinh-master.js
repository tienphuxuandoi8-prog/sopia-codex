/**
 * MASTER GENERATOR FOR ĐẠO ĐỨC KINH (LÃO TỬ - TAO TE CHING)
 * TRỌN BỘ 81 CHƯƠNG TOÀN VĂN CHUẨN XÁC, CHI TIẾT 100%:
 * 1. Chữ Hán nguyên bản (Văn ngôn cổ)
 * 2. Phiên âm Hán - Việt kinh điển
 * 3. Bản dịch nghĩa toàn văn tinh hoa, sâu sắc
 * 4. Bình giảng triết học chuyên sâu và chú giải cội nguồn Đạo gia
 * 5. Chiêm nghiệm thực tiễn & Ứng dụng quản trị, đời sống hiện đại
 */

const fs = require('fs');
const path = require('path');

// Định nghĩa dữ liệu 81 chương toàn hảo
const CHAPTERS_RAW = [
  // ================= THƯỢNG KINH: ĐẠO KINH (CHƯƠNG 1 - 37) =================
  {
    num: 1,
    title: "Thể Đạo (Bản thể của Đạo - Khởi nguyên trời đất)",
    han: "道可道，非常道。名可名，非常名。無名天地之始；有名萬物之母。故常無，欲以觀其妙；常有，欲以觀其徼。此兩者，同出而異名，同謂之玄。玄之又玄，眾妙之門。",
    am: "Đạo khả đạo, phi thường Đạo. Danh khả danh, phi thường Danh. Vô danh thiên địa chi thủy; hữu danh vạn vật chi mẫu. Cố thường vô, dục dĩ quan kỳ diệu; thường hữu, dục dĩ quan kỳ kiệu. Thử lưỡng giả, đồng xuất nhi dị danh, đồng vị chi huyền. Huyền chi hựu huyền, chúng diệu chi môn.",
    dich: "Đạo mà có thể dùng lời để nói ra được, thì không còn là Đạo vĩnh cửu bất biến (Thường Đạo). Tên mà có thể gọi ra thành tiếng được, không còn là cái Tên thường hằng nguyên bản. Không tên (Vô danh) là cội nguồn khởi đầu của trời đất; Có tên (Hữu danh) là mẹ sinh dưỡng muôn loài vạn vật. Cho nên, thường giữ lòng 'Không' (Vô) để chiêm ngưỡng điều huyền diệu nhiệm màu; thường giữ lòng 'Có' (Hữu) để quan sát ranh giới bờ cõi của vạn vật. Cả hai cùng xuất phát từ một nguồn cội mà khác tên gọi, đều được gọi là sâu thẳm nhiệm màu (Huyền). Huyền diệu lại thêm huyền diệu, đó chính là cánh cửa mở vào mọi điều vi diệu khôn lường của vũ trụ.",
    binh: "Chương mở đầu đặt nền tảng tối thượng cho toàn bộ triết học Đạo gia. Lão Tử chỉ ra rằng chân lý tối hậu của vũ trụ là siêu việt ngôn ngữ và ý niệm phàm trần. Ngôn từ của con người chỉ là công cụ quy ước hạn hẹp, không thể đóng khung bản thể vô cùng của Đạo. 'Vô' và 'Hữu' không đối lập triệt tiêu nhau mà là hai mặt của một thực tại: 'Vô' là thể tính vô hình dung nạp tất cả, 'Hữu' là tướng trạng sinh sôi nuôi dưỡng vạn vật. Người đắc Đạo biết dùng cái tâm rỗng lặng để nhìn thấu bản chất sâu xa của cuộc đời.",
    takeaways: [
      { title: "Hạ Bớt Cái Tôi 'Biết Tuốt'", desc: "Chân lý cuộc sống quá rộng lớn; giữ tâm thế khiêm nhường học hỏi như một chiếc ly rỗng đón nhận kiến thức mới." },
      { title: "Tâm Tĩnh Mới Thấy Bản Chất", desc: "Khi tâm trí không vướng bận định kiến, những nút thắt khó khăn trong công việc sẽ tự khắc sáng tỏ." }
    ]
  },
  {
    num: 2,
    title: "Dưỡng Thân (Tính tương đối & Biện chứng vô vi)",
    han: "天下皆知美之為美，斯惡已。皆知善之為善，斯不善已。故有無相生，難易相成，長短相較，高下相傾，音聲相和，前後相隨。是以聖人處無為之事，行不言之教；萬物作焉而不辭，生而不有，為而不恃，功成而弗居。夫唯弗居，是以不去。",
    am: "Thiên hạ giai tri mỹ chi vi mỹ, tư ác dĩ. Giai tri thiện chi vi thiện, tư bất thiện dĩ. Cố hữu vô tương sinh, nan dị tương thành, trường đoản tương giác, cao hạ tương khuynh, âm thanh tương hòa, tiền hậu tương tùy. Thị dĩ thánh nhân xử vô vi chi sự, hành bất ngôn chi giáo; vạn vật tác yên nhi bất từ, sinh nhi bất hữu, vi nhi bất thị, công thành nhi phất cư. Phù duy phất cư, thị dĩ bất khứ.",
    dich: "Thiên hạ đều biết cái Đẹp là đẹp, thế là đã nảy sinh cái Xấu; đều biết điều Thiện là thiện, thế là đã có điều Bất thiện. Cho nên Có và Không cùng sinh ra nhau; Khó và Dễ cùng tạo nên nhau; Dài và Ngắn cùng làm rõ nhau; Cao và Thấp cùng tựa vào nhau; Tiếng và Giọng cùng hòa quyện với nhau; Trước và Sau cùng nối tiếp nhau. Vì vậy, bậc Thánh nhân làm việc theo phép 'Vô vi' (thuận tự nhiên, không cưỡng cầu tư lợi), dùng lời dạy không lời để giáo hóa; vạn vật sinh sôi mà không can thiệp ép buộc, sinh dưỡng mà không chiếm làm của riêng, làm nên việc mà không cậy công, thành công rồi mà không ở lại thụ hưởng. Chính vì không ở lại nhận công, nên công đức muôn đời không bao giờ mất đi.",
    binh: "Lão Tử nêu bật quy luật nhị nguyên tương đãi của nhận thức con người: mọi phán xét đẹp-xấu, thiện-ác, cao-thấp đều mang tính tương đối. Khi con người càng cố chấp áp đặt định kiến duy ý chí, xung đột xã hội càng bùng phát. Bậc minh triết ứng xử bằng tinh thần 'Vô vi' — hành động thuận theo quy luật khách quan, dốc lòng cống hiến mà buông bỏ chấp niệm tranh công đoạt lợi.",
    takeaways: [
      { title: "Nhìn Nhận Đa Chiều Về Được - Mất", desc: "Thuận lợi và khó khăn luôn đi liền nhau; bình tâm trước biến cố vì trong nghịch cảnh luôn ẩn chứa mầm mống cơ hội." },
      { title: "Lãnh Đạo Theo Tinh Thần Vô Vi", desc: "Tạo môi trường thuận lợi cho cộng sự phát huy năng lực thay vì kiểm soát tiểu tiết hay tranh giành thành quả." }
    ]
  },
  {
    num: 3,
    title: "An Dân (Không chuộng hư danh, lòng dân thanh thản)",
    han: "不尚賢，使民不爭；不貴難得之貨，使民不為盜；不見可欲，使民心不亂。是以聖人之治，虛其心，實其腹；弱其志，強其骨。常使民無知無欲，使夫知者不敢為也。為無為，則無不治。",
    am: "Bất thượng hiền, sử dân bất tranh; bất quý nan đắc chi hóa, sử dân bất vi đạo; bất kiến khả dục, sử dân tâm bất loạn. Thị dĩ thánh nhân chi trị, hư kỳ tâm, thực kỳ phúc; nhược kỳ chí, cường kỳ cốt. Thường sử dân vô tri vô dục, sử phù tri giả bất cảm vi dã. Vi vô vi, tắc vô bất trị.",
    dich: "Không suy tôn kẻ hiền tài giả tạo thì dân không tranh giành; Không quý của cải hiếm có thì dân không trộm cướp; Không phô bày điều tham dục thì lòng dân không bị rối loạn. Bởi vậy, bậc Thánh nhân trị nước: Làm cho lòng họ trống rỗng thanh thản mà bụng họ no ấm; làm cho ý chí tranh đoạt mềm dịu mà xương cốt cứng cáp khỏe mạnh. Thường khiến cho người dân giữ sự thuần phác, không mưu mô vụ lợi; khiến kẻ xảo trá không dám làm càn. Làm theo phép Vô vi thì không việc gì là không yên ổn trật tự.",
    binh: "Lão Tử phê phán thói chuộng hư danh và thói xa hoa giả tạo của giới cầm quyền thời Chiến Quốc. Xã hội hỗn loạn bắt nguồn từ lòng tham không đáy và sự cổ xúy lối sống phô trương vật chất. Nghệ thuật quản trị đỉnh cao là lo cho dân chúng có đời sống ấm no, sức khỏe vững bền và tâm hồn trong sáng, không bị cuốn vào vòng xoáy so bì danh lợi.",
    takeaways: [
      { title: "Bớt So Sánh, Thêm Bình Yên", desc: "Giảm bớt thời gian lướt mạng xã hội xem phô trương của cải; tập trung chăm sóc sức khỏe thể chất và nội tâm bình an." },
      { title: "Đơn Giản Hóa Mục Tiêu Sống", desc: "Tập trung vào những giá trị nền tảng cốt lõi: thân thể khỏe mạnh, gia đình êm ấm, trí tuệ sáng suốt." }
    ]
  },
  {
    num: 4,
    title: "Bất Doanh (Đạo trống không khôn lường)",
    han: "道沖而用之或不盈。淵兮似萬物之宗。挫其銳，解其紛；和其光，同其塵。湛兮似或存。吾不知誰之子，象帝之先。",
    am: "Đạo xung nhi dụng chi hoặc bất doanh. Uyên hề tự vạn vật chi tông. Tỏa kỳ nhuệ, giải kỳ phân; hòa kỳ quang, đồng kỳ trần. Trạm hề tự hoặc tồn. Ngô bất tri thùy chi tử, tượng Đế chi tiên.",
    dich: "Đạo trống không như vực thẳm thăm thẳm, nhưng dùng mãi mà không bao giờ vơi cạn. Sâu xa khôn lường dường như là tổ tiên nguồn cội của muôn loài vạn vật. Nó mài nhẵn các góc nhọn gay gắt, tháo gỡ mọi nút thắt rắc rối rối ren; hòa cùng ánh sáng rực rỡ, đồng nhất cùng cát bụi trần gian. Lặng lẽ trong trẻo dường như hằng còn mãi. Ta không biết Đạo sinh ra từ đâu, dường như có trước cả Thượng đế tạo hóa.",
    binh: "Khái niệm 'Hòa quang đồng trần' (hòa cùng ánh sáng, lẫn vào cát bụi) là tư tưởng xử thế trứ danh của Đạo gia. Bậc đắc Đạo không cần phô trương sắc nhọn gay gắt, không kiêu ngạo đứng trên người khác, mà hòa mình bình dị vào cuộc đời trần thế, từ bi tháo gỡ những xung đột phức tạp bằng sự điềm tĩnh vô song.",
    takeaways: [
      { title: "Hòa Quang Đồng Trần", desc: "Dù tài giỏi đến đâu cũng giữ thái độ nhã nhặn, chan hòa với đồng nghiệp; không tỏ vẻ ta đây vượt trội." },
      { title: "Tháo Gỡ Nút Thắt Bằng Điềm Tĩnh", desc: "Khi đối mặt xung đột căng thẳng, giữ tâm thế ôn hòa mài bớt góc nhọn để giải quyết vấn đề tận gốc rễ." }
    ]
  },
  {
    num: 5,
    title: "Hư Dụng (Trời đất vô tư, coi vạn vật như chó rơm)",
    han: "天地不仁，以萬物為芻狗；聖人不仁，以百姓為芻狗。天地之間，其猶橐籥乎？虛而不屈，動而愈出。多言數窮，不如守中。",
    am: "Thiên địa bất nhân, dĩ vạn vật vi sô cẩu; thánh nhân bất nhân, dĩ bách tính vi sô cẩu. Thiên địa chi gian, kỳ do thác thược hồ? Hư nhi bất khuất, động nhi dũ xuất. Đa ngôn sổ cùng, bất như thủ trung.",
    dich: "Trời đất không có lòng nhân riêng tư (bất nhân), coi vạn vật bình đẳng như chó rơm tế lễ; Bậc Thánh nhân không có lòng thiên vị vị kỷ, coi trăm họ công bằng tự nhiên như chó rơm. Khoảng không gian giữa trời và đất chẳng giống như chiếc ống bễ lò rèn hay sao? Trống rỗng bên trong mà sức lực không bao giờ cùng kiệt, càng chuyển động khí gió lại càng thổi ra mạnh mẽ. Nói nhiều thì mau lâm vào cảnh cùng quẫn bế tắc, chẳng bằng giữ lòng hư tĩnh trung chính (Thủ trung).",
    binh: "'Trời đất bất nhân' không phải là sự tàn nhẫn, mà là sự công bình tuyệt đối vô tư của quy luật tự nhiên. Tự nhiên không ưu ái ai và cũng không ghét bỏ ai; mặt trời mọc cho người lành lẫn kẻ xấu. Bậc lãnh đạo công chính không dùng cảm xúc yêu-ghét cá nhân để thiên vị, mà tôn trọng sự phát triển tự nhiên của từng thành viên.",
    takeaways: [
      { title: "Sự Công Tâm Trong Quản Trị", desc: "Lãnh đạo bằng sự công bằng minh bạch, không thiên vị cảm tính bè phái; tạo cơ hội đồng đều cho mọi người." },
      { title: "Giữ Lòng Trung Chính (Thủ Trung)", desc: "Tránh nói nhiều hứa suông; giữ sự điềm tĩnh và chừng mực trong lời ăn tiếng nói hàng ngày." }
    ]
  },
  {
    num: 6,
    title: "Thành Tượng (Huyền tẫn chi môn - Cội nguồn sinh hóa)",
    han: "谷神不死，是謂玄牝。玄牝之門，是謂天地根。綿綿若存，用之不勤。",
    am: "Cốc thần bất tử, thị vị huyền tẫn. Huyền tẫn chi môn, thị vị thiên địa căn. Miên miên nhược tồn, dụng chi bất cần.",
    dich: "Thần linh của thung lũng (khoảng trống tĩnh lặng) không bao giờ chết, gọi là Mẹ nhiệm màu (Huyền tẫn). Cửa của người Mẹ nhiệm màu ấy chính là gốc rễ cội nguồn của trời đất. Mênh mang vĩnh hằng như còn mãi, dùng hoài mà không bao giờ mỏi mệt kiệt cùng.",
    binh: "Hình tượng 'thung lũng' (Cốc thần) và 'người Mẹ nhiệm màu' (Huyền tẫn) biểu trưng cho nguyên lý Nhu thuận, Rỗng không và Năng lực sinh thành bất tận của Đạo. Khác với tư duy chuộng sức mạnh cơ bắp và sự cứng rắn thô bạo, Đạo gia tôn vinh năng lượng tĩnh tại, bao dung như đất mẹ.",
    takeaways: [
      { title: "Sức Mạnh Của Sự Nhẫn Nại Rỗng Lặng", desc: "Học cách lắng nghe sâu như thung lũng đón nhận mọi dòng suối đổ về; tiếp nhận ý kiến đóng góp đa chiều." },
      { title: "Duy Trì Năng Lượng Bền Vững", desc: "Không làm việc kiệt quệ mất kiểm soát; duy trì nhịp độ làm việc bền bỉ (miên miên nhược tồn) để đi đường dài." }
    ]
  },
  {
    num: 7,
    title: "Thao Quang (Trời đất trường cửu vì không sống cho mình)",
    han: "天長地久。天地所以能長且久者，以其不自生，故能長生。是以聖人後其身而身先，外其身而身存。非以其無私邪？故能成其私。",
    am: "Thiên trường địa cửu. Thiên địa sở dĩ năng trường thả cửu giả, dĩ kỳ bất tự sinh, cố năng trường sinh. Thị dĩ thánh nhân hậu kỳ thân nhi thân tiên, ngoại kỳ thân nhi thân tồn. Phi dĩ kỳ vô tư tà? Cố năng thành kỳ tư.",
    dich: "Trời dài đất lâu. Trời đất sở dĩ có thể trường tồn dài lâu là vì không sống cho riêng mình, cho nên mới sống lâu mãi mãi. Vì vậy bậc Thánh nhân đặt mình ra phía sau mà lại được ở phía trước, coi nhẹ thân mình bên ngoài mà thân mình lại được bảo tồn. Chẳng phải vì bậc ấy không mưu cầu tư lợi ích kỷ hay sao? Chính vì vô tư nên mới thành tựu được sự nghiệp vĩ đại của mình.",
    binh: "Một nghịch lý triết học sâu sắc: Càng ích kỷ bo bo giữ mình thì càng nhanh tàn lụi; càng vị tha phụng sự cộng đồng thì uy tín và tầm ảnh hưởng càng trường tồn. Bậc lãnh đạo đích thực là người nâng đỡ người khác lên trước, sẵn sàng nhận phần trách nhiệm về mình, từ đó chiếm trọn niềm tin yêu của tập thể.",
    takeaways: [
      { title: "Lãnh Đạo Bằng Sự Phụng Sự (Servant Leadership)", desc: "Đặt lợi ích của đội ngũ và khách hàng lên trên tư lợi cá nhân; thành công của tập thể sẽ nâng tầm bạn." },
      { title: "Không Tranh Giành Vị Trí Trước", desc: "Khiêm tốn lùi lại hỗ trợ người khác; năng lực và sự tử tế thực chất sẽ tự khắc đưa bạn lên vị trí xứng đáng." }
    ]
  },
  {
    num: 8,
    title: "Dị Tính (Thượng thiện nhược thủy - Đức cao như nước)",
    han: "上善若水。水善利萬物而不爭，處眾人之所惡，故幾於道。居善地，心善淵，與善仁，言善信，政善治，事善能，動善時。夫唯不爭，故無尤。",
    am: "Thượng thiện nhược thủy. Thủy thiện lợi vạn vật nhi bất tranh, xử chúng nhân chi sở ố, cố cơ vu Đạo. Cư thiện địa, tâm thiện uyên, dữ thiện nhân, ngôn thiện tín, chính thiện trị, sự thiện năng, động thiện thời. Phù duy bất tranh, cố vô ưu.",
    dich: "Điều thiện lành cao nhất giống như Nước. Nước khéo làm lợi cho muôn loài vạn vật mà không bao giờ tranh giành, lại bằng lòng ở chỗ thấp hèn mà mọi người đều ghê ghét, cho nên Nước gần gũi với Đạo nhất. Chọn chỗ ở khéo chọn nơi đất thấp thích hợp; Nuôi dưỡng tâm khéo giữ sự sâu thẳm tĩnh lặng; Đối xử với người khéo giữ lòng nhân từ nhân ái; Lời nói khéo giữ sự thành tín đáng tin cậy; Làm chính trị khéo giữ trật tự an bình; Làm việc khéo phát huy năng lực thích ứng; Hành động khéo chọn đúng thời cơ thích hợp. Chính vì không tranh giành với ai, nên không bao giờ gặp phải oán hận tai ương.",
    binh: "Chương kinh điển nhất của Đạo Đức Kinh mô tả 7 phẩm chất tuyệt hảo của Nước: thích ứng linh hoạt với mọi hình dạng bình chứa, nuôi dưỡng vạn vật mà không đòi hỏi đền đáp, nhún nhường ở chỗ trũng thấp. Sức mạnh của nước là nhu hòa nhưng có thể bào mòn đá tảng cứng nhất. Không tranh giành không phải là nhu nhược, mà là đỉnh cao của trí tuệ phòng tránh rủi ro.",
    takeaways: [
      { title: "Học Phẩm Chất Của Nước", desc: "Linh hoạt thích ứng với hoàn cảnh thay đổi; bền bỉ kiên trì vượt qua chướng ngại mà không đối đầu hung hãn." },
      { title: "Nắm Bắt Thời Cơ (Động Thiện Thời)", desc: "Kiên nhẫn chờ đợi thời điểm chín muồi để ra quyết định; hành động đúng lúc mang lại hiệu quả cao nhất." }
    ]
  },
  {
    num: 9,
    title: "Vận Di (Công thành thân thoái - Đầy thì tràn)",
    han: "持而盈之，不如其已；揣而銳之，不可長保。金玉滿堂，莫之能守；富貴而驕，自遺其咎。功成名遂身退，天之道也。",
    am: "Trì nhi doanh chi, bất như kỳ dĩ; suy nhi nhuệ chi, bất khả trường bảo. Kim ngọc mãn đường, mạc chi năng thủ; phú quý nhi kiêu, tự di kỳ cữu. Công thành danh toại thân thoái, thiên chi đạo dã.",
    dich: "Cầm giữ chén nước mà rót cho đầy ắp, chẳng bằng dừng lại đúng lúc; Mài lưỡi gươm cho thật sắc bén, không thể giữ bền được lâu dài. Vàng ngọc đầy nhà, không ai có thể canh giữ nổi; Giàu sang phú quý mà sinh lòng kiêu ngạo, là tự chuốc lấy tai họa cho mình. Công thành, danh toại rồi biết rút lui giữ mình (thân thoái), đó chính là Đạo của Trời đất vậy.",
    binh: "Quy luật tuần hoàn của vũ trụ: trăng tròn thì khuyết, nước đầy thì tràn, cực thịnh tất suy. Lão Tử khuyên con người phải biết điểm dừng (Tri chỉ), biết đủ (Tri túc). Khi đã hoàn thành sứ mệnh và đạt được đỉnh cao danh vọng, người khôn ngoan biết chuyển giao thế hệ, lui về giữ gìn nhân cách thanh sạch thay vì tham lam níu giữ quyền lực đến lúc sụp đổ.",
    takeaways: [
      { title: "Biết Dừng Đúng Lúc (Tri Chỉ)", desc: "Tránh lòng tham lam vô độ; hoàn thành mục tiêu rồi hãy biết trân trọng thành quả và chia sẻ cơ hội cho người sau." },
      { title: "Khiêm Tốn Khi Thành Đạt", desc: "Càng thành công càng phải khiêm nhường; kiêu ngạo tự mãn chính là khởi đầu của sự thất bại." }
    ]
  },
  {
    num: 10,
    title: "Năng Vi (Chuyên khí trí nhu - Ôm ấp linh hồn)",
    han: "載營魄抱一，能無離乎？專氣致柔，能如嬰兒乎？滌除玄覽，能無疵乎？愛國治民，能無為乎？天門開闔，能為雌乎？明白四達，能無知乎？生之畜之，生而不有，為而不恃，長而不宰，是謂玄德。",
    am: "Tái doanh phách bão nhất, năng vô ly hồ? Chuyên khí trí nhu, năng như anh nhi hồ? Địch trừ huyền lãm, năng vô tỳ hồ? Ái quốc trị dân, năng vô vi hồ? Thiên môn khai hạp, năng vi thư hồ? Minh bạch tứ đạt, năng vô tri hồ? Sinh chi súc chi, sinh nhi bất hữu, vi nhi bất thị, trưởng nhi bất tể, thị vị Huyền đức.",
    dich: "Giữ gìn hồn phách ôm ấp lấy cái Một (Đạo), liệu có thể không rời xa chăng? Gom tụ tinh khí đạt tới sự mềm dịu tuyệt đối, liệu có thể như đứa trẻ sơ sinh chăng? Gột rửa sạch tấm gương soi nội tâm nhiệm màu, liệu có thể không chút tì vết chăng? Yêu nước trị dân, liệu có thể theo phép Vô vi không cưỡng cầu chăng? Cửa trời đóng mở biến chuyển, liệu có thể giữ vai trò nhu thuận như chim mái chăng? Hiểu biết sáng suốt khắp bốn phương trời, liệu có thể giữ tâm không chấp trước mưu mẹo chăng? Sinh ra và nuôi dưỡng muôn loài, sinh sôi mà không chiếm làm của riêng, làm nên việc mà không cậy công lao, dẫn dắt nâng đỡ mà không làm bạo chúa thống trị, đó gọi là Đức sâu xa nhiệm màu (Huyền đức).",
    binh: "Lão Tử đưa ra 6 câu hỏi tự vấn lương tâm cho hành giả tu dưỡng. 'Huyền đức' là đức hạnh tối thượng: tạo dựng giá trị cho muôn loài nhưng hoàn toàn buông bỏ quyền sở hữu, không đòi hỏi sự quy phục hay tung hô. Trở về trạng thái hồn nhiên, mềm dẻo như đứa trẻ sơ sinh là đỉnh cao của sự tự do nội tâm.",
    takeaways: [
      { title: "Gột Rửa Tấm Gương Tâm Trí", desc: "Mỗi tối dành thời gian thanh lọc những suy nghĩ độc hại, thiên kiến giận dữ để giữ tâm hồn trong sáng không tì vết." },
      { title: "Huyền Đức Trong Lãnh Đạo", desc: "Đào tạo và nâng đỡ cấp dưới phát triển vượt bậc mà không tìm cách trói buộc hay kiểm soát họ." }
    ]
  },
  {
    num: 11,
    title: "Vô Dụng (Cái 'Không' mới là chỗ dùng)",
    han: "三十輻共一轂，當其無，有車之用。埏埴以為器，當其無，有器之用。鑿戶牖以為室，當其無，有室之用。故有之以為利，無之以為用。",
    am: "Tam thập bức cộng nhất cốc, đương kỳ vô, hữu xa chi dụng. Duyên thực dĩ vi khí, đương kỳ vô, hữu khí chi dụng. Tạc hộ dũ dĩ vi thất, đương kỳ vô, hữu thất chi dụng. Cố hữu chi dĩ vi lợi, vô chi dĩ vi dụng.",
    dich: "Ba mươi nan hoa cùng cắm vào một trục bánh xe, nhưng chính nhờ khoảng trống rỗng ở giữa trục mà xe mới lăn bánh được. Nhào nặn đất sét để làm nên chén bát đồ dùng, nhưng chính nhờ khoảng trống rỗng bên trong lòng bát mà đồ dùng mới chứa đựng được. Đục khoét cửa đi và cửa sổ để làm nên gian phòng, nhưng chính nhờ khoảng trống rỗng bên trong phòng mà căn phòng mới ở được. Cho nên, cái 'Có' (vật chất cụ thể) tạo ra điều tiện lợi, nhưng chính cái 'Không' (khoảng trống tĩnh lặng) mới là chỗ dùng đích thực.",
    binh: "Một trong những ẩn dụ vật lý - triết học thiên tài nhất của phương Đông: Con người thường chỉ nhìn thấy và tham lam tích trữ cái 'Hữu' (hình tướng, của cải, đồ vật), nhưng lại quên rằng giá trị sử dụng và sự linh hoạt cốt lõi lại nằm ở cái 'Vô' (khoảng trống). Tâm trí con người cũng vậy: nếu chứa đầy toan tính và định kiến chật ních thì không thể tiếp nhận thêm sự sáng tạo nào nữa.",
    takeaways: [
      { title: "Tạo Khoảng Trống Cho Tâm Trí", desc: "Dọn dẹp lịch làm việc bận rộn; để ra những khoảng trống không làm gì để tái tạo năng lượng và nảy sinh ý tưởng mới." },
      { title: "Lắng Nghe Không Định Kiến", desc: "Giữ tâm trí trống rỗng khi đối thoại để thấu hiểu trọn vẹn góc nhìn của người khác trước khi phản hồi." }
    ]
  },
  {
    num: 12,
    title: "Kiểm Dục (Ngũ sắc làm mù mắt, ngũ âm làm điếc tai)",
    han: "五色令人目盲；五音令人耳聾；五味令人口爽；馳騁畋獵，令人心發狂；難得之貨，令人行妨。是以聖人為腹不為目，故去彼取此。",
    am: "Ngũ sắc lệnh nhân mục manh; ngũ âm lệnh nhân nhĩ lung; ngũ vị lệnh nhân khẩu sảng; trì sính điền liệp, lệnh nhân tâm phát cuồng; nan đắc chi hóa, lệnh nhân hành phương. Thị dĩ thánh nhân vi phúc bất vi mục, cố khứ bỉ thủ thử.",
    dich: "Năm sắc màu rực rỡ khiến mắt người ta bị mờ đục; Năm cung bậc âm thanh ồn ào khiến tai người ta bị điếc lác; Năm vị nếm nồng đượm khiến miệng lưỡi người ta bị mất vị giác; Rong ruổi săn bắn rong chơi khiến lòng người phát cuồng loạn trí; Của cải quý hiếm khiến nết người ta sinh thói hư tật xấu trộm cướp. Bởi vậy bậc Thánh nhân chăm lo cho bụng no ấm (nhu cầu thực chất) chứ không mải miết chiều chuộng theo con mắt (ảo vọng hào nhoáng bên ngoài), cho nên gạt bỏ cái kia mà giữ lấy cái này.",
    binh: "Lời cảnh tỉnh sâu sắc về lối sống tiêu thụ quá độ và ô nhiễm giác quan. Thế giới hiện đại ngập tràn hình ảnh kích thích thị giác, âm thanh huyên náo và mạng xã hội làm con người kiệt quệ tinh thần. 'Vi phúc bất vi mục' nghĩa là tập trung vào nhu cầu cốt lõi nuôi dưỡng sinh mệnh đích thực thay vì chạy theo những ảo ảnh lấp lánh bên ngoài.",
    takeaways: [
      { title: "Thanh Lọc Giác Quan (Digital Detox)", desc: "Hạn chế tiêu thụ nội dung rác và thông tin giật gân; bảo vệ đôi mắt và đôi tai khỏi sự quá tải của thế giới số." },
      { title: "Tập Trung Nhu Cầu Thực Chất", desc: "Ưu tiên chi tiêu và sống vì sức khỏe, sự bình an thực sự thay vì chi tiền để gây ấn tượng với người khác." }
    ]
  },
  {
    num: 13,
    title: "Yểm Sỉ (Sủng nhục nhược kinh - Được chuộng hay bị nhục đều lo)",
    han: "寵辱若驚，貴大患若身。何謂寵辱若驚？寵為下，得之若驚，失之若驚，是謂寵辱若驚。何謂貴大患若身？吾所以有大患者，為吾有身，及吾無身，吾有何患？故貴以身為天下，若可寄天下；愛以身為天下，若可託天下。",
    am: "Sủng nhục nhược kinh, quý đại hoạn nhược thân. Hà vị sủng nhục nhược kinh? Sủng vi hạ, đắc chi nhược kinh, thất chi nhược kinh, thị vị sủng nhục nhược kinh. Hà vị quý đại hoạn nhược thân? Ngô sở dĩ hữu đại hoạn giả, vi ngô hữu thân, cập ngô vô thân, ngô hữu hà hoạn? Cố quý dĩ thân vi thiên hạ, nhược khả ký thiên hạ; ái dĩ thân vi thiên hạ, nhược khả thác thiên hạ.",
    dich: "Được sủng ái hay bị sỉ nhục đều lo sợ bàng hoàng; Coi mối tai họa lớn giống như chính thân thể mình. Thế nào là được sủng ái hay bị sỉ nhục đều lo sợ? Sủng ái là cái ở thế thấp hơn: Được khen thưởng sủng ái thì lo sợ giữ gìn, mất đi sự sủng ái thì lo sợ mất mát, thế gọi là được hay nhục đều lo sợ. Thế nào là coi tai họa lớn như chính thân thể mình? Sở dĩ ta có nỗi lo âu hoạn nạn lớn là vì ta quá bận tâm bám chấp vào cái thân này; nếu ta không còn chấp vào cái thân này nữa thì ta có tai họa gì đâu? Cho nên, ai biết quý trọng việc lấy thân mình cống hiến cho thiên hạ thì mới có thể giao phó thiên hạ cho người ấy; ai biết yêu thương thiên hạ như chính thân mình thì mới có thể ủy thác thiên hạ cho người ấy.",
    binh: "Tâm lý học về sự lệ thuộc vào lời khen chê của tha nhân. Khi bạn vui sướng vì được cấp trên khen ngợi và suy sụp khi bị khiển trách, bạn đã trao quyền kiểm soát cuộc đời mình cho người khác. Vượt qua sự chấp ngã vào thân xác và danh lợi giúp con người đạt được sự tự do tự tại, từ đó mới xứng đáng đảm nhận trọng trách dẫn dắt cộng đồng.",
    takeaways: [
      { title: "Thoát Khỏi Ách Khen - Chê", desc: "Giữ tâm thế độc lập trước lời tâng bốc lẫn lời chỉ trích; đánh giá bản thân bằng thước đo liêm chính nội tại." },
      { title: "Phụng Sự Không Màng Vị Kỷ", desc: "Làm việc vì trách nhiệm và lòng yêu thương cộng đồng; khi buông bỏ toan tính cá nhân, bạn sẽ được trao quyền lực lớn." }
    ]
  },
  {
    num: 14,
    title: "Tán Huyền (Nhìn không thấy gọi là Di, nghe không thấy gọi là Hi)",
    han: "視之不見名曰夷；聽之不聞名曰希；摶之不得名曰微。此三者不可致詰，故混而為一。其上不皦，其下不昧。繩繩不可名，復歸於無物。是謂無狀之狀，無物之象，是謂惚恍。迎之不見其首，隨之不見其後。執古之道，以御今之有。能知古始，是謂道紀。",
    am: "Thị chi bất kiến danh viết Di; thính chi bất văn danh viết Hi; đoàn chi bất đắc danh viết Vi. Thử tam giả bất khả trí cật, cố hỗn nhi vi nhất. Kỳ thượng bất khiếu, kỳ hạ bất muội. Thằng thằng bất khả danh, phục quy vu vô vật. Thị vị vô trạng chi trạng, vô vật chi tượng, thị vị hốt hoảng. Nghênh chi bất kiến kỳ thủ, tùy chi bất kiến kỳ hậu. Chấp cổ chi đạo, dĩ ngự kim chi hữu. Năng tri cổ thủy, thị vị Đạo kỷ.",
    dich: "Nhìn mà không thấy gọi là Di (vô sắc); Nghe mà không thấy tiếng gọi là Hi (vô thanh); Nắm bắt mà không được gọi là Vi (vô hình). Ba điều ấy không thể truy xét rạch ròi bằng giác quan thông thường, cho nên dung hợp lại thành cái Một. Phía trên không sáng chói rực rỡ, phía dưới không tăm tối mịt mù. Miên man vô tận không thể đặt tên, rốt cuộc lại quay trở về cõi không hình vật. Thế gọi là hình trạng của cái không hình dạng, hình tượng của cái không có vật thể, mờ ảo chập chờn khôn lường. Đón phía trước không thấy đầu mối, đi theo phía sau không thấy lưng đuôi. Nắm giữ Đạo xưa để điều khiển vạn vật ngày nay; Biết được cội nguồn khởi đầu từ thuở xưa, đó gọi là giềng mối của Đạo (Đạo kỷ).",
    binh: "Đạo vượt khỏi mọi phạm trù nhận thức cảm tính của con người: không màu, không tiếng, không hình. Nhưng Đạo không phải hư vô chết cứng, mà là quy luật vận hành xuyên suốt lịch sử vũ trụ. Bậc thức giả thấu hiểu quy luật cổ xưa ấy để ung dung ứng xử và giải quyết các bài toán phức tạp của thời đại hôm nay.",
    takeaways: [
      { title: "Thấu Hiểu Quy Luật Cốt Lõi (Đạo Kỷ)", desc: "Mọi hiện tượng xã hội và kinh doanh đều vận hành theo những quy luật muôn đời; nắm chắc bản chất để không bị bề nổi làm hoang mang." },
      { title: "Nhìn Vượt Ra Khỏi Bề Mặt Hữu Hình", desc: "Đừng chỉ đánh giá sự vật qua vẻ ngoài; những giá trị cốt lõi nhất (văn hóa, uy tín, niềm tin) đều là những thứ vô hình." }
    ]
  },
  {
    num: 15,
    title: "Hiển Đức (Bậc cổ nhân đắc Đạo: cẩn trọng như lội sông băng)",
    han: "古之善為士者，微妙玄通，深不可識。夫唯不可識，故強為之容：豫兮若冬涉川；猶兮若畏四鄰；儼兮其若客；渙兮若冰之將釋；敦兮其若樸；曠兮其若谷；混兮其若濁。孰能濁以靜之徐清？孰能安以久動之徐生？保此道者不欲盈。夫唯不盈，故能蔽不新成。",
    am: "Cổ chi thiện vi sĩ giả, vi diệu huyền thông, thâm bất khả thức. Phù duy bất khả thức, cố cưỡng vi chi dung: Dự hề nhược đông thiệp xuyên; do hề nhược úy tứ lân; nghiễm hề kỳ nhược khách; hoán hề nhược băng chi tương thích; đôn hề kỳ nhược phác; khoáng hề kỳ nhược cốc; hỗn hề kỳ nhược đục. Thục năng đục dĩ tĩnh chi từ thanh? Thục năng an dĩ cửu động chi từ sinh? Bảo thử đạo giả bất dục doanh. Phù duy bất doanh, cố năng tế bất tân thành.",
    dich: "Bậc học giả giỏi hành Đạo thuở xưa vi diệu huyền thông, sâu sắc đến mức người đời không thể đo lường thấu đáo. Chính vì không thể thấu suốt, nên chỉ có thể gượng tả dung mạo của họ: Cẩn trọng dè dặt như mùa đông bước qua sông băng nứt nẻ; Ngập ngừng thận trọng như e sợ láng giềng bốn bề dòm ngó; Trang nghiêm cung kính như một vị khách quý; Tan biến hòa nhập như tảng băng mùa xuân sắp tan; Mộc mạc chất phác như khúc gỗ chưa đẽo gọt; Rộng rãi bao la như thung lũng thâm u; Hỗn độn đục ngầu như dòng nước phù sa. Ai có thể để cho nước đục lắng dần xuống trong sự tĩnh lặng mà từ từ trở nên trong trẻo? Ai có thể làm cho sự yên tĩnh lâu ngày chuyển động từ từ mà sinh sôi sức sống mới? Người giữ Đạo này không bao giờ mong cầu đầy tràn. Chính vì không đầy tràn, nên có thể giữ sự giản dị trường tồn mà không cần làm mới phô trương.",
    binh: "Bức chân dung tuyệt mỹ về phong thái của một bậc chân nhân: cẩn trọng, khiêm nhu, tự nhiên và sâu sắc. Lão Tử đưa ra bí quyết tu dưỡng: 'Đục dĩ tĩnh chi từ thanh' — khi tâm trí đang rối bời đục ngầu, giải pháp không phải là quấy đảo thêm, mà là dừng lại, giữ sự tĩnh lặng tuyệt đối để mọi cặn bã tự lắng xuống đáy, trả lại sự sáng suốt tinh khôi.",
    takeaways: [
      { title: "Lắng Lòng Khi Khủng Hoảng", desc: "Khi tâm trí hoang mang, đừng vội đưa ra quyết định; giữ sự tĩnh lặng để cảm xúc lắng xuống, sự thật sẽ tự hiện rõ." },
      { title: "Thận Trọng Nhưng Linh Hoạt", desc: "Chu đáo trong từng bước đi như bước trên băng mỏng; không chủ quan khinh suất trước mọi thử thách." }
    ]
  },
  {
    num: 16,
    title: "Quy Căn (Trí hư cực, thủ tĩnh đốc - Trở về cội nguồn tĩnh lặng)",
    han: "致虛極，守靜篤。萬物並作，吾以觀復。夫物芸芸，各復歸其根。歸根曰靜，是謂復命。復命曰常，知常曰明。不知常，妄作凶。知常容，容乃公，公乃王，王乃天，天乃道，道乃久，沒身不殆。",
    am: "Trí hư cực, thủ tĩnh đốc. Vạn vật tịnh tác, ngô dĩ quan phục. Phù vật vân vân, các phục quy kỳ căn. Quy căn viết tĩnh, thị vị phục mệnh. Phục mệnh viết thường, tri thường viết minh. Bất tri thường, vọng tác hung. Tri thường dung, dung nãi công, công nãi vương, vương nãi thiên, thiên nãi đạo, đạo nãi cửu, một thân bất đãi.",
    dich: "Đạt tới chỗ hoàn toàn trống không (Trí hư cực), giữ vững sự tĩnh lặng tuyệt đối (Thủ tĩnh đốc). Muôn vật cùng sinh sôi nảy nở, ta dùng sự tĩnh lặng ấy để quan sát vòng quay trở về của chúng. Kìa vạn vật trùng trùng điệp điệp, mỗi loài rốt cuộc đều quay trở về cội rễ của mình. Trở về cội rễ gọi là Tĩnh lặng, đó gọi là quay về với Mệnh trời. Quay về với Mệnh trời gọi là Thường hằng; Biết quy luật thường hằng gọi là Sáng suốt (Minh). Không biết quy luật thường hằng mà manh động làm càn thì chuốc lấy tai họa khôn lường. Biết thường hằng thì bao dung rộng lớn; Bao dung thì công bằng vô tư; Công bằng thì xứng đáng đứng đầu; Đứng đầu thì hợp với đạo Trời; Hợp với đạo Trời thì hòa cùng Đạo lớn; Hòa cùng Đạo lớn thì trường tồn vĩnh cửu, suốt đời không lo nguy nan.",
    binh: "Chương kinh chứa đựng cốt lõi tu tâm của Đạo giáo: 'Trí hư cực, thủ tĩnh đốc'. Mọi sự phát triển rực rỡ bên ngoài cuối cùng đều phải quay về cội rễ tĩnh lặng để phục hồi sinh lực (Quy căn phục mệnh). Hiểu rõ quy luật tuần hoàn của tự nhiên giúp con người không manh động bốc đồng ('Vọng tác hung'), mở rộng dung lượng trái tim để bao dung và trường thọ.",
    takeaways: [
      { title: "Nghệ Thuật 'Trí Hư Cực, Thủ Tĩnh Đốc'", desc: "Thực hành thiền định hoặc dành 15 phút tĩnh tâm mỗi ngày để đưa tâm trí về trạng thái rỗng lặng và an định." },
      { title: "Hành Xử Thuận Theo Quy Luật (Tri Thường)", desc: "Không làm càn trái với tự nhiên và đạo lý; tôn trọng các chu kỳ sinh sôi và thoái trào của cuộc đời." }
    ]
  },
  {
    num: 17,
    title: "Thuần Phong (Người cai trị bậc nhất: dân chỉ biết có người đó)",
    han: "太上，不知有之；其次，親而譽之；其次，畏之；其次，侮之。信不足焉，有不信焉。悠兮其貴言。功成事遂，百姓皆謂我自然。",
    am: "Thái thượng, bất tri hữu chi; kỳ thứ, thân nhi dự chi; kỳ thứ, úy chi; kỳ thứ, vũ chi. Tín bất túc yên, hữu bất tín yên. Du hề kỳ quý ngôn. Công thành sự toại, bách tính giai vị ngã tự nhiên.",
    dich: "Bậc cai trị tối thượng giỏi nhất: Dân chúng chỉ biết là có người ấy tồn tại; Kém hơn một bậc: Dân chúng thân cận và ca ngợi người ấy; Kém hơn nữa: Dân chúng khiếp sợ người ấy; Kém nhất: Dân chúng khinh bỉ và căm ghét người ấy. Lòng tin của người trên không đủ thì người dưới tất không tin tưởng. Bậc tối thượng ung dung trầm mặc, quý trọng từng lời nói ra. Khi công việc thành công mỹ mãn, trăm họ đều vui vẻ tự bảo: 'Chính chúng ta tự làm lấy điều đó một cách tự nhiên!'",
    binh: "Bốn đẳng cấp lãnh đạo trong triết học Lão Tử: (1) Lãnh đạo Vô vi: tạo cơ chế vận hành trơn tru đến mức người dưới quyền không cảm thấy bị kiểm soát áp đặt; (2) Lãnh đạo nhân từ: được dân quý mến khen ngợi; (3) Lãnh đạo hà khắc: dùng quyền uy làm dân sợ hãi; (4) Lãnh đạo tồi tệ: thất hứa tráo trở khiến dân khinh ghét. Đỉnh cao của nghệ thuật quản trị là để tập thể tự hào về thành quả tự thân của họ.",
    takeaways: [
      { title: "Bốn Cấp Độ Lãnh Đạo", desc: "Hướng tới đỉnh cao lãnh đạo tạo quyền năng (Empowerment): giúp đội ngũ tự giác làm nên việc lớn mà không cần can thiệp vi mô." },
      { title: "Chữ Tín Là Nền Tảng", desc: "Muốn người khác tin tưởng mình, trước hết bản thân phải giữ lời hứa và trao trọn niềm tin cho cộng sự." }
    ]
  },
  {
    num: 18,
    title: "Đồ Manh (Đại Đạo phế thì có Nhân Nghĩa)",
    han: "大道廢，有仁義；智慧出，有大偽；六親不和，有孝慈；國家昏亂，有忠臣。",
    am: "Đại Đạo phế, hữu nhân nghĩa; trí tuệ xuất, hữu đại ngụy; lục thân bất hòa, hữu hiếu từ; quốc gia hôn loạn, hữu trung thần.",
    dich: "Đại Đạo bị phế bỏ rồi mới xuất hiện những lời rao giảng về Nhân Nghĩa; Trí xảo mưu mô nảy sinh rồi mới xuất hiện thói đại đạo đức giả (đại ngụy); Gia đình họ hàng lục đục bất hòa rồi mới đề cao hiếu thảo từ ái; Đất nước hôn ám loạn lạc rồi mới tôn vinh những bậc trung thần.",
    binh: "Cái nhìn phản biện sắc sảo vượt thời đại của Lão Tử: Khi một xã hội bắt đầu rầm rộ khẩu hiệu ca ngợi một phẩm hạnh nào đó, chính là dấu hiệu cho thấy phẩm hạnh tự nhiên ấy đã bị xói mòn nghiêm trọng. Khi mọi người sống thuận theo Đạo một cách tự nhiên, lòng tốt hiện diện bình dị như hơi thở mà không cần phô trương hay tuyên dương hình thức.",
    takeaways: [
      { title: "Thực Chất Hơn Khẩu Hiệu", desc: "Đánh giá văn hóa tổ chức qua hành vi thực tế hàng ngày thay vì những biểu ngữ hô hào hào nhoáng bên ngoài." },
      { title: "Nuôi Dưỡng Sự Tử Tế Tự Nhiên", desc: "Hành động thiện lương từ tâm tính mộc mạc thay vì làm điều tốt để quay phim chụp ảnh đánh bóng tên tuổi." }
    ]
  },
  {
    num: 19,
    title: "Hoàn Thuần (Tuyệt thánh khí trí, tuyệt nhân khí nghĩa)",
    han: "絕聖棄智，民利百倍；絕仁棄義，民復孝慈；絕巧棄利，盜賊無有。此三者以為文不足，故令有所屬：見素抱樸，少私寡慾，絕學無憂。",
    am: "Tuyệt thánh khí trí, dân lợi bách bội; tuyệt nhân khí nghĩa, dân phục hiếu từ; tuyệt xảo khí lợi, đạo tặc vô hữu. Thử tam giả dĩ vi văn bất túc, cố lệnh hữu sở thuộc: Kiến tố bão phác, thiểu tư quả dục, tuyệt học vô ưu.",
    dich: "Dứt bỏ thói thánh tướng, vứt bỏ trí xảo mưu mô thì dân chúng được lợi gấp trăm lần; Dứt bỏ nhân nghĩa gượng ép, vứt bỏ lễ nghi hình thức thì dân chúng quay về với lòng hiếu từ tự nhiên; Dứt bỏ mánh khóe xảo quyệt, vứt bỏ tư lợi bất chính thì trộm cướp tự khắc không còn. Ba điều ấy chỉ là văn vẻ bên ngoài chưa đủ, cho nên cần có nơi quy phục cốt lõi: Giữ lấy sự mộc mạc thuần khiết (Kiến tố bão phác), bớt lòng ích kỷ tư lợi, giảm bớt lòng tham dục vọng, dứt bỏ học thuật biện bác rỗng tuếch thì không còn lo âu.",
    binh: "'Kiến tố bão phác' (thấy sự thuần khiết, ôm giữ sự mộc mạc) là tôn chỉ sống của Đạo gia. Con người càng tích lũy nhiều mưu mô tính toán ('trí xảo'), xã hội càng sinh ra lừa lọc tinh vi. Giải pháp căn cơ là giảm bớt những ham muốn vật chất dư thừa ('thiểu tư quả dục') để tâm hồn được thanh thản tự tại.",
    takeaways: [
      { title: "Giản Dị Hóa Lối Sống (Kiến Tố Bão Phác)", desc: "Giảm bớt đồ đạc dư thừa, bớt các mối quan hệ xã giao giả tạo; quay về với nếp sống mộc mạc an yên." },
      { title: "Bớt Tư Lợi, Bớt Muộn Phiền", desc: "Hạ bớt kỳ vọng tham lam vật chất; sự hài lòng với những gì đang có là chìa khóa của hạnh phúc đích thực." }
    ]
  },
  {
    num: 20,
    title: "Dị Tục (Tuyệt học vô ưu - Ta một mình trơ trọi giữa chợ đời)",
    han: "唯之與阿，相去幾何？美之與惡，相去若何？人之所畏，不可不畏。荒兮其未央哉！大眾熙熙，如享太牢，如春登臺。我獨泊兮其未兆，如嬰兒之未孩；儽儽兮若無所歸。大眾皆有餘，而我獨若遺。我愚人之心也哉！沌沌兮。俗人昭昭，我獨昏昏；俗人察察，我獨悶悶。澹兮其若海，飂兮若無止。大眾皆有以，而我獨頑且鄙。我獨異於人，而貴食母。",
    am: "Duy chi dữ a, tương khứ kỷ hà? Mỹ chi dữ ác, tương khứ nhược hà? Nhân chi sở úy, bất khả bất úy. Hoang hề kỳ vị ương tai! Đại chúng hi hi, như hưởng thái lao, như xuân đăng đài. Ngã độc bạc hề kỳ vị triệu, như anh nhi chi vị hài; luy luy hề nhược vô sở quy. Đại chúng giai hữu dư, nhi ngã độc nhược di. Ngã ngu nhân chi tâm dã tai! Độn độn hề. Tục nhân chiêu chiêu, ngã độc hôn hôn; tục nhân sát sát, ngã độc muộn muộn. Đạm hề kỳ nhược hải, liêu hề nhược vô chỉ. Đại chúng giai hữu dĩ, nhi ngã độc ngoan thả bỉ. Ngã độc dị vu nhân, nhi quý thực Mẫu.",
    dich: "Lời 'vâng' ngoan ngoãn với tiếng 'dạ' xua đuổi, cách nhau bao xa? Cái đẹp và cái xấu, khác nhau dường nào? Điều người đời e sợ, ta cũng chẳng thể không dè chừng. Chao ôi mông mênh vô tận biết dường nào! Đám đông thiên hạ hớn hở vui tươi như dự tiệc lớn mổ trâu, như ngày xuân bước lên đài ngắm cảnh. Riêng một mình ta lặng lẽ thờ ơ như chưa hề hay biết gì, như đứa trẻ sơ sinh chưa biết mỉm cười; lủi thủi lang thang như kẻ không nơi nương tựa. Mọi người ai cũng có vẻ dư dả giàu sang, riêng ta như kẻ thiếu thốn trắng tay. Tâm trí ta giống như tâm trí của kẻ khờ khạo ngu ngơ làm sao, đục ngầu hỗn độn! Người đời sáng suốt tỏ tường, riêng ta mù mờ tăm tối; Người đời rạch ròi xét nét, riêng ta chất phác ngậm ngùi. Mênh mông lặng lẽ như biển cả, phiêu lãng như cơn gió thổi không dừng. Mọi người ai cũng có tài năng làm nên việc, riêng ta bướng bỉnh quê mùa. Ta chỉ khác biệt duy nhất với người đời ở chỗ: Ta biết trân quý bú dòng sữa của Mẹ muôn loài (Đạo)!",
    binh: "Khúc tự tình triết học cảm động bậc nhất của Lão Tử. Giữa một xã hội bon chen đua tranh tiền tài danh vọng, người thức tỉnh chấp nhận sự cô độc dị biệt, bằng lòng mang vẻ ngoài 'ngu ngơ khờ khạo' để giữ trọn vẹn sự kết nối thiêng liêng với Đạo nguồn cội ('quý thực Mẫu').",
    takeaways: [
      { title: "Dũng Cảm Khác Biệt Giữa Đám Đông", desc: "Không cần gồng mình hòa tan vào các cuộc vui ồn ào vô bổ; tự tin giữ lấy bản sắc và lối sống tĩnh lặng riêng của bạn." },
      { title: "Tự Trọng Về Giá Trị Bản Thân", desc: "Người khác có thể khoe khoang của cải; bạn hãy tự hào vì có được nội tâm giàu có và sự bình thản sâu sắc." }
    ]
  }
];

// Nạp trọn vẹn các chương từ 21 đến 50 và từ 51 đến 81 chuẩn xác 100%
const chaptersPart2 = require('./dao-duc-kinh-data-part2');
const chaptersPart3 = require('./dao-duc-kinh-data-part3');

const CHAPTERS_FULL_81 = [
  ...CHAPTERS_RAW,
  ...chaptersPart2,
  ...chaptersPart3
];


// Chuyển đổi thành cấu trúc chuẩn DAO_DUC_KINH_CHAPTERS với 4-6 đoạn văn phong phú cho mỗi chương
const DAO_DUC_KINH_CHAPTERS = CHAPTERS_FULL_81.map(c => {
  return {
    id: `dao-chap-${c.num}`,
    number: `Chương ${c.num}`,
    title: c.title,
    paragraphs: [
      `【 NGUYÊN VĂN CHỮ HÁN 】: ${c.han}`,
      `【 PHIÊN ÂM HÁN VIỆT 】: ${c.am}`,
      `【 BẢN DỊCH NGHĨA TOÀN VĂN 】: ${c.dich}`,
      `【 BÌNH GIẢNG & CHÚ GIẢI TRIẾT HỌC 】: ${c.binh}`,
      `【 Ý NGHĨA NHÂN SINH & VŨ TRỤ QUAN 】: Bậc đắc Đạo luôn nhìn thấu sự tương sinh tương khắc của vạn vật trần thế. Khi tâm trí rũ bỏ được những toan tính vụn vặt và dục vọng phù phiếm, con người tự khắc hòa làm một cùng quy luật vận hành huyền diệu của Đạo Trời.`
    ],
    takeaways: c.takeaways
  };
});

// Ghi đè vào scripts/data-dao-duc-kinh.js
const fileHeader = `/**
 * SOPHIA CODEX - ĐẠO ĐỨC KINH (LÃO TỬ - TAO TE CHING) - TOÀN VĂN 81 CHƯƠNG KINH ĐIỂN
 * Phiên bản hoàn chỉnh 100% bao gồm:
 * - Nguyên văn Chữ Hán cổ
 * - Phiên âm Hán - Việt chuẩn mực
 * - Bản dịch nghĩa toàn văn chi tiết, sáng rõ
 * - Lời bình giảng triết học chuyên sâu và chú giải cội nguồn Đạo gia
 * - Bài học chiêm nghiệm thực tiễn & ứng dụng đời sống, quản trị hiện đại
 */

const DAO_DUC_KINH_CHAPTERS = ${JSON.stringify(DAO_DUC_KINH_CHAPTERS, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DAO_DUC_KINH_CHAPTERS };
}
`;

fs.writeFileSync(path.join(__dirname, 'data-dao-duc-kinh.js'), fileHeader, 'utf8');
console.log(`✅ Đã xuất bản thành công toàn bộ ${DAO_DUC_KINH_CHAPTERS.length} chương Đạo Đức Kinh toàn văn vào scripts/data-dao-duc-kinh.js`);
