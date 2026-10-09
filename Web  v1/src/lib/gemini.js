const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const apiKey = env.GEMINI_API_KEY;
const modelName = env.GEMINI_MODEL || 'gemini-2.0-flash';

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('GEMINI_API_KEY is missing. Using fallback mock generator.');
}

/**
 * Xây dựng system prompt với phong cách Socrates.
 * @param {Object} params - Tham số context
 * @param {string} [params.bookTitle] - Tên sách
 * @param {string} [params.author] - Tác giả
 * @param {string} [params.chapterTitle] - Tên chương
 * @param {string} [params.chapterContent] - Nội dung chương
 * @param {string} [params.selectedQuote] - Trích dẫn đã chọn
 * @returns {string} System prompt
 */
const buildSocratesSystemPrompt = ({ bookTitle, author, chapterTitle, chapterContent, selectedQuote }) => {
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
 * Gửi tin nhắn tới Gemini và stream kết quả trả về.
 * @param {Object} params - Tham số
 * @param {string} params.systemPrompt - Lời nhắc hệ thống
 * @param {Array} params.history - Lịch sử hội thoại (format role/parts)
 * @param {string} params.message - Tin nhắn mới của người dùng
 * @param {Function} params.onChunk - Hàm callback khi nhận được chunk text
 * @returns {Promise<{text: string, tokenCount: number}>} Text hoàn chỉnh và số token (mock)
 */
const streamSocratesResponse = async ({ systemPrompt, history, message, onChunk }) => {
  if (!genAI) {
    // Fallback mock generator
    const mockResponse = "Theo quan điểm của Socrates, câu hỏi của bạn mở ra một chân trời tư duy mới. Bạn nghĩ sao về việc bản chất của sự việc đôi khi không nằm ở bề ngoài, mà ở những câu hỏi chúng ta tự đặt ra? Liệu chúng ta có thực sự hiểu điều mình đang tìm kiếm?";
    const chunks = mockResponse.split(' ');
    
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // giả lập delay
      onChunk(chunks[i] + ' ');
    }
    
    return { text: mockResponse, tokenCount: mockResponse.length };
  }

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

  return { text: fullText, tokenCount: 0 };
};

module.exports = {
  buildSocratesSystemPrompt,
  streamSocratesResponse
};
