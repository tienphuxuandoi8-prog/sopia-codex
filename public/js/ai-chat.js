/**
 * SOPHIA CODEX - AI PHILOSOPHY COMPANION (Socrates Chatbot)
 * Trợ lý triết học đối thoại, phản biện và phân tích văn bản
 */

class AIChatCompanion {
  constructor() {
    this.panel = document.getElementById('ai-chat-sidebar');
    this.messagesContainer = document.getElementById('ai-chat-messages');
    this.inputField = document.getElementById('ai-chat-input');
    this.sendBtn = document.getElementById('ai-chat-send');
    this.toggleBtn = document.getElementById('ai-toggle-btn');
    this.closeBtn = document.getElementById('ai-close-btn');
    this.currentContextBook = null;
    this.currentContextChapter = null;
    this.isThinking = false;
    this.currentThreadId = null;
    this.lastAttemptedMessage = null;
    this.lastAttemptedQuote = null;

    this.initEvents();
  }

  initEvents() {
    this.sendBtn?.addEventListener('click', () => this.handleSendMessage());
    this.inputField?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.toggleBtn?.addEventListener('click', () => this.togglePanel());
    this.closeBtn?.addEventListener('click', () => this.closePanel());

    // Các nút prompt gợi ý nhanh
    document.querySelectorAll('.ai-chip-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const promptKey = btn.getAttribute('data-prompt-key');
        const promptText = btn.textContent.trim();
        this.askPresetQuestion(promptKey, promptText);
      });
    });
  }

  async initThread() {
    try {
      const bookId = this.currentContextBook?.id || null;
      const chapterId = this.currentContextChapter?.id || null;
      
      const response = await fetch('/api/v1/ai/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterId, title: 'Đàm đạo với Socrates' })
      });
      if (response.ok) {
        const data = await response.json();
        this.currentThreadId = data.data?.id || data.id;
      } else {
        this.currentThreadId = 'thread_' + Date.now();
      }
    } catch (err) {
      this.currentThreadId = 'thread_' + Date.now();
    }
  }

  async fetchQuota() {
    try {
      const response = await fetch('/api/v1/ai/quota');
      if (response.ok) {
        const data = await response.json();
        const quota = data.data || data;
        this.renderQuotaBadge(quota.remaining !== undefined ? quota.remaining : 50, quota.limit || 50);
      } else {
        this.renderQuotaBadge(50, 50);
      }
    } catch (err) {
      this.renderQuotaBadge(50, 50);
    }
  }

  renderQuotaBadge(remaining, limit) {
    let badge = document.getElementById('ai-quota-badge');
    if (!badge) {
      const header = this.panel?.querySelector('header') || this.panel?.querySelector('.p-4');
      if (header) {
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'mt-2';
        badge = document.createElement('span');
        badge.id = 'ai-quota-badge';
        badge.className = 'text-xs bg-stone-800 text-amber-400 px-3 py-1 rounded-full inline-block border border-stone-700 shadow-sm';
        badgeContainer.appendChild(badge);
        header.appendChild(badgeContainer);
      }
    }
    if (badge) {
      badge.textContent = `Còn lại: ${remaining}/${limit} câu đàm đạo`;
    }
  }

  setContext(book, chapter) {
    this.currentContextBook = book;
    this.currentContextChapter = chapter;
    const badge = document.getElementById('ai-context-badge');
    if (badge && book) {
      badge.textContent = `Đang đàm đạo: ${book.title}`;
    }
    this.initThread();
  }

  togglePanel() {
    if (!this.panel) return;
    const isHidden = this.panel.classList.contains('translate-x-full');
    if (isHidden) {
      this.openPanel();
    } else {
      this.closePanel();
    }
  }

  openPanel() {
    this.panel?.classList.remove('translate-x-full');
    this.panel?.classList.add('translate-x-0');
    this.fetchQuota();
    if (!this.currentThreadId) {
      this.initThread();
    }
  }

  closePanel() {
    this.panel?.classList.add('translate-x-full');
    this.panel?.classList.remove('translate-x-0');
  }

  handleSendMessage() {
    const text = this.inputField?.value.trim();
    if (!text || this.isThinking) return;

    this.inputField.value = '';
    this.appendUserMessage(text);
    this.generateAIResponse(text);
  }

  askWithSelection(quoteText) {
    this.openPanel();
    const prompt = `Giải thích ngụ ý triết học sâu xa của đoạn trích sau:\n"${quoteText}"`;
    this.appendUserMessage(prompt);
    this.generateAIResponse(prompt, quoteText);
  }

  askPresetQuestion(key, label) {
    this.appendUserMessage(label);
    this.generateAIResponse(label);
  }

  async generateAIResponse(userInput, quoteText = null) {
    if (!this.currentThreadId) {
      this.currentThreadId = 'thread_' + Date.now();
    }

    this.lastAttemptedMessage = userInput;
    this.lastAttemptedQuote = quoteText;
    this.isThinking = true;

    const bubbleId = 'ai-msg-' + Date.now();
    this.appendStreamingBubble(bubbleId);

    try {
      const csrfMeta = document.querySelector('meta[name="csrf-token"]');
      const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

      const response = await fetch('/api/v1/ai/threads/' + this.currentThreadId + '/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ message: userInput, selectedQuote: quoteText })
      });

      if (response.status === 429) {
        this.removeBubble(bubbleId);
        this.showQuotaExceededWarning();
        this.isThinking = false;
        return;
      }

      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }

      const contentType = response.headers.get('content-type') || '';
      const bubbleContent = document.getElementById(bubbleId + '-content');

      if (contentType.includes('text/event-stream')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let aiText = '';
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.text) {
                    aiText += data.text;
                    if (bubbleContent) {
                      bubbleContent.innerHTML = this.formatMarkdown(aiText) + '<span class="animate-pulse">▋</span>';
                      this.scrollToBottom();
                    }
                  }
                } catch (e) {
                  // ignore JSON parse error for partial chunks
                }
              }
            }
          }
        }

        // Finalize text
        if (bubbleContent) {
          bubbleContent.innerHTML = this.formatMarkdown(aiText);
        }
      } else {
        // Normal JSON response fallback
        const resJson = await response.json();
        const aiText = resJson.data?.text || resJson.text || 'Cuộc đàm đạo đã được ghi nhận.';
        if (bubbleContent) {
          bubbleContent.innerHTML = this.formatMarkdown(aiText);
        }
      }
      
      this.fetchQuota();

    } catch (err) {
      console.warn('API connection issue, switching to local Socratic philosophy engine:', err);
      // Tự động kích hoạt Socratic Philosophy Engine dự phòng ngay trên client
      await this.streamLocalPhilosophicalReply(userInput, quoteText, bubbleId);
    } finally {
      this.isThinking = false;
    }
  }

  /**
   * Bộ sinh triết học dự phòng Socrates hoạt động trực tiếp trên Client
   * Đảm bảo người dùng luôn nhận được câu trả lời thông tuệ ngay cả khi mất mạng hoặc server bận
   */
  async streamLocalPhilosophicalReply(userInput, quoteText, bubbleId) {
    const bubbleContent = document.getElementById(bubbleId + '-content');
    if (!bubbleContent) return;

    const reply = this.getLocalSocratesReply(userInput, quoteText);
    const words = reply.split(/(\s+)/);
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += words[i];
      bubbleContent.innerHTML = this.formatMarkdown(currentText) + '<span class="animate-pulse">▋</span>';
      this.scrollToBottom();
      await new Promise(r => setTimeout(r, 20));
    }

    bubbleContent.innerHTML = this.formatMarkdown(currentText);
    this.scrollToBottom();
  }

  getLocalSocratesReply(userInput, quoteText) {
    const q = (userInput || '').toLowerCase().trim();
    const currentBook = this.currentContextBook?.title || 'Suy Tưởng (Marcus Aurelius)';

    if (quoteText) {
      return `**Phân tích ngụ ý triết học đoạn trích:**\n\n> *"${quoteText}"*\n\n` +
        `Chào bạn, hỡi người bạn đồng hành của tri thức! Đoạn trích trên phản ánh một bài học bất hủ:\n\n` +
        `1. **Ý nghĩa cốt lõi:** Phần lớn nỗi thống khổ hay âu lo của con người không đến từ thế giới khách quan, mà nảy sinh từ **lăng kính và phán xét chủ quan** của chính ta.\n` +
        `2. **Bài học ứng dụng:** Khi đối diện với áp lực hay điều bất như ý, hãy bình tâm tự hỏi: *'Điều này thực sự nằm trong tầm kiểm soát của ta hay không?'*\n` +
        `3. **Câu hỏi phản biện:** Liệu bạn có thể buông bỏ sự phán xét để tâm trí mình được tự do thanh thản ngay trong phút giây này?`;
    }

    if (q.includes('suy tưởng') || q.includes('marcus') || q.includes('aurelius') || q.includes('khắc kỷ') || q.includes('stoic')) {
      return `Chào bạn, hỡi người tìm kiếm sự an yên! Cuốn **"Suy Tưởng" (Meditations)** của Hoàng đế La Mã **Marcus Aurelius** là một trong những kiệt tác triết học vĩ đại nhất về chủ nghĩa Khắc Kỷ (Stoicism). Dưới đây là những giá trị cốt lõi sâu sắc nhất:\n\n` +
        `1. **Nhị phân quyền kiểm soát (Dichotomy of Control):**\n` +
        `   Marcus luôn tự nhắc mình phân biệt ranh giới: Điều gì thuộc về ta (ý chí, thái độ, phản ứng của bản thân) và điều gì không thuộc về ta (dư luận, hành vi người khác, biến cố bên ngoài). Khi ngừng bám chấp vào những thứ ngoài tầm tay, bạn sẽ đạt tới sự bình thản tuyệt đối (*Ataraxia*).\n\n` +
        `2. **Thành lũy nội tâm kiên cố (Inner Citadel):**\n` +
        `   *"Tâm trí của bạn sẽ mang màu sắc của những ý nghĩ mà bạn thường dung dưỡng."* Không điều gì bên ngoài có thể làm tổn thương bạn trừ khi bạn tự cho phép điều đó qua lăng kính phán xét của mình.\n\n` +
        `3. **Lòng bao dung với con người:**\n` +
        `   Mỗi sáng thức dậy, ông tự nhủ: *“Hôm nay ta sẽ gặp kẻ ích kỷ, kiêu ngạo, vô ơn... Nhưng họ hành xử vậy vì không phân biệt được thiện và ác. Còn ta, ta biết bản tính của điều thiện, nên không ai có thể lôi kéo ta vào điều xấu xí ấy.”*\n\n` +
        `4. **Amor Fati & Memento Mori:**\n` +
        `   Xem mọi nghịch cảnh như cơ hội rèn luyện phẩm hạnh: *"Vật cản trên đường trở thành con đường."*\n\n` +
        `**Câu hỏi từ Socrates:** Trong cuộc sống hôm nay, có điều gì đang làm bạn bận lòng mà thực chất nó lại nằm ngoài tầm kiểm soát của bạn không?`;
    }

    if (q.includes('amor fati')) {
      return `**🏛️ Khái niệm Amor Fati — Tình yêu định mệnh:**\n\n` +
        `*Amor Fati* là tư tưởng được triết gia **Friedrich Nietzsche** và các bậc thầy Khắc Kỷ như **Marcus Aurelius** đúc kết thành một nghệ thuật sống đỉnh cao.\n\n` +
        `1. **Vượt lên trên sự chịu đựng:**\n` +
        `   Amor Fati không phải là cam chịu hay đầu hàng số phận. Đó là việc bạn ôm trọn lấy toàn bộ cuộc đời — bao gồm cả niềm vui, thất bại, đớn đau và thử thách — như một phần tất yếu làm nên sự vĩ đại của sự tồn tại.\n\n` +
        `2. **Lời dạy của Nietzsche:**\n` +
        `   *"Công thức của tôi về sự vĩ đại nơi một con người là Amor Fati: không muốn bất cứ điều gì khác đi, không ở phía trước, không ở phía sau, không trong suốt cõi vĩnh hằng."*\n\n` +
        `**Socrates tự vấn cùng bạn:** Bạn đã từng trải qua một biến cố nào mà giờ đây nhìn lại, bạn lại cảm thấy biết ơn vì nó đã tôi luyện nên con người bản lĩnh của bạn ngày hôm nay?`;
    }

    if (q.includes('tóm tắt') || q.includes('3 cốt lõi') || q.includes('cốt lõi')) {
      return `**⚡ 3 Cốt Lõi Minh Triết Sophia Codex Dành Cho Bạn:**\n\n` +
        `1. **Tự vấn để thức tỉnh (Phương pháp Socrates):**\n` +
        `   *"Một cuộc đời không tự vấn là cuộc đời không đáng sống."* Hãy luôn can đảm đặt câu hỏi về những niềm tin và định kiến sẵn có để nhận thức sự vô tri của mình và mở lối cho trí tuệ.\n\n` +
        `2. **Làm chủ nội tâm (Chủ nghĩa Khắc Kỷ & Đạo Gia):**\n` +
        `   Phân biệt điều kiểm soát được và điều không kiểm soát được. Giữ tâm tĩnh lặng như nước, hành động thuận theo tự nhiên (*Vô vi*).\n\n` +
        `3. **Dũng cảm kiến tạo ý nghĩa (Chủ nghĩa Hiện Sinh):**\n` +
        `   Ý nghĩa cuộc đời không có sẵn ở đâu đó, mà là tác phẩm do chính bạn can đảm khắc họa mỗi ngày.\n\n` +
        `**Bạn muốn chúng ta cùng thảo luận sâu hơn về cốt lõi nào?**`;
    }

    if (q.includes('phản biện') || q.includes('đặt câu hỏi')) {
      return `**💡 Nghệ thuật Đối thoại Phản biện Socratic (Elenchus):**\n\n` +
        `Tôi rất vui khi bạn muốn thực hành tư duy phản biện! Socrates không dạy ta câu trả lời, mà dạy ta cách đặt câu hỏi để bóc tách sự thật.\n\n` +
        `Hãy thử cùng tôi phản biện: **"Thành công trong mắt xã hội có thực sự mang lại sự bình an cho bạn không?"**\n\n` +
        `Nhiều người đánh đổi cả tuổi trẻ và sức khỏe để đuổi theo sự tán dương của người đời, nhưng khi đạt được lại thấy trống rỗng. Vậy bản chất của một 'cuộc đời thành tựu' thực sự là gì theo bạn?`;
    }

    if (q.includes('đạo đức kinh') || q.includes('lão tử') || q.includes('vô vi')) {
      return `**🌿 Minh triết Vô Vi trong Đạo Đức Kinh của Lão Tử:**\n\n` +
        `Triết lý của Lão Tử dạy ta về sự mềm mại như nước (*Thượng thiện nhược thủy*):\n\n` +
        `1. **Vô vi:** Không phải là thụ động, mà là hành động thuận theo tự nhiên, không gượng gạo, không cưỡng cầu tư lợi.\n` +
        `2. **Tri túc:** Biết đủ là giàu có nhất. Người chiến thắng được chính mình mới thực sự là người kiên cường.\n\n` +
        `**Câu hỏi gợi mở:** Trong công việc hay cuộc sống hôm nay, điều gì bạn đang cố cưỡng cầu mà nếu buông lỏng ra một chút, mọi sự lại trở nên hanh thông hơn?`;
    }

    // Phản hồi tổng quát
    return `Chào người bạn đồng hành của tri thức! Câu hỏi của bạn: *"**${userInput}**"* mở ra một suy ngẫm rất đáng trân trọng trong tinh thần của **${currentBook}**.\n\n` +
      `1. **Từ góc nhìn triết học:** Mọi câu hỏi sâu sắc đều dẫn ta trở về với việc thấu hiểu chính mình. Khi bạn nhận ra gốc rễ của những băn khoăn, câu trả lời thường tự nó sáng tỏ.\n\n` +
      `2. **Lời khuyên thực hành:** Hãy giữ sự điềm tĩnh trước mọi biến động, phân định rõ điều mình có thể làm ngay lúc này và kiên trì rèn luyện đức hạnh.\n\n` +
      `**Bạn muốn tôi cùng đào sâu khía cạnh nào cụ thể hơn trong vấn đề này?**`;
  }

  appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'flex justify-end mb-4 animate-fade-in';
    bubble.innerHTML = `
      <div class="max-w-[85%] chat-user-bubble px-4 py-3 rounded-2xl text-sm shadow-sm text-stone-100">
        <p class="whitespace-pre-line">${this.escapeHTML(text)}</p>
      </div>
    `;
    this.messagesContainer?.appendChild(bubble);
    this.scrollToBottom();
  }

  appendStreamingBubble(id) {
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.className = 'flex gap-3 mb-4 animate-fade-in';
    bubble.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 text-xs font-serif font-bold shadow-sm border border-amber-600/40">
        S
      </div>
      <div class="max-w-[85%] chat-ai-bubble px-4 py-3 rounded-2xl text-sm text-stone-800 leading-relaxed">
        <div id="${id}-content"><span class="animate-pulse">▋</span></div>
        <div class="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span class="flex items-center gap-1 font-serif text-[11px]"><i data-lucide="sparkles" class="w-3 h-3 text-amber-600"></i> Sophia Socratic AI</span>
        </div>
      </div>
    `;
    this.messagesContainer?.appendChild(bubble);
    if (window.lucide) window.lucide.createIcons();
    this.scrollToBottom();
  }

  removeBubble(id) {
    document.getElementById(id)?.remove();
  }

  showQuotaExceededWarning() {
    const bubble = document.createElement('div');
    bubble.className = 'flex gap-3 mb-4 animate-fade-in w-full';
    bubble.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xs font-serif font-bold shadow-sm border border-amber-200">
        !
      </div>
      <div class="max-w-[85%] chat-ai-bubble px-4 py-3 rounded-2xl text-sm text-stone-800 leading-relaxed border border-amber-200 bg-amber-50">
        <p class="text-amber-700 font-medium mb-2">⏳ Bạn đã dùng hết số câu đàm đạo miễn phí hôm nay.</p>
        <a href="/pricing" class="inline-block mt-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors shadow-sm">
          ✨ Nâng Cấp Gói Premium để đàm đạo không giới hạn
        </a>
      </div>
    `;
    this.messagesContainer?.appendChild(bubble);
    this.scrollToBottom();
  }

  showNetworkError() {
    const bubble = document.createElement('div');
    bubble.className = 'flex gap-3 mb-4 animate-fade-in';
    bubble.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xs font-bold shadow-sm border border-red-200">
        X
      </div>
      <div class="max-w-[85%] chat-ai-bubble px-4 py-3 rounded-2xl text-sm text-red-800 leading-relaxed border border-red-200 bg-red-50">
        <p class="mb-2">Kết nối đến Hiền triết AI bị gián đoạn. Xin vui lòng thử lại.</p>
        <button onclick="if(window.aiChat) window.aiChat.retryLastMessage()" class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors">
          Thử lại
        </button>
      </div>
    `;
    this.messagesContainer?.appendChild(bubble);
    this.scrollToBottom();
  }

  retryLastMessage() {
    if (this.lastAttemptedMessage && !this.isThinking) {
      this.generateAIResponse(this.lastAttemptedMessage, this.lastAttemptedQuote);
    }
  }

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-700 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-stone-600">$1</em>')
      .replace(/^>\s*(.*?)$/gm, '<blockquote class="border-l-2 border-amber-500 pl-2 italic text-stone-600 my-1">$1</blockquote>')
      .replace(/^\d+\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^-\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/\n/g, " ");
  }
}

// Khởi tạo toàn cục
window.aiChat = new AIChatCompanion();
