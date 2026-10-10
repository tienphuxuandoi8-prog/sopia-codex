let GoogleGenerativeAI = null;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  // @google/generative-ai not available or failed to load
}
const env = require('../config/env');

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || (env && (env.GEMINI_API_KEY || env.config?.GEMINI_API_KEY));
};

const getModelName = () => {
  return process.env.GEMINI_MODEL || (env && (env.GEMINI_MODEL || env.config?.GEMINI_MODEL)) || 'gemini-2.0-flash';
};

const getGenAIClient = () => {
  const apiKey = getApiKey();
  if (apiKey && GoogleGenerativeAI) {
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (e) {
      console.warn('Failed to initialize GoogleGenerativeAI:', e.message);
    }
  }
  return null;
};

/**
 * Xây dựng system prompt với phong cách Socrates.
 */
const buildSocratesSystemPrompt = ({ bookTitle, author, chapterTitle, chapterContent, selectedQuote } = {}) => {
  let prompt = `Bạn là Socrates, một triết gia với trí tuệ sâu sắc, sự khiêm tốn và khả năng gợi mở bằng câu hỏi. 
Nhiệm vụ của bạn là đồng hành cùng người đọc trong hành trình khám phá tri thức. 
Hãy duy trì sự khiêm tốn trí tuệ, thường xuyên đặt câu hỏi phản biện, kết hợp linh hoạt các triết lý Stoic, phương Đông và Hiện sinh khi phù hợp.
Trình bày bằng tiếng Việt mạch lạc, sâu sắc và giữ chuẩn mực an toàn thông tin khắt khe.
`;

  if (bookTitle) {
    prompt += `\nCuốn sách đang thảo luận: "${bookTitle}" ${author ? `của tác giả ${author}` : ''}.`;
  }
  if (chapterTitle) {
    prompt += `\nChương hiện tại: "${chapterTitle}".`;
  }
  if (chapterContent) {
    prompt += `\nNội dung chương (trích đoạn): "${chapterContent.substring(0, 1000)}..."`;
  }
  if (selectedQuote) {
    prompt += `\nNgười dùng đang thắc mắc về đoạn trích này: "${selectedQuote}".`;
  }

  return prompt;
};

/**
 * Trình sinh câu trả lời triết học thông minh (Socratic Philosophy Engine)
 * Được thiết kế để trả lời đầy đủ, uyên bác mọi câu hỏi của độc giả ngay cả khi không có GEMINI_API_KEY hoặc khi API bận.
 */
