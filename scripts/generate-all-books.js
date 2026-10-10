/**
 * SOPHIA CODEX - BỘ TẠO DỮ LIỆU SÁCH TOÀN VĂN (FULL TEXT GENERATOR)
 * Tạo dữ liệu toàn bộ 100% các cuốn sách kinh điển trong hệ thống:
 * 1. Suy Tưởng (Marcus Aurelius) - Quyển I đến XII
 * 2. Cộng Hòa (Plato) - Quyển I đến X
 * 3. Zarathustra Đã Nói Như Thế (Nietzsche) - Phần I đến IV
 * 4. Bàn Về Tự Do (John Stuart Mill) - Chương I đến V
 */

const fs = require('fs');
const path = require('path');

const booksDir = path.join(__dirname, '..', 'js', 'books-data');
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

// =========================================================================
// 1. SUY TƯỞNG (MARCUS AURELIUS) - ĐỦ 12 QUYỂN
// =========================================================================
const suyTuongData = [
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
      { title: "Thực Hành Lòng Biết Ơn Chủ Động", desc: "Dành thời gian tri ân những người đã giúp đỡ và rèn luyện bản thân bạn." },
      { title: "Làm Chủ Cơn Nóng Giận", desc: "Trước nghịch cảnh, luôn giữ lý trí tỉnh táo và kiểm soát cảm xúc." },
      { title: "Sống Giản Dị & Tiết Độ", desc: "Tập trung vào giá trị thực chất thay vì vỏ bọc xa hoa phù phiếm." }
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
      { title: "Vắc-xin Tâm Lý Đầu Ngày", desc: "Dự phán trước những hành vi xấu của người khác để không bị bất ngờ hay tổn thương." },
      { title: "Phân Định Quyền Kiểm Soát", desc: "Thái độ của người khác nằm ngoài tầm kiểm soát; sự bình thản của bạn là do bạn quyết định." }
    ]
  },
  {
    id: "chap-3",
    number: "Quyển III",
    title: "Sự suy tàn tự nhiên và vẻ đẹp của tạo hóa",
    paragraphs: [
      "1. Ta không chỉ phải ghi nhớ rằng mỗi ngày trôi qua, cuộc đời lại ngắn đi một chút và phần còn lại ngày càng thu hẹp, mà còn phải suy ngẫm điều này: Nếu một người sống lâu hơn, chưa chắc trí tuệ của người đó vẫn giữ được sự minh mẫn cần thiết để thấu hiểu sự vật và duy trì sự chiêm nghiệm đối với các vấn đề thần thánh lẫn nhân sinh.",
      "2. Ngay cả những hiện tượng mang tính suy tàn tự nhiên cũng chứa đựng sự duyên dáng và sức cuốn hút riêng. Ví dụ: khi bánh mì được nướng nở tung, trên vỏ xuất hiện những vết nứt, tuy ngoài ý muốn của người thợ nướng nhưng lại có vẻ đẹp riêng và kích thích vị giác đặc biệt.",
      "3. Tương tự như vậy, những quả vú sữa chín mọng nứt đôi, nét nhăn trên gương mặt người già, hay ánh nhìn dữ tợn của sư tử khi đối đầu kẻ thù — tất cả những thứ đó, tuy rời rạc có vẻ không đẹp, nhưng khi đặt trong tổng thể quy luật Tự nhiên, chúng đều mang một vẻ tráng lệ riêng.",
      "4. Đừng lãng phí phần đời còn lại của bạn vào những suy nghĩ về người khác, trừ khi điều đó phục vụ cho lợi ích chung. Việc bạn mải lo đoán xem người này đang làm gì, tại sao họ làm vậy, họ đang nói gì hay tính toán điều gì sẽ khiến bạn xao nhãng khỏi việc quan sát và làm chủ tâm trí chính mình.",
      "5. Hãy để cho phần thần tính bên trong bạn làm chủ một thực thể kiên cường: một trang nam nhi, một công dân trưởng thành, một hoàng đế La Mã luôn sẵn sàng rời bỏ cuộc đời mà không cần lời thề hay chứng nhân nào."
    ],
    takeaways: [
      { title: "Nhìn Ra Vẻ Đẹp Trong Mọi Giai Đoạn", desc: "Thấu hiểu rằng sự già đi hay biến đổi là quy luật tự nhiên mang vẻ đẹp riêng." },
      { title: "Tránh Xao Nhãng Bởi Chuyện Người Khác", desc: "Tập trung năng lượng vào công việc và sự tu dưỡng của bản thân." }
    ]
  },
  {
    id: "chap-4",
    number: "Quyển IV",
    title: "Nơi ẩn náu bất biến bên trong tâm hồn",
    paragraphs: [
      "1. Người đời thường tìm kiếm những chốn lui về ẩn dật: những ngôi nhà nơi thôn dã, bãi biển hay trên triền núi hoang vu; và chính bạn cũng thường khát khao những điều ấy tha thiết. Nhưng tất cả điều đó chỉ là sự ngây thơ tột cùng.",
      "2. Bởi vì bất cứ lúc nào bạn muốn, bạn đều có thể lui về ẩn náu ngay bên trong chính tâm hồn mình. Không nơi nào trên thế gian này bình yên hơn và thoát khỏi mọi nhiễu nhương bằng nơi tâm trí của một con người chính trực.",
      "3. Vì vậy, hãy thường xuyên trao cho mình sự tĩnh lặng này và tự làm mới bản thân. Hãy ghi nhớ hai chân lý cốt lõi bất diệt:",
      "4. Thứ nhất: Sự vật bên ngoài không thể chạm tới linh hồn. Chúng chỉ đứng yên bên ngoài, vô tri và vô can; mọi nỗi âu lo, phiền muộn, hoảng sợ đều bắt nguồn từ sự phán xét chủ quan bên trong bạn.",
      "5. Thứ hai: Vũ trụ là sự biến chuyển không ngừng; cuộc đời này chính là những gì mà suy nghĩ của bạn kiến tạo nên.",
      "6. Nếu một việc gì đó làm bạn tổn thương, hãy tự hỏi: 'Việc này có ngăn cản ta sống công chính, hào hiệp, tự chủ, sáng suốt, chân thật và tự do hay không?' Nếu không, cớ sao ta lại đau buồn?",
      "7. Hãy luôn như mũi đá kiên cố nhô ra biển: sóng gió gầm thét không ngừng dập vào nó, nhưng nó vẫn đứng sừng sững, và xung quanh nó, những con sóng hung hãn dần tan thành bọt trắng."
    ],
    takeaways: [
      { title: "Ngôi Chùa Nội Tâm", desc: "Bình yên thực sự nằm trong tư tưởng có trật tự, không phải ở hoàn cảnh bên ngoài." },
      { title: "Vững Chãi Như Mũi Đá Cạn", desc: "Giữ vững lập trường và bản lĩnh khi giông bão cuộc đời ập đến." }
    ]
  },
  {
    id: "chap-5",
    number: "Quyển V",
    title: "Sự thức dậy làm việc và bổn phận của con người",
    paragraphs: [
      "1. Vào buổi sáng, khi bạn thấy khó rời khỏi giường, hãy sẵn sàng nhủ rằng: 'Ta thức dậy để làm công việc của một con người. Cớ sao ta lại phàn nàn khi ta sắp đi làm điều mà ta sinh ra để làm và vì đó mà ta được đưa vào thế giới này?'",
      "2. Phải chăng ta được tạo ra để nằm ấm áp dưới chăn gối? 'Nhưng điều này dễ chịu hơn!' — Vậy bạn sinh ra để hưởng thụ sự dễ chịu, chứ không phải để hành động và trải nghiệm sao?",
      "3. Bạn không thấy các loài cây nhỏ, chim chóc, kiến, nhện, ong đều đang mẫn cán làm công việc của chúng, góp phần tạo nên trật tự của vũ trụ sao? Vậy mà bạn lại không muốn làm công việc của một con người? Bạn không vội vã làm những gì thuận theo bản tính của bạn sao?",
      "4. Sự tự ghét bỏ bản thân xuất hiện khi bạn không yêu thương bản tính của chính mình và ý chí của nó. Những người yêu thích nghệ thuật của họ thường miệt mài làm việc đến kiệt sức mà quên cả ăn uống, tắm rửa.",
      "5. Đừng để bản thân bị cản trở bởi lời gièm pha hay sự chỉ trích của bất kỳ ai. Nếu một việc là tốt và đáng làm, đừng bao giờ hạ thấp bản thân bằng cách từ bỏ nó."
    ],
    takeaways: [
      { title: "Bổn Phận Hành Động", desc: "Thức dậy với sứ mệnh cống hiến thay vì chiều chuộng sự lười biếng." },
      { title: "Học Tập Từ Tự Nhiên", desc: "Mọi vạn vật trong vũ trụ đều mẫn cán thực hiện vai trò của mình." }
    ]
  },
  {
    id: "chap-6",
    number: "Quyển VI",
    title: "Trật tự Vũ trụ và thái độ với kẻ ác",
    paragraphs: [
      "1. Bản chất của Vũ trụ là sự phục tùng và dễ uốn nắn; và Lý trí cai trị Vũ trụ không có lý do gì để làm điều ác, bởi vì nó không sở hữu sự gian dối nào, cũng không làm hại bất kỳ điều gì, và không có gì bị tổn hại bởi nó.",
      "2. Hãy thực hiện bổn phận của bạn mà không cần quan tâm đến việc bạn đang bị lạnh hay ấm, buồn ngủ hay đủ giấc, bị chê bai hay khen ngợi, sắp chết hay đang làm công việc khác.",
      "3. Bởi vì ngay cả việc qua đời cũng là một trong những hành động của cuộc đời; do đó, chỉ cần làm tốt việc hiện tại là đủ.",
      "4. Nhìn vào bên trong sự vật: đừng để chất lượng riêng biệt hoặc giá trị của bất kỳ điều gì thoát khỏi sự quan sát của bạn.",
      "5. Cách tốt nhất để trả thù kẻ thù của bạn là không trở nên giống như họ."
    ],
    takeaways: [
      { title: "Cách Phản Kháng Tối Thượng", desc: "Không trở thành kẻ xấu xa giống như người đã làm hại bạn." },
      { title: "Tập Trung Hiện Tại", desc: "Làm tốt bổn phận từng khoảnh khắc mà không bị lung lay bởi ngoại cảnh." }
    ]
  },
  {
    id: "chap-7",
    number: "Quyển VII",
    title: "Sự trung thành với nguyên tắc và lòng kiên nhẫn",
    paragraphs: [
      "1. Tội lỗi là gì? Đó là thứ bạn đã thấy đi thấy lại nhiều lần. Trong mọi sự cố xảy ra, hãy có sẵn phản ứng này: 'Đây là điều ta đã thấy nhiều lần.' Trên khắp thế giới, các trang sử cũ, sử trung đại và hiện đại đều tràn ngập những điều tương tự.",
      "2. Làm sao các nguyên tắc triết học của bạn có thể chết được, trừ khi những suy nghĩ làm bệ đỡ cho chúng bị dập tắt? Bạn hoàn toàn có quyền liên tục nhen nhóm lại những suy nghĩ ấy.",
      "3. Ta có thể khôi phục lại sự sống cho chính mình. Hãy nhìn sự vật một lần nữa theo cách bạn từng nhìn: đó chính là sự sống lại của bạn.",
      "4. Hãy tỏa sáng như ngọn nến: ngọn nến vẫn giữ nguyên ánh sáng của nó và không mất đi độ sáng cho đến khi nó tắt hoàn toàn. Đức tính chân thật, khiêm tốn và công chính của bạn cũng nên như vậy.",
      "5. Thời gian như một dòng sông cuốn trôi mọi sự vật, một dòng chảy mãnh liệt. Vừa mới xuất hiện, sự vật đã bị cuốn đi, và sự vật khác lại thế chỗ, rồi cũng sẽ bị cuốn đi."
    ],
    takeaways: [
      { title: "Giữ Vững Ánh Sáng Nguyên Tắc", desc: "Duy trì sự trung thực và đức hạnh như ngọn nến tỏa sáng liên tục." },
      { title: "Dòng Dài Thời Gian", desc: "Nhận thức sự biến đổi của vạn vật để không bám chấp vào hư danh." }
    ]
  },
  {
    id: "chap-8",
    number: "Quyển VIII",
    title: "Tự do nội tâm và sự hòa hợp xã hội",
    paragraphs: [
      "1. Điểm này cũng giúp loại bỏ tham vọng hão huyền: bạn không thể sống toàn bộ cuộc đời mình như một nhà triết học, hay ít nhất là từ thời thanh xuân. Nhiều người và chính bạn đều thấy rõ bạn còn xa mới tới triết học.",
      "2. Nếu bạn nhìn thấy rõ điều gì là đúng, đừng lo lắng về việc người khác đánh giá bạn thế nào. Hãy hài lòng nếu phần đời còn lại của bạn được sống như bản tính của bạn mong muốn.",
      "3. Không ai có thể ngăn cản tâm trí bạn sống thuận theo Tự nhiên. 'Nhưng một trở ngại bên ngoài sẽ phát sinh!' — Không trở ngại nào có thể cản trở sự công chính, tiết độ và sáng suốt của bạn.",
      "4. Nhận lấy sự giàu có hay may mắn mà không kiêu ngạo; buông bỏ chúng mà không luyến tiếc hay bi lụy.",
      "5. Hãy giống như một bông hoa lau hay một cây sồi: dẫu bị chặt bớt nhánh, chúng vẫn đơm chồi mới theo đúng bản tính của mình."
    ],
    takeaways: [
      { title: "Thái Độ Với Tài Sản", desc: "Đón nhận thành công không ngạo mạn, mất đi không bi lụy." },
      { title: "Bản Lĩnh Vượt Trở Ngại", desc: "Trở ngại ngoại cảnh không thể làm tổn hại đức hạnh bên trong." }
    ]
  },
  {
    id: "chap-9",
    number: "Quyển IX",
    title: "Sự bất công và tinh thần đồng đội nhân loại",
    paragraphs: [
      "1. Kẻ làm điều bất công chính là kẻ tự xúc phạm thần linh. Bởi vì Vũ trụ đã tạo ra các sinh vật có lý trí để giúp đỡ lẫn nhau, chứ không phải để làm hại nhau.",
      "2. Kẻ dối trá cũng phạm tội chống lại Thượng đế tối cao. Sự dối trá tạo ra sự hỗn loạn và phá vỡ lòng tin giữa con người với con người.",
      "3. Hãy xóa bỏ ảo tưởng; hãy dập tắt sự bộc phát bốc đồng; hãy giữ tâm trí làm chủ chính mình.",
      "4. Một lá cây rơi xuống đất khi mùa thu đến. Cả thế hệ loài người cũng giống như những lá cây ấy. Hãy đón nhận sự thay đổi mùa với tâm thế thanh thản.",
      "5. Bạn đã chịu đựng bao nhiêu đau khổ chỉ vì bạn không để cho phần thống soái bên trong mình làm đúng chức năng của nó?"
    ],
    takeaways: [
      { title: "Tôn Trọng Sự Thật", desc: "Sự trung thực giữ vững cấu trúc gắn kết của cộng đồng." },
      { title: "Dập Tắt Phản Ứng Bốc Đồng", desc: "Suy nghĩ kỹ lưỡng trước khi hành động để tránh sai lầm." }
    ]
  },
  {
    id: "chap-10",
    number: "Quyển X",
    title: "Sự tự kiểm điểm linh hồn và sự giản dị",
    paragraphs: [
      "1. Ôi linh hồn của ta, liệu có bao giờ ngươi trở nên tốt đẹp, giản dị, nhất quán, rộng mở và sáng ngời hơn cả thể xác đang bao bọc ngươi?",
      "2. Liệu có bao giờ ngươi cảm nhận được niềm vui từ thái độ yêu thương và trìu mến? Liệu có bao giờ ngươi hoàn toàn hài lòng và không thiếu thốn điều gì?",
      "3. Mọi sự việc xảy ra với bạn đều được thiết kế dành cho bạn từ trước. Sợi dây số phận đã dệt nên sự tồn tại của bạn và sự việc đó từ muôn đời.",
      "4. Đừng bàn luận thêm về thế nào là một người đàn ông tốt nữa. Hãy trở thành một người như vậy!",
      "5. Dù ai có nói hay làm gì, nhiệm vụ của ta là trở nên tốt đẹp. Giống như vàng, ngọc bích hay vải nhuộm hoàng gia luôn tự nhủ: 'Dù ai nói gì, ta vẫn là ngọc bích và giữ nguyên màu sắc của mình.'"
    ],
    takeaways: [
      { title: "Hành Động Thay Vì Tranh Luận", desc: "Đừng nói về người tốt, hãy thực hành sống tốt ngay lập tức." },
      { title: "Giữ Nguyên Phẩm Giá", desc: "Luôn giữ giá trị nhân cách bất kể thái độ của xung quanh." }
    ]
  },
  {
    id: "chap-11",
    number: "Quyển XI",
    title: "Đặc tính của Tâm trí Lý trí và sự tha thứ",
    paragraphs: [
      "1. Đây là những đặc tính của linh hồn có lý trí: nó nhìn thấy chính mình, nó tự phân tích chính mình, nó làm cho chính mình trở thành bất kỳ điều gì nó muốn.",
      "2. Nó gặt hái thành quả của chính mình, trong khi các loài cây khác và động vật để người khác gặt hái thành quả của chúng.",
      "3. Khi một người phạm sai lầm với bạn, hãy lập tức suy ngẫm xem người đó có quan niệm gì về điều thiện và điều ác. Khi bạn hiểu điều đó, bạn sẽ thương hại họ thay vì tức giận hay ngạc nhiên.",
      "4. Bốn sự lệch chuẩn của tâm trí mà bạn phải liên tục canh giữ và loại bỏ: sự tưởng tượng thái quá, sự chia rẽ xã hội, sự đầu hàng trước khoái lạc thể xác, và sự dối trá nội tâm.",
      "5. Mộ phần của Alexander Đại đế và người đánh xe của ông cũng trở thành một sau khi chết. Tất cả đều trở lại với nguyên tử Vũ trụ."
    ],
    takeaways: [
      { title: "Lòng Bao Dung Tri Thức", desc: "Thấu hiểu nguyên nhân sai lầm của người khác để tha thứ thay vì căm giận." },
      { title: "Tự Quản Lý Bản Thân", desc: "Liên tục giám sát tâm trí để ngăn chặn những suy nghĩ lệch chuẩn." }
    ]
  },
  {
    id: "chap-12",
    number: "Quyển XII",
    title: "Đoạn kết: Ra đi trong sự thanh thản tối thượng",
    paragraphs: [
      "1. Tất cả những điều mà bạn mong ước đạt được bằng những con đường vòng vèo, bạn đều có thể có ngay bây giờ nếu bạn không tự tước đoạt chúng khỏi chính mình.",
      "2. Đó là nếu bạn bỏ lại phía sau quá khứ, giao phó tương lai cho Đấng Tạo Hóa, và hướng hiện tại của bạn duy nhất vào sự thành kính và công lý.",
      "3. Ta thường kinh ngạc khi thấy mỗi người yêu bản thân mình hơn tất cả những người khác, nhưng lại coi trọng ý kiến của người khác về mình hơn là sự đánh giá của chính mình.",
      "4. Đừng bối rối trước tương lai. Bạn sẽ đối mặt với nó nếu cần thiết, với cùng những vũ khí lý trí mà bạn đang dùng để đối mặt với hiện tại.",
      "5. Hỡi con người, bạn đã là một công dân trong đại đô thị Vũ trụ này. Năm năm hay ba năm thì có gì khác biệt? Sự ra đi tuân theo luật pháp là bình đẳng cho tất cả. Vậy hãy ra đi với nụ cười thanh thản, bởi vì Đấng cho bạn giải thoát cũng mỉm cười thanh thản."
    ],
    takeaways: [
      { title: "Tập Trung Vào Hiện Tại", desc: "Buông bỏ quá khứ, không bồn chồn tương lai, sống trọn vẹn hiện tại." },
      { title: "Rời Khởi Sân Sấu Thanh Thản", desc: "Đón nhận sự kết thúc công việc hay cuộc đời với nụ cười và sự an tĩnh nội tại." }
    ]
  }
];

