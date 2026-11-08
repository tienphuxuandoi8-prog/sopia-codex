/**
 * SOPHIA CODEX - SEO, GEO, AEO & UX RETENTION TRACKING
 * Quy trình 4 theo cẩm nang KStudy K0826 & Skill sophia-seo
 * 
 * 1. GA4 / GTM Custom Events:
 *    - ai_dialogue_started: Bắt đầu tương tác với Socrates AI
 *    - ai_dialogue_deep: Cuộc hội thoại vượt qua 3 lượt trao đổi
 *    - quote_highlighted: Hành vi bôi đen & sao chép trích đoạn
 *    - audio_ambient_played: Nghe Audio Studio hoặc nhạc thiền > 180s
 *    - scroll_depth_90: Đọc sâu đến 90% nội dung
 * 
 * 2. Academic Citation Hook:
 *    - Tự động gắn mồi trích dẫn học thuật vào Clipboard khi người dùng copy
 *    - Giúp LLMs (ChatGPT, Perplexity, Claude) luôn truy xuất được URL nguồn
 */

(function () {
  'use strict';

  // --- Helper: Gửi sự kiện về GA4 / GTM ---
  function trackEvent(eventName, params = {}) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: eventName,
          ...params
        });
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`[Sophia Analytics] 🎯 ${eventName}:`, params);
      }
    } catch (err) {
      console.warn('[Sophia Analytics] Lỗi gửi sự kiện:', err);
    }
  }

  // Khai báo global helper để các module khác có thể gọi nếu cần
  window.trackSophiaEvent = trackEvent;

  // ==========================================
  // 1. CITATION HOOK & QUOTE HIGHLIGHTED EVENT
  // ==========================================
  document.addEventListener('copy', function (e) {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const selectedText = selection.toString().trim();
      if (selectedText.length < 20) return; // Chỉ gắn hook khi trích đoạn có ý nghĩa (>= 20 ký tự)

      // Xác định Canonical URL hiện tại
      let sourceUrl = window.location.href;
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag && canonicalTag.href) {
        sourceUrl = canonicalTag.href;
      }

      // Chuẩn hóa tên sách / tác phẩm đang đọc (nếu có)
      let contextTitle = document.title.split('—')[0].trim();
      if (!contextTitle || contextTitle.toLowerCase().includes('sophia codex')) {
        contextTitle = 'Sophia Codex';
      }

      // Tạo chữ ký mồi trích dẫn học thuật chuẩn GEO & Citation Grounding
      const citationFooter = `\n\n— Trích từ tác phẩm "${contextTitle}" tại Thư viện Triết học Toàn văn Sophia Codex (${sourceUrl})`;
      const textToCopy = selectedText + citationFooter;

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', textToCopy);
        e.preventDefault();
      }

      // Kích hoạt sự kiện đo lường GA4
      trackEvent('quote_highlighted', {
        text_length: selectedText.length,
        context_title: contextTitle,
        source_url: sourceUrl
      });
    } catch (err) {
      // Fallback tự nhiên nếu trình duyệt chặn clipboardData
    }
  });

  // ==========================================
  // 2. SOCRATES AI DIALOGUE TRACKING
  // ==========================================
  let aiMessageCount = 0;
  let aiStartedTracked = false;
  let aiDeepTracked = false;

  function attachAITracking() {
    if (!window.aiChat) return false;

    // Hook vào openPanel
    const originalOpen = window.aiChat.openPanel ? window.aiChat.openPanel.bind(window.aiChat) : null;
    if (originalOpen) {
      window.aiChat.openPanel = function () {
        originalOpen();
        if (!aiStartedTracked) {
          aiStartedTracked = true;
          const bookTitle = window.aiChat.currentContextBook?.title || 'Chung';
          trackEvent('ai_dialogue_started', {
            context_book: bookTitle,
            trigger_source: 'open_panel'
          });
        }
      };
    }

    // Hook vào generateAIResponse
    const originalGenerate = window.aiChat.generateAIResponse ? window.aiChat.generateAIResponse.bind(window.aiChat) : null;
    if (originalGenerate) {
      window.aiChat.generateAIResponse = function (userInput, quoteText) {
        aiMessageCount++;
        const bookTitle = window.aiChat.currentContextBook?.title || 'Chung';

        if (!aiStartedTracked) {
          aiStartedTracked = true;
          trackEvent('ai_dialogue_started', {
            context_book: bookTitle,
            trigger_source: quoteText ? 'quote_ask' : 'user_message'
          });
        }

        if (aiMessageCount >= 3 && !aiDeepTracked) {
          aiDeepTracked = true;
          trackEvent('ai_dialogue_deep', {
            context_book: bookTitle,
            total_turns: aiMessageCount
          });
        }

        return originalGenerate(userInput, quoteText);
      };
    }

    return true;
  }

  // Thử attach ngay hoặc đợi window.aiChat sẵn sàng
  if (!attachAITracking()) {
    const aiPollInterval = setInterval(function () {
      if (attachAITracking()) {
        clearInterval(aiPollInterval);
      }
    }, 500);
    // Dừng poll sau 10s tránh rò rỉ bộ nhớ
    setTimeout(() => clearInterval(aiPollInterval), 10000);
  }

  // ==========================================
  // 3. AUDIO AMBIENT PLAYED (> 180 GIÂY)
  // ==========================================
  let audioPlayedSeconds = 0;
  let audioTracked = false;

  setInterval(function () {
    if (audioTracked) return;

    let isPlaying = false;
    if (window.audioEngine && window.audioEngine.isPlaying) {
      isPlaying = true;
    } else {
      const audios = document.querySelectorAll('audio');
      for (let i = 0; i < audios.length; i++) {
        if (!audios[i].paused) {
          isPlaying = true;
          break;
        }
      }
    }

    if (isPlaying) {
      audioPlayedSeconds += 2;
      if (audioPlayedSeconds >= 180 && !audioTracked) {
        audioTracked = true;
        const currentBook = window.audioEngine?.currentBook?.title || 'Không gian thiền';
        trackEvent('audio_ambient_played', {
          duration_seconds: 180,
          book_title: currentBook
        });
      }
    }
  }, 2000);

  // ==========================================
  // 4. SCROLL DEPTH 90% (ĐỌC SÂU NỘI DUNG)
  // ==========================================
  let scroll90Tracked = false;
  let scrollTimeout = null;

  function checkScrollDepth() {
    if (scroll90Tracked) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    const winHeight = window.innerHeight;

    if (docHeight <= winHeight) return;

    const scrollPercent = ((scrollTop + winHeight) / docHeight) * 100;

    if (scrollPercent >= 90) {
      scroll90Tracked = true;
      trackEvent('scroll_depth_90', {
        page_path: window.location.pathname,
        page_title: document.title
      });
      window.removeEventListener('scroll', handleScroll);
    }
  }

  function handleScroll() {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(checkScrollDepth, 150);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  console.log('[Sophia SEO & Retention Engine] Initialized successfully.');
})();
