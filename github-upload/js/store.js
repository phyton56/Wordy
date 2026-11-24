(function (root) {
  'use strict';

  const STORAGE_KEY = 'wordy_state_v3';
  const VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const VALID_LEVEL_SET = new Set(VALID_LEVELS);
  const VALID_PALETTES = ['forest', 'plum', 'ocean', 'crimson', 'olive', 'rose', 'cobalt'];
  const VALID_PALETTE_SET = new Set(VALID_PALETTES);
  const VALID_RING_COLORS = ['theme', 'blue', 'pink', 'red', 'green', 'purple', 'yellow'];
  const VALID_RING_COLOR_SET = new Set(VALID_RING_COLORS);
  const DEFAULT_LEVELS = ['B2', 'C1', 'C2'];
  const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const MAX_IMPORT_ITEMS = 5000;
  const MAX_WORD_LEN = 80;
  const MAX_TR_LEN = 240;
  const MAX_SENTENCE_LEN = 500;

  const LEGACY_KEYS = {
    poolV2: 'wordy_pool_v2',
    poolV1: 'wordy_pool',
    statsV1: 'wordy_stats_v1',
    prefsV1: 'wordy_prefs_v1',
    themeV1: 'wordy_theme_v1',
    themeV0: 'wordy_theme',
    levelsV1: 'wordy_selected_levels_v1'
  };

  function getStorage() {
    try {
      return root.localStorage || null;
    } catch {
      return null;
    }
  }

  function safeParse(raw) {
    if (typeof raw !== 'string' || !raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function clampInt(val, min, max, fallback) {
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function clampNumber(val, min, max, fallback) {
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function isDateLike(val) {
    return Boolean(val && typeof val.getFullYear === 'function' && typeof val.getTime === 'function' && !Number.isNaN(val.getTime()));
  }

  function formatLocalDate(date) {
    const d = isDateLike(date) ? date : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getYesterdayDate(date) {
    const d = isDateLike(date) ? new Date(date.getTime()) : new Date();
    d.setDate(d.getDate() - 1);
    return formatLocalDate(d);
  }

  function createDefaultState() {
    return {
      version: 3,
      pool: [],
      stats: { lastDate: '', todayCount: 0, streak: 0, dailyGoal: 20, history: {} },
      prefs: {
        sound: true,
        haptic: true,
        theme: 'light',
        palette: 'forest',
        goalRingColor: 'theme',
        speechRate: 0.92,
        accent: 'en-US'
      },
      selectedLevels: [...DEFAULT_LEVELS],
      reviewStepCounter: 0,
      scheduledRepeats: []
    };
  }

  function sanitizeHistory(rawHistory, fallbackGoal) {
    const out = {};
    if (!rawHistory || typeof rawHistory !== 'object' || Array.isArray(rawHistory)) return out;
    for (const [dateKey, val] of Object.entries(rawHistory)) {
      if (!DATE_KEY_RE.test(dateKey) || !val || typeof val !== 'object') continue;
      const count = clampInt(val.count, 0, 100000, 0);
      const goal = clampInt(val.goal, 1, 500, fallbackGoal);
      out[dateKey] = { count, goal };
    }
    return out;
  }

  function seedHistoryFromStats(stats) {
    if (!stats.history || typeof stats.history !== 'object') stats.history = {};
    if (stats.lastDate && DATE_KEY_RE.test(stats.lastDate) && stats.todayCount > 0 && !stats.history[stats.lastDate]) {
      stats.history[stats.lastDate] = { count: stats.todayCount, goal: stats.dailyGoal || 20 };
      return true;
    }
    return false;
  }

  function normalizePoolEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const word = typeof raw.word === 'string' ? raw.word.trim() : '';
    const trSource = typeof raw.tr === 'string' ? raw.tr : (typeof raw.meaning === 'string' ? raw.meaning : '');
    const tr = trSource.trim();
    if (!word || !tr) return null;

    const sentence = typeof raw.sentence === 'string' ? raw.sentence.trim().slice(0, MAX_SENTENCE_LEN) : '';
    const levelRaw = typeof raw.level === 'string' ? raw.level.trim().toUpperCase() : 'B2';
    const level = VALID_LEVEL_SET.has(levelRaw) ? levelRaw : 'B2';
    const score = clampInt(raw.score, 1, 5, 1);
    const wrongCount = clampInt(raw.wrongCount, 0, 100000, 0);
    const lastReviewedAt = typeof raw.lastReviewedAt === 'number' && Number.isFinite(raw.lastReviewedAt) ? raw.lastReviewedAt : null;
    const nextReviewAt = typeof raw.nextReviewAt === 'number' && Number.isFinite(raw.nextReviewAt) ? raw.nextReviewAt : null;
    const custom = Boolean(raw.custom);

    return {
      word: word.slice(0, MAX_WORD_LEN),
      tr: tr.slice(0, MAX_TR_LEN),
      sentence,
      level,
      score,
      wrongCount,
      lastReviewedAt,
      nextReviewAt,
      custom
    };
  }

  function mergePools(primaryList, secondaryList) {
    const map = new Map();
    const ingest = (list, preferText) => {
      if (!Array.isArray(list)) return;
      for (const raw of list) {
        const entry = normalizePoolEntry(raw);
        if (!entry) continue;
        const key = entry.word.toLowerCase();
        const existing = map.get(key);
        if (!existing) {
          map.set(key, entry);
        } else {
          existing.score = Math.max(existing.score, entry.score);
          existing.wrongCount = Math.max(existing.wrongCount, entry.wrongCount);
          if (entry.lastReviewedAt && (!existing.lastReviewedAt || entry.lastReviewedAt > existing.lastReviewedAt)) {
            existing.lastReviewedAt = entry.lastReviewedAt;
          }
          if (entry.nextReviewAt && (!existing.nextReviewAt || entry.nextReviewAt < existing.nextReviewAt)) {
            existing.nextReviewAt = entry.nextReviewAt;
          }
          existing.custom = existing.custom || entry.custom;
          if (preferText) {
            if (entry.tr) existing.tr = entry.tr;
            if (entry.sentence) existing.sentence = entry.sentence;
            if (VALID_LEVEL_SET.has(entry.level)) existing.level = entry.level;
          } else {
            if (!existing.sentence && entry.sentence) existing.sentence = entry.sentence;
          }
        }
      }
    };
    ingest(primaryList, true);
    ingest(secondaryList, false);
    return Array.from(map.values());
  }

  function sanitizeLevels(levels) {
    if (!Array.isArray(levels)) return [...DEFAULT_LEVELS];
    const clean = [];
    for (const l of levels) {
      if (typeof l === 'string') {
        const up = l.trim().toUpperCase();
        if (VALID_LEVEL_SET.has(up) && !clean.includes(up)) clean.push(up);
      }
    }
    return clean.length > 0 ? clean : [...DEFAULT_LEVELS];
  }

  function sanitizeScheduledRepeats(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const word = typeof item.word === 'string'
        ? item.word.trim()
        : (item.wordObj && typeof item.wordObj.word === 'string' ? item.wordObj.word.trim() : '');
      const dueAtStep = clampInt(item.dueAtStep, 0, 10000000, -1);
      if (word && dueAtStep >= 0) out.push({ word, dueAtStep });
    }
    return out;
  }

  function normalizeState(raw) {
    const def = createDefaultState();
    if (!raw || typeof raw !== 'object') return def;

    const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
    const prefs = raw.prefs && typeof raw.prefs === 'object' ? raw.prefs : {};
    const dailyGoal = clampInt(stats.dailyGoal, 1, 500, 20);
    const normalizedStats = {
      lastDate: typeof stats.lastDate === 'string' ? stats.lastDate : '',
      todayCount: clampInt(stats.todayCount, 0, 100000, 0),
      streak: clampInt(stats.streak, 0, 100000, 0),
      dailyGoal,
      history: sanitizeHistory(stats.history, dailyGoal)
    };
    seedHistoryFromStats(normalizedStats);

    return {
      version: 3,
      pool: mergePools(raw.pool, []),
      stats: normalizedStats,
      prefs: {
        sound: typeof prefs.sound === 'boolean' ? prefs.sound : true,
        haptic: typeof prefs.haptic === 'boolean' ? prefs.haptic : true,
        theme: prefs.theme === 'dark' ? 'dark' : 'light',
        palette: VALID_PALETTE_SET.has(prefs.palette) ? prefs.palette : 'forest',
        goalRingColor: VALID_RING_COLOR_SET.has(prefs.goalRingColor) ? prefs.goalRingColor : 'theme',
        speechRate: clampNumber(prefs.speechRate, 0.5, 1.5, 0.92),
        accent: prefs.accent === 'en-GB' ? 'en-GB' : 'en-US'
      },
      selectedLevels: sanitizeLevels(raw.selectedLevels),
      reviewStepCounter: clampInt(raw.reviewStepCounter, 0, 10000000, 0),
      scheduledRepeats: sanitizeScheduledRepeats(raw.scheduledRepeats)
    };
  }

  function migrateFromLegacy(storage) {
    const state = createDefaultState();
    let foundLegacy = false;

    const rawPoolV2 = safeParse(storage.getItem(LEGACY_KEYS.poolV2));
    const rawPoolV1 = safeParse(storage.getItem(LEGACY_KEYS.poolV1));
    if (Array.isArray(rawPoolV2) || Array.isArray(rawPoolV1)) {
      foundLegacy = true;
      state.pool = mergePools(rawPoolV2, rawPoolV1);
    }

    const rawStats = safeParse(storage.getItem(LEGACY_KEYS.statsV1));
    if (rawStats && typeof rawStats === 'object') {
      foundLegacy = true;
      state.stats.lastDate = typeof rawStats.lastDate === 'string' ? rawStats.lastDate : '';
      state.stats.todayCount = clampInt(rawStats.todayCount, 0, 100000, 0);
      state.stats.streak = clampInt(rawStats.streak, 0, 100000, 0);
      seedHistoryFromStats(state.stats);
    }

    const rawPrefs = safeParse(storage.getItem(LEGACY_KEYS.prefsV1));
    if (rawPrefs && typeof rawPrefs === 'object') {
      foundLegacy = true;
      if (typeof rawPrefs.sound === 'boolean') state.prefs.sound = rawPrefs.sound;
      if (typeof rawPrefs.haptic === 'boolean') state.prefs.haptic = rawPrefs.haptic;
    }

    const legacyTheme = storage.getItem(LEGACY_KEYS.themeV1) || storage.getItem(LEGACY_KEYS.themeV0);
    if (legacyTheme === 'dark' || legacyTheme === 'light') {
      foundLegacy = true;
      state.prefs.theme = legacyTheme;
    }

    const rawLevels = safeParse(storage.getItem(LEGACY_KEYS.levelsV1));
    if (Array.isArray(rawLevels) && rawLevels.length > 0) {
      foundLegacy = true;
      state.selectedLevels = sanitizeLevels(rawLevels);
    }

    return { state, foundLegacy };
  }

  function applyDateRollover(stats, nowDate) {
    if (!stats.lastDate) return false;
    const today = formatLocalDate(nowDate);
    const yesterday = getYesterdayDate(nowDate);
    if (stats.lastDate !== today && stats.lastDate !== yesterday) {
      stats.streak = 0;
      stats.todayCount = 0;
      return true;
    }
    if (stats.lastDate !== today && stats.todayCount !== 0) {
      stats.todayCount = 0;
      return true;
    }
    return false;
  }

  let currentState = createDefaultState();

  const WordyStore = {
    STORAGE_KEY,
    VALID_LEVELS,
    VALID_PALETTES,
    VALID_RING_COLORS,
    formatLocalDate,

    load(nowDate) {
      const storage = getStorage();
      if (!storage) {
        currentState = createDefaultState();
        return currentState;
      }

      const existingRaw = storage.getItem(STORAGE_KEY);
      if (existingRaw) {
        const parsed = safeParse(existingRaw);
        const hadHistory = Boolean(parsed && parsed.stats && parsed.stats.history && typeof parsed.stats.history === 'object');
        currentState = normalizeState(parsed);
        const rolledOver = applyDateRollover(currentState.stats, nowDate);
        if (rolledOver || (!hadHistory && Object.keys(currentState.stats.history).length > 0)) {
          this.save();
        }
        return currentState;
      }

      const { state, foundLegacy } = migrateFromLegacy(storage);
      currentState = state;
      applyDateRollover(currentState.stats, nowDate);
      if (foundLegacy) {
        this.save();
      }
      return currentState;
    },

    save() {
      const storage = getStorage();
      if (!storage) return false;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        return true;
      } catch {
        return false;
      }
    },

    getState() {
      return currentState;
    },

    recordPractice(nowDate) {
      const today = formatLocalDate(nowDate);
      const yesterday = getYesterdayDate(nowDate);
      const stats = currentState.stats;

      if (stats.lastDate !== today) {
        stats.streak = stats.lastDate === yesterday ? (stats.streak || 0) + 1 : 1;
        stats.todayCount = 0;
        stats.lastDate = today;
      }
      const prevCount = stats.todayCount || 0;
      stats.todayCount = prevCount + 1;
      if (!stats.history || typeof stats.history !== 'object') stats.history = {};
      stats.history[today] = { count: stats.todayCount, goal: stats.dailyGoal || 20 };
      const goalJustReached = prevCount < stats.dailyGoal && stats.todayCount >= stats.dailyGoal;
      this.save();
      return { stats: { ...stats, history: { ...stats.history } }, goalJustReached };
    },

    setDailyGoal(n) {
      const goal = clampInt(n, 1, 500, currentState.stats.dailyGoal);
      currentState.stats.dailyGoal = goal;
      const today = formatLocalDate();
      if (currentState.stats.history && currentState.stats.history[today]) {
        currentState.stats.history[today] = {
          count: currentState.stats.history[today].count,
          goal
        };
      }
      this.save();
      return goal;
    },

    upsertWord(entry) {
      const normalized = normalizePoolEntry(entry);
      if (!normalized) return null;
      const key = normalized.word.toLowerCase();
      const idx = currentState.pool.findIndex((w) => w.word.toLowerCase() === key);
      if (idx >= 0) {
        currentState.pool[idx] = { ...currentState.pool[idx], ...normalized };
        this.save();
        return currentState.pool[idx];
      }
      currentState.pool.unshift(normalized);
      this.save();
      return normalized;
    },

    removeWord(word) {
      if (typeof word !== 'string' || !word.trim()) return null;
      const key = word.trim().toLowerCase();
      const index = currentState.pool.findIndex((w) => w.word.toLowerCase() === key);
      if (index < 0) return null;
      const [item] = currentState.pool.splice(index, 1);
      currentState.scheduledRepeats = currentState.scheduledRepeats.filter(
        (r) => r.word.toLowerCase() !== key
      );
      this.save();
      return { item, index };
    },

    restoreWord(item, index) {
      const normalized = normalizePoolEntry(item);
      if (!normalized) return false;
      const key = normalized.word.toLowerCase();
      if (currentState.pool.some((w) => w.word.toLowerCase() === key)) return false;
      const pos = clampInt(index, 0, currentState.pool.length, 0);
      currentState.pool.splice(pos, 0, normalized);
      this.save();
      return true;
    },

    resetPool() {
      currentState.pool = [];
      currentState.scheduledRepeats = [];
      currentState.reviewStepCounter = 0;
      this.save();
    },

    updatePrefs(partial) {
      if (!partial || typeof partial !== 'object') return { ...currentState.prefs };
      const p = currentState.prefs;
      if (typeof partial.sound === 'boolean') p.sound = partial.sound;
      if (typeof partial.haptic === 'boolean') p.haptic = partial.haptic;
      if (partial.theme === 'dark' || partial.theme === 'light') p.theme = partial.theme;
      if (VALID_PALETTE_SET.has(partial.palette)) p.palette = partial.palette;
      if (VALID_RING_COLOR_SET.has(partial.goalRingColor)) p.goalRingColor = partial.goalRingColor;
      if (partial.speechRate !== undefined) p.speechRate = clampNumber(partial.speechRate, 0.5, 1.5, p.speechRate);
      if (partial.accent === 'en-US' || partial.accent === 'en-GB') p.accent = partial.accent;
      this.save();
      return { ...p };
    },

    setSelectedLevels(levels) {
      currentState.selectedLevels = sanitizeLevels(levels);
      this.save();
      return [...currentState.selectedLevels];
    },

    exportJSON() {
      return JSON.stringify(
        {
          app: 'wordy',
          version: 3,
          exportedAt: new Date().toISOString(),
          pool: currentState.pool,
          stats: currentState.stats,
          prefs: currentState.prefs,
          selectedLevels: currentState.selectedLevels
        },
        null,
        2
      );
    },

    importJSON(rawString, mode = 'merge') {
      if (mode !== 'merge' && mode !== 'replace') {
        return { ok: false, error: 'Geçersiz içe aktarma modu.' };
      }
      if (typeof rawString !== 'string' || !rawString.trim()) {
        return { ok: false, error: 'Seçtiğin dosya boş.' };
      }
      if (rawString.length > 5_000_000) {
        return { ok: false, error: 'Yedek dosyası çok büyük (en fazla 5 MB).' };
      }

      let parsed;
      try {
        parsed = JSON.parse(rawString);
      } catch {
        return { ok: false, error: 'Geçersiz JSON dosyası. Wordy yedeği seçtiğinden emin ol.' };
      }

      const rawList = Array.isArray(parsed)
        ? parsed
        : (parsed && typeof parsed === 'object' && Array.isArray(parsed.pool) ? parsed.pool : null);

      if (!rawList) {
        return { ok: false, error: 'Yedek dosyasında kelime listesi bulunamadı.' };
      }
      if (rawList.length > MAX_IMPORT_ITEMS) {
        return { ok: false, error: `En fazla ${MAX_IMPORT_ITEMS} kelime içe aktarılabilir.` };
      }

      const validated = [];
      const seen = new Set();

      for (let i = 0; i < rawList.length; i++) {
        const item = rawList[i];
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return { ok: false, error: `${i + 1}. satırdaki kelime kaydı geçersiz.` };
        }
        const word = typeof item.word === 'string' ? item.word.trim() : '';
        const trRaw = typeof item.tr === 'string' ? item.tr : (typeof item.meaning === 'string' ? item.meaning : '');
        const tr = trRaw.trim();

        if (!word || word.length > MAX_WORD_LEN) {
          return { ok: false, error: `${i + 1}. kayıtta geçersiz kelime alanı (1-${MAX_WORD_LEN} karakter olmalı).` };
        }
        if (!tr || tr.length > MAX_TR_LEN) {
          return { ok: false, error: `${i + 1}. kayıtta ("${word}") geçersiz Türkçe anlam alanı.` };
        }
        if (item.sentence !== undefined && typeof item.sentence !== 'string') {
          return { ok: false, error: `${i + 1}. kayıtta ("${word}") örnek cümle metin olmalı.` };
        }
        const sentence = typeof item.sentence === 'string' ? item.sentence.trim() : '';
        if (sentence.length > MAX_SENTENCE_LEN) {
          return { ok: false, error: `${i + 1}. kayıtta ("${word}") örnek cümle çok uzun (en fazla ${MAX_SENTENCE_LEN} karakter).` };
        }
        const level = typeof item.level === 'string' ? item.level.trim().toUpperCase() : '';
        if (!VALID_LEVEL_SET.has(level)) {
          return { ok: false, error: `${i + 1}. kayıtta ("${word}") geçersiz seviye: "${item.level}".` };
        }
        if (item.score !== undefined && (!Number.isFinite(Number(item.score)))) {
          return { ok: false, error: `${i + 1}. kayıtta ("${word}") geçersiz puan değeri.` };
        }

        const key = word.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        validated.push({
          word,
          tr,
          sentence,
          level,
          score: clampInt(item.score, 1, 5, 1),
          wrongCount: clampInt(item.wrongCount, 0, 100000, 0),
          lastReviewedAt: typeof item.lastReviewedAt === 'number' && Number.isFinite(item.lastReviewedAt) ? item.lastReviewedAt : null,
          nextReviewAt: typeof item.nextReviewAt === 'number' && Number.isFinite(item.nextReviewAt) ? item.nextReviewAt : null,
          custom: Boolean(item.custom)
        });
      }

      let added = 0;
      let updated = 0;

      if (mode === 'replace') {
        currentState.pool = validated;
        currentState.scheduledRepeats = [];
        added = validated.length;
        if (parsed && typeof parsed === 'object' && parsed.prefs && typeof parsed.prefs === 'object') {
          if (VALID_PALETTE_SET.has(parsed.prefs.palette)) currentState.prefs.palette = parsed.prefs.palette;
          if (VALID_RING_COLOR_SET.has(parsed.prefs.goalRingColor)) currentState.prefs.goalRingColor = parsed.prefs.goalRingColor;
        }
      } else {
        const existingMap = new Map(currentState.pool.map((w, idx) => [w.word.toLowerCase(), idx]));
        for (const entry of validated) {
          const key = entry.word.toLowerCase();
          if (existingMap.has(key)) {
            const idx = existingMap.get(key);
            const prev = currentState.pool[idx];
            currentState.pool[idx] = {
              ...prev,
              ...entry,
              score: Math.max(prev.score, entry.score),
              wrongCount: Math.max(prev.wrongCount || 0, entry.wrongCount)
            };
            updated++;
          } else {
            currentState.pool.push(entry);
            existingMap.set(key, currentState.pool.length - 1);
            added++;
          }
        }
      }

      this.save();
      return { ok: true, added, updated, total: currentState.pool.length };
    }
  };

  root.WordyStore = WordyStore;
})(typeof window !== 'undefined' ? window : globalThis);