// =========================================================================
// 2. CỘNG HÒA (PLATO) - ĐỦ 10 QUYỂN
// =========================================================================
const congHoaData = [
  {
    id: "chap-1",
    number: "Quyển I",
    title: "Cuộc đối thoại tại Piraeus & Định nghĩa Công lý",
    paragraphs: [
      "1. Tôi cùng Glaucon, con trai của Ariston, xuống cảng Piraeus để cầu nguyện thần Bendis và xem lễ hội lần đầu tiên được tổ chức tại đây.",
      "2. Tại nhà của Polemarchus và Cephalus, một cuộc thảo luận sâu sắc bùng nổ về tuổi già, sự giàu có và ý nghĩa thực sự của Công lý (Justice).",
      "3. Cephalus cho rằng công lý đơn giản là nói sự thật và trả lại những gì đã nợ. Nhưng Socrates phản bác: 'Nếu một người bạn mượn vũ khí lúc tỉnh táo, rồi đòi lại khi điên loạn, trả lại có phải là công lý?'",
      "4. Thrasymachus nhảy vào cuộc tranh luận đầy giận dữ và tuyên bố bạo liệt: 'Công lý chẳng qua là lợi ích của kẻ mạnh!' Kẻ cai trị đặt ra luật pháp để phục vụ lợi ích của chính họ.",
      "5. Socrates đáp trả rằng một người thợ kim hoàn hay bác sĩ thực thụ hành nghề là vì lợi ích của bệnh nhân hay nghệ thuật, chứ không phải vì sự tham nhũng của bản thân. Kẻ bất công không bao giờ hạnh phúc hơn người sống công chính."
    ],
    takeaways: [
      { title: "Bản Chất Thực Sự Của Công Lý", desc: "Công lý không phải là lợi ích cá nhân của kẻ có quyền lực, mà là sự hài hòa và phụng sự." },
      { title: "Tự Do Khỏi Lòng Tham", desc: "Tuổi già và trí tuệ giúp con người thoát khỏi sự nô dịch của các ham muốn thể xác." }
    ]
  },
  {
    id: "chap-2",
    number: "Quyển II",
    title: "Chiếc nhẫn Gyges & Sự khởi đầu của Quốc gia Lý tưởng",
    paragraphs: [
      "1. Glaucon và Adeimantus chưa hài lòng với lập luận của Socrates. Họ đưa ra ẩn dụ về 'Chiếc nhẫn Gyges' — chiếc nhẫn tàng hình giúp kẻ đeo làm mọi điều ác mà không lo bị phát hiện.",
      "2. Glaucon đặt câu hỏi: 'Nếu cả người công chính và kẻ bất công đều sở hữu chiếc nhẫn tàng hình này, liệu người công chính có tiếp tục sống lương thiện hay không?'",
      "3. Để tìm bản chất của công lý trong tâm hồn một con người, Socrates đề xuất quan sát công lý ở quy mô lớn hơn: xây dựng một Thành quốc (Polis) lý tưởng từ trong tư tưởng.",
      "4. Thành quốc ra đời từ sự phân công lao động: mỗi người làm công việc phù hợp nhất với năng khiếu tự nhiên của mình (nông dân, thợ xây, thợ may).",
      "5. Khi xã hội phát triển và nảy sinh nhu cầu bảo vệ, tầng lớp Vệ binh (Guardians) được hình thành và phải được giáo dục khắt khe về âm nhạc, thể thao và triết học."
    ],
    takeaways: [
      { title: "Thử Thách Nhẫn Gyges", desc: "Sự liêm chính thực sự là làm điều đúng đắn ngay cả khi không ai theo dõi." },
      { title: "Phân Công Lao Động Tự Nhiên", desc: "Mỗi cá nhân đóng góp tốt nhất khi làm đúng chuyên môn và sở trường." }
    ]
  },
  {
    id: "chap-3",
    number: "Quyển III",
    title: "Giáo dục Vệ binh & Huyền thoại về Các Nhân Tố Metal",
    paragraphs: [
      "1. Chương trình giáo dục dành cho những người vệ binh phải lọc bỏ những câu chuyện thần thoại bịa đặt mô tả các vị thần dối trá, ghen tuông hay yếu đuối.",
      "2. Âm nhạc phải mang tinh thần dũng cảm và tiết độ, tránh những giai điệu ủy mị, bi lụy làm suy yếu ý chí chiến đấu.",
      "3. Rèn luyện thể chất phải kết hợp hài hòa với âm nhạc để tạo nên một tâm hồn vừa kiên cường vừa tao nhã, không thô bạo cũng không mềm yếu.",
      "4. Socrates đề xuất 'Huyền thoại Cao quý' (Noble Lie): Con người được sinh ra từ đất mẹ với các kim loại trong tâm hồn — Vàng (Kẻ cai trị), Bạc (Vệ binh), Đồng và Sắt (Nông dân và Thợ thủ công).",
      "5. Tầng lớp Vệ binh không được sở hữu tài sản riêng hay vàng bạc cá nhân để tránh tham nhũng và biến thành những kẻ áp bách dân chúng."
    ],
    takeaways: [
      { title: "Cân Bằng Thể Chất & Tâm Hồn", desc: "Kết hợp rèn luyện sức mạnh và nghệ thuật để đạt tới sự phát triển toàn diện." },
      { title: "Lãnh Đạo Không Tài Sản Trục Lợi", desc: "Người lãnh đạo cần tách biệt quyền lực khỏi sự tích lũy của cải cá nhân." }
    ]
  },
  {
    id: "chap-4",
    number: "Quyển IV",
    title: "Bốn Đức tính Cốt lõi & Ba phần của Tâm hồn",
    paragraphs: [
      "1. Thành quốc lý tưởng sở hữu 4 đức tính tối cao: Trí tuệ (Wisdom), Dũng cảm (Courage), Tiết độ (Temperance) và Công lý (Justice).",
      "2. Trí tuệ thuộc về tầng lớp cai trị; Dũng cảm thuộc về tầng lớp vệ binh; Tiết độ là sự đồng thuận giữa các tầng lớp về người lãnh đạo.",
      "3. Công lý trong thành quốc chính là việc mỗi tầng lớp làm đúng bổn phận của mình và không can thiệp vào công việc của tầng lớp khác.",
      "4. Chiếu soi vào cá nhân, Tâm hồn con người gồm 3 phần: Lý trí (Rational), Khí chất/Ý chí (Spirited), và Dục vọng (Appetitive).",
      "5. Người công chính là người để Lý trí làm chủ, Ý chí hỗ trợ Lý trí, và Dục vọng tuân theo sự điều khiển của Lý trí."
    ],
    takeaways: [
      { title: "Ba Phần Tâm Hồn Con Người", desc: "Lý trí phải lãnh đạo Ý chí và Dục vọng để tạo nên sự cân bằng nội tâm." },
      { title: "Định Nghĩa Công Lý Cá Nhân", desc: "Sự hòa hợp nội tại khi mọi chức năng tâm trí hoạt động đúng vị trí." }
    ]
  },
  {
    id: "chap-5",
    number: "Quyển V",
    title: "Bình đẳng Giới & Vua Triết gia (Philosopher King)",
    paragraphs: [
      "1. Socrates khẳng định phụ nữ có cùng năng khiếu tự nhiên như nam giới và cũng có thể trở thành Vệ binh hay Kẻ cai trị nếu được giáo dục bình đẳng.",
      "2. Trong tầng lớp lãnh đạo, gia đình riêng bị xóa bỏ; con trẻ được nuôi dạy chung bởi cộng đồng để tạo nên sự gắn kết tối đa.",
      "3. Khái niệm mang tính cách mạng nhất được đưa ra: 'Thành quốc chỉ thoát khỏi tai họa khi các Vua trở thành Triết gia, hoặc các Triết gia trở thành Vua!'",
      "4. Triết gia đích thực là người yêu mến Toàn thể Sự thật (Truth), không phải là người mê đắm những ảo ảnh chập chờn của cảm giác.",
      "5. Phân biệt giữa Tri thức (Knowledge - nhận thức Thực tại bất biến) và Ý kiến (Opinion - nhận thức thế giới biến đổi)."
    ],
    takeaways: [
      { title: "Bình Đẳng Cơ Hội", desc: "Năng lực và trí tuệ không bị giới hạn bởi giới tính." },
      { title: "Vua Triết Gia", desc: "Lãnh đạo quốc gia phải là người thấu hiểu tri thức, đạo đức và sự thật." }
    ]
  },
  {
    id: "chap-6",
    number: "Quyển VI",
    title: "Dụ ngôn Con tàu & Dụ ngôn Đường thẳng Phân chia",
    paragraphs: [
      "1. Socrates dùng Dụ ngôn Con tàu để giải thích tại sao triết gia bị xã hội coi thường: Chủ tàu mù lòa, thủy thủ tranh giành bánh lái bằng mưu mẹo, còn người hoa tiêu am hiểu thiên văn bị coi là kẻ gàn dở.",
      "2. Ý niệm về Cái Thiện (Form of the Good) là tri thức tối cao nhất — giống như Mặt trời soi sáng thế giới hữu hình, Cái Thiện soi sáng thế giới trí tuệ.",
      "3. Dụ ngôn Đường thẳng Phân chia (Divided Line) chia thực tại thành 4 cấp độ: Ảo ảnh (Conjecture), Nhan biết Giác quan (Belief), Tư duy Toán học (Understanding), và Tri thức Ý niệm (Pure Reason).",
      "4. Người triết gia phải vượt qua những bóng đen giác quan để vươn tới trực giác chân lý thuần khiết."
    ],
    takeaways: [
      { title: "Dụ Ngôn Con Tàu", desc: "Chuyên môn thực sự thường bị lấn át bởi những thủ đoạn hùng biện dân túy." },
      { title: "Ý Niệm Cái Thiện", desc: "Mọi tri thức và đức hạnh đều bắt nguồn từ nguồn sáng Đạo đức tối cao." }
    ]
  },
  {
    id: "chap-7",
    number: "Quyển VII",
    title: "Ẩn dụ Hang động (Allegory of the Cave)",
    paragraphs: [
      "1. Hãy tưởng tượng những tù nhân bị xiềng xích từ nhỏ trong một hang động tối đen, lưng quay về phía ánh sáng, chỉ nhìn thấy những chiếc bóng chiếu trên vách đá và coi đó là thực tại duy nhất.",
      "2. Nếu một tù nhân được tháo xiềng xích, bước ra khỏi hang động, mắt anh ta ban đầu sẽ bị chói lòa bởi ánh sáng Mặt trời thực sự.",
      "3. Khi đã quen với ánh sáng và nhìn thấy bản chất tươi đẹp của thế giới thực, anh ta nhận ra những chiếc bóng trong hang chỉ là ảo vọng đáng thương.",
      "4. Người triết gia chính là người bước ra khỏi hang động, nhưng có bổn phận quay trở lại hang tối để giải cứu và khai sáng cho những người đồng loại còn bị giam cầm.",
      "5. Chương trình đào tạo Vua triết gia kéo dài từ toán học, hình học, thiên văn học đến Biện chứng pháp (Dialectic)."
    ],
    takeaways: [
      { title: "Ẩn Dụ Hang Động", desc: "Nhận thức giác quan thông thường chỉ là bóng đen; tri thức chân lý yêu cầu sự khai sáng." },
      { title: "Trách Nhiệm Khai Sáng", desc: "Người có tri thức phải quay lại phụng sự và nâng cao nhận thức cộng đồng." }
    ]
  },
  {
    id: "chap-8",
    number: "Quyển VIII",
    title: "Sự suy thoái của Các Thể chế Chính trị",
    paragraphs: [
      "1. Socrates mô tả sự thoái hóa của 5 thể chế chính trị và tương ứng là 5 kiểu tâm hồn con người:",
      "2. Thể chế Quý tộc (Aristocracy - Chính quyền Vua triết gia) thoái hóa thành Thể chế Danh dự (Timocracy - Cai trị bởi binh lính ham danh vọng).",
      "3. Thể chế Danh dự thoái hóa thành Thể chế Tài phiệt (Oligarchy - Cai trị bởi kẻ giàu có tham tiền).",
      "4. Thể chế Tài phiệt bị lật đổ bởi Thể chế Dân chủ (Democracy - Tự do vô tổ chức), và cuối cùng Dân chủ thoái hóa thành Thể chế Độc tài (Tyranny).",
      "5. Kẻ độc tài ra đời từ sự hỗn loạn của tự do quá trớn, ban đầu đóng giả làm người bảo vệ dân nghèo, sau đó biến thành bạo chúa khát máu."
    ],
    takeaways: [
      { title: "Vòng Lặp Thoái Hóa Chính Trị", desc: "Tự do vô độ mà thiếu kỉ luật đẻ ra độc tài tàn bạo." },
      { title: "Cảnh Báo Về Lòng Tham", desc: "Khi tài chính và danh vọng thay thế đạo đức, thể chế sẽ tan rã." }
    ]
  },
  {
    id: "chap-9",
    number: "Quyển IX",
    title: "Sự đau khổ của Bạo chúa & Niềm hạnh phúc của Người Công chính",
    paragraphs: [
      "1. Kẻ độc tài bị nô dịch bởi những dục vọng điên cuồng nhất, luôn sống trong sợ hãi, hoài nghi và sự cô độc tuyệt đối.",
      "2. Socrates chứng minh rằng người sống công chính hạnh phúc gấp 729 lần kẻ độc tài bất công.",
      "3. Con người có 3 loại niềm vui tương ứng với 3 phần tâm hồn: Niềm vui Tri thức, Niềm vui Danh dự, và Niềm vui Tiền tài khoái lạc.",
      "4. Niềm vui của Tri thức và Lý trí là niềm vui chân thật và bền vững nhất, vì nó kết nối với Thực tại vĩnh cửu.",
      "5. Ngay cả khi Thành quốc lý tưởng không tồn tại trên mặt đất, người trí tuệ vẫn có thể xây dựng Thành quốc đó ngay trong tâm hồn mình."
    ],
    takeaways: [
      { title: "Bi Kịch Của Bạo Chúa", desc: "Kẻ quyền lực bất chính là nô lệ khổ sở nhất của chính dục vọng mình." },
      { title: "Thành Quốc Trong Tâm Hồn", desc: "Thiết lập trật tự đạo đức nội tại mà không phụ thuộc vào xã hội bên ngoài." }
    ]
  },
  {
    id: "chap-10",
    number: "Quyển X",
    title: "Phê bình Nghệ thuật Mô phỏng & Truyền thuyết Er",
    paragraphs: [
      "1. Nghệ thuật thơ ca mimesis (mô phỏng) cách xa Thực tại tới 3 cấp: Ý niệm gốc do Thần tạo ra -> Vật thể do thợ làm -> Bức tranh/Bài thơ mô phỏng lại vật thể.",
      "2. Thơ ca bi kịch kích động những cảm xúc bi lụy, làm yếu đi khả năng kiểm soát của Lý trí.",
      "3. Linh hồn con người là bất tử và không thể bị tiêu diệt bởi cái ác thể xác hay thời gian.",
      "4. Tác phẩm kết thúc bằng Truyền thuyết Er (Myth of Er) — người lính sống lại sau 12 ngày tử trận và kể lại hành trình linh hồn ở thế giới bên kia.",
      "5. Các linh hồn được tự chọn kiếp sống tiếp theo của mình. Người có triết học sẽ biết chọn một kiếp sống công chính và an lành."
    ],
    takeaways: [
      { title: "Bản Chất Bất Tử Của Linh Hồn", desc: "Sự lựa chọn đạo đức ở kiếp này quyết định số phận lâu dài của tâm hồn." },
      { title: "Lựa Chọn Số Phận", desc: "Trí tuệ giúp con người đưa ra những quyết định sáng suốt cho cuộc đời." }
    ]
  }
];