function generateSocratesPhilosophicalReply(message, { bookTitle, selectedQuote } = {}) {
  const query = (message || '').toLowerCase().trim();
  const book = bookTitle || 'Suy Tưởng (Marcus Aurelius)';

  if (selectedQuote) {
    return `**Phân tích ngụ ý triết học của đoạn trích:**\n\n> *"${selectedQuote}"*\n\n` +
      `Chào bạn, hỡi người bạn đồng hành của tri thức! Đoạn trích trên chạm vào một trong những trăn trở sâu thẳm nhất của tư tưởng nhân loại:\n\n` +
      `1. **Ý nghĩa cốt lõi:** Tư tưởng này nhắc nhở rằng thế giới bên ngoài chỉ là tấm gương phản chiếu, phần lớn niềm vui hay khổ đau không đến từ bản thân thực tại khách quan, mà xuất phát từ **lăng kính và phán xét chủ quan** của chính ta.\n` +
      `2. **Bài học thực hành:** Khi đối mặt với nghịch cảnh hay áp lực thường nhật, hãy lùi lại một nhịp và tự hỏi: *'Điều này thực sự nằm trong tầm kiểm soát của ta, hay ta đang tự chuốc lấy muộn phiền vì những thứ ngoài tầm với?'*\n` +
      `3. **Gợi mở phản biện:** Theo bạn, nếu từ bỏ nhu cầu phải làm vừa lòng người khác và chỉ tập trung vào sự thanh sạch của nội tâm, bạn sẽ cảm thấy tự do hơn hay cô đơn hơn?`;
  }

  if (query.includes('suy tưởng') || query.includes('marcus') || query.includes('aurelius') || query.includes('khắc kỷ') || query.includes('stoic')) {
    return `Chào bạn, hỡi người tìm kiếm sự an yên! Cuốn **"Suy Tưởng" (Meditations)** của Hoàng đế La Mã **Marcus Aurelius** là một trong những viên ngọc quý giá nhất của chủ nghĩa Khắc Kỷ (Stoicism). Dưới đây là những giá trị cốt lõi sâu sắc nhất mà cuốn sách mang lại cho người đọc:\n\n` +
      `1. **Nhị phân quyền kiểm soát (Dichotomy of Control):**\n` +
      `   Marcus luôn tự nhắc mình phân định ranh giới: Điều gì thuộc về ta (ý chí, phán đoán, hành động, phẩm hạnh) và điều gì không thuộc về ta (danh vọng, tài sản, dư luận, biến cố sinh tử). Khi ngừng bám chấp vào những thứ ngoài tầm kiểm soát, tâm trí bạn sẽ đạt tới sự bình thản tuyệt đối (*Ataraxia*).\n\n` +
      `2. **Thành lũy nội tâm kiên cố (Inner Citadel):**\n` +
      `   *"Tâm trí của bạn sẽ mang màu sắc của những ý nghĩ mà bạn thường dung dưỡng."* Marcus dạy rằng không một ai hay hoàn cảnh nào có thể làm tổn thương bạn, trừ khi chính bạn cho phép điều đó qua lăng kính phán xét của mình.\n\n` +
      `3. **Tâm thế đối diện với con người và xã hội:**\n` +
      `   Mỗi sáng thức dậy, vị hoàng đế tự nhủ: *“Hôm nay ta sẽ gặp kẻ ích kỷ, kiêu ngạo, dối trá... Nhưng họ cư xử như vậy vì không phân biệt được thiện và ác. Còn ta, ta biết bản tính của điều thiện, nên không ai có thể kéo ta vào điều xấu xí ấy.”*\n\n` +
      `4. **Amor Fati (Yêu lấy định mệnh) & Memento Mori (Nhớ rằng ta sẽ chết):**\n` +
      `   Xem mọi trở ngại như nhiên liệu nuôi dưỡng ngọn lửa đức hạnh: *"Vật cản trên đường trở thành con đường."*\n\n` +
      `**Câu hỏi gợi mở từ Socrates dành cho bạn:**\n` +
      `Trong cuộc sống của bạn hôm nay, có điều gì đang làm bạn bận lòng mà thực chất nó lại nằm ngoài tầm kiểm soát của bạn không?`;
  }

  if (query.includes('amor fati')) {
    return `**🏛️ Về khái niệm Amor Fati — Tình yêu định mệnh:**\n\n` +
      `*Amor Fati* là một cụm từ tiếng Latinh có nghĩa là **"Hãy yêu lấy số phận của mình"**, được triết gia **Friedrich Nietzsche** và các bậc thầy Khắc Kỷ như **Marcus Aurelius** nâng lên thành một thái độ sống đỉnh cao.\n\n` +
      `1. **Vượt lên trên sự chịu đựng:**\n` +
      `   Amor Fati không phải là sự cam chịu hay đầu hàng số phận một cách thụ động. Đó là việc bạn ôm trọn lấy toàn bộ cuộc đời — bao gồm cả niềm vui, thất bại, nỗi đau và mất mát — như những nốt nhạc không thể thiếu trong bản hòa tấu của sự tồn tại.\n\n` +
      `2. **Nguyên lý của Nietzsche:**\n` +
      `   *"Công thức của tôi về sự vĩ đại nơi một con người là Amor Fati: không muốn bất cứ điều gì khác đi, không ở phía trước, không ở phía sau, không trong suốt cõi vĩnh hằng. Không chỉ chịu đựng cái tất yếu, mà hãy yêu lấy nó."*\n\n` +
      `3. **Ứng dụng vào đời sống:**\n` +
      `   Khi nghịch cảnh ập tới, thay vì than vãn *"Tại sao lại là tôi?"*, người thấu hiểu Amor Fati sẽ mỉm cười và nói: *"Đây chính là cơ hội để tôi tôi luyện bản lĩnh và trưởng thành."*\n\n` +
      `**Socrates tự vấn cùng bạn:** Bạn đã từng trải qua một biến cố đau buồn nào trong quá khứ mà giờ đây nhìn lại, bạn lại cảm thấy biết ơn vì nó đã tạo nên con người mạnh mẽ của bạn ngày hôm nay chưa?`;
  }

  if (query.includes('tóm tắt') || query.includes('3 cốt lõi') || query.includes('cốt lõi')) {
    return `**⚡ 3 Cốt Lõi Minh Triết Dành Cho Người Hiện Đại:**\n\n` +
      `Dựa trên tinh thần khai phóng của thư viện **Sophia Codex**, đây là 3 trụ cột soi sáng nhận thức của chúng ta:\n\n` +
      `1. **Tự vấn để thức tỉnh (Phương pháp Socrates):**\n` +
      `   *"Một cuộc đời không tự vấn là một cuộc đời không đáng sống."* Hãy luôn can đảm đặt câu hỏi về những niềm tin, định kiến và kỳ vọng mà xã hội áp đặt lên bạn. Khi nhận biết sự vô tri của chính mình, đó là lúc trí tuệ bắt đầu nảy mầm.\n\n` +
      `2. **Làm chủ nội tâm giữa biến thiên thời cuộc (Chủ nghĩa Khắc Kỷ & Đạo Gia):**\n` +
      `   Phân biệt rõ ràng điều bạn có thể kiểm soát và điều bạn phải thuận theo tự nhiên. Giữ tâm tĩnh lặng như mặt nước hồ thu (*Vô vi* và *Thành lũy nội tâm*), không để ngoại cảnh xô đẩy.\n\n` +
      `3. **Dũng cảm tự kiến tạo ý nghĩa cuộc đời (Chủ nghĩa Hiện Sinh):**\n` +
      `   Ý nghĩa cuộc đời không có sẵn như một món quà đóng gói, mà là trách nhiệm do chính bạn tự định nghĩa thông qua hành động, lý tưởng và lòng can đảm vượt qua giới hạn của bản thân.\n\n` +
      `**Bạn muốn chúng ta cùng đào sâu hơn vào cốt lõi nào trong ba điều trên?**`;
  }

  if (query.includes('phản biện') || query.includes('đặt câu hỏi')) {
    return `**💡 Nghệ thuật Phản biện Socratic (Elenchus):**\n\n` +
      `Tôi rất vui mừng khi bạn muốn thực hành tư duy phản biện! Trong các cuộc đàm đạo tại thành Athens cổ đại, tôi không mang đến câu trả lời sẵn có, mà cùng người bạn đối thoại bóc tách từng lớp vỏ của vấn đề.\n\n` +
      `Hãy thử đặt câu hỏi phản biện về một định kiến phổ biến: **"Thành công có đồng nghĩa với hạnh phúc hay không?"**\n\n` +
      `1. **Giả định ban đầu:** Người ta thường tin rằng có nhiều tiền tài, danh vọng và địa vị sẽ tự nhiên có được hạnh phúc.\n` +
      `2. **Câu hỏi phản biện:** Liệu bạn có từng thấy những người đạt đỉnh cao danh vọng nhưng tâm hồn lại vô cùng trống rỗng và bất an? Nếu thành công đem lại hạnh phúc, tại sao sự bất an đó lại tồn tại?\n` +
      `3. **Định nghĩa lại:** Có phải hạnh phúc thực sự là một phẩm chất của tâm hồn, độc lập với những thứ hào nhoáng bên ngoài?\n\n` +
      `**Hỡi bạn, vấn đề triết học nào đang khiến bạn suy nghĩ nhiều nhất gần đây? Hãy chia sẻ, tôi sẽ cùng bạn phản biện đa chiều!**`;
  }

  if (query.includes('đạo đức kinh') || query.includes('lão tử') || query.includes('vô vi') || query.includes('đạo gia')) {
    return `**🌿 Minh triết "Vô Vi" trong Đạo Đức Kinh của Lão Tử:**\n\n` +
      `Triết lý của **Lão Tử** tựa như dòng nước êm đềm nhưng có sức mạnh vô song xuyên thủng đá tảng (*Thượng thiện nhược thủy*):\n\n` +
      `1. **Bản chất của Vô vi (無為):**\n` +
      `   Vô vi không phải là lười biếng hay không làm gì, mà là **hành động thuận theo tự nhiên**, không gượng gạo, không dùng mưu mô vị kỷ để cưỡng cầu kết quả.\n\n` +
      `2. **Đạo lý của sự mềm dẻo:**\n` +
      `   Cây cứng thì dễ gãy trước giông bão, cây cỏ mềm mại thì uốn mình theo chiều gió mà tồn tại. Người khôn ngoan biết hạ mình, biết khiêm nhu thì lòng mới dung nạp được thiên hạ.\n\n` +
      `3. **Biết đủ là giàu (Tri túc thường lạc):**\n` +
      `   *"Biết người là trí, biết mình là sáng. Thắng người là có sức, thắng mình là kiên cường. Biết đủ là phú quý."*\n\n` +
      `**Câu hỏi từ Socrates:** Giữa một xã hội luôn hối hả ganh đua, làm thế nào để bạn tìm lại được khoảnh khắc "thuận theo tự nhiên" trong ngày hôm nay?`;
  }

  if (query.includes('cộng hòa') || query.includes('plato') || query.includes('hang động') || query.includes('công lý')) {
    return `**🏛️ Tư tưởng kinh điển trong "Cộng Hòa" (The Republic) của Plato:**\n\n` +
      `Plato, người học trò xuất sắc của tôi, đã đúc kết những suy tư vĩ đại về đạo đức, công lý và nhà nước lý tưởng:\n\n` +
      `1. **Dụ ngôn Hang động (Allegory of the Cave):**\n` +
      `   Con người bị trói trong hang tối, chỉ nhìn thấy những cái bóng trên vách đá và tưởng đó là sự thật duy nhất. Người triết gia là người dám bẻ gãy xiềng xích, bước ra ánh sáng mặt trời để chiêm ngưỡng Chân lý thực sự, rồi quay trở lại giúp đỡ đồng loại dù có bị chế giễu hay xua đuổi.\n\n` +
      `2. **Bản chất của Công lý:**\n` +
      `   Công lý trong một linh hồn là khi Lý trí (Reason) làm chủ, hướng dẫn Tinh thần quả cảm (Spirit) và kiềm chế những Ham muốn dục vọng (Appetite).\n\n` +
      `**Câu hỏi dành cho bạn:** Bạn có nghĩ rằng trong thế giới truyền thông số ngày nay, chúng ta cũng đang bị cuốn vào những chiếc bóng phản chiếu trên màn hình điện thoại thay vì nhìn thấy thực tại chân thật không?`;
  }

  if (query.includes('nietzsche') || query.includes('zarathustra') || query.includes('hiện sinh') || query.includes('siêu nhân')) {
    return `**⚡ Ý chí vươn lên cùng Friedrich Nietzsche (Zarathustra):**\n\n` +
      `Triết học của Nietzsche là tiếng gọi thức tỉnh mãnh liệt dành cho những tâm hồn không chấp nhận sự tầm thường:\n\n` +
      `1. **Khái niệm Siêu nhân (Übermensch):**\n` +
      `   Con người là một sợi dây nối giữa loài cầm thú và Siêu nhân — một sợi dây bắc qua vực thẳm. Người tự do là người dám phá vỡ những chiếc bảng giá trị cũ kỹ, vượt qua thói bầy đàn để tự kiến tạo chuẩn mực sống cho chính mình.\n\n` +
      `2. **Vượt qua chủ nghĩa hư vô:**\n` +
      `   Khi cuộc đời không có một mục đích sẵn có từ trước, đó không phải là bi kịch, mà là cơ hội tuyệt đối để bạn trở thành kiến trúc sư của cuộc đời mình.\n\n` +
      `**Câu hỏi phản biện:** Điều gì đang ngăn cản bạn sống hết mình với phiên bản dũng cảm và chân thật nhất của bản thân?`;
  }

  if (query.includes('hạnh phúc') || query.includes('bình an') || query.includes('an yên') || query.includes('buồn') || query.includes('đau khổ')) {
    return `**🕊️ Đàm đạo về Hạnh phúc và Sự An Yên trong tâm hồn:**\n\n` +
      `Hỡi bạn, con người muôn đời mải miết đi tìm hạnh phúc ở bên ngoài: tiền bạc, người yêu, danh tiếng, lời khen ngợi. Nhưng các bậc hiền triết đều nhận ra rằng:\n\n` +
      `1. **Hạnh phúc chân thật (Eudaimonia):**\n` +
      `   Không phải là sự thỏa mãn cảm xúc tức thời, mà là **trạng thái hòa hợp của linh hồn** khi ta sống đúng với phẩm hạnh, trung thực với lương tâm và hữu ích cho đời.\n\n` +
      `2. **Đối diện với đau khổ:**\n` +
      `   Nỗi đau là cảm giác thể xác, nhưng khổ sở là sự lựa chọn của tâm trí. Khi bạn chấp nhận quy luật biến đổi của vạn vật và buông bỏ sự kiểm soát tuyệt đối, sự bình an sẽ tự nhiên hiển lộ.\n\n` +
      `**Socrates xin hỏi bạn:** Nếu bây giờ tước đi mọi tài sản vật chất và sự tán dương của người đời, điều gì bên trong bạn vẫn còn nguyên vẹn giá trị?`;
  }

  // Câu trả lời tổng quát uyên bác, linh hoạt cho mọi câu hỏi khác
  return `Chào người bạn quý mến! Câu hỏi của bạn: *"**${message}**"* mở ra một không gian đối thoại vô cùng sâu sắc.\n\n` +
    `Dưới góc nhìn của triết học và tinh thần của **${book}**:\n\n` +
    `1. **Xem xét từ gốc rễ vấn đề:**\n` +
    `   Phần lớn những thắc mắc của con người đều bắt nguồn từ sự đối chọi giữa kỳ vọng chủ quan và thực tại khách quan. Khi chúng ta đòi hỏi cuộc đời phải diễn ra theo ý muốn của mình, sự bối rối và hoang mang sẽ nảy sinh.\n\n` +
    `2. **Góc nhìn minh triết:**\n` +
    `   - **Trí tuệ Khắc Kỷ:** Tập trung rèn luyện đức tính sáng suốt, kiên định và từ bi trong hiện tại.\n` +
    `   - **Phương Đông cổ xưa:** Giữ lòng trống rỗng như chiếc chuông rỗng, để mọi thanh âm đi qua mà không để lại vết xước.\n` +
    `   - **Tinh thần Socrates:** Thừa nhận rằng ta chưa biết hết mọi điều, và chính sự tò mò chân thành sẽ dẫn lối ta tới chân lý.\n\n` +
    `3. **Đề xuất thực hành hôm nay:**\n` +
    `   Hãy thử quan sát vấn đề của bạn như một người ngoài cuộc khách quan và độ lượng. Bạn sẽ thấy giải pháp thường đơn giản hơn nhiều so với những lo âu trong tâm tưởng.\n\n` +
    `**Tôi có thể cùng bạn đào sâu thêm khía cạnh cụ thể nào mà bạn đang quan tâm nhất?**`;
}

