(function (root) {
  'use strict';

  const CONFETTI_COLORS = ['#1B4332', '#2D6A4F', '#4ADE80', '#89CFF0', '#1E7FB3', '#A7D7B8'];

  let toastTimer = null;
  let toastEl = null;

  function prefersReducedMotion() {
    return Boolean(
      root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function getOriginCoords(originEl) {
    const w = root.innerWidth || 1;
    const h = root.innerHeight || 1;
    if (originEl && typeof originEl.getBoundingClientRect === 'function') {
      const rect = originEl.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        return {
          x: Math.min(0.95, Math.max(0.05, (rect.left + rect.width / 2) / w)),
          y: Math.min(0.95, Math.max(0.05, (rect.top + rect.height / 2) / h))
        };
      }
    }
    return { x: 0.5, y: 0.55 };
  }

  function runCanvasBurst({ count, origin, spread, speed }) {
    if (typeof document === 'undefined' || !document.body) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    canvas.width = root.innerWidth || 390;
    canvas.height = root.innerHeight || 844;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }

    const palette = CONFETTI_COLORS;
    const cx = canvas.width * origin.x;
    const cy = canvas.height * origin.y;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * spread;
      const vel = speed * (0.45 + Math.random() * 0.75);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        size: 5 + Math.random() * 4,
        color: palette[i % palette.length],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1
      });
    }

    let frame = 0;
    const maxFrames = count > 30 ? 95 : 52;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.36;
        p.vx *= 0.985;
        p.rot += p.vRot;
        if (frame > maxFrames * 0.45) p.alpha -= 0.03;
        if (p.alpha > 0 && p.y < canvas.height + 24) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
          ctx.restore();
        }
      }
      frame++;
      if (alive && frame < maxFrames && typeof root.requestAnimationFrame === 'function') {
        root.requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    };

    if (typeof root.requestAnimationFrame === 'function') {
      root.requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  function ensureToastElement() {
    if (typeof document === 'undefined' || !document.body) return null;
    if (toastEl && document.body.contains(toastEl)) return toastEl;
    const existing = document.getElementById('wordy-toast');
    if (existing) {
      toastEl = existing;
      return toastEl;
    }
    const el = document.createElement('div');
    el.id = 'wordy-toast';
    el.className = 'wordy-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
    toastEl = el;
    return el;
  }

  const WordyEffects = {
    microBurst(originEl) {
      if (prefersReducedMotion()) return;
      const origin = getOriginCoords(originEl);
      if (typeof root.confetti === 'function') {
        root.confetti({
          particleCount: 18,
          spread: 52,
          startVelocity: 26,
          scalar: 0.78,
          ticks: 90,
          gravity: 1.15,
          colors: CONFETTI_COLORS,
          origin,
          disableForReducedMotion: true,
          zIndex: 9999
        });
        return;
      }
      runCanvasBurst({ count: 18, origin, spread: Math.PI * 0.7, speed: 9 });
    },

    celebrateFull() {
      if (prefersReducedMotion()) return;
      if (typeof root.confetti === 'function') {
        root.confetti({
          particleCount: 75,
          spread: 85,
          startVelocity: 42,
          colors: CONFETTI_COLORS,
          origin: { x: 0.5, y: 0.58 },
          disableForReducedMotion: true,
          zIndex: 9999
        });
        setTimeout(() => {
          if (prefersReducedMotion() || typeof root.confetti !== 'function') return;
          root.confetti({
            particleCount: 38,
            angle: 60,
            spread: 60,
            colors: CONFETTI_COLORS,
            origin: { x: 0.08, y: 0.65 },
            disableForReducedMotion: true,
            zIndex: 9999
          });
          root.confetti({
            particleCount: 38,
            angle: 120,
            spread: 60,
            colors: CONFETTI_COLORS,
            origin: { x: 0.92, y: 0.65 },
            disableForReducedMotion: true,
            zIndex: 9999
          });
        }, 140);
        return;
      }
      runCanvasBurst({ count: 85, origin: { x: 0.5, y: 0.58 }, spread: Math.PI * 1.1, speed: 15 });
    },

    showToast(message, options = {}) {
      const el = ensureToastElement();
      if (!el) return;

      if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
      }

      const {
        actionLabel = '',
        onAction = null,
        duration = 5000,
        tone = 'neutral'
      } = options;

      el.textContent = '';
      el.dataset.tone = tone;

      const msgSpan = document.createElement('span');
      msgSpan.className = 'wordy-toast-message';
      msgSpan.textContent = String(message || '');
      el.appendChild(msgSpan);

      if (actionLabel && typeof onAction === 'function') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wordy-toast-action';
        btn.textContent = String(actionLabel);
        btn.addEventListener('click', () => {
          this.hideToast();
          onAction();
        });
        el.appendChild(btn);
      }

      el.classList.add('is-visible');

      if (duration > 0) {
        toastTimer = setTimeout(() => {
          this.hideToast();
        }, duration);
      }
    },

    hideToast() {
      if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
      }
      if (toastEl) {
        toastEl.classList.remove('is-visible');
      }
    }
  };

  root.WordyEffects = WordyEffects;
})(typeof window !== 'undefined' ? window : globalThis);
