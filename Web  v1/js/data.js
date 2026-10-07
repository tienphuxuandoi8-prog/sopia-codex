/**
 * SOPHIA CODEX - PHILOSOPHY DATABASE (BẢN TOÀN VĂN CHI TIẾT)
 * Sách triết học kinh điển toàn văn, đầy đủ các chương mục dịch thuật chuẩn xác,
 * âm thanh thu âm phòng thu (Studio Audio) và chân dung triết gia bảo tàng.
 */

const PHILOSOPHY_DATA = {
  stats: {
    totalBooks: 5,
    totalChapters: 24,
    totalAudioHours: "18.5 giờ",
    readersCount: "68,400+"
  },

  categories: [
    { id: "all", name: "Tất cả trường phái", icon: "book-open", count: 5 },
    { id: "stoicism", name: "Chủ nghĩa Khắc Kỷ", icon: "shield", count: 1 },
    { id: "eastern", name: "Triết học Phương Đông", icon: "sun", count: 1 },
    { id: "existentialism", name: "Chủ nghĩa Hiện sinh", icon: "compass", count: 1 },
    { id: "classical", name: "Hy Lạp & La Mã Cổ Đại", icon: "landmark", count: 1 },
    { id: "enlightenment", name: "Thời kỳ Khai Sáng", icon: "feather", count: 1 }
  ],

  philosophers: [
    {
      id: "marcus-aurelius",
      name: "Marcus Aurelius",
      title: "Hoàng đế Triết gia La Mã",
      era: "121 – 180 SCN",
      school: "Chủ nghĩa Khắc Kỷ (Stoicism)",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Marcus_Aurelius_Louvre_MR561_n01.jpg/400px-Marcus_Aurelius_Louvre_MR561_n01.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&auto=format&fit=crop&q=80",
      quote: "Hạnh phúc cuộc đời bạn phụ thuộc vào chất lượng những suy nghĩ của bạn.",
      bio: "Vị hoàng đế cuối cùng trong thời kỳ 'Năm vị minh quân' của Đế quốc La Mã. Giữa sa trường và đại dịch Antonine, ông viết 'Suy Tưởng' như một tấm gương soi chiếu nội tâm.",
      bookId: "suy-tuong",
      color: "from-emerald-900 to-stone-900"
    },
    {
      id: "socrates",
      name: "Plato & Socrates",
      title: "Cội nguồn Triết học Phương Tây",
      era: "428 – 348 TCN",
      school: "Triết học Cổ điển Hy Lạp",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/400px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80",
      quote: "Một cuộc đời không có sự chất vấn và tự soi chiếu là một cuộc đời không đáng sống.",
      bio: "Học trò xuất sắc của Socrates và thầy của Aristotle. Ông sáng lập Viện Hàn lâm Athens - cơ sở giáo dục đại học đầu tiên của thế giới phương Tây.",
      bookId: "cong-hoa",
      color: "from-blue-950 to-slate-900"
    },
    {
      id: "lao-tzu",
      name: "Lão Tử",
      title: "Bậc thầy Đạo Gia",
      era: "Thế kỷ 6 TCN",
      school: "Triết học Phương Đông",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Zhang_Lu-Laozi_Riding_an_Ox.jpg/400px-Zhang_Lu-Laozi_Riding_an_Ox.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80",
      quote: "Biết người là thông minh, biết mình mới là bậc đại giác ngộ.",
      bio: "Triết gia huyền thoại của Trung Hoa cổ đại, người sáng lập trường phái Đạo gia với tư tưởng Vô vi (thuận theo quy luật tự nhiên, không cưỡng cầu tư lợi).",
      bookId: "dao-duc-kinh",
      color: "from-teal-950 to-stone-900"
    },
    {
      id: "nietzsche",
      name: "Friedrich Nietzsche",
      title: "Nhà tư tưởng Hiện sinh Đức",
      era: "1844 – 1900",
      school: "Chủ nghĩa Hiện sinh",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/400px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      quote: "Kẻ nào có một lý do 'Tại sao' để sống, kẻ đó có thể chịu đựng hầu hết mọi 'Như thế nào'.",
      bio: "Nhà triết học văn hóa người Đức với những tư tưởng chấn động về cái chết của Thượng đế, Ý chí quyền lực và hình mẫu Con người siêu việt (Übermensch).",
      bookId: "zarathustra",
      color: "from-rose-950 to-neutral-900"
    },
    {
      id: "john-stuart-mill",
      name: "John Stuart Mill",
      title: "Nhà tư tưởng Tự do & Khai Sáng",
      era: "1806 – 1873",
      school: "Thời kỳ Khai Sáng",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/John_Stuart_Mill_by_London_Stereoscopic_Company%2C_c1870.jpg/400px-John_Stuart_Mill_by_London_Stereoscopic_Company%2C_c1870.jpg",
      fallbackAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
      quote: "Tự do tư tưởng và tự do tranh luận là điều kiện tiên quyết cho sự tiến bộ của toàn thể nhân loại.",
      bio: "Triết gia kinh tế học chính trị người Anh, người đặt nền móng vĩ đại bảo vệ quyền tự do cá nhân trước sự độc đoán của số đông xã hội.",
      bookId: "ban-ve-tu-do",
      color: "from-indigo-950 to-slate-900"
    }
  ],

  books: [
    {
      id: "suy-tuong",
      title: "Suy Tưởng (Meditations)",
      originalTitle: "Τὰ εἰς ἑαυτόν",
      author: "Marcus Aurelius",
      authorRole: "Hoàng đế Triết gia La Mã",
      school: "Chủ nghĩa Khắc Kỷ (Stoicism)",
      category: "stoicism",
      readTime: "95 phút",
      audioDuration: "3 giờ 45 phút",
      year: "170 – 180 SCN",
      rating: 4.95,
      readersCount: "28,450",
      featured: true,
      tagline: "Nhật ký tự rèn luyện nội tâm của vị Hoàng đế vĩ đại nhất thành Rome",
      coverImage: "assets/covers/suy-tuong.svg",
      fallbackCover: "assets/covers/suy-tuong.svg",
      bgmTheme: "Giai điệu Đàn Hạc Thư Phòng & Sa Trường",
      // Giọng đọc studio phòng thu trầm ấm kết hợp nhạc thiền
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #0F2318 0%, #06100B 100%)",
        accent: "#C59B4B",
        textColor: "#FFFFFF",
        badge: "Tuyệt Tác Khắc Kỷ • Toàn Văn"
      },
      summary: "Cuốn sách không được viết ra để xuất bản hay giảng dạy cho người khác, mà là những ghi chép chân thực nhất của Marcus Aurelius gửi gắm cho chính bản thân mình giữa sa trường và bệnh tật hiểm nghèo. Tác phẩm dạy ta nghệ thuật làm chủ tâm trí, phân biệt những gì thuộc về quyền kiểm soát của ta và những gì nằm ngoài, từ đó đạt được sự an tĩnh nội tại tối thượng trước mọi giông bão cuộc đời.",
      chapters: [
        {
          id: "chap-1",
          number: "Quyển I",
          title: "Những bài học ân nghĩa và tu dưỡng nhân cách",
          paragraphs: [
            "1. Từ ông nội Annius Verus của ta: Ta học được tính tình hòa nhã, đức độ khoan dung và khả năng làm chủ sự nóng giận trước mọi nghịch cảnh.",
            "2. Từ danh tiếng và ký ức về thân phụ: Ta học được sự khiêm nhường sâu sắc và khí phách kiên định, không hề dao động của một trang nam nhi thực thụ.",
            "3. Từ mẫu thân hiền từ: Ta học được lòng kính thần, đức tính hào hiệp và ý thức kiêng dè không chỉ việc làm điều ác, mà cả việc manh nha những ý nghĩ xấu xa trong tâm trí; và hơn nữa, một nếp sống giản dị, đạm bạc, cách xa thói xa hoa phù phiếm của giới vương quyền.",
            "4. Từ cụ cố của ta: Ta học được việc không cần phải theo học tại các trường lớp công cộng ồn ào, mà nên thỉnh những người thầy giỏi nhất về dạy dỗ tại gia, và hiểu rằng đối với việc học vấn thì không bao giờ được tiếc tiền của.",
            "5. Từ người gia sư thuở ấu thơ: Ta học được việc không bao giờ đứng về phe áo xanh hay áo xanh lá cây trong các trường đua ngựa, cũng không thiên vị các đấu sĩ khiên tròn hay khiên vuông; học được cách chịu đựng gian khổ, hài lòng với những nhu cầu tối thiểu, tự tay làm việc của mình, không can thiệp vào chuyện người khác và bịt tai trước những lời gièm pha dối trá.",
            "6. Từ thầy Diognetus: Ta học được thói quen không để tâm vào những trò mê tín, phù phiếm; không tin vào những kẻ làm trò ma thuật hay trừ tà; học cách lắng nghe lời phê bình thẳng thắn và say mê triết học.",
            "7. Từ thầy Rusticus: Ta học được nhận thức rằng nhân cách của mình cần sự rèn luyện và uốn nắn nghiêm ngặt; không để bản thân bị cuốn vào những trò hùng biện rỗng tuếch hay viết những lý thuyết cao siêu thiếu thực tế; học cách tha thứ và sẵn sàng hòa giải với những người từng xúc phạm ta ngay khi họ tỏ ý muốn hòa hảo.",
            "8. Từ thầy Apollonius: Ta học được tự do tư tưởng đích thực và sự kiên định không bao giờ để may rủi làm chao đảo; học cách luôn giữ một tâm thế vững vàng trong nỗi đau đớn cùng cực, khi mất đi đứa con thơ hay trong những cơn bạo bệnh dài ngày.",
            "9. Từ thầy Sextus: Ta học được tấm lòng nhân ái, gương mẫu của một người chủ gia đình mẫu mực; một khái niệm rõ ràng về nếp sống thuận theo Tự nhiên; sự trang nghiêm không giả tạo; sự chu đáo với bạn bè và lòng khoan dung trước những kẻ ngu dốt hoặc phát biểu bừa bãi.",
            "10. Từ thầy Alexander nhà ngữ pháp: Ta học được cách không bao giờ bắt bẻ vụn vặt; không chỉ trích người khác một cách sỉ nhục khi họ dùng sai một từ cổ hay phát âm chưa chuẩn, mà khéo léo dùng lại từ đúng trong câu trả lời của chính mình.",
            "11. Từ hoàng đế cha nuôi Antoninus Pius: Ta học được đức tính kiên nhẫn xem xét cẩn trọng mọi vấn đề; sự thanh liêm tuyệt đối trong công vụ; nếp sống giản dị không cần cận vệ vây quanh; sự tận tụy với công việc của đế quốc và không bao giờ thỏa hiệp với sự lười biếng.",
            "12. Sau cùng, ta triân các Đấng Thần Linh: Đã ban cho ta những bậc ông bà, cha mẹ, thầy cô và bạn hữu tốt lành đến như vậy. Con người sinh ra là để cộng tác với nhau, như đôi bàn tay, đôi bàn chân, như hàng mi mắt trên dưới cùng bảo vệ một ánh nhìn."
          ],
          takeaways: [
            {
              title: "Thực hành Lòng Biết Ơn Chủ Động",
              desc: "Trước khi bắt đầu ngày làm việc, hãy dành 3 phút tri ân những người đã dạy dỗ, hỗ trợ hoặc tạo cơ hội cho bạn."
            },
            {
              title: "Tiết Chế Nóng Giận Trước Nghịch Cảnh",
              desc: "Khi gặp tình huống ức chế trong công việc, hãy dừng lại 10 giây để lý trí kiểm soát cảm xúc, không phản ứng bốc đồng."
            },
            {
              title: "Sống Giản Dị, Tránh Phù Phiếm Xã Hội",
              desc: "Tập trung vào giá trị năng lực và nhân cách thực tế thay vì chạy theo những tiêu chuẩn hào nhoáng bên ngoài."
            }
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
            {
              title: "Vắc-xin Tâm Lý Đầu Ngày",
              desc: "Mỗi sáng thức dậy, hãy lường trước rằng bạn sẽ gặp người khó tính; sự tiêu cực của họ không thể chạm đến bạn trừ khi bạn cho phép."
            },
            {
              title: "Phân Định Quyền Kiểm Soát",
              desc: "Thái độ của người khác là thứ bạn không kiểm soát được; cách bạn phản ứng là thứ duy nhất hoàn toàn thuộc về bạn."
            },
            {
              title: "Trân Trọng Quỹ Thời Gian Hữu Hạn",
              desc: "Đừng lãng phí cuộc đời ngắn ngủi để lo sợ người khác nghĩ gì về mình. Hãy chăm lo cho sự bình an nội tại của chính bạn."
            }
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
          ]
        },
        {
          id: "chap-12",
          number: "Quyển XII",
          title: "Đoạn kết: Ra đi trong sự thanh thản tối thượng",
          paragraphs: [
            "1. Hỡi con người, bạn đã từng là một công dân của thành bang vĩ đại này — vũ trụ bao la. Việc bạn sống trong đó năm năm hay một trăm năm có gì khác biệt? Bởi vì luật lệ của nó công bằng cho tất cả mọi người.",
            "2. Vậy thì có gì đáng sợ hãi khi bạn được lệnh rời khỏi vở kịch trần gian, không phải bởi một bạo chúa hay quan tòa bất công đuổi đi, mà bởi chính Tự Nhiên — Đấng đã từng đưa bạn lên sân khấu?",
            "3. Giống như một diễn viên hài kịch được vị đạo diễn cho thôi diễn: 'Nhưng tôi chưa diễn hết năm màn, tôi mới diễn xong có ba màn!' — 'Đúng vậy, nhưng trong cuộc đời, ba màn đã là trọn vẹn một vở kịch!'",
            "4. Bởi vì sự kết thúc trọn vẹn do Đấng sáng tạo định đoạt, chứ không phải do bạn. Vì vậy, hãy ra đi với tâm hồn thanh thản, khoan dung; bởi vì Đấng cho bạn nghỉ ngơi cũng là Đấng vô cùng nhân từ."
          ]
        }
      ]
    },
    {
      id: "cong-hoa",
      title: "Cộng Hòa (The Republic)",
      originalTitle: "Πολιτεία",
      author: "Plato",
      authorRole: "Triết gia Cổ điển Athens",
      school: "Triết học Cổ điển Hy Lạp",
      category: "classical",
      readTime: "120 phút",
      audioDuration: "4 giờ 10 phút",
      year: "375 TCN",
      rating: 4.88,
      readersCount: "34,200",
      featured: false,
      tagline: "Khảo sát vĩ đại nhất về Công lý, Nhà nước lý tưởng và Chân lý tối thượng",
      coverImage: "assets/covers/cong-hoa.svg",
      fallbackCover: "assets/covers/cong-hoa.svg",
      bgmTheme: "Giai điệu Đàn Lia Hy Lạp Cổ",
      studioAudioUrl: "https://cdn.freesound.org/previews/588/588234_11861866-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #131E2E 0%, #080D14 100%)",
        accent: "#64B5F6",
        textColor: "#FFFFFF",
        badge: "Nền Tảng Văn Minh • Toàn Văn"
      },
      summary: "Tác phẩm đối thoại kinh điển của Plato dưới lời dẫn của Socrates. Cuốn sách khảo sát bản chất sâu xa của Công lý trong linh hồn con người và trong cấu trúc của một quốc gia lý tưởng. Đỉnh cao của tác phẩm là Dụ ngôn Hang Động — ẩn dụ bất hủ về hành trình giải phóng con người khỏi xiềng xích của định kiến và ảo ảnh để bước ra ánh sáng chân lý.",
      chapters: [
        {
          id: "chap-cave-full",
          number: "Quyển VII",
          title: "Dụ ngôn Hang Động (The Allegory of the Cave - Toàn văn)",
          paragraphs: [
            "— Này Glaucon, hãy so sánh tình trạng của bản chất con người chúng ta về mặt giáo dục và sự thiếu hiểu biết với một hoàn cảnh như sau:",
            "— Hãy hình dung một nơi cư ngụ giống như hang động dưới lòng đất, có lối vào mở rộng đón ánh sáng dọc theo toàn bộ chiều dài của hang. Trong đó có những con người bị giam cầm từ thuở ấu thơ, chân và cổ bị xiềng xích chặt chẽ đến mức họ chỉ có thể ngồi yên tại chỗ và nhìn về phía bức tường đá trước mặt, không thể quay đầu lại.",
            "— Ở phía sau lưng họ, từ trên cao và xa xôi, có một ngọn lửa lớn đang bốc cháy sáng rực. Ở khoảng giữa ngọn lửa và các tù nhân, có một con đường trên cao, dọc theo đó có xây một bức tường thấp, tựa như tấm rèm mà những người múa rối thường dựng lên để biểu diễn các con rối phía trên rèm.",
            "— Dọc theo bức tường này, có những người mang vác đủ loại đồ vật nhô lên khỏi mép tường: hình nhân người, muông thú bằng đá, gỗ và đủ loại vật liệu. Trong số những người mang vác đó, có kẻ nói chuyện, có kẻ im lặng.",
            "— Glaucon đáp: 'Thật là một hình ảnh kỳ lạ, và những người tù đó cũng thật kỳ lạ!'",
            "— Socrates nói tiếp: 'Họ hoàn toàn giống như chúng ta! Trước hết, hãy tự hỏi liệu những người tù đó đã từng nhìn thấy điều gì của chính họ và của những người bên cạnh ngoài những chiếc bóng mà ngọn lửa chiếu lên bức tường đá trước mặt?'",
            "— 'Làm sao họ có thể thấy điều gì khác nếu cả đời bị buộc phải giữ đầu bất động?', Glaucon bảo.",
            "— 'Và nếu họ có thể trò chuyện với nhau, chẳng phải họ sẽ cho rằng những cái bóng mà họ nhìn thấy chính là những vật thể có thực hay sao?'",
            "— Bây giờ, hãy xem điều gì sẽ xảy ra khi một trong số họ được cởi trói, bị ép phải đứng dậy, quay cổ lại, bước đi và ngước nhìn lên ánh sáng ngọn lửa. Tất cả những hành động đó sẽ khiến anh ta đau nhức dữ dội; ánh sáng chói lòa sẽ làm anh ta lóa mắt, không thể nhìn rõ những vật thể mà trước kia anh ta chỉ thấy bóng.",
            "— Nếu ai đó bảo anh ta rằng: Những gì anh thấy trước kia chỉ là ảo ảnh vô nghĩa, còn giờ đây anh đang tiến gần hơn tới thực tại chân thật, anh ta sẽ bối rối và tin rằng những cái bóng trước kia còn chân thực hơn những gì đang thấy!",
            "— Và nếu người ta dùng sức kéo anh ta lên con dốc gồ ghề, đưa anh ta ra hẳn ngoài miệng hang dưới ánh sáng mặt trời rực rỡ, mắt anh ta sẽ bị thiêu đốt bởi ánh dương. Anh ta cần thời gian để quen dần: thoạt đầu là nhìn bóng dưới nước, sau đó là nhìn bầu trời đêm và các vì sao, và cuối cùng mới có thể chiêm ngưỡng chính đấng Mặt Trời!",
            "— Khi đã hiểu ra rằng Mặt Trời sinh dưỡng vạn vật và chi phối mọi trật tự thế gian, người ấy sẽ nhớ lại nơi giam cầm cũ, thương hại cho những bạn tù đang tranh cãi xem chiếc bóng nào xuất hiện trước, và anh ta thà chịu làm kẻ bần hàn nhất nơi trần gian còn hơn phải quay lại sống đời tăm tối trong hang động!"
          ]
        },
        {
          id: "chap-justice",
          number: "Quyển I",
          title: "Bản chất của Công lý và Sự chính trực",
          paragraphs: [
            "— Này Thrasymachus, ông khẳng định rằng Công lý không là gì khác ngoài 'lợi ích của kẻ mạnh hơn'? Hãy giải thích rõ hơn điều đó cho chúng tôi.",
            "— Thrasymachus gầm lên: 'Mỗi chính quyền đều đặt ra luật pháp vì lợi ích của chính họ: chính quyền dân chủ đặt luật dân chủ, kẻ bạo chúa đặt luật chuyên chế. Họ tuyên bố rằng điều có lợi cho kẻ cai trị chính là Công lý đối với người dân, và kẻ nào vi phạm sẽ bị trừng phạt như kẻ bất công!'",
            "— Socrates từ tốn đáp: 'Nhưng thưa người bạn thông thái, chẳng lẽ các nhà cai trị không bao giờ mắc sai lầm? Khi họ ban hành luật tưởng rằng có lợi cho mình nhưng thực chất lại có hại, thì việc thần dân tuân lệnh họ lại biến thành việc làm điều có hại cho kẻ cai trị. Như vậy, Công lý lại biến thành điều bất lợi cho kẻ mạnh hay sao?'",
            "— 'Một người thầy thuốc chân chính chữa bệnh vì lợi ích của bệnh nhân hay vì túi tiền của ông ta? Một người thuyền trưởng lái tàu vì sự an toàn của các thủy thủ hay vì sự kiêu ngạo của bản thân?'",
            "— Công lý chân chính không phải là sự áp đặt của quyền lực, mà là sự hài hòa tối thượng của linh hồn: nơi Lý trí dẫn đường, Dũng khí bảo vệ và Dục vọng được tiết chế trong trật tự cao đẹp."
          ]
        }
      ]
    },
    {
      id: "dao-duc-kinh",
      title: "Đạo Đức Kinh (Tao Te Ching)",
      originalTitle: "道德經",
      author: "Lão Tử",
      authorRole: "Bậc thầy Đạo Gia Phương Đông",
      school: "Triết học Phương Đông",
      category: "eastern",
      readTime: "75 phút",
      audioDuration: "2 giờ 30 phút",
      year: "Thế kỷ 6 TCN",
      rating: 5.0,
      readersCount: "41,800",
      featured: true,
      tagline: "Tuyệt tác triết học về Đạo tự nhiên, Vô vi và sự hài hòa tối thượng",
      coverImage: "assets/covers/dao-duc-kinh.svg",
      fallbackCover: "assets/covers/dao-duc-kinh.svg",
      bgmTheme: "Giai điệu Sáo Trúc & Chuông Thiền Ngũ Cung",
      studioAudioUrl: "https://cdn.freesound.org/previews/416/416174_5121236-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #0A2114 0%, #030D07 100%)",
        accent: "#48CAE4",
        textColor: "#FFFFFF",
        badge: "Kinh Điển Đông Phương • Toàn Văn"
      },
      summary: "Với vỏn vẹn khoảng 5000 chữ Hán chia làm 81 chương, Đạo Đức Kinh của Lão Tử cô đọng những quy luật vận hành kỳ diệu của vũ trụ và đời người. Triết lý 'Vô vi' (thuận theo tự nhiên, không cưỡng ép) và hình tượng 'Nước' mang lại cho con người đương đại liều thuốc an định giữa cuộc sống xô bồ, đua chen danh lợi.",
      chapters: [
        {
          id: "dao-chap-1",
          number: "Chương 1",
          title: "Đạo Khả Đạo (Khởi nguyên trời đất)",
          paragraphs: [
            "Đạo khả đạo, phi thường Đạo. Danh khả danh, phi thường Danh.",
            "Cái Đạo mà có thể dùng lời lẽ để nói ra rành mạch được, thì không còn là Đạo vĩnh cửu bất biến. Cái Tên mà có thể gọi ra thành tiếng được, không còn là cái Tên thường hằng nguyên bản.",
            "Vô danh là gốc của trời đất vạn vật. Hữu danh là mẹ sinh dưỡng muôn loài.",
            "Cho nên, thường giữ lòng 'Không' để chiêm ngưỡng điều huyền diệu nhiệm màu; thường giữ lòng 'Có' để quan sát biên giới giới hạn của vạn vật.",
            "Cả hai cùng xuất phát từ một cội nguồn nhưng khác tên gọi. Sự đồng nhất ấy gọi là Huyền diệu. Huyền diệu lại thêm huyền diệu, đó chính là cánh cửa dẫn vào mọi điều vi diệu của thế gian."
          ]
        },
        {
          id: "dao-chap-8",
          number: "Chương 8",
          title: "Thượng Thiện Nhược Thủy (Cái thiện tối cao như Nước)",
          paragraphs: [
            "Thượng thiện nhược thủy. Thủy thiện lợi vạn vật nhi bất tranh, xử chúng nhân chi sở ố, cố cơ ư Đạo.",
            "Cái thiện bậc nhất ví như Nước. Nước đem lại lợi ích nuôi dưỡng muôn loài vạn vật mà không bao giờ tranh giành, luôn khiêm nhường chảy xuống chỗ trũng thấp mà người đời chê bai, thế nên Nước gần gũi với Đạo nhất.",
            "Ở thì chọn nơi đất thấp dung dị; Tâm thì lắng sâu như đầm nước biếc; Cư xử với người thì giữ trọn lòng nhân hậu; Nói năng thì giữ lời thành tín; Cai trị thì giữ sự thanh bình; Làm việc thì thuận theo năng lực; Hành động thì chọn đúng thời cơ.",
            "Bởi vì duy nhất không tranh giành với ai, nên suốt đời không bao giờ mắc phải lỗi lầm hay chuốc lấy oán hờn."
          ]
        },
        {
          id: "dao-chap-16",
          number: "Chương 16",
          title: "Quy Căn Phục Mệnh (Trở về cội rễ tĩnh lặng)",
          paragraphs: [
            "Trí hư cực, thủ tĩnh đốc. Vạn vật tịnh tác, ngô dĩ quan phục.",
            "Giữ lòng hư không cho đến cùng cực, giữ sự yên tĩnh cho thật vững vàng. Vạn vật cùng sinh sôi nảy nở, ta nhân đó mà quan sát quy luật tuần hoàn trở về cội rễ.",
            "Vạn vật phồn thịnh xum xuê, cuối cùng đều quay về gốc rễ của nó. Quay về cội rễ gọi là Tĩnh; Tĩnh gọi là Phục mệnh (trở về với mệnh trời). Trở về với mệnh trời gọi là Thường (luật vĩnh hằng).",
            "Biết luật vĩnh hằng thì lòng dạ sáng suốt bao dung; bao dung thì công bình; công bình thì bao trùm; bao trùm thì hợp với Trời; hợp với Trời tức là hợp với Đạo; hợp với Đạo thì đời đời không nguy nan!"
          ]
        },
        {
          id: "dao-chap-33",
          number: "Chương 33",
          title: "Biện Đức (Tự chiến thắng chính mình)",
          paragraphs: [
            "Tri nhân giả trí, tự tri giả minh. Thắng nhân giả hữu lực, tự thắng giả cường.",
            "Kẻ biết người là người thông minh, nhưng kẻ biết rõ chính mình mới là bậc đại giác ngộ. Kẻ chiến thắng được người khác là kẻ có sức mạnh, nhưng kẻ chiến thắng được dục vọng và bản ngã của chính mình mới là người thực sự dũng mãnh vô địch.",
            "Biết đủ là người giàu có nhất thế gian; kiên trì hành động là người có ý chí; không đánh mất cội nguồn là người bền vững lâu dài; chết mà tư tưởng không mất đi, ấy mới là trường thọ bất tử!"
          ]
        }
      ]
    },
    {
      id: "zarathustra",
      title: "Zarathustra Đã Nói Như Thế",
      originalTitle: "Also sprach Zarathustra",
      author: "Friedrich Nietzsche",
      authorRole: "Triết gia Khai phá nước Đức",
      school: "Chủ nghĩa Hiện sinh & Ý chí Quyền lực",
      category: "existentialism",
      readTime: "85 phút",
      audioDuration: "3 giờ 15 phút",
      year: "1883 – 1885",
      rating: 4.85,
      readersCount: "21,600",
      featured: false,
      tagline: "Bản hùng ca triết học về sự thức tỉnh, lòng can đảm và Siêu nhân (Übermensch)",
      coverImage: "assets/covers/zarathustra.svg",
      fallbackCover: "assets/covers/zarathustra.svg",
      bgmTheme: "Giai điệu Vĩ Cầm Trầm Mặc Đỉnh Núi Tuyết",
      studioAudioUrl: "https://cdn.freesound.org/previews/469/469989_9083316-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #2A1010 0%, #0E0505 100%)",
        accent: "#FF7B54",
        textColor: "#FFFFFF",
        badge: "Khai Phóng Hiện Sinh • Toàn Văn"
      },
      summary: "Cuốn sách chấn động nhất của Friedrich Nietzsche theo chân nhà tiên tri Zarathustra từ đỉnh núi tuyết trở về với nhân gian sau mười năm ẩn dật. Tác phẩm thúc giục mỗi cá nhân vượt thoát khỏi thói mòn bầy đàn, dũng cảm đối diện với hư vô và tự tôi luyện chính mình thành hình mẫu Con Người Siêu Việt (Übermensch).",
      chapters: [
        {
          id: "zara-prologue",
          number: "Lời Tựa",
          title: "Zarathustra bước xuống trần gian & Con người siêu việt",
          paragraphs: [
            "1. Khi Zarathustra được ba mươi tuổi, chàng rời bỏ quê hương và bờ hồ quê hương để lên núi ẩn dật. Tại đây, chàng vui hưởng tinh thần và sự cô độc của mình suốt mười năm ròng rã không hề mỏi mệt.",
            "2. Nhưng rốt cuộc, trái tim chàng chuyển biến; vào một buổi sáng sớm, chàng thức dậy cùng ánh bình minh, bước ra đứng trước mặt vầng Thái Dương và cất lời:",
            "3. 'Hỡi ngôi sao vĩ đại! Hạnh phúc của ngươi sẽ là gì nếu ngươi không có những kẻ mà ngươi chiếu sáng? Ngươi đã lên đây tới đỉnh hang của ta suốt mười năm nay; ngươi hẳn đã chán ngấy ánh sáng và hành trình này nếu không có ta, con đại bàng và con rắn của ta!'",
            "4. 'Kìa, chén của ta muốn cạn trở lại, và Zarathustra muốn trở lại làm người!' Thế rồi Zarathustra bắt đầu cuộc hạ sơn.",
            "5. Khi đến khu chợ của thành phố gần nhất, Zarathustra cất tiếng nói trước đám đông dân chúng:",
            "6. 'Ta dạy cho các ngươi về Con Người Siêu Việt (Übermensch)! Con người là một cái gì đó cần phải được vượt qua. Các ngươi đã làm gì để vượt qua chính mình?'",
            "7. 'Mọi sinh vật từ trước đến nay đều tạo ra một cái gì đó vượt trội hơn chính chúng; chẳng lẽ các ngươi lại muốn trở thành ngọn thủy triều rút lui của loài sinh vật vĩ đại ấy, thà quay trở lại làm loài thú vật hơn là vượt qua con người?'",
            "8. 'Con người là một sợi dây thừng căng giữa con thú và Con Người Siêu Việt — một sợi dây vắt qua vực thẳm sâu hoắm. Điều vĩ đại ở con người là chàng là một cây cầu chứ không phải là một đích đến!'"
          ]
        },
        {
          id: "zara-metamorphosis",
          number: "Bài Thuyết Giảng I",
          title: "Ba bước biến chuyển của tinh thần (Lạc đà, Sư tử, Đứa trẻ)",
          paragraphs: [
            "1. Này những người anh em, ta nói cho các ngươi nghe về ba bước biến chuyển của tinh thần: Tinh thần biến thành Lạc đà, Lạc đà biến thành Sư tử, và cuối cùng Sư tử hóa thành Đứa trẻ ngây thơ!",
            "2. Thế nào là Lạc đà? Đó là tinh thần biết gánh vác, nặng lòng tôn kính và khiêm cung. Tinh thần mạnh mẽ, kiên nhẫn ấy quỳ gối xin được chở nặng: 'Cái gì nặng nhất, hỡi các bậc anh hùng, để ta gánh lấy trên lưng và hân hoan bước đi trong sa mạc cô đơn?'",
            "3. Nó gánh vác mọi giáo điều, mọi định kiến, mọi bổn phận của xã hội cũ rồi rảo bước vào cõi hoang vu nhất của sa mạc nội tâm.",
            "4. Nhưng ngay giữa lòng sa mạc hoang vu nhất, sự biến chuyển thứ hai kỳ diệu xảy ra: Lạc đà hóa thành Sư tử! Con sư tử muốn đoạt lấy tự do và làm chủ sa mạc của chính nó.",
            "5. Tại đây, nó giáp mặt kẻ thống trị tối cao cuối cùng: con Rồng khổng lồ mang tên 'Ngươi phải làm'. Từng vảy vàng óng của con Rồng lấp lánh những giới luật hàng nghìn năm tuổi.",
            "6. Nhưng con sư tử của tinh thần gầm lên tiếng thét kiêu hãnh: 'Ta muốn!' Nó dũng mãnh bẻ gãy mọi sợi xích của sự phục tùng giáo điều!",
            "7. Song le, hỡi các bạn, con sư tử dù dũng mãnh đến đâu cũng chỉ có thể phá hủy chứ chưa thể sáng tạo giá trị mới. Vì thế, tinh thần cần bước chuyển hóa tối hậu:",
            "8. Sư tử phải hóa thành Đứa trẻ! Đứa trẻ là sự thơ ngây, là sự lãng quên trong trẻo, một khởi đầu mới tinh khôi, một trò chơi tự quay, một chuyển động ban sơ, một lời chuẩn nhận thiêng liêng: 'Vâng, đối với cuộc đời!'"
          ]
        }
      ]
    },
    {
      id: "ban-ve-tu-do",
      title: "Bàn Về Tự Do (On Liberty)",
      originalTitle: "On Liberty",
      author: "John Stuart Mill",
      authorRole: "Nhà tư tưởng Khai sáng Anh",
      school: "Thời kỳ Khai Sáng",
      category: "enlightenment",
      readTime: "90 phút",
      audioDuration: "3 giờ 00 phút",
      year: "1859",
      rating: 4.88,
      readersCount: "18,400",
      featured: false,
      tagline: "Tuyên ngôn bất hủ bảo vệ quyền tự do tư tưởng và giới hạn quyền lực xã hội",
      coverImage: "assets/covers/ban-ve-tu-do.svg",
      fallbackCover: "assets/covers/ban-ve-tu-do.svg",
      bgmTheme: "Giai điệu Thính Phòng Cổ Điển Oxford",
      studioAudioUrl: "https://cdn.freesound.org/previews/519/519065_9329737-lq.mp3",
      coverTheme: {
        bg: "linear-gradient(135deg, #15222E 0%, #080E14 100%)",
        accent: "#E2B659",
        textColor: "#FFFFFF",
        badge: "Khai Minh Nhân Loại • Toàn Văn"
      },
      summary: "Tác phẩm đặt ra nguyên lý tối thượng về quyền tự do cá nhân: Xã hội chỉ có quyền can thiệp vào tự do của một người nhằm mục đích duy nhất là tự vệ, ngăn chặn điều gây hại cho người khác. Tự do tư tưởng, tự do thảo luận và tranh biện là điều kiện tiên quyết cho sự tiến bộ và phẩm giá của nền văn minh nhân loại.",
      chapters: [
        {
          id: "mill-chap-2",
          number: "Chương II",
          title: "Về tự do tư tưởng và tự do ngôn luận (Toàn văn)",
          paragraphs: [
            "1. Thời kỳ mà người ta cần phải bảo vệ tự do báo chí như một phương tiện chống lại một chính phủ chuyên chế thối nát đã trôi qua ở các quốc gia tiến bộ. Nhưng hiểm họa mới còn tinh vi hơn: đó là sự chuyên chế của số đông đè bẹp tiếng nói bất đồng.",
            "2. Giả sử toàn thể nhân loại đều cùng một ý kiến, và chỉ có duy nhất một người giữ ý kiến trái ngược, thì việc nhân loại bắt người đó phải câm lặng cũng bất công và phi lý như việc người đó có đủ quyền lực để bắt cả nhân loại phải câm lặng!",
            "3. Tác hại đặc thù của việc dập tắt một ý kiến là nó đã cướp đoạt tài sản tinh thần của toàn thể nhân loại — cả thế hệ hiện tại lẫn các thế hệ tương lai. Nếu ý kiến bị cấm đoán đó đúng, nhân loại bị tước mất cơ hội đổi sai lấy đúng;",
            "4. Còn nếu ý kiến đó sai, họ đánh mất một lợi ích to lớn không kém: Đó là nhận thức rõ ràng hơn, sinh động hơn về chân lý thông qua sự va chạm nảy lửa với sai lầm.",
            "5. Chúng ta không bao giờ có thể hoàn toàn chắc chắn rằng ý kiến mà ta đang cố gắng bóp nghẹt là một ý kiến sai lầm; và ngay cả khi ta chắc chắn nó sai, việc dập tắt nó vẫn là một tai họa.",
            "6. Chân lý không phải là một pho tượng đá hay giáo điều chết để học thuộc lòng. Một chân lý không bao giờ được phép tranh luận tự do sẽ sớm trở thành một định kiến mù quáng, mất đi toàn bộ sinh khí và sức lay động tâm hồn con người!"
          ]
        }
      ]
    }
  ],

  dailyQuotes: [
    {
      quote: "Hạnh phúc của cuộc đời không phụ thuộc vào những gì xảy đến với bạn, mà vào cách bạn lựa chọn phản ứng với chúng.",
      author: "Epictetus",
      school: "Chủ nghĩa Khắc Kỷ",
      context: "Lời răn dạy của người thầy nô lệ La Mã về quyền tự do nội tâm tối thượng."
    },
    {
      quote: "Người chinh phục được người khác là người có sức mạnh; người chinh phục được chính mình mới là kẻ vô địch.",
      author: "Lão Tử",
      school: "Đạo Gia",
      context: "Chương 33 Đạo Đức Kinh về việc thắng được bản ngã tư lợi."
    },
    {
      quote: "Kẻ nào có một lý do 'Tại sao' để sống, kẻ đó có thể chịu đựng hầu hết mọi 'Như thế nào'.",
      author: "Friedrich Nietzsche",
      school: "Chủ nghĩa Hiện sinh",
      context: "Tư tưởng nền tảng giúp con người tìm thấy ý nghĩa sống giữa nghịch cảnh cùng cực."
    },
    {
      quote: "Sự bình yên thực sự không nằm ở một vùng quê xa xôi hay bãi biển thanh vắng, mà ẩn sâu trong sự tĩnh lặng của một tâm trí có trật tự.",
      author: "Marcus Aurelius",
      school: "Khắc Kỷ La Mã",
      context: "Suy Tưởng Quyển IV về chốn lui về ẩn náu bên trong tâm hồn."
    }
  ],

  aiKnowledge: {
    systemPrompt: `Bạn là Hiền Triết AI (Socrates & Stoic Companion) của nền tảng Sophia Codex. Bạn nói tiếng Việt tao nhã, sâu sắc, hòa nhã, chuẩn mực của một học giả triết học uyên bác. Bạn hỗ trợ người đọc bằng phương pháp gợi mở Socrates (Socratic dialogue): giải thích các khái niệm triết học khó hiểu, tóm lược luận điểm và khơi gợi tư duy phản biện.`,
    
    presets: {
      "tom-tat": "Dưới góc nhìn của Sophia Codex, tác phẩm này xoay quanh 3 luận điểm trụ cột:\n1. **Quyền năng nội tâm**: Bạn không thể điều khiển nghịch cảnh bên ngoài, nhưng có toàn quyền điều khiển cách phản ứng của tâm trí.\n2. **Sự hòa hợp với tự nhiên**: Chấp nhận dòng chảy của thời gian và sinh tử với tâm thế ung dung (*Amor Fati*).\n3. **Trách nhiệm với cộng đồng**: Con người sinh ra để tương trợ lẫn nhau, làm điều thiện xuất phát từ chính bổn phận chứ không vì danh vọng.",
      "amor-fati": "**Amor Fati** (Yêu số phận) là khái niệm được triết gia Khắc Kỷ và sau này là Nietzsche đề cao:\nNó không phải là sự buông xuôi thụ động (cam chịu), mà là thái độ nhiệt thành đón nhận mọi biến cố—dù là vinh quang hay trắc trở—như một chất liệu quý giá tôi luyện bản lĩnh và vẻ đẹp của tâm hồn bạn.",
      "phan-bien": "Hãy để tôi đặt cho bạn một câu hỏi gợi mở:\n*Nếu bạn cho rằng tâm trí có thể hoàn toàn bình thản trước mọi mất mát, thì cảm xúc đau buồn tự nhiên khi mất đi người thân yêu có phải là một sự 'yếu đuối' hay chính là bằng chứng thiêng liêng của nhân tính? Bạn sẽ dung hòa giữa lý trí Khắc Kỷ và trái tim con người như thế nào?*"
    }
  }
};

