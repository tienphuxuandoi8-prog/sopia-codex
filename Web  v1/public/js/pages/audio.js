/**
 * SOPHIA CODEX - AUDIO ENGINE (Dual Studio Voice & Deep Scholar TTS)
 * Tích hợp 2 chế độ:
 * 1. Chế độ Giọng Thu Âm Studio (Studio Podcast Audio) - Trầm ấm, truyền cảm, có chiều sâu không gian
 * 2. Chế độ Giọng Đọc AI (TTS) có bộ lọc Equalizer trầm ấm (Warm Bass Equalizer)
 */

class AudioEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    
    // Chế độ phát: 'tts' (Giọng đọc học giả AI trầm mặc) hoặc 'studio' (Phòng thu podcast)
    this.playbackMode = 'tts';

    // Studio Audio Element
    this.studioAudio = new Audio();
    this.studioAudio.preload = 'auto';

    // Thông số giọng AI trầm mặc
    this.pitch = 0.82; // Cao độ trầm ấm, trang nghiêm
    this.playbackRate = 0.86; // Nhịp điệu khoan thai, truyền cảm
    this.voiceVolume = 1.0;

    this.currentBook = null;
    this.currentChapter = null;
    this.currentParagraphIndex = 0;
    this.paragraphs = [];
    this.selectedVoice = null;
    this.availableVoices = [];

    this.initVoices();
    this.initStudioEvents();
    this.initUI();
  }

  initVoices() {
    const loadVoices = () => {
      this.availableVoices = this.synth.getVoices();
      
      const viVoices = this.availableVoices.filter(v => 
        v.lang.toLowerCase().includes('vi') || 
        v.name.toLowerCase().includes('vietnam')
      );

      if (viVoices.length > 0) {
        const maleOrNatural = viVoices.find(v => 
          v.name.toLowerCase().includes('nam') || 
          v.name.toLowerCase().includes('an') || 
          v.name.toLowerCase().includes('natural')
        );
        this.selectedVoice = maleOrNatural || viVoices[0];
      } else {
        this.selectedVoice = this.availableVoices[0];
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  initStudioEvents() {
    this.studioAudio.addEventListener('timeupdate', () => {
      if (!this.studioAudio.duration) return;
      const percent = (this.studioAudio.currentTime / this.studioAudio.duration) * 100;
      if (this.progressBar) this.progressBar.style.width = `${percent}%`;
      
      const curMin = Math.floor(this.studioAudio.currentTime / 60);
      const curSec = Math.floor(this.studioAudio.currentTime % 60).toString().padStart(2, '0');
      const totalMin = Math.floor(this.studioAudio.duration / 60);
      const totalSec = Math.floor(this.studioAudio.duration % 60).toString().padStart(2, '0');

      if (this.timeCurrentEl) this.timeCurrentEl.textContent = `${curMin}:${curSec}`;
      if (this.timeTotalEl) this.timeTotalEl.textContent = `${totalMin}:${totalSec}`;

      // Mô phỏng chuyển câu/đoạn đồng bộ theo thời gian
      const totalParas = this.paragraphs.length || 1;
      const calculatedIndex = Math.min(totalParas - 1, Math.floor((this.studioAudio.currentTime / this.studioAudio.duration) * totalParas));
      if (calculatedIndex !== this.currentParagraphIndex) {
        this.currentParagraphIndex = calculatedIndex;
        this.highlightReaderParagraph(this.currentParagraphIndex);
      }
    });

    this.studioAudio.addEventListener('ended', () => {
      this.stop();
    });

    this.studioAudio.addEventListener('error', () => {
      console.warn("Studio audio stream fallback to AI Voice engine.");
      this.playbackMode = 'tts';
      this.playCurrentParagraph();
    });
  }

  initUI() {
    this.playerDock = document.getElementById('audio-player-dock');
    this.playBtn = document.getElementById('audio-play-btn');
    this.playIcon = document.getElementById('audio-play-icon');
    this.bookTitleEl = document.getElementById('audio-book-title');
    this.chapterTitleEl = document.getElementById('audio-chapter-title');
    this.progressBar = document.getElementById('audio-progress-bar');
    this.timeCurrentEl = document.getElementById('audio-time-current');
    this.timeTotalEl = document.getElementById('audio-time-total');
    this.speedBtn = document.getElementById('audio-speed-btn');
    this.equalizer = document.getElementById('audio-equalizer');
    this.modeSelector = document.getElementById('audio-mode-selector');

    this.playBtn?.addEventListener('click', () => this.togglePlay());
    document.getElementById('audio-prev-btn')?.addEventListener('click', () => this.seek(-15));
    document.getElementById('audio-next-btn')?.addEventListener('click', () => this.seek(15));
    this.speedBtn?.addEventListener('click', () => this.cycleSpeed());

    // Switcher chế độ: Studio Podcast vs AI Voice
    this.modeSelector?.addEventListener('change', (e) => {
      this.playbackMode = e.target.value;
      if (this.isPlaying) {
        this.pause();
        this.togglePlay();
      }
    });

    // BGM toggle trên Player Dock
    document.getElementById('dock-bgm-toggle')?.addEventListener('click', () => {
      if (window.bgmEngine) {
        window.bgmEngine.toggle(this.currentBook ? this.currentBook.id : 'suy-tuong');
      }
    });

    // Volume BGM slider
    document.getElementById('dock-bgm-slider')?.addEventListener('input', (e) => {
      if (window.bgmEngine) {
        window.bgmEngine.setVolume(parseFloat(e.target.value));
      }
    });

    // Close dock
    document.getElementById('audio-close-btn')?.addEventListener('click', () => {
      this.stop();
      if (window.bgmEngine) window.bgmEngine.pause();
      this.playerDock?.classList.add('translate-y-full', 'opacity-0');
    });
  }

  loadChapter(book, chapterIndex = 0, autoShow = false) {
    this.stop();
    this.currentBook = book;
    this.currentChapter = (book && book.chapters) ? book.chapters[chapterIndex] : null;
    this.paragraphs = (this.currentChapter && this.currentChapter.paragraphs) ? this.currentChapter.paragraphs : [];
    this.currentParagraphIndex = 0;

    if (this.bookTitleEl && book) this.bookTitleEl.textContent = book.title;
    if (this.chapterTitleEl && this.currentChapter) {
      this.currentChapter.number = this.currentChapter.number || this.currentChapter.chapter_number || 'Chương';
      this.chapterTitleEl.textContent = `${this.currentChapter.number}: ${this.currentChapter.title}`;
    }
    
    // Nạp source âm thanh phòng thu nếu có
    const audioSrc = book?.studioAudioUrl || book?.studio_audio_url;
    if (audioSrc) {
      this.studioAudio.src = audioSrc;
    }

    if (window.bgmEngine && book) {
      window.bgmEngine.setBook(book.id);
    }

    if (autoShow) {
      this.showPlayer();
    }
  }

  showPlayer() {
    if (this.playerDock) {
      this.playerDock.classList.remove('translate-y-full', 'opacity-0', 'pointer-events-none');
      this.playerDock.classList.add('translate-y-0', 'opacity-100');
    }
  }

  togglePlay() {
    if (!this.currentBook) {
      const firstBook = PHILOSOPHY_DATA.books[0];
      this.loadChapter(firstBook, 0, true);
    }

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.showPlayer();
    this.isPlaying = true;
    this.isPaused = false;
    this.updatePlayStateUI(true);

    // Kích hoạt BGM hòa âm nhẹ nhàng
    if (window.bgmEngine && !window.bgmEngine.isPlaying) {
      window.bgmEngine.play(this.currentBook ? this.currentBook.id : 'suy-tuong');
    }

    if (this.playbackMode === 'studio' && this.studioAudio.src) {
      this.studioAudio.playbackRate = this.playbackRate;
      this.studioAudio.play().catch(() => {
        // Fallback sang TTS giọng trầm nếu file audio bị chặn
        this.playbackMode = 'tts';
        this.playCurrentParagraph();
      });
    } else {
      this.playCurrentParagraph();
    }
  }

  pause() {
    this.isPlaying = false;
    this.isPaused = true;
    this.studioAudio.pause();
    if (this.synth) this.synth.cancel();
    this.updatePlayStateUI(false);
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.studioAudio.pause();
    this.studioAudio.currentTime = 0;
    if (this.synth) this.synth.cancel();
    if (this.utterance) {
      this.utterance.onstart = null;
      this.utterance.onend = null;
      this.utterance.onerror = null;
      this.utterance = null;
    }
    this.updatePlayStateUI(false);
    this.clearHighlight();
  }

  seek(seconds) {
    if (this.playbackMode === 'studio') {
      this.studioAudio.currentTime = Math.max(0, Math.min(this.studioAudio.duration || 0, this.studioAudio.currentTime + seconds));
    } else {
      this.currentParagraphIndex = Math.max(0, Math.min(this.paragraphs.length - 1, this.currentParagraphIndex + (seconds > 0 ? 1 : -1)));
      if (this.isPlaying) this.playCurrentParagraph();
    }
  }

  /**
   * Tối ưu hóa ngữ điệu trầm mặc, tự nhiên cho bộ đọc TTS
   */
  prepareTextForSpeech(text) {
    return text
      .replace(/^[\d]+\.\s*/, '') // Xóa số thứ tự đầu câu
      .replace(/^—\s*/, '')
      .replace(/\s*—\s*/g, ', ')
      .replace(/:\s*/g, '... ')
      .replace(/\.\s*/g, '.... ')
      .replace(/\?\s*/g, '?.... ');
  }

  playCurrentParagraph() {
    if (!this.synth) return;
    this.synth.cancel();
    if (this.utterance) {
      this.utterance.onstart = null;
      this.utterance.onend = null;
      this.utterance.onerror = null;
      this.utterance = null;
    }

    if (this.currentParagraphIndex >= this.paragraphs.length) {
      this.stop();
      return;
    }

    const rawText = this.paragraphs[this.currentParagraphIndex];
    const textToRead = this.prepareTextForSpeech(rawText);

    this.utterance = new SpeechSynthesisUtterance(textToRead);
    this.utterance.lang = 'vi-VN';
    if (this.selectedVoice) this.utterance.voice = this.selectedVoice;
    
    // Tinh chỉnh âm trầm sâu lắng (Deep Contemplative Bass)
    this.utterance.rate = this.playbackRate;
    this.utterance.pitch = this.pitch;
    this.utterance.volume = this.voiceVolume;

    this.highlightReaderParagraph(this.currentParagraphIndex);

    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.updatePlayStateUI(true);
    };

    this.utterance.onend = () => {
      if (this.utterance) {
        this.utterance.onstart = null;
        this.utterance.onend = null;
        this.utterance.onerror = null;
        this.utterance = null;
      }
      this.currentParagraphIndex++;
      if (this.currentParagraphIndex < this.paragraphs.length && this.isPlaying) {
        setTimeout(() => {
          if (this.isPlaying) this.playCurrentParagraph();
        }, 500); // Khoảng lặng trầm tư 500ms
      } else {
        this.stop();
      }
    };

    this.utterance.onerror = () => {
      if (this.utterance) {
        this.utterance.onstart = null;
        this.utterance.onend = null;
        this.utterance.onerror = null;
        this.utterance = null;
      }
      this.stop();
    };

    this.synth.speak(this.utterance);
  }

  readSpecificText(text) {
    this.stop();
    this.showPlayer();
    if (this.chapterTitleEl) this.chapterTitleEl.textContent = "Đang đọc trích đoạn được chọn...";
    
    const formatted = this.prepareTextForSpeech(text);
    this.utterance = new SpeechSynthesisUtterance(formatted);
    this.utterance.lang = 'vi-VN';
    if (this.selectedVoice) this.utterance.voice = this.selectedVoice;
    this.utterance.rate = this.playbackRate;
    this.utterance.pitch = this.pitch;
    
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.updatePlayStateUI(true);
    };
    this.utterance.onend = () => {
      this.stop();
    };

    this.synth.speak(this.utterance);
  }

  cycleSpeed() {
    const speeds = [0.86, 1.0, 1.2, 0.75];
    const currentIndex = speeds.indexOf(this.playbackRate);
    this.playbackRate = speeds[(currentIndex + 1) % speeds.length];
    
    if (this.speedBtn) {
      this.speedBtn.textContent = `${this.playbackRate}x`;
    }

    if (this.playbackMode === 'studio') {
      this.studioAudio.playbackRate = this.playbackRate;
    } else if (this.isPlaying) {
      this.playCurrentParagraph();
    }
  }

  updatePlayStateUI(playing) {
    // 1. Cập nhật nút Play/Pause trên Bottom Player Dock
    if (this.playBtn) {
      if (playing) {
        this.playBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"></rect>
            <rect x="14" y="4" width="4" height="16" rx="1"></rect>
          </svg>
        `;
        this.playBtn.title = "Tạm dừng đọc (Space)";
        this.playBtn.classList.add('ring-4', 'ring-amber-400/50', 'scale-105');
      } else {
        this.playBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
        this.playBtn.title = "Bắt đầu nghe đọc (Space)";
        this.playBtn.classList.remove('ring-4', 'ring-amber-400/50', 'scale-105');
      }
    }

    // 2. Cập nhật nút Giọng Đọc trên Thanh công cụ Reader
    const readerAudioBtn = document.getElementById('reader-audio-btn');
    if (readerAudioBtn) {
      if (playing) {
        readerAudioBtn.innerHTML = `
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
          <span>Tạm Dừng Đọc</span>
        `;
        readerAudioBtn.className = "p-2 px-3 rounded-xl bg-amber-500 text-stone-950 font-bold transition-all flex items-center gap-2 text-xs shadow-md ring-2 ring-amber-400/60";
      } else {
        readerAudioBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
          <span class="hidden sm:inline">Nghe Giọng Đọc</span>
        `;
        readerAudioBtn.className = "p-2 px-3 rounded-xl bg-emerald-950 text-amber-300 border border-amber-500/40 hover:bg-emerald-900 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm";
      }
    }

    // 3. Hiệu ứng sóng nhạc Equalizer
    if (this.equalizer) {
      if (playing) {
        this.equalizer.classList.remove('audio-paused');
      } else {
        this.equalizer.classList.add('audio-paused');
      }
    }
  }

  highlightReaderParagraph(index) {
    this.clearHighlight();
    const pElements = document.querySelectorAll('#reader-body p');
    if (pElements[index]) {
      pElements[index].classList.add('speaking-sentence');
      pElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  clearHighlight() {
    document.querySelectorAll('.speaking-sentence').forEach(el => el.classList.remove('speaking-sentence'));
  }
}

// Khởi tạo instance AudioEngine toàn cục
window.audioEngine = new AudioEngine();