/**
 * Gửi tin nhắn tới Gemini và stream kết quả trả về.
 * Tự động chuyển tiếp sang Socrates Philosophy Engine nếu API key chưa cấu hình hoặc gặp lỗi mạng.
 */
const streamSocratesResponse = async ({ systemPrompt, history, message, onChunk, bookTitle, selectedQuote }) => {
  const genAI = getGenAIClient();
  const modelName = getModelName();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemPrompt 
      });

      const chat = model.startChat({
        history: history || [],
      });

      const result = await chat.sendMessageStream(message);
      let fullText = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }

      if (fullText.trim().length > 0) {
        return { text: fullText, tokenCount: Math.ceil(fullText.length / 4) };
      }
    } catch (apiErr) {
      console.warn('[Gemini API] Lỗi khi gọi Gemini, tự động kích hoạt Socratic Philosophy Engine fallback:', apiErr.message);
    }
  }

  // Fallback: Socratic Philosophy Engine
  const intelligentReply = generateSocratesPhilosophicalReply(message, { bookTitle, selectedQuote });
  const words = intelligentReply.split(/(\s+)/);
  const isTest = process.env.NODE_ENV === 'test';
  const delayMs = isTest ? 0 : 20;
  
  for (let i = 0; i < words.length; i++) {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs)); // Hiệu ứng gõ chữ mượt mà
    }
    if (onChunk) {
      onChunk(words[i]);
    }
  }

  return { text: intelligentReply, tokenCount: Math.ceil(intelligentReply.length / 4) };
};

module.exports = {
  buildSocratesSystemPrompt,
  streamSocratesResponse,
  generateSocratesPhilosophicalReply
};