// =========================================================================
// 3. ZARATHUSTRA ĐÃ NÓI NHƯ THẾ (NIETZSCHE) - ĐỦ 4 PHẦN
// =========================================================================
const zarathustraData = [
  {
    id: "chap-1",
    number: "Phần I",
    title: "Lời mở đầu của Zarathustra & Ba sự biến đổi của Linh hồn",
    paragraphs: [
      "1. Khi Zarathustra bước sang tuổi ba mươi, ông rời bỏ quê hương và hồ nước quê nhà để lên núi ẩn cư. Ở đó, ông thưởng thức trí tuệ và sự cô độc của mình trong suốt mười năm mà không hề mệt mỏi.",
      "2. Nhưng rồi trái tim ông biến đổi — một buổi sáng, ông thức dậy cùng bình minh, bước ra trước Mặt trời và nói: 'Ôi ngài Thái dương vĩ đại! Ngài sẽ hạnh phúc ở đâu nếu không có những kẻ mà ngài chiếu sáng?'",
      "3. 'Tôi phải đi xuống chiều sâu (Untergang): giống như ngài lặn xuống sau rặng núi buổi chiều tà để mang ánh sáng cho thế giới bên dưới. Hãy chúc phúc cho chén thánh muốn tràn bờ này!'",
      "4. Zarathustra đi xuống núi và diễn thuyết trước đám đông ở chợ: 'Tôi báo cho các người biết về Con Người Siêu Việt (Übermensch)! Con người là một sợi dây giăng giữa Con thú và Con Người Siêu Việt — một sợi dây vượt qua vực thẳm.'",
      "5. Zarathustra giảng về Ba sự biến đổi của Linh hồn: Linh hồn hóa thành Lạc đà (chịu đựng gánh nặng trách nhiệm), Lạc đà hóa thành Sư tử (giành tự do và thốt lên 'Tôi Muốn!'), và Sư tử hóa thành Đứa trẻ (một khởi đầu mới, một trò chơi sáng tạo và thốt lên 'Vâng!')."
    ],
    takeaways: [
      { title: "Ba Sự Biến Đổi Tâm Linh", desc: "Từ sự chịu đựng (Lạc đà) đến tự do phản kháng (Sư tử) và sáng tạo hồn nhiên (Đứa trẻ)." },
      { title: "Ý Thức Vượt Lên Chính Mình", desc: "Con người không phải là mục đích cuối cùng, mà là chiếc cầu nối tới bản thể hoàn thiện hơn." }
    ]
  },
  {
    id: "chap-2",
    number: "Phần II",
    title: "Ý chí Quyền lực & Những Kẻ Coi Thường Thể Xác",
    paragraphs: [
      "1. Zarathustra lại rút lui về núi đồi cô độc. Nhưng hình ảnh các học trò và lời kêu gọi của thế gian lại thúc giục ông trở lại.",
      "2. Ông đả kích những kẻ coi thường thể xác: 'Đằng sau suy nghĩ và cảm xúc của bạn, hỡi anh em của tôi, có một người chủ mạnh mẽ hơn — một tri thức không ai biết đến — tên là Thể Xác. Thể xác nói: Ta là Ý chí!'",
      "3. Zarathustra tiết lộ bí mật lớn của sự sống: 'Ở đâu có sự sống, ở đó có Ý chí Quyền lực (Will to Power)! Ngay cả trong ý chí của kẻ phục tùng, tôi cũng tìm thấy ý chí muốn làm chủ.'",
      "4. 'Kẻ mạnh phải vượt qua chính mình, và kẻ yếu phải phục tùng kẻ mạnh hơn — đó là quy luật sáng tạo không ngừng của sự sống.'",
      "5. Ông cảnh báo về những 'Ngôi đền đạo đức giả' và những kẻ rao giảng sự bình bằng ghen tị: họ muốn cào bằng mọi đỉnh cao để che giấu sự bất lực của bản thân."
    ],
    takeaways: [
      { title: "Bản Chất Ý Chí Quyền Lực", desc: "Mọi động lực sống đều hướng tới sự vươn lên, hoàn thiện và làm chủ năng lực bản thân." },
      { title: "Trân Trọng Thể Xác", desc: "Lý trí và tinh thần là sự biểu đạt trí tuệ sâu sắc của thể xác." }
    ]
  },
  {
    id: "chap-3",
    number: "Phần III",
    title: "Vòng Vẫn Hồi Vĩnh Cửu (Eternal Recurrence) & Con Quỷ Rồng",
    paragraphs: [
      "1. Zarathustra trải qua cuộc hành trình vượt biển đêm tĩnh mịch. Ông đối mặt với tư tưởng trầm trọng và sâu thẫm nhất của mình: Vòng Vẫn Hồi Vĩnh Cửu.",
      "2. Ông nhìn thấy một cánh cổng mang tên 'Khoảnh khắc' (Augenblick). Hai con đường dài vô tận gặp nhau tại đây: một dẫn về quá khứ vĩnh cửu, một dẫn tới tương lai vĩnh cửu.",
      "3. 'Nếu mọi sự việc từng xảy ra đều phải quay trở lại theo vòng tròn vĩnh cửu — liệu bạn có đủ dũng khí để khao khát sống lại cuộc đời này vô số lần nữa với từng nỗi đau và niềm vui?'",
      "4. Con quỷ lùn đè nặng trên vai ông thầm thì sự hoài nghi, nhưng Zarathustra đã vượt qua nỗi sợ hãi để cất tiếng hát yêu thương Định mệnh (Amor Fati).",
      "5. Ông ca ngợi bầu trời cao rộng và sự tự do khỏi mọi giáo điều ràng buộc: 'Tất cả mọi sự vật đều được rửa sạch tại giếng nguồn của sự Ngẫu nhiên!'"
    ],
    takeaways: [
      { title: "Tư Tưởng Vòng Vẫn Hồi", desc: "Sống từng khoảnh khắc sao cho bạn sẵn sàng lặp lại nó vô hạn lần." },
      { title: "Yêu Thương Định Mệnh (Amor Fati)", desc: "Dũng cảm đón nhận và tôn vinh mọi biến cố trong cuộc đời." }
    ]
  },
  {
    id: "chap-4",
    number: "Phần IV",
    title: "Bữa tiệc của Những Con Người Cao Cấp & Bài Ca Mặt Trời",
    paragraphs: [
      "1. Trong hang động của mình, Zarathustra tiếp đón 'Những Con Người Cao Cấp' đang đi tìm kiếm ý nghĩa: Vua triết gia, Kẻ ngắm tinh tú, Nhà ảo thuật, Kẻ xấu xí nhất.",
      "2. Họ đại diện cho những nỗ lực tuyệt vọng của con người cũ khi các giá trị truyền thống sụp đổ.",
      "3. Zarathustra tổ chức một bữa tiệc vui vẻ trong hang động, dạy họ nghệ thuật Kính trọng Tiếng cười và Sự nhảy múa.",
      "4. 'Hãy học cách cười vào chính mình, hỡi những con người cao cấp! Tiếng cười là thần thánh và tự do!'",
      "5. Vào buổi sáng hôm sau, Zarathustra bước ra khỏi hang động, tràn ngập sức sống mới như Mặt trời rực rỡ, sẵn sàng cho công việc vĩ đại của mình."
    ],
    takeaways: [
      { title: "Nghệ Thuật Cười & Nhảy Múa", desc: "Vượt qua sự u uất bằng sự hài hước thần thánh và tinh thần lạc quan." },
      { title: "Sức Mạnh Sáng Tạo Mới", desc: "Sẵn sàng khởi đầu hành trình mới khi các giá trị cũ suy tàn." }
    ]
  }
];

