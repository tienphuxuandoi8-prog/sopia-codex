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

  setContext(book, chapter) {
    this.currentContextBook = book;
    this.currentContextChapter = chapter;
    const badge = document.getElementById('ai-context-badge');
    if (badge && book) {
      badge.textContent = `Đang đàm đạo: ${book.title}`;
    }
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
    this.showThinking();

    setTimeout(() => {
      this.hideThinking();
      let response = PHILOSOPHY_DATA.aiKnowledge.presets[key];
      if (!response) {
        response = `Về vấn đề này trong cuốn "${this.currentContextBook ? this.currentContextBook.title : 'triết học kinh điển'}", các nhà tư tưởng khuyến nghị ta không nên tìm câu trả lời tuyệt đối ngay lập tức, mà hãy chiêm nghiệm qua lăng kính của sự trung thực với chính bản thân mình.`;
      }
      this.appendAIMessage(response);
      this.logToSQLite(label, response);
    }, 900);
  }

  generateAIResponse(userInput, quoteText = null) {
    this.showThinking();

    setTimeout(() => {
      this.hideThinking();
      let reply = "";

      const lower = userInput.toLowerCase();
      const currentBookName = this.currentContextBook ? this.currentContextBook.title : "Suy Tưởng";

      if (quoteText) {
        reply = `**Phân tích đoạn trích:**\n\n*${quoteText}*\n\n1. **Ý nghĩa cốt lõi:** Đoạn văn này nhấn mạnh rằng phần lớn nỗi khổ đau của con người không đến từ thực tại khách quan, mà xuất phát từ lăng kính và phán xét chủ quan của chính ta.\n2. **Ứng dụng cho người đi làm & sinh viên:** Khi gặp áp lực công việc hay mâu thuẫn giao tiếp, thay vì phản ứng bộc phát, hãy lùi lại một nhịp và tự hỏi: *'Điều này có thực sự nằm trong tầm kiểm soát của ta hay không?'*`;
      } else if (lower.includes('hạnh phúc') || lower.includes('bình yên')) {
        reply = `Theo các triết gia Khắc Kỷ như **Marcus Aurelius** và **Epictetus**, hạnh phúc (Eudaimonia) không phải là sự thỏa mãn khoái lạc nhất thời, mà là **trạng thái tâm trí không bị xáo trộn** (*Ataraxia*). Bạn chỉ có thể an yên khi biết buông bỏ kỳ vọng điều khiển người khác và tập trung rèn luyện đức hạnh của chính mình.`;
      } else if (lower.includes('đạo') || lower.includes('vô vi') || lower.includes('nước')) {
        reply = `**Lão Tử** trong *Đạo Đức Kinh* dạy về 'Vô vi'—không phải là không làm gì cả, mà là **hành động thuận theo tự nhiên**, không gượng gạo, không cưỡng cầu tư lợi. Giống như dòng nước mềm mại, uốn lượn qua đá mà cuối cùng có thể bào mòn cả đá tảng!`;
      } else if (lower.includes('tại sao') || lower.includes('nghĩa') || lower.includes('sống')) {
        reply = `Đó là câu hỏi muôn thuở của chủ nghĩa Hiện sinh. **Nietzsche** từng nói: *"Kẻ có một lý do để sống có thể vượt qua mọi nghịch cảnh"*. Ý nghĩa cuộc đời không phải là một kho báu có sẵn chờ bạn đào lên, mà là một tác phẩm nghệ thuật do chính bạn can đảm khắc họa mỗi ngày.`;
      } else {
        reply = `Một suy ngẫm rất đáng trân trọng! Trong dòng chảy của **${currentBookName}**, tư tưởng này nhắc nhở chúng ta về tầm quan trọng của việc tự vấn lương tâm mỗi ngày. \n\n*Nếu bạn muốn đào sâu hơn, tôi có thể phân tích thêm khía cạnh thực hành hoặc đối thoại phản biện cùng bạn.*`;
      }

      this.appendAIMessage(reply);
      this.logToSQLite(userInput, reply);
    }, 1100);
  }

  logToSQLite(question, response) {
    try {
      const bookId = this.currentContextBook ? this.currentContextBook.id : 'suy-tuong';
      fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, question, response })
      }).catch(() => {});
    } catch(e) {}
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

  appendAIMessage(markdownText) {
    const bubble = document.createElement('div');
    bubble.className = 'flex gap-3 mb-4 animate-fade-in';
    
    // Convert basic bolding and linebreaks
    const formatted = markdownText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-700 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-stone-600">$1</em>')
      .replace(/\n/g, '<br/>');

    bubble.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 text-xs font-serif font-bold shadow-sm border border-amber-600/40">
        S
      </div>
      <div class="max-w-[85%] chat-ai-bubble px-4 py-3 rounded-2xl text-sm text-stone-800 leading-relaxed">
        ${formatted}
        <div class="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span class="flex items-center gap-1 font-serif text-[11px]"><i data-lucide="sparkles" class="w-3 h-3 text-amber-600"></i> Sophia Socratic AI</span>
          <button class="hover:text-emerald-800 copy-ai-btn" onclick="navigator.clipboard.writeText('${this.escapeQuotes(markdownText)}')">
            Sao chép
          </button>
        </div>
      </div>
    `;
    this.messagesContainer?.appendChild(bubble);
    if (window.lucide) window.lucide.createIcons();
    this.scrollToBottom();
  }

  showThinking() {
    this.isThinking = true;
    const thinkingEl = document.createElement('div');
    thinkingEl.id = 'ai-thinking-indicator';
    thinkingEl.className = 'flex gap-3 mb-4';
    thinkingEl.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 text-xs font-serif font-bold shadow-sm">
        S
      </div>
      <div class="chat-ai-bubble px-4 py-3 rounded-2xl text-xs text-stone-500 italic flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        Hiền triết AI đang chiêm nghiệm câu trả lời...
      </div>
    `;
    this.messagesContainer?.appendChild(thinkingEl);
    this.scrollToBottom();
  }

  hideThinking() {
    this.isThinking = false;
    document.getElementById('ai-thinking-indicator')?.remove();
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
