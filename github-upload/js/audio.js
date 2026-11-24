(function (root) {
  'use strict';

  let audioCtx = null;
  let activeAudio = null;
  let activeBtn = null;
  let activeTimer = null;
  let speechSeq = 0;

  function getPrefs() {
    if (root.WordyStore && typeof root.WordyStore.getState === 'function') {
      return root.WordyStore.getState().prefs || {};
    }
    return { sound: true, haptic: true, speechRate: 0.92, accent: 'en-US' };
  }

  function clearActiveSpeech() {
    if (activeTimer) {
      clearTimeout(activeTimer);
      activeTimer = null;
    }
    if (activeBtn) {
      activeBtn.classList.remove('speaking');
      activeBtn = null;
    }
    if (activeAudio) {
      try {
        activeAudio.pause();
        activeAudio.src = '';
      } catch {}
      activeAudio = null;
    }
    if (typeof root.speechSynthesis !== 'undefined' && typeof root.speechSynthesis.cancel === 'function') {
      try {
        root.speechSynthesis.cancel();
      } catch {}
    }
  }

  function pickVoice(accent) {
    if (typeof root.speechSynthesis === 'undefined') return null;
    const voices = root.speechSynthesis.getVoices ? root.speechSynthesis.getVoices() : [];
    if (!voices || voices.length === 0) return null;
    const exact = voices.find((v) => v.lang && v.lang.toLowerCase() === accent.toLowerCase());
    if (exact) return exact;
    const prefix = accent.split('-')[0].toLowerCase();
    return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix)) || null;
  }

  function playGoogleTTSFallback(text, accent, onDone) {
    if (typeof root.Audio === 'undefined' || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      onDone();
      return;
    }
    try {
      const lang = accent === 'en-GB' ? 'en-GB' : 'en';
      const clipped = text.slice(0, 200);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(clipped)}`;
      const audio = new root.Audio(url);
      activeAudio = audio;
      audio.onended = onDone;
      audio.onerror = onDone;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(onDone);
      }
    } catch {
      onDone();
    }
  }

  function ensureAudioContext() {
    const AudioCtx = root.AudioContext || root.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  const WordyAudio = {
    stop() {
      speechSeq += 1;
      clearActiveSpeech();
    },

    speak(text, options = {}) {
      const clean = typeof text === 'string' ? text.trim() : '';
      if (!clean) return;
      if (typeof document !== 'undefined' && document.hidden) return;

      const prefs = getPrefs();
      if (prefs.sound === false) {
        this.stop();
        return;
      }

      speechSeq += 1;
      const seq = speechSeq;
      clearActiveSpeech();

      const btnEl = options.btnEl || null;
      const rate = typeof options.rate === 'number' && Number.isFinite(options.rate)
        ? Math.min(1.5, Math.max(0.5, options.rate))
        : (prefs.speechRate || 0.92);
      const accent = options.accent === 'en-GB' || options.accent === 'en-US'
        ? options.accent
        : (prefs.accent || 'en-US');

      if (btnEl) {
        activeBtn = btnEl;
        btnEl.classList.add('speaking');
      }

      let finished = false;
      const cleanup = () => {
        if (finished || seq !== speechSeq) return;
        finished = true;
        if (activeTimer) {
          clearTimeout(activeTimer);
          activeTimer = null;
        }
        if (activeBtn) {
          activeBtn.classList.remove('speaking');
          activeBtn = null;
        }
        if (activeAudio) {
          try {
            activeAudio.pause();
            activeAudio.src = '';
          } catch {}
          activeAudio = null;
        }
      };

      const maxWait = Math.min(12000, Math.max(2500, clean.length * 140));
      activeTimer = setTimeout(cleanup, maxWait);

      const hasSpeech = typeof root.speechSynthesis !== 'undefined' && typeof root.SpeechSynthesisUtterance !== 'undefined';
      if (hasSpeech) {
        try {
          const utter = new root.SpeechSynthesisUtterance(clean);
          utter.lang = accent;
          utter.rate = rate;
          const voice = pickVoice(accent);
          if (voice) utter.voice = voice;

          utter.onend = cleanup;
          utter.onerror = (ev) => {
            if (finished || seq !== speechSeq) return;
            const errCode = ev && ev.error ? String(ev.error) : '';
            if (errCode === 'canceled' || errCode === 'interrupted') {
              cleanup();
              return;
            }
            if ((typeof document !== 'undefined' && document.hidden) || getPrefs().sound === false) {
              cleanup();
              return;
            }
            playGoogleTTSFallback(clean, accent, cleanup);
          };
          root.speechSynthesis.speak(utter);
          return;
        } catch {
          // Fall through to Google TTS fallback
        }
      }

      playGoogleTTSFallback(clean, accent, cleanup);
    },

    playTone(type) {
      const prefs = getPrefs();
      if (prefs.sound === false) return;
      try {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'correct') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.09);
          gain.gain.setValueAtTime(0.11, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.24);
        } else if (type === 'mastered') {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const t = now + idx * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.23);
          });
        } else if (type === 'wrong') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
          gain.gain.setValueAtTime(0.11, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.19);
        }
      } catch {}
    },

    haptic(type) {
      const prefs = getPrefs();
      if (prefs.haptic === false) return;
      if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
      try {
        if (type === 'light') navigator.vibrate(12);
        else if (type === 'success') navigator.vibrate([15, 35, 20]);
        else if (type === 'error') navigator.vibrate([35, 30, 35]);
      } catch {}
    }
  };

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) WordyAudio.stop();
    });
  }
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('pagehide', () => WordyAudio.stop());
  }

  root.WordyAudio = WordyAudio;
})(typeof window !== 'undefined' ? window : globalThis);
