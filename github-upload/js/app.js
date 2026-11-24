(function (root) {
  'use strict';

  const DICT = Array.isArray(root.WORDY_DICTIONARY) ? root.WORDY_DICTIONARY : [];
  const Store = root.WordyStore;
  const SRS = root.WordySRS;
  const Audio = root.WordyAudio;
  const Effects = root.WordyEffects;
  const Modes = root.WordyModes;
  const Pool = root.WordyPool;

  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const RING_CIRCUMFERENCE = 2 * Math.PI * 18;
  const CAL_HERO_CIRCUMFERENCE = 2 * Math.PI * 23;
  const CAL_DAY_CIRCUMFERENCE = 2 * Math.PI * 15;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const PALETTE_THEME_COLORS = {
    forest: { light: '#1B4332', dark: '#0E1612' },
    plum: { light: '#4C1D6E', dark: '#140D1C' },
    ocean: { light: '#173A5E', dark: '#0C1420' },
    crimson: { light: '#6E1D2A', dark: '#180E11' },
    olive: { light: '#364422', dark: '#12160D' },
    rose: { light: '#831843', dark: '#190D18' },
    cobalt: { light: '#102A5C', dark: '#091122' }
  };

  const RING_COLOR_LABELS = {
    theme: 'Tema',
    blue: 'Mavi',
    pink: 'Pembe',
    red: 'Kırmızı',
    green: 'Yeşil',
    purple: 'Mor',
    yellow: 'Sarı'
  };

  const MONTH_NAMES_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const uiState = {
    activeModal: null,
    lastTriggerEl: null,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    calSelectedDate: ''
  };

  function $(id) {
    return document.getElementById(id);
  }

  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildHighlightedSentence(container, sentence, targetWord) {
    container.textContent = '';
    const cleanSentence = String(sentence || '').trim();
    if (!cleanSentence) return;
    const cleanTarget = String(targetWord || '').trim();
    if (!cleanTarget) {
      container.textContent = cleanSentence;
      return;
    }

    const regex = new RegExp(`(\\b${escapeRegExp(cleanTarget)}\\w*)`, 'ig');
    let lastIdx = 0;
    let match;
    while ((match = regex.exec(cleanSentence)) !== null) {
      if (match.index > lastIdx) {
        container.appendChild(document.createTextNode(cleanSentence.slice(lastIdx, match.index)));
      }
      const mark = document.createElement('mark');
      mark.textContent = match[0];
      container.appendChild(mark);
      lastIdx = regex.lastIndex;
    }
    if (lastIdx < cleanSentence.length) {
      container.appendChild(document.createTextNode(cleanSentence.slice(lastIdx)));
    }
  }

  function createMasteryTray(score) {
    const clamped = Math.max(0, Math.min(5, Number(score) || 0));
    const state = clamped >= 5 ? 'mastered' : (clamped <= 1 ? 'weak' : 'learning');

    const tray = document.createElement('div');
    tray.className = 'mastery-tray';
    tray.dataset.score = String(clamped);
    tray.dataset.state = state;
    tray.setAttribute('aria-label', `Kelime ilerlemesi: ${clamped} / 5`);

    const slots = document.createElement('div');
    slots.className = 'mastery-slots';
    slots.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= 5; i++) {
      const slot = document.createElement('span');
      slot.className = i <= clamped ? 'mastery-slot is-filled' : 'mastery-slot';
      slots.appendChild(slot);
    }

    const readout = document.createElement('span');
    readout.className = 'mastery-readout';

    if (state === 'mastered') {
      readout.innerHTML = '<svg class="mastery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (state === 'weak') {
      readout.innerHTML = '<svg class="mastery-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }

    const num = document.createElement('span');
    num.className = 'mono-num';
    num.textContent = `${clamped}/5`;
    readout.appendChild(num);

    tray.appendChild(slots);
    tray.appendChild(readout);
    return tray;
  }

  /* ==================== THEME, PALETTE, RING COLOR & PREFS ==================== */

  function syncMetaThemeColor() {
    const prefs = Store.getState().prefs;
    const isDark = prefs.theme === 'dark';
    const palette = PALETTE_THEME_COLORS[prefs.palette] ? prefs.palette : 'forest';
    const metaTheme = $('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', PALETTE_THEME_COLORS[palette][isDark ? 'dark' : 'light']);
    }
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('dark-theme', isDark);
    syncMetaThemeColor();

    document.querySelectorAll('.theme-icon-moon').forEach((el) => {
      el.toggleAttribute('hidden', isDark);
    });
    document.querySelectorAll('.theme-icon-sun').forEach((el) => {
      el.toggleAttribute('hidden', !isDark);
    });
    const themeToggleBtn = $('btn-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    }
    document.querySelectorAll('[data-bind="theme-label"]').forEach((el) => {
      el.textContent = isDark ? 'Koyu' : 'Açık';
    });
  }

  function applyPalette(palette) {
    const clean = PALETTE_THEME_COLORS[palette] ? palette : 'forest';
    document.documentElement.dataset.palette = clean;
    document.querySelectorAll('[data-palette-option]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.paletteOption === clean));
    });
    syncMetaThemeColor();
  }

  function applyRingColor(color) {
    const clean = RING_COLOR_LABELS[color] ? color : 'theme';
    document.documentElement.dataset.ringColor = clean;
    document.querySelectorAll('[data-ring-color-option]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.ringColorOption === clean));
    });
    const labelEl = $('cal-ring-color-name');
    if (labelEl) {
      labelEl.textContent = RING_COLOR_LABELS[clean];
    }
  }

  function toggleTheme() {
    const next = Store.getState().prefs.theme === 'dark' ? 'light' : 'dark';
    Store.updatePrefs({ theme: next });
    applyTheme(next);
    Audio.haptic('light');
  }

  function syncPrefsUI() {
    const prefs = Store.getState().prefs;
    document.querySelectorAll('[data-pref-toggle="sound"]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(Boolean(prefs.sound)));
    });
    document.querySelectorAll('[data-pref-toggle="haptic"]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(Boolean(prefs.haptic)));
    });
    document.querySelectorAll('[data-bind="sound-label"]').forEach((el) => {
      el.textContent = prefs.sound ? 'Açık' : 'Kapalı';
    });
    document.querySelectorAll('[data-bind="haptic-label"]').forEach((el) => {
      el.textContent = prefs.haptic ? 'Açık' : 'Kapalı';
    });
    applyPalette(prefs.palette);
    applyRingColor(prefs.goalRingColor);
  }

  function setSettingsPopover(open) {
    const popover = $('settings-popover');
    if (!popover) return;
    popover.classList.toggle('is-open', open);
    popover.setAttribute('aria-hidden', String(!open));
    document.querySelectorAll('[data-settings-toggle]').forEach((btn) => {
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ==================== DAILY GOAL CALENDAR MODAL ==================== */

  function formatDateKey(year, monthIdx, day) {
    const m = String(monthIdx + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function getHistoryEntryForDate(dateKey) {
    const { stats } = Store.getState();
    const todayKey = Store.formatLocalDate();
    if (dateKey === todayKey) {
      const fromHist = stats.history && stats.history[todayKey];
      const count = Math.max(stats.todayCount || 0, fromHist ? fromHist.count : 0);
      const goal = Math.max(1, stats.dailyGoal || 20);
      return count > 0 ? { count, goal } : null;
    }
    if (stats.history && stats.history[dateKey] && stats.history[dateKey].count > 0) {
      return {
        count: stats.history[dateKey].count,
        goal: Math.max(1, stats.history[dateKey].goal || stats.dailyGoal || 20)
      };
    }
    return null;
  }

  function updateCalendarDayDetail(dateKey) {
    const detailEl = $('cal-day-detail');
    if (!detailEl || !dateKey) return;
    const parts = dateKey.split('-');
    const dayNum = Number(parts[2]);
    const monthName = MONTH_NAMES_TR[Number(parts[1]) - 1] || '';
    const entry = getHistoryEntryForDate(dateKey);

    if (entry && entry.count > 0) {
      const pct = Math.min(100, Math.round((entry.count / entry.goal) * 100));
      detailEl.textContent = `${dayNum} ${monthName} · ${entry.count} / ${entry.goal} kelime (%${pct})`;
    } else {
      detailEl.textContent = `${dayNum} ${monthName} · Çalışma kaydı yok`;
    }
  }

  function createDayRingSvg(ratio) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'cal-day-svg');
    svg.setAttribute('viewBox', '0 0 36 36');
    svg.setAttribute('aria-hidden', 'true');

    const track = document.createElementNS(SVG_NS, 'circle');
    track.setAttribute('class', 'cal-day-track');
    track.setAttribute('cx', '18');
    track.setAttribute('cy', '18');
    track.setAttribute('r', '15');

    const prog = document.createElementNS(SVG_NS, 'circle');
    prog.setAttribute('class', 'cal-day-progress');
    prog.setAttribute('cx', '18');
    prog.setAttribute('cy', '18');
    prog.setAttribute('r', '15');
    prog.setAttribute('stroke-dasharray', CAL_DAY_CIRCUMFERENCE.toFixed(1));
    const clamped = Math.max(0, Math.min(1, ratio));
    const offset = CAL_DAY_CIRCUMFERENCE * (1 - clamped);
    prog.setAttribute('stroke-dashoffset', offset.toFixed(1));

    svg.appendChild(track);
    svg.appendChild(prog);
    return svg;
  }

  function renderCalendar() {
    const grid = $('cal-grid');
    const monthLabel = $('cal-month-label');
    if (!grid || !monthLabel) return;

    const { stats } = Store.getState();
    const todayKey = Store.formatLocalDate();
    const goal = Math.max(1, stats.dailyGoal || 20);
    const todayCount = stats.todayCount || 0;
    const todayRatio = Math.min(1, todayCount / goal);
    const todayPct = Math.round(todayRatio * 100);

    const heroRing = $('cal-today-ring');
    if (heroRing) {
      heroRing.setAttribute('stroke-dasharray', CAL_HERO_CIRCUMFERENCE.toFixed(1));
      heroRing.setAttribute('stroke-dashoffset', (CAL_HERO_CIRCUMFERENCE * (1 - todayRatio)).toFixed(1));
    }
    const heroPct = $('cal-today-pct');
    if (heroPct) heroPct.textContent = `${todayPct}%`;

    const heroStatus = $('cal-today-status');
    if (heroStatus) {
      if (todayCount >= goal) heroStatus.textContent = 'Bugünkü hedef tamamlandı';
      else if (todayCount > 0) heroStatus.textContent = `Hedefe ${goal - todayCount} kelime kaldı`;
      else heroStatus.textContent = 'Bugün çalışmaya başla';
    }

    const year = uiState.calYear;
    const month = uiState.calMonth;
    monthLabel.textContent = `${MONTH_NAMES_TR[month]} ${year}`;

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    if (!uiState.calSelectedDate || !uiState.calSelectedDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)) {
      uiState.calSelectedDate = todayKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)
        ? todayKey
        : formatDateKey(year, month, 1);
    }

    grid.textContent = '';

    for (let s = 0; s < firstWeekday; s++) {
      const spacer = document.createElement('span');
      spacer.className = 'cal-day-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      grid.appendChild(spacer);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const entry = getHistoryEntryForDate(dateKey);
      const ratio = entry ? Math.min(1, entry.count / entry.goal) : 0;
      const isComplete = Boolean(entry && entry.count >= entry.goal);
      const isPartial = Boolean(entry && entry.count > 0 && entry.count < entry.goal);
      const isToday = dateKey === todayKey;
      const isFuture = dateKey > todayKey;
      const isSelected = dateKey === uiState.calSelectedDate;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day-btn';
      btn.dataset.date = dateKey;
      btn.setAttribute('aria-pressed', String(isSelected));
      if (isToday) btn.classList.add('is-today');
      if (isFuture) btn.classList.add('is-future');
      if (isComplete) btn.classList.add('is-complete');
      else if (isPartial) btn.classList.add('is-partial');
      if (isSelected) btn.classList.add('is-selected');

      const pct = Math.round(ratio * 100);
      const ariaInfo = entry ? `${entry.count} / ${entry.goal} kelime (%${pct})` : 'çalışma kaydı yok';
      btn.setAttribute('aria-label', `${day} ${MONTH_NAMES_TR[month]} ${year}, ${ariaInfo}`);

      btn.appendChild(createDayRingSvg(ratio));

      const numSpan = document.createElement('span');
      numSpan.className = 'cal-day-num mono-num';
      numSpan.textContent = String(day);
      btn.appendChild(numSpan);

      btn.addEventListener('click', () => {
        uiState.calSelectedDate = dateKey;
        grid.querySelectorAll('.cal-day-btn').forEach((b) => {
          const active = b.dataset.date === dateKey;
          b.classList.toggle('is-selected', active);
          b.setAttribute('aria-pressed', String(active));
        });
        updateCalendarDayDetail(dateKey);
        Audio.haptic('light');
      });

      grid.appendChild(btn);
    }

    updateCalendarDayDetail(uiState.calSelectedDate);
  }

  function openCalendarModal(triggerEl) {
    const now = new Date();
    uiState.calYear = now.getFullYear();
    uiState.calMonth = now.getMonth();
    uiState.calSelectedDate = Store.formatLocalDate(now);
    renderCalendar();
    openModal('modal-calendar', triggerEl);
  }

  /* ==================== DASHBOARD SYNC ==================== */

  function syncDashboard() {
    const state = Store.getState();
    const { pool, stats, selectedLevels } = state;

    const weakCount = SRS ? SRS.getWeakWords().length : pool.filter((w) => w.score < 5).length;
    const masteredCount = pool.filter((w) => w.score >= 5).length;
    const goal = Math.max(1, stats.dailyGoal || 20);
    const todayCount = stats.todayCount || 0;
    const ratio = Math.min(1, todayCount / goal);
    const pct = Math.round(ratio * 100);
    const offset = RING_CIRCUMFERENCE * (1 - ratio);

    document.querySelectorAll('[data-bind="today-count"]').forEach((el) => {
      el.textContent = String(todayCount);
    });
    document.querySelectorAll('[data-bind="daily-goal"]').forEach((el) => {
      el.textContent = String(goal);
    });
    document.querySelectorAll('[data-bind="goal-pct"]').forEach((el) => {
      el.textContent = `${pct}%`;
    });
    document.querySelectorAll('[data-bind="goal-ring"]').forEach((circle) => {
      circle.setAttribute('stroke-dasharray', RING_CIRCUMFERENCE.toFixed(1));
      circle.setAttribute('stroke-dashoffset', offset.toFixed(1));
      circle.classList.toggle('is-complete', todayCount >= goal);
    });
    document.querySelectorAll('[data-goal-option]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.goalOption) === goal));
    });
    document.querySelectorAll('[data-bind="streak-count"]').forEach((el) => {
      el.textContent = String(stats.streak || 0);
    });
    document.querySelectorAll('[data-bind="pool-count"]').forEach((el) => {
      el.textContent = String(pool.length);
    });
    document.querySelectorAll('[data-bind="weak-count"]').forEach((el) => {
      el.textContent = String(weakCount);
    });
    document.querySelectorAll('[data-bind="weak-label"]').forEach((el) => {
      el.textContent = weakCount > 0 ? `${weakCount} tekrar` : `${DICT.length} kelime`;
    });
    document.querySelectorAll('[data-bind="mastered-count"]').forEach((el) => {
      el.textContent = String(masteredCount);
    });
    document.querySelectorAll('[data-bind="dict-total"]').forEach((el) => {
      el.textContent = String(DICT.length);
    });

    const mobileWeakChip = $('hero-weak-chip');
    if (mobileWeakChip) {
      mobileWeakChip.disabled = weakCount === 0;
    }
    const heroWeakQuick = $('btn-hero-weak-quick');
    if (heroWeakQuick) {
      heroWeakQuick.hidden = weakCount === 0;
    }

    const heroLevels = $('hero-selected-levels');
    if (heroLevels) {
      heroLevels.textContent = '';
      selectedLevels.forEach((lvl) => {
        const chip = document.createElement('span');
        chip.className = 'cefr-chip';
        chip.textContent = lvl;
        heroLevels.appendChild(chip);
      });
    }

    if (Modes && typeof Modes.syncWeakButtons === 'function') {
      Modes.syncWeakButtons();
    }
  }

  /* ==================== MODAL LIFECYCLE ==================== */

  function openModal(modalId, triggerEl) {
    setSettingsPopover(false);
    if (uiState.activeModal && uiState.activeModal !== modalId) {
      closeModal(uiState.activeModal, true, true);
    }
    const modal = $(modalId);
    if (!modal) return;

    uiState.activeModal = modalId;
    uiState.lastTriggerEl = triggerEl || document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const firstFocusable = modal.querySelector('button:not([hidden]), input:not([hidden]), select:not([hidden])');
    if (firstFocusable) {
      requestAnimationFrame(() => firstFocusable.focus());
    }
  }

  function closeModal(modalId, skipFocusRestore, forceClose) {
    const id = modalId || uiState.activeModal;
    if (!id) return;

    if (!forceClose && Modes && Modes.handleBackOrEscape(id)) {
      return;
    }

    if (Audio && typeof Audio.stop === 'function') Audio.stop();

    const modal = $(id);
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    if (uiState.activeModal === id) {
      uiState.activeModal = null;
      document.body.classList.remove('modal-open');
      if (!skipFocusRestore && uiState.lastTriggerEl && typeof uiState.lastTriggerEl.focus === 'function') {
        uiState.lastTriggerEl.focus();
      }
      uiState.lastTriggerEl = null;
    }
    syncDashboard();
  }

  function openWeakReview(triggerEl) {
    if (!SRS || SRS.getWeakWords().length === 0) {
      Effects.showToast('Tekrar gereken kelime yok.', { duration: 2400 });
      return;
    }
    renderReviewLevels();
    openModal('modal-review', triggerEl);
    Modes.startReviewSession({ weakOnly: true });
  }

  /* ==================== REVIEW LEVEL SELECTOR ==================== */

  function renderReviewLevels() {
    const grid = $('review-level-grid');
    const mixBtn = $('btn-level-mix');
    if (!grid) return;

    const selected = new Set(Store.getState().selectedLevels);
    grid.textContent = '';

    LEVELS.forEach((lvl) => {
      const count = DICT.filter((w) => w.level === lvl).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'level-btn';
      btn.dataset.level = lvl;
      btn.setAttribute('aria-pressed', String(selected.has(lvl)));

      const code = document.createElement('span');
      code.className = 'level-btn-code';
      code.textContent = lvl;

      const num = document.createElement('span');
      num.className = 'level-btn-count';
      num.textContent = `${count} kelime`;

      btn.appendChild(code);
      btn.appendChild(num);
      btn.addEventListener('click', () => {
        const cur = new Set(Store.getState().selectedLevels);
        if (cur.has(lvl)) {
          if (cur.size > 1) cur.delete(lvl);
        } else {
          cur.add(lvl);
        }
        Store.setSelectedLevels(Array.from(cur));
        Audio.haptic('light');
        renderReviewLevels();
        syncDashboard();
      });

      grid.appendChild(btn);
    });

    if (mixBtn) {
      const allSelected = LEVELS.every((l) => selected.has(l));
      mixBtn.setAttribute('aria-pressed', String(allSelected));
    }
  }

  /* ==================== GLOBAL KEYBOARD ==================== */

  function handleGlobalKeydown(e) {
    if (e.key === 'Escape') {
      const popover = $('settings-popover');
      if (popover && popover.classList.contains('is-open')) {
        setSettingsPopover(false);
        return;
      }
      if (uiState.activeModal === 'modal-pool' && Pool && Pool.isEditing()) {
        Pool.cancelEditing();
        return;
      }
      if (uiState.activeModal) {
        closeModal(uiState.activeModal);
      }
      return;
    }

    if (uiState.activeModal && Modes) {
      Modes.handleKeydown(e, uiState.activeModal);
    }
  }

  /* ==================== EVENT BINDING & BOOT ==================== */

  function getPhoneLinkInfo() {
    const loc = root.location;
    const protocol = (loc.protocol || '').toLowerCase();
    const hostname = (loc.hostname || '').toLowerCase();
    const isLocalOnly =
      protocol === 'file:' ||
      !hostname ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]';
    const shareable = !isLocalOnly && (protocol === 'https:' || protocol === 'http:');
    const url = shareable ? `${loc.origin}${loc.pathname}` : '';
    return { shareable, url };
  }

  function syncPhoneLinkUI() {
    const { shareable, url } = getPhoneLinkInfo();
    document.querySelectorAll('[data-phone-shareable]').forEach((el) => {
      el.hidden = !shareable;
    });
    document.querySelectorAll('[data-phone-local-only]').forEach((el) => {
      el.hidden = shareable;
    });
    const linkInput = $('phone-link-input');
    if (linkInput) linkInput.value = url;
    const railUrlEl = $('rail-phone-url');
    if (railUrlEl) railUrlEl.textContent = url;
    return { shareable, url };
  }

  async function copyTextSafe(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.className = 'sr-only';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand && document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('copy-failed');
  }

  function bindEvents() {
    const themeToggleBtn = $('btn-theme-toggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    // Unified Settings popover (mobile + desktop top-right trigger)
    document.querySelectorAll('[data-settings-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const popover = $('settings-popover');
        const isOpen = Boolean(popover && popover.classList.contains('is-open'));
        setSettingsPopover(!isOpen);
      });
    });

    // Grouped Theme Color Combos inside Settings popover
    document.querySelectorAll('[data-palette-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextPalette = btn.dataset.paletteOption;
        Store.updatePrefs({ palette: nextPalette });
        applyPalette(nextPalette);
        Audio.haptic('light');
      });
    });

    // Daily Goal Calendar Modal triggers & controls
    document.querySelectorAll('[data-action="open-calendar"]').forEach((btn) => {
      btn.addEventListener('click', (e) => openCalendarModal(e.currentTarget));
    });

    const calPrevBtn = $('btn-cal-prev');
    if (calPrevBtn) {
      calPrevBtn.addEventListener('click', () => {
        uiState.calMonth -= 1;
        if (uiState.calMonth < 0) {
          uiState.calMonth = 11;
          uiState.calYear -= 1;
        }
        renderCalendar();
        Audio.haptic('light');
      });
    }

    const calNextBtn = $('btn-cal-next');
    if (calNextBtn) {
      calNextBtn.addEventListener('click', () => {
        uiState.calMonth += 1;
        if (uiState.calMonth > 11) {
          uiState.calMonth = 0;
          uiState.calYear += 1;
        }
        renderCalendar();
        Audio.haptic('light');
      });
    }

    document.querySelectorAll('[data-goal-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextGoal = Number(btn.dataset.goalOption);
        Store.setDailyGoal(nextGoal);
        syncDashboard();
        renderCalendar();
        Audio.haptic('light');
        Effects.showToast(`Günlük hedef ${nextGoal} kelime yapıldı.`, { duration: 2200 });
      });
    });

    document.querySelectorAll('[data-ring-color-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextColor = btn.dataset.ringColorOption;
        Store.updatePrefs({ goalRingColor: nextColor });
        applyRingColor(nextColor);
        Audio.haptic('light');
      });
    });

    // Outside click closes Settings popover
    document.addEventListener('click', (e) => {
      const popover = $('settings-popover');
      const clickedSettingsBtn = e.target && e.target.closest && e.target.closest('[data-settings-toggle]');
      if (popover && popover.classList.contains('is-open') && !popover.contains(e.target) && !clickedSettingsBtn) {
        setSettingsPopover(false);
      }
    });

    // Sound / Haptic toggles
    document.querySelectorAll('[data-pref-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.prefToggle;
        const cur = Boolean(Store.getState().prefs[key]);
        Store.updatePrefs({ [key]: !cur });
        if (key === 'sound' && cur && Audio && typeof Audio.stop === 'function') {
          Audio.stop();
        }
        syncPrefsUI();
        Audio.haptic('light');
      });
    });

    // Smart Phone Link collapsible bars
    syncPhoneLinkUI();

    $('btn-phone-bar').addEventListener('click', () => {
      const panel = $('phone-bar-panel');
      const open = !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', open);
      $('btn-phone-bar').setAttribute('aria-expanded', String(open));
    });

    const railPhoneBtn = document.querySelector('[data-action="toggle-rail-phone"]');
    if (railPhoneBtn) {
      railPhoneBtn.addEventListener('click', () => {
        const panel = $('rail-phone-panel');
        const open = !panel.classList.contains('is-open');
        panel.classList.toggle('is-open', open);
        railPhoneBtn.setAttribute('aria-expanded', String(open));
      });
    }

    document.querySelectorAll('[data-action="copy-app-link"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const { shareable, url } = getPhoneLinkInfo();
        if (!shareable || !url) {
          Effects.showToast('Bu bağlantı yalnızca bu bilgisayarda açılır.', { duration: 2600 });
          return;
        }
        try {
          await copyTextSafe(url);
          Audio.haptic('light');
          Effects.showToast('Bağlantı kopyalandı.', { duration: 2400 });
        } catch {
          Effects.showToast('Kopyalanamadı. Adresi tarayıcı çubuğundan kopyalayabilirsin.', { duration: 2800 });
        }
      });
    });

    // Open Modals
    $('btn-open-review').addEventListener('click', (e) => {
      renderReviewLevels();
      Modes.showReviewSetup();
      openModal('modal-review', e.currentTarget);
    });

    document.querySelectorAll('[data-action="open-weak-review"]').forEach((btn) => {
      btn.addEventListener('click', (e) => openWeakReview(e.currentTarget));
    });

    $('btn-open-pool').addEventListener('click', (e) => {
      Pool.open();
      openModal('modal-pool', e.currentTarget);
    });

    $('btn-open-activities').addEventListener('click', (e) => {
      Modes.showActivitiesMenu();
      openModal('modal-activities', e.currentTarget);
    });

    // Close modals
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop.id);
      });
    });

    // Review level mix
    $('btn-level-mix').addEventListener('click', () => {
      Store.setSelectedLevels([...LEVELS]);
      Audio.haptic('light');
      renderReviewLevels();
      syncDashboard();
    });

    // Empty activities -> go to review
    $('btn-act-go-review').addEventListener('click', () => {
      renderReviewLevels();
      Modes.showReviewSetup();
      openModal('modal-review');
    });

    document.addEventListener('keydown', handleGlobalKeydown);
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  function init() {
    Store.load();
    applyTheme(Store.getState().prefs.theme);
    syncPrefsUI();

    Modes.init({
      onDashboardSync: syncDashboard,
      onCloseModal: (modalId) => closeModal(modalId, false, true),
      onOpenWeakReview: () => openWeakReview(),
      highlightWord: buildHighlightedSentence,
      createMasteryTray
    });

    Pool.init({
      onChange: syncDashboard,
      highlightWord: buildHighlightedSentence,
      createMasteryTray
    });

    syncDashboard();
    bindEvents();
    registerServiceWorker();

    // Handle manifest shortcuts (?open=review / ?open=pool)
    const params = new URLSearchParams(root.location.search);
    const openTarget = params.get('open');
    if (openTarget === 'review') {
      renderReviewLevels();
      Modes.showReviewSetup();
      openModal('modal-review');
    } else if (openTarget === 'pool') {
      Pool.open();
      openModal('modal-pool');
    }
  }

  root.WordyApp = {
    openModal,
    closeModal,
    openWeakReview,
    refreshUI: () => {
      syncPrefsUI();
      syncDashboard();
    },
    renderMasteryTray: createMasteryTray,
    highlightWordInSentence: buildHighlightedSentence
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
