/**
 * SOPHIA CODEX - MELODIC BACKGROUND MUSIC ENGINE (BGM)
 * Bộ tạo giai điệu âm nhạc thiền định thực thụ (Acoustic Harp, Zen Bell & Classical Strings)
 * Phát các nốt nhạc giai điệu (Melody Sequencer) thay vì chỉ phát tần số đơn thuần.
 */

class BGMEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.volume = 0.35; // Âm lượng nền êm dịu, không lấn át giọng đọc
    this.currentBookId = 'suy-tuong';
    this.stepTimer = null;
    this.currentNoteIndex = 0;

    // Bảng tần số các nốt nhạc chuẩn âm học (Hz) từ quãng trầm đến bổng
    this.NOTE_FREQS = {
      'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
      'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
      'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
      'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
    };

    // Kho giai điệu âm nhạc tương ứng với từng tác phẩm (Có nốt bè trầm Contrabass & Đàn mộc)
    this.soundscapes = {
      'suy-tuong': {
        name: 'Giai điệu Đàn Hạc Thư Phòng & Sa Trường',
        instrument: 'harp',
        tempo: 480, // ms mỗi nốt
        melody: [
          'E4', 'G4', 'B4', 'E5', 'D5', 'B4', 'G4', 'E4',
          'C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'C4',
          'D4', 'F#4', 'A4', 'D5', 'C5', 'A4', 'F#4', 'D4',
          'B3', 'D#4', 'F#4', 'B4', 'A4', 'F#4', 'D#4', 'B3'
        ],
        bassRoots: { 0: 'E2', 8: 'C2', 16: 'D2', 24: 'B1' }
      },
      'cong-hoa': {
        name: 'Giai điệu Đàn Lia Hy Lạp Cổ (Ancient Lyre)',
        instrument: 'lyre',
        tempo: 520,
        melody: [
          'D4', 'E4', 'F4', 'G4', 'A4', 'F4', 'E4', 'D4',
          'F4', 'A4', 'C5', 'D5', 'C5', 'A4', 'G4', 'E4',
          'A4', 'C5', 'B4', 'G4', 'F4', 'E4', 'F4', 'D4'
        ],
        bassRoots: { 0: 'D2', 8: 'F2', 16: 'A1' }
      },
      'dao-duc-kinh': {
        name: 'Giai điệu Sáo Trúc & Chuông Thiền Ngũ Cung',
        instrument: 'zen-flute',
        tempo: 540,
        melody: [
          'D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'C5', 'A4',
          'G4', 'F4', 'D4', 'C4', 'D4', 'F4', 'A4', 'G4',
          'D4', 'F4', 'G4', 'C5', 'A4', 'G4', 'F4', 'D4'
        ],
        bassRoots: { 0: 'D2', 8: 'G2', 16: 'A1' }
      },
      'zarathustra': {
        name: 'Giai điệu Vĩ Cầm Trầm Mặc Đỉnh Núi Tuyết',
        instrument: 'strings',
        tempo: 460,
        melody: [
          'G3', 'Bb3', 'D4', 'G4', 'F4', 'D4', 'Bb3', 'G3',
          'Eb3', 'G3', 'Bb3', 'Eb4', 'D4', 'Bb3', 'G3', 'Eb3',
          'F3', 'A3', 'C4', 'F4', 'Eb4', 'C4', 'A3', 'F3',
          'D3', 'F#3', 'A3', 'D4', 'C4', 'A3', 'F#3', 'D3'
        ],
        bassRoots: { 0: 'G1', 8: 'Eb2', 16: 'F2', 24: 'D2' }
      },
      'ban-ve-tu-do': {
        name: 'Giai điệu Thính Phòng Cổ Điển Oxford',
        instrument: 'piano',
        tempo: 490,
        melody: [
          'C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'C4',
          'A3', 'C4', 'E4', 'A4', 'G4', 'E4', 'C4', 'A3',
          'F3', 'A3', 'C4', 'F4', 'E4', 'C4', 'A3', 'F3',
          'G3', 'B3', 'D4', 'G4', 'F4', 'D4', 'B3', 'G3'
        ],
        bassRoots: { 0: 'C2', 8: 'A1', 16: 'F1', 24: 'G1' }
      }
    };
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setBook(bookId) {
    this.currentBookId = bookId;
    const config = this.soundscapes[bookId] || this.soundscapes['suy-tuong'];

    // Cập nhật tên nhạc nền trên toàn bộ UI
    document.querySelectorAll('.bgm-current-title').forEach(el => {
      el.textContent = config.name;
    });

    if (this.isPlaying) {
      this.stopMelodyLoop();
      this.currentNoteIndex = 0;
      this.startMelodyLoop();
    }
  }

  toggle(bookId = null) {
    if (bookId) this.currentBookId = bookId;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(this.currentBookId);
    }
  }

  play(bookId = null) {
    if (bookId) this.currentBookId = bookId;
    this.initAudioContext();
    this.isPlaying = true;
    this.currentNoteIndex = 0;

    this.startMelodyLoop();
    this.updateUI(true);
  }

  pause() {
    this.isPlaying = false;
    this.stopMelodyLoop();
    this.updateUI(false);
  }

  stop() {
    this.pause();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    const volInputs = document.querySelectorAll('#reader-bgm-volume, #dock-bgm-slider');
    volInputs.forEach(input => {
      if (input && Math.abs(parseFloat(input.value) - this.volume) > 0.01) {
        input.value = this.volume;
      }
    });
  }

  startMelodyLoop() {
    this.stopMelodyLoop();
    const config = this.soundscapes[this.currentBookId] || this.soundscapes['suy-tuong'];
    const melody = config.melody;
    const tempo = config.tempo;

    const tick = () => {
      if (!this.isPlaying) return;

      // 1. Kích hoạt nốt bè trầm Contrabass/Cello tạo chiều sâu âm nhạc
      if (config.bassRoots && config.bassRoots[this.currentNoteIndex]) {
        const bassNote = config.bassRoots[this.currentNoteIndex];
        const bassFreq = this.NOTE_FREQS[bassNote];
        if (bassFreq) this.playWarmBassNote(bassFreq);
      }

      // 2. Kích hoạt nốt giai điệu chính
      const noteName = melody[this.currentNoteIndex];
      const freq = this.NOTE_FREQS[noteName] || 440;
      
      this.pluckAcousticNote(freq, config.instrument);

      this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
      this.stepTimer = setTimeout(tick, tempo);
    };

    tick();
  }

  stopMelodyLoop() {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
  }

  /**
   * Phát nốt bè trầm sâu lắng (Contrabass / Cello root note) tạo không gian đa âm hưởng thiền định
   */
  playWarmBassNote(frequency) {
    if (!this.audioCtx || this.volume <= 0.01) return;
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, t);

    const bassVol = this.volume * 0.22;
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.linearRampToValueAtTime(bassVol, t + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(t);
    osc.stop(t + 3.3);
  }

  /**
   * Phát một nốt nhạc giai điệu với âm sắc mộc (Plucked String / Harp / Piano resonance)
   */
  pluckAcousticNote(frequency, instrument = 'harp') {
    if (!this.audioCtx || this.volume <= 0.01) return;

    const t = this.audioCtx.currentTime;
    
    // Tạo 2 Dao động âm thanh tạo độ dày của dây đàn mộc
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Cấu hình âm sắc nhạc cụ
    if (instrument === 'zen-flute') {
      osc1.type = 'sine';
      osc2.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 2.2, t);
    } else if (instrument === 'strings') {
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 1.8, t);
    } else {
      // Harp / Piano gảy mộc
      osc1.type = 'triangle';
      osc2.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 2.8, t);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.2, t + 0.6);
    }

    osc1.frequency.setValueAtTime(frequency, t);
    osc2.frequency.setValueAtTime(frequency * 1.002, t); // Micro-detune tạo độ ấm tự nhiên

    // Đường bao biên độ âm lượng ADSR (Attack - Decay - Sustain - Release)
    const effectiveVolume = this.volume * 0.18; // Âm lượng êm ái
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(effectiveVolume, t + 0.02); // Attack 20ms
    gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.35, t + 0.25); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 1.6); // Long release

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.65);
    osc2.stop(t + 1.65);
  }

  updateUI(playing) {
    document.querySelectorAll('.bgm-toggle-btn').forEach(btn => {
      if (playing) {
        btn.classList.add('bg-amber-500', 'text-stone-950', 'ring-2', 'ring-amber-400');
        btn.classList.remove('text-amber-800', 'text-amber-300');
      } else {
        btn.classList.remove('bg-amber-500', 'text-stone-950', 'ring-2', 'ring-amber-400');
        if (btn.id === 'reader-bgm-toggle') {
          btn.classList.add('text-amber-800');
        } else {
          btn.classList.add('text-amber-300');
        }
      }
    });

    document.querySelectorAll('.bgm-status-text').forEach(el => {
      el.textContent = playing ? 'Đang phát' : 'Đã tắt';
    });
  }
}

// Khởi tạo toàn cục BGM Engine
window.bgmEngine = new BGMEngine();