// ============================================================================
// TỰ ĐỘNG KẾT NỐI TOÀN VĂN CÁC KIỆT TÁC (100% COMPLETE VOLUMES & CHAPTERS)
// ============================================================================
if (typeof window !== 'undefined') {
  // 1. Nạp trọn vẹn 12 Quyển toàn văn Suy Tưởng (Marcus Aurelius)
  if (window.SUY_TUONG_FULL_CHAPTERS) {
    const suyTuong = PHILOSOPHY_DATA.books.find(b => b.id === 'suy-tuong');
    if (suyTuong) {
      suyTuong.chapters = window.SUY_TUONG_FULL_CHAPTERS;
      suyTuong.tagline = "Toàn văn trọn vẹn 12 Quyển suy tư của Marcus Aurelius";
    }
  }

  // 2. Nạp trọn vẹn 81 Chương toàn văn Đạo Đức Kinh (Lão Tử)
  if (window.DAO_DUC_KINH_FULL_CHAPTERS) {
    const daoDucKinh = PHILOSOPHY_DATA.books.find(b => b.id === 'dao-duc-kinh');
    if (daoDucKinh) {
      daoDucKinh.chapters = window.DAO_DUC_KINH_FULL_CHAPTERS;
      daoDucKinh.tagline = "Toàn văn trọn bộ 81 Chương (Thượng Kinh & Hạ Kinh) của Lão Tử";
    }
  }

  // 3. Nạp trọn vẹn 10 Quyển toàn văn Cộng Hòa (Plato)
  if (window.CONG_HOA_FULL_CHAPTERS) {
    const congHoa = PHILOSOPHY_DATA.books.find(b => b.id === 'cong-hoa');
    if (congHoa) {
      congHoa.chapters = window.CONG_HOA_FULL_CHAPTERS;
      congHoa.tagline = "Toàn văn trọn bộ 10 Quyển về Quốc gia lý tưởng & Công lý của Plato";
    }
  }

  // 4. Nạp trọn vẹn 4 Phần toàn văn Zarathustra Đã Nói Như Thế (Nietzsche)
  if (window.ZARATHUSTRA_FULL_CHAPTERS) {
    const zarathustra = PHILOSOPHY_DATA.books.find(b => b.id === 'zarathustra');
    if (zarathustra) {
      zarathustra.chapters = window.ZARATHUSTRA_FULL_CHAPTERS;
      zarathustra.tagline = "Toàn văn trọn bộ 4 Phần di sản triết học Hiện sinh của Nietzsche";
    }
  }

  // 5. Nạp trọn vẹn 5 Chương toàn văn Bàn Về Tự Do (John Stuart Mill)
  if (window.BAN_VE_TU_DO_FULL_CHAPTERS) {
    const banVeTuDo = PHILOSOPHY_DATA.books.find(b => b.id === 'ban-ve-tu-do');
    if (banVeTuDo) {
      banVeTuDo.chapters = window.BAN_VE_TU_DO_FULL_CHAPTERS;
      banVeTuDo.tagline = "Toàn văn trọn bộ 5 Chương luận thuyết Tự do cá nhân của J.S. Mill";
    }
  }

  // Cập nhật tổng số chương trên toàn thư viện
  PHILOSOPHY_DATA.stats.totalChapters = PHILOSOPHY_DATA.books.reduce((acc, b) => acc + (b.chapters ? b.chapters.length : 0), 0);
  PHILOSOPHY_DATA.stats.totalBooks = PHILOSOPHY_DATA.books.length;
}

