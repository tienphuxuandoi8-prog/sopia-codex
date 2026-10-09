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
      }
    } catch (err) {
      console.error('Failed to init thread:', err);
    }
  }

  async fetchQuota() {
    try {
      const response = await fetch('/api/v1/ai/quota');
      if (response.ok) {
        const data = await response.json();
        const quota = data.data || data;
        this.renderQuotaBadge(quota.remaining || 0, quota.limit || 0);
      }
    } catch (err) {
      console.error('Failed to fetch quota:', err);
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
      await this.initThread();
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
          'X-CSRF-Token': csrfToken
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
        throw new Error('Network error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiText = '';
      let done = false;

      const bubbleContent = document.getElementById(bubbleId + '-content');

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
      
      this.fetchQuota();

    } catch (err) {
      console.error(err);
      this.removeBubble(bubbleId);
      this.showNetworkError();
    } finally {
      this.isThinking = false;
    }
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
        <p class="text-amber-700 font-medium mb-2">⏳ Bạn đã đạt giới hạn câu hỏi miễn phí hôm nay.</p>
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