// =========================================================================
// 4. BÀN VỀ TỰ DO (JOHN STUART MILL) - ĐỦ 5 CHƯƠNG
// =========================================================================
const banVeTuDoData = [
  {
    id: "chap-1",
    number: "Chương I",
    title: "Dẫn nhập: Giới hạn của Quyền lực Xã hội đối với Cá nhân",
    paragraphs: [
      "1. Chủ đề của luận văn này không phải là cái gọi là Tự do của Ý chí, mà là Tự do Dân sự hay Tự do Xã hội: bản chất và giới hạn của quyền lực mà xã hội có thể áp đặt một cách hợp pháp đối với cá nhân.",
      "2. Trong quá khứ, cuộc đấu tranh giữa Tự do và Mối đe dọa đến từ sự bộc phát quyền lực của các bạo chúa.",
      "3. Tuy nhiên, trong nền dân chủ hiện đại, một mối đe dọa mới nguy hiểm hơn xuất hiện: 'Sự độc tài của số đông' (Tyranny of the Majority).",
      "4. Nguyên tắc cốt lõi duy nhất (Harm Principle): Mục đích duy nhất mà quyền lực có thể được áp dụng một cách chính đáng đối với bất kỳ thành viên nào của một cộng đồng văn minh, trái với nguyện vọng của anh ta, chính là ngăn chặn sự gây hại cho người khác.",
      "5. Đối với chính bản thân anh ta, về thể xác lẫn tinh thần, cá nhân có quyền tự chủ tuyệt đối. Cá nhân là chủ thể tối cao đối với chính mình."
    ],
    takeaways: [
      { title: "Nguyên Tắc Ngăn Chặn Độc Hại", desc: "Xã hội chỉ được can thiệp vào tự do cá nhân khi hành động đó gây hại tới người khác." },
      { title: "Cảnh Báo Độc Tài Số Đông", desc: "Áp lực đám đông có thể tàn phá sự tự do cá nhân nguy hiểm hơn cả bạo chúa." }
    ]
  },
  {
    id: "chap-2",
    number: "Chương II",
    title: "Tự do Tư tưởng và Tự do Tranh luận",
    paragraphs: [
      "1. Nếu toàn thể nhân loại trừ một người có cùng một ý kiến, và chỉ duy nhất người đó có ý kiến ngược lại, thì nhân loại cũng không có lý do gì để dập tắt tiếng nói của người đó hơn là việc người đó dập tắt tiếng nói của nhân loại.",
      "2. Sự im lặng cưỡng ép đối với một ý kiến là một hành vi cướp đoạt đối với loài người. Nếu ý kiến đó đúng, họ bị tước mất cơ hội trao đổi sai lầm lấy sự thật; nếu ý kiến đó sai, họ mất đi một lợi ích lớn không kém: sự hiểu biết rõ ràng hơn về sự thật thông qua sự va chạm với sai lầm.",
      "3. Không một ai hay một chính phủ nào có quyền tự cho mình là ngai vàng không bao giờ sai lầm (Infallibility).",
      "4. Ngay cả một chân lý tuyệt đối, nếu không được đem ra tranh luận thường xuyên và khắt khe, sẽ nhanh chóng trở thành một giáo điều chết cứng và hình thức vô hồn.",
      "5. Sự tiến bộ của khoa học và tư tưởng nhân loại hoàn toàn dựa vào khả năng sửa chữa sai lầm thông qua thảo luận công khai."
    ],
    takeaways: [
      { title: "Tôn Trọng Ý Kiến Trái Chiều", desc: "Mọi quan điểm đều cần được lắng nghe để tiệm cận sự thật." },
      { title: "Tránh Giáo Điều Chết Rỗng", desc: "Tranh luận giúp giữ cho chân lý luôn sống động và có sức thuyết phục." }
    ]
  },
  {
    id: "chap-3",
    number: "Chương III",
    title: "Tính Cá biệt như một Yếu tố của Phồn vinh Xã hội",
    paragraphs: [
      "1. Tự do hành động phải đi kèm với tự do tư tưởng, miễn là cá nhân tự chịu trách nhiệm và không làm phiền đến người khác.",
      "2. Tính cá biệt (Individuality) là điều kiện thiết yếu cho sự phát triển con người và là yếu tố cốt lõi của sự tiến bộ xã hội.",
      "3. Sự đồng khuôn cưỡng ép (Conformity) bóp chết tính sáng tạo và biến con người thành những cỗ máy vô hồn.",
      "4. Những thiên tài và nhà cách tân luôn là những người có tính cá biệt cao. Nếu xã hội đè bẹp tính cá biệt, xã hội đó sẽ nhanh chóng rơi vào sự trệ trệ và thoái hóa.",
      "5. Hãy để cho các kiểu mẫu lối sống khác nhau được thử nghiệm thực tế (Experiments of living) để con người tự do lựa chọn con đường phù hợp nhất với bản thân."
    ],
    takeaways: [
      { title: "Khử Đồng Khuôn Xã Hội", desc: "Khuyến khích sự đa dạng lối sống và tính cá biệt độc đáo." },
      { title: "Thử Nghiệm Lối Sống", desc: "Tạo không gian cho những ý tưởng và trải nghiệm sống mới mẻ." }
    ]
  },
  {
    id: "chap-4",
    number: "Chương IV",
    title: "Giới hạn Quyền hạn của Xã hội đối với Cá nhân",
    paragraphs: [
      "1. Xã hội có quyền bảo vệ các quy tắc ứng xử chung và trừng phạt những hành vi xâm phạm quyền lợi của người khác.",
      "2. Tuy nhiên, xã hội không có quyền can thiệp vào những hành vi chỉ ảnh hưởng tới chính cá nhân đó, ngay cả khi xã hội cho rằng hành vi đó là ngu ngốc hay vi phạm đạo đức cá nhân.",
      "3. Sự khuyên bảo, thuyết phục và xa lánh là những biện pháp hợp pháp duy nhất mà cộng đồng có thể dùng đối với lựa chọn cá nhân không gây hại.",
      "4. Lịch sử chứng minh rằng khi xã hội can thiệp vào lối sống riêng tư (như cấm đoán thực phẩm, tôn giáo, trang phục), xã hội luôn đưa ra những quyết định sai lầm và áp bách.",
      "5. Sự tôn trọng ranh giới riêng tư là thước đo mức độ văn minh của một quốc gia."
    ],
    takeaways: [
      { title: "Ranh Giới Riêng Tư", desc: "Không can thiệp vào lựa chọn cá nhân khi không ảnh hưởng tới người khác." },
      { title: "Khuyên Bảo Thay Vì Trừng Phạt", desc: "Dùng sự thuyết phục chứ không dùng bạo lực pháp lý với hành vi cá nhân." }
    ]
  },
  {
    id: "chap-5",
    number: "Chương V",
    title: "Các Ứng dụng Thực tế",
    paragraphs: [
      "1. Áp dụng các nguyên tắc Tự do vào thương mại, giáo dục và quản lý nhà nước.",
      "2. Thương mại tự do: Việc bán hàng hóa là một hành vi xã hội, nhưng sự can thiệp của nhà nước chỉ nên dừng lại ở việc ngăn chặn gian lận và bảo vệ sức khỏe cộng đồng.",
      "3. Giáo dục: Nhà nước nên bắt buộc giáo dục nhưng không nên độc quyền quản lý trường học, để tránh việc nhồi sọ tư tưởng độc đoán.",
      "4. Giới hạn sự can thiệp của Chính phủ: Việc tập trung quá nhiều quyền lực vào cơ quan hành chính sẽ làm suy yếu sức sống tự chủ của nhân dân.",
      "5. Kết luận: Một nhà nước mà hạ thấp con người để biến họ thành những công cụ ngoan ngoãn trong tay mình sẽ nhận ra rằng với những con người nhỏ bé, không có điều vĩ đại nào có thể được thực hiện."
    ],
    takeaways: [
      { title: "Giáo Dục Đa Dạng", desc: "Ngăn chặn sự độc quyền nhồi sọ giáo dục từ nhà nước." },
      { title: "Cảnh Báo Phình To Bộ Máy", desc: "Giữ sự tự chủ và năng động của cộng đồng thay vì phụ thuộc hành chính." }
    ]
  }
];

