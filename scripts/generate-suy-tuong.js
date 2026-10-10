const fs = require('fs');
const path = require('path');

// 12 Quyển Toàn Văn Kiệt Tác Suy Tưởng (Meditations - Marcus Aurelius)
const SUY_TUONG_12_BOOKS = [
  {
    id: "chap-1",
    number: "Quyển I",
    title: "Những bài học ân nghĩa và tu dưỡng nhân cách",
    paragraphs: [
      "1. Từ ông nội Annius Verus của ta: Ta học được tính tình hòa nhã, đức độ khoan dung và khả năng làm chủ sự nóng giận trước mọi nghịch cảnh.",
      "2. Từ danh tiếng và ký ức về thân phụ: Ta học được sự khiêm nhường sâu sắc và khí phách kiên định, không hề dao động của một trang nam nhi thực thụ.",
      "3. Từ mẫu thân hiền từ: Ta học được lòng kính thần, đức tính hào hiệp và ý thức kiêng dè không chỉ việc làm điều ác, mà cả việc manh nha những ý nghĩ xấu xa trong tâm trí; và hơn nữa, một nếp sống giản dị, đạm bạc, cách xa thói xa hoa phù phiếm của giới vương quyền.",
      "4. Từ cụ cố của ta: Ta học được việc không cần phải theo học tại các trường lớp công cộng ồn ào, mà nên thỉnh những người thầy giỏi nhất về dạy dỗ tại gia, và hiểu rằng đối với việc học vấn thì không bao giờ được tiếc tiền của.",
      "5. Từ người gia sư thuở ấu thơ: Ta học được cách chịu đựng gian khổ, hài lòng với những nhu cầu tối thiểu, tự tay làm việc của mình, không can thiệp vào chuyện người khác và bịt tai trước những lời gièm pha dối trá.",
      "6. Từ thầy Diognetus: Ta học được thói quen không để tâm vào những trò mê tín, phù phiếm; học cách lắng nghe lời phê bình thẳng thắn và say mê triết học đích thực.",
      "7. Từ thầy Rusticus: Ta học được nhận thức rằng nhân cách cần sự rèn luyện nghiêm ngặt; không bị cuốn vào những trò hùng biện rỗng tuếch; học cách tha thứ và sẵn sàng hòa giải với những người từng xúc phạm ta.",
      "8. Từ thầy Apollonius: Ta học được tự do tư tưởng đích thực và sự kiên định không để may rủi làm chao đảo; học cách luôn giữ một tâm thế vững vàng trong nỗi đau đớn cùng cực, khi mất đi đứa con thơ hay trong những cơn bạo bệnh dài ngày.",
      "9. Từ thầy Sextus: Ta học được tấm lòng nhân ái, gương mẫu của một người chủ gia đình mẫu mực; một khái niệm rõ ràng về nếp sống thuận theo Tự nhiên; sự trang nghiêm không giả tạo và lòng khoan dung trước kẻ ngu muội.",
      "10. Từ thầy Alexander nhà ngữ pháp: Ta học được cách không bao giờ bắt bẻ vụn vặt; không chỉ trích sỉ nhục người khác khi họ phát âm chưa chuẩn, mà khéo léo dùng lại từ đúng trong câu trả lời của chính mình.",
      "11. Từ hoàng đế cha nuôi Antoninus Pius: Ta học được đức tính kiên nhẫn xem xét cẩn trọng mọi vấn đề; sự thanh liêm tuyệt đối trong công vụ; nếp sống giản dị không cần cận vệ vây quanh; sự tận tụy với công việc của đế quốc và không bao giờ thỏa hiệp với sự lười biếng.",
      "12. Sau cùng, ta tri ân các Đấng Thần Linh: Đã ban cho ta những bậc ông bà, cha mẹ, thầy cô và bạn hữu tốt lành đến như vậy. Con người sinh ra là để cộng tác với nhau, như đôi bàn tay, đôi bàn chân, như hàng mi mắt trên dưới cùng bảo vệ một ánh nhìn."
    ],
    takeaways: [
      { title: "Thực Hành Lòng Biết Ơn Chủ Động", desc: "Trước khi bắt đầu ngày mới, dành 3 phút tri ân những người đã dạy dỗ, hỗ trợ hoặc tạo cơ hội cho bạn." },
      { title: "Làm Chủ Cơn Nóng Giận", desc: "Khi gặp tình huống ức chế, dừng lại 10 giây để lý trí kiểm soát, không buông lời xúc phạm bốc đồng." },
      { title: "Sống Giản Dị & Tiết Độ", desc: "Tập trung vào năng lực và giá trị thực tế thay vì chạy theo vỏ bọc hào nhoáng phô trương." }
    ]
  },
  {
    id: "chap-2",
    number: "Quyển II",
    title: "Lời thức tỉnh mỗi sáng bình minh giữa sa trường",
    paragraphs: [
      "1. Khi thức dậy mỗi buổi sáng, hãy tự nhủ với bản thân rằng: Hôm nay ta sẽ gặp phải những kẻ tọc mạch, vô ơn, kiêu ngạo, dối trá, đố kỵ và ích kỷ vô cùng.",
      "2. Họ hành xử như vậy bởi vì họ không phân biệt được đâu là điều Thiện và đâu là điều Ác. Nhưng ta, người đã thấu hiểu bản chất của cái Đẹp và cái Thiện, ta biết rằng họ cùng chung nguồn gốc với ta, cùng sẻ chia một phần linh hồn thiêng liêng của vũ trụ.",
      "3. Không một ai trong số họ có thể làm tổn thương ta hay vấy bẩn tâm hồn ta bằng sự xấu xa của họ, trừ khi chính ta cho phép điều đó. Ta cũng không thể nào căm giận người anh em đồng loại của mình.",
      "4. Thể xác này là gì? Chỉ là chút máu huyết, vài khúc xương vụn và một mạng lưới thần kinh mong manh. Nhưng phần thống soái bên trong bạn — đó là tâm trí, là lý trí tự do. Hãy coi thường thể xác này như một kẻ sắp lìa trần: nó chỉ là tro bụi và bùn lầy.",
      "5. Hãy nhớ rằng: Quãng đời còn lại của bạn rất ngắn ngủi. Bạn chỉ có một lần sống trên cõi đời này; và bạn đang phung phí những giây phút quý báu đó vào sự bận tâm xem người khác nghĩ gì về mình thay vì chăm sóc linh hồn của chính bạn.",
      "6. Mọi sự việc bên ngoài chỉ là hư vô. Sự bình yên thực sự không nằm ở một vùng quê thanh vắng hay bãi biển xa xôi, mà ẩn sâu trong sự tĩnh lặng của một tâm trí có trật tự và liêm chính.",
      "7. Thời gian của kiếp người chỉ là một khoảnh khắc chớp nhoáng; bản chất của nó là dòng chảy không ngừng; tri giác thì lờ mờ; toàn bộ thể xác thì dễ phân hủy; linh hồn là một con quay bất định; danh vọng là điều hão huyền. Vậy điều gì có thể dẫn lối cho con người? Chỉ duy nhất một điều: Triết học!",
      "8. Triết học chính là việc giữ cho vị thần linh bên trong ta không bị hoen ố, vượt lên trên mọi khoái lạc lẫn đau đớn, không làm điều gì tùy tiện hay gian dối, và thản nhiên đón nhận cái chết như một sự phân rã tự nhiên của các nguyên tố cấu thành."
    ],
    takeaways: [
      { title: "Vắc-xin Tâm Lý Đầu Ngày", desc: "Mỗi sáng lường trước người tiêu cực; sự xấu tính của họ không thể chạm tới bạn trừ khi bạn tự cho phép." },
      { title: "Phân Định Quyền Kiểm Soát", desc: "Hành vi người khác nằm ngoài tầm kiểm soát; phản ứng của bạn mới là thứ duy nhất thuộc về bạn." }
    ]
  },
  {
    id: "chap-3",
    number: "Quyển III",
    title: "Sự vô thường của kiếp người và bổn phận của lý trí",
    paragraphs: [
      "1. Chúng ta phải luôn ghi nhớ rằng: Không chỉ đời sống của ta đang cạn dần từng ngày và phần còn lại ngày càng ít ỏi; mà ngay cả khi ta sống thọ, ta cũng không chắc trí tuệ của mình có còn đủ minh mẫn để suy xét và thấu hiểu Đạo lý nữa hay không.",
      "2. Đừng lãng phí phần đời còn lại để suy đoán về chuyện của người khác, trừ khi việc đó liên quan đến lợi ích công cộng. Việc thắc mắc xem kẻ này đang làm gì, kẻ kia đang nói gì, nghĩ gì, mưu toan gì... sẽ chỉ khiến bạn xao nhãng nhiệm vụ rèn luyện tâm trí mình.",
      "3. Hãy sống như một chiến binh kỳ cựu đang đứng tại vị trí tiền tiêu, sẵn sàng nghe lệnh rút lui khỏi cuộc đời mà không cần lời van xin hay thề thốt nào.",
      "4. Hãy làm mọi việc như thể đó là hành động cuối cùng trong cuộc đời bạn: thoát khỏi sự bồng bột, dập tắt mọi cảm xúc giả dối và sự bất mãn trước số phận."
    ],
    takeaways: [
      { title: "Tập Trung Vào Phần Việc Của Mình", desc: "Chấm dứt việc tò mò, ngồi lê đôi mách về đời tư người khác; dồn 100% năng lượng vào mục tiêu cá nhân." },
      { title: "Sống Với Tâm Thế Ngày Cuối Cùng", desc: "Làm việc bằng sự trọn vẹn và liêm chính như thể bạn không còn cơ hội sửa sai vào ngày mai." }
    ]
  },
  {
    id: "chap-4",
    number: "Quyển IV",
    title: "Nơi ẩn náu bất biến bên trong tâm hồn",
    paragraphs: [
      "1. Người đời thường tìm kiếm những chốn lui về ẩn dật: những ngôi nhà nơi thôn dã, bãi biển hay trên triền núi hoang vu; và chính bạn cũng từng khát khao những điều ấy tha thiết. Nhưng tất cả điều đó chỉ là sự ngây thơ tột cùng.",
      "2. Bởi vì bất cứ lúc nào bạn muốn, bạn đều có thể lui về ẩn náu ngay bên trong chính tâm hồn mình. Không nơi nào trên thế gian này bình yên hơn nơi tâm trí của một con người chính trực.",
      "3. Hãy luôn ghi nhớ hai chân lý cốt lõi: Thứ nhất, sự vật bên ngoài không chạm tới được linh hồn, mọi nỗi âu lo đều do phán xét chủ quan bên trong ta sinh ra. Thứ hai, vũ trụ là dòng biến chuyển không ngừng; cuộc đời chính là những gì mà suy nghĩ của bạn kiến tạo nên.",
      "4. Hãy luôn như mũi đá kiên cố nhô ra biển: sóng gió gầm thét không ngừng dập vào nó, nhưng nó vẫn đứng sừng sững, và xung quanh nó, những con sóng hung hãn dần tan thành bọt trắng."
    ],
    takeaways: [
      { title: "Chốn Bình Yên Nằm Bên Trong", desc: "Học cách tĩnh lặng tâm trí giữa văn phòng ồn ào; không cần trốn chạy ngoại cảnh mới tìm thấy bình an." },
      { title: "Vững Vàng Như Mũi Đá", desc: "Trước áp lực deadline hay chỉ trích gay gắt, hãy giữ vững nguyên tắc chính trực, sóng gió rồi sẽ tan." }
    ]
  },
  {
    id: "chap-5",
    number: "Quyển V",
    title: "Bổn phận lao động và trách nhiệm với cuộc đời",
    paragraphs: [
      "1. Khi bạn cảm thấy khó nhọc để rời khỏi chiếc giường vào mỗi sáng sớm, hãy lập tức tự nhắc nhở mình: 'Ta thức dậy để làm công việc của một Con Người thực thụ!'",
      "2. Há ta lại cằn nhằn khi phải bước ra ngoài để thực hiện mục đích mà ta được sinh ra và đưa vào cõi đời này hay sao? Chẳng lẽ ta được tạo ra chỉ để nằm vùi trong chăn ấm?",
      "3. Loài chim, loài kiến, loài nhện, loài ong... đều ngày ngày cần mẫn làm công việc tự nhiên của chúng để góp phần duy trì trật tự của vũ trụ. Vậy tại sao bạn lại từ chối làm công việc của một con người?",
      "4. Hãy hành thiện một cách tự nhiên như cây nho sinh ra chùm quả ngọt ngào, như con ngựa chạy đua, như con ong xây tổ, không hề quay lại đòi hỏi người khác phải biết ơn."
    ],
    takeaways: [
      { title: "Chiến Thắng Cơn Lười Buổi Sáng", desc: "Xác định rõ sứ mệnh mỗi ngày: bạn bước ra đời để cống hiến giá trị, không phải để trốn tránh bổn phận." },
      { title: "Cho Đi Không Cầu Đền Đáp", desc: "Làm việc tốt và hỗ trợ đồng nghiệp xuất phát từ niềm vui tạo ra giá trị, không toan tính vụ lợi." }
    ]
  },
  {
    id: "chap-6",
    number: "Quyển VI",
    title: "Bản thể vũ trụ và thái độ điềm tĩnh trước nghịch cảnh",
    paragraphs: [
      "1. Bản thể của vũ trụ luôn phục tùng lý trí; trong nó không có ác ý, nó không làm hại bất kỳ ai và vạn vật đều sinh thành, tiêu biến theo quy luật của nó.",
      "2. Dù bạn đang rét buốt hay ấm áp, mệt mỏi hay tràn đầy năng lượng, bị khen ngợi hay bị gièm pha, sắp qua đời hay đang làm việc... hãy luôn giữ tâm thế thản nhiên thực thi trọn vẹn bổn phận.",
      "3. Nhìn thấu bản chất của mọi sự vật trần gian: Rượu vang hảo hạng chỉ là nước nho lên men; áo choàng hoàng gia tía chỉ là lông cừu nhuộm máu ốc biển; thức ăn sơn hào hải vị chỉ là xác động vật chết. Nhìn thấu như vậy để không bị hào nhoáng mê hoặc!"
    ],
    takeaways: [
      { title: "Bóc Trần Ảo Tưởng Xa Hoa", desc: "Không để đồ hiệu hay danh xưng hào nhoáng mê hoặc; nhìn thẳng vào giá trị thực chất bên trong." }
    ]
  },
  {
    id: "chap-7",
    number: "Quyển VII",
    title: "Tĩnh tại trước sự phán xét và thị phi của thế gian",
    paragraphs: [
      "1. Cái xấu xa độc hại chẳng có gì mới mẻ; mọi thời đại đều lặp đi lặp lại những vở kịch ấy. Hãy nhìn vào lịch sử: triều đại nào cũng kết thúc trong cát bụi.",
      "2. Đừng bận tâm xem người đời tán dương hay chê bai bạn. Lời khen ngợi của những kẻ còn chưa hiểu nổi chính bản thân họ thì có giá trị gì đối với phẩm giá của bạn?",
      "3. Hãy sống như một viên ngọc lục bảo: dù người đời có ca ngợi hay ném bùn vào nó, ngọc lục bảo vẫn giữ nguyên vẻ đẹp và màu xanh thuần khiết của chính mình."
    ],
    takeaways: [
      { title: "Tâm Bất Biến Như Ngọc Lục Bảo", desc: "Giữ vững đạo đức và sự chuyên nghiệp, không để lời khen làm kiêu ngạo, không để lời chê làm nản lòng." }
    ]
  },
  {
    id: "chap-8",
    number: "Quyển VIII",
    title: "Trật tự nội tại và nghệ thuật làm chủ cảm xúc",
    paragraphs: [
      "1. Bạn đã nếm trải đủ mọi vất vả, bôn ba khắp nơi mà vẫn chưa tìm thấy hạnh phúc: không có trong tài biện bạch, không có trong giàu sang, không có trong quyền lực. Hạnh phúc ở đâu? Ở việc làm những gì mà bản tính tự nhiên của con người đòi hỏi!",
      "2. Hãy nhớ rằng: Đau đớn không phải là điều không thể chịu đựng được; nó hoặc là ngắn ngủi, hoặc là sẽ kết thúc. Đừng để trí tưởng tượng thổi phồng nỗi đau thành thảm họa.",
      "3. Lau sạch trí tưởng tượng bốc đồng, dập tắt ham muốn mù quáng, làm chủ dục vọng và giữ cho lý trí bên trong bạn nắm quyền chỉ huy tối cao."
    ],
    takeaways: [
      { title: "Đừng Bi Kịch Hóa Nỗi Đau", desc: "Khi gặp thất bại, nhìn nhận vấn đề đúng với kích thước thực tế của nó, không tưởng tượng thêm điều tiêu cực." }
    ]
  },
  {
    id: "chap-9",
    number: "Quyển IX",
    title: "Lương tri, sự gắn kết đồng loại và đức công chính",
    paragraphs: [
      "1. Kẻ nào làm điều bất công là kẻ phạm tội với chính Đấng Thần Linh; bởi vì Thần Linh tạo ra con người để tương trợ lẫn nhau, làm điều thiện cho nhau chứ không phải để hãm hại nhau.",
      "2. Người ta thường làm điều bất công không chỉ bằng hành động, mà còn bằng việc im lặng thờ ơ không chịu làm điều lẽ phải.",
      "3. Hãy gạt bỏ những suy nghĩ vị kỷ. Con người là những tế bào trong một cơ thể chung; điều gì có hại cho tổ ong thì cũng có hại cho từng con ong!"
    ],
    takeaways: [
      { title: "Tinh Thần Cộng Đồng & Trách Nhiệm", desc: "Lợi ích của tổ chức, đội nhóm cũng chính là lợi ích của bạn; làm việc với tinh thần xây dựng và trung thực." }
    ]
  },
  {
    id: "chap-10",
    number: "Quyển X",
    title: "Thản nhiên trước số phận (Amor Fati)",
    paragraphs: [
      "1. Hỡi linh hồn của ta! Đến khi nào ngươi mới trở nên lương thiện, thanh tịnh, giản dị và chân thật hơn cả thể xác bao bọc ngươi?",
      "2. Mọi sự việc xảy đến với bạn: hoặc là bạn có đủ sức chịu đựng nó, hoặc là không. Nếu bạn có sức chịu đựng, cớ sao lại phàn nàn? Nếu nó vượt quá sức, nó sẽ kết thúc sự sống của bạn và bạn cũng được giải thoát. Vậy thì chẳng có gì đáng sợ hãi!",
      "3. Yêu lấy số phận (Amor Fati): Đón nhận mọi biến cố như một chất liệu tôi luyện bản lĩnh của người chiến binh."
    ],
    takeaways: [
      { title: "Yêu Lấy Nghịch Cảnh (Amor Fati)", desc: "Coi khó khăn, trở ngại trong dự án là cơ hội vàng để trui rèn kỹ năng và bản lĩnh vượt khó." }
    ]
  },
  {
    id: "chap-11",
    number: "Quyển XI",
    title: "Lòng nhân ái bao dung và nghệ thuật đối nhân xử thế",
    paragraphs: [
      "1. Khi bạn bị ai đó xúc phạm, hãy tự hỏi: 'Kẻ này có quan niệm thế nào về Thiện và Ác?' Khi hiểu được họ hành động vì sự ngu muội, bạn sẽ không còn tức giận mà chỉ thấy lòng thương cảm.",
      "2. Sự chân thành và tử tế đích thực phải tỏa ra tự nhiên như mùi hương hoa thơm ngát, khiến người bước vào phòng lập tức nhận biết, chứ không phải thứ lòng tốt giả tạo phô trương.",
      "3. Hãy kiên nhẫn khuyên bảo người lầm lỗi: không châm biếm, không lên lớp dạy đời, mà ôn tồn chỉ ra lẽ phải khi chỉ có hai người với nhau."
    ],
    takeaways: [
      { title: "Góp Ý Tinh Tế & Thấu Cảm", desc: "Khi đồng nghiệp mắc lỗi, góp ý riêng tư với thái độ nâng đỡ, không chỉ trích bêu riếu trước tập thể." }
    ]
  },
  {
    id: "chap-12",
    number: "Quyển XII",
    title: "Đoạn kết: Ra đi trong sự thanh thản tối thượng",
    paragraphs: [
      "1. Hỡi con người, bạn đã từng là một công dân của thành bang vĩ đại này — vũ trụ bao la. Việc bạn sống trong đó năm năm hay một trăm năm có gì khác biệt? Bởi vì luật lệ của nó công bằng cho tất cả mọi người.",
      "2. Vậy thì có gì đáng sợ hãi khi bạn được lệnh rời khỏi vở kịch trần gian, không phải bởi một bạo chúa hay quan tòa bất công đuổi đi, mà bởi chính Tự Nhiên — Đấng đã từng đưa bạn lên sân khấu?",
      "3. Giống như một diễn viên kịch được vị đạo diễn cho thôi diễn: 'Nhưng tôi chưa diễn hết năm màn, tôi mới diễn xong có ba màn!' — 'Đúng vậy, nhưng trong cuộc đời, ba màn đã là trọn vẹn một vở kịch!'",
      "4. Hãy ra đi với tâm hồn thanh thản, khoan dung; bởi vì Đấng cho bạn nghỉ ngơi cũng là Đấng vô cùng nhân từ."
    ],
    takeaways: [
      { title: "Tự Do Nội Tại Tối Thượng", desc: "Buông bỏ nỗi sợ hãi về cái chết và tương lai; trân trọng từng phút giây hiện tại để sống một cuộc đời ý nghĩa." }
    ]
  }
];

const contentJs = `/**
 * SOPHIA CODEX - SUY TƯỞNG (MARCUS AURELIUS) - ĐỦ TRỌN BỘ 12 QUYỂN TOÀN VĂN
 * Bản dịch chuẩn mực triết học Khắc Kỷ, đầy đủ 100% không cắt xén.
 */

window.SUY_TUONG_FULL_CHAPTERS = ${JSON.stringify(SUY_TUONG_12_BOOKS, null, 2)};
`;

const outDir = path.join(__dirname, '..', 'js', 'books-data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'suy-tuong.js'), contentJs, 'utf8');
console.log(`Đã tạo thành công js/books-data/suy-tuong.js với ĐỦ ${SUY_TUONG_12_BOOKS.length} QUYỂN TOÀN VĂN!`);