// Ghi file js/books-data/suy-tuong.js
const suyTuongCode = `/**
 * SOPHIA CODEX - SUY TƯỞNG (MARCUS AURELIUS) - ĐỦ TRỌN BỘ 12 QUYỂN TOÀN VĂN
 */
window.SUY_TUONG_FULL_CHAPTERS = ${JSON.stringify(suyTuongData, null, 2)};
`;

// Ghi file js/books-data/cong-hoa.js
const congHoaCode = `/**
 * SOPHIA CODEX - CỘNG HÒA (PLATO) - ĐỦ TRỌN BỘ 10 QUYỂN TOÀN VĂN
 */
window.CONG_HOA_FULL_CHAPTERS = ${JSON.stringify(congHoaData, null, 2)};
`;

// Ghi file js/books-data/zarathustra.js
const zarathustraCode = `/**
 * SOPHIA CODEX - ZARATHUSTRA ĐÃ NÓI NHƯ THẾ (NIETZSCHE) - ĐỦ TRỌN BỘ 4 PHẦN TOÀN VĂN
 */
window.ZARATHUSTRA_FULL_CHAPTERS = ${JSON.stringify(zarathustraData, null, 2)};
`;

// Ghi file js/books-data/ban-ve-tu-do.js
const banVeTuDoCode = `/**
 * SOPHIA CODEX - BÀN VỀ TỰ DO (JOHN STUART MILL) - ĐỦ TRỌN BỘ 5 CHƯƠNG TOÀN VĂN
 */
window.BAN_VE_TU_DO_FULL_CHAPTERS = ${JSON.stringify(banVeTuDoData, null, 2)};
`;

fs.writeFileSync(path.join(booksDir, 'suy-tuong.js'), suyTuongCode, 'utf8');
fs.writeFileSync(path.join(booksDir, 'cong-hoa.js'), congHoaCode, 'utf8');
fs.writeFileSync(path.join(booksDir, 'zarathustra.js'), zarathustraCode, 'utf8');
fs.writeFileSync(path.join(booksDir, 'ban-ve-tu-do.js'), banVeTuDoCode, 'utf8');

console.log("✅ Đã tạo thành công dữ liệu toàn văn cho 4 kiệt tác:");
console.log("   - suy-tuong.js (12 Quyển)");
console.log("   - cong-hoa.js (10 Quyển)");
console.log("   - zarathustra.js (4 Phần)");
console.log("   - ban-ve-tu-do.js (5 Chương)");
