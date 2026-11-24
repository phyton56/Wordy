(function (root) {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;

  function getStore() {
    return root.WordyStore;
  }

  function getDict() {
    return Array.isArray(root.WORDY_DICTIONARY) ? root.WORDY_DICTIONARY : [];
  }

  function normalizeKey(word) {
    return String(word || '').trim().toLowerCase();
  }

  function findPoolEntry(word) {
    const store = getStore();
    if (!store) return null;
    const key = normalizeKey(word);
    if (!key) return null;
    return store.getState().pool.find((w) => w.word.toLowerCase() === key) || null;
  }

  function findDictEntry(word) {
    const key = normalizeKey(word);
    if (!key) return null;
    return getDict().find((w) => w.word.toLowerCase() === key) || null;
  }

  function sortWeakEntries(list) {
    return list.slice().sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      const wrongDiff = (b.wrongCount || 0) - (a.wrongCount || 0);
      if (wrongDiff !== 0) return wrongDiff;
      const aNext = typeof a.nextReviewAt === 'number' ? a.nextReviewAt : Number.MAX_SAFE_INTEGER;
      const bNext = typeof b.nextReviewAt === 'number' ? b.nextReviewAt : Number.MAX_SAFE_INTEGER;
      if (aNext !== bNext) return aNext - bNext;
      return a.word.localeCompare(b.word);
    });
  }

  function getWeakWords(selectedLevels) {
    const store = getStore();
    if (!store) return [];
    const pool = store.getState().pool;
    const levelSet = Array.isArray(selectedLevels) && selectedLevels.length > 0
      ? new Set(selectedLevels)
      : null;

    const weak = pool.filter((w) => w.score < 5 && (!levelSet || levelSet.has(w.level)));
    return sortWeakEntries(weak);
  }

  function getNextWord(options = {}) {
    const store = getStore();
    const dict = getDict();
    if (!store) return { done: true, reason: 'no-store' };

    const state = store.getState();
    const selectedLevels = Array.isArray(options.selectedLevels) && options.selectedLevels.length > 0
      ? options.selectedLevels
      : state.selectedLevels;
    const levelSet = new Set(selectedLevels);
    const weakOnly = Boolean(options.weakOnly);
    const lastKey = normalizeKey(options.lastWord);
    const now = typeof options.now === 'number' ? options.now : Date.now();
    const upcomingStep = (state.reviewStepCounter || 0) + 1;

    // 1. Due persistent scheduled repeats (+2 / +13)
    if (Array.isArray(state.scheduledRepeats) && state.scheduledRepeats.length > 0) {
      let dirty = false;
      for (let i = 0; i < state.scheduledRepeats.length; i++) {
        const item = state.scheduledRepeats[i];
        const itemKey = normalizeKey(item.word);
        const poolEntry = findPoolEntry(item.word);

        if (poolEntry && poolEntry.score >= 5) {
          state.scheduledRepeats.splice(i, 1);
          i--;
          dirty = true;
          continue;
        }

        if (item.dueAtStep <= upcomingStep && itemKey !== lastKey) {
          if (weakOnly && (!poolEntry || poolEntry.score >= 5)) {
            continue;
          }
          const resolved = poolEntry || findDictEntry(item.word);
          state.scheduledRepeats.splice(i, 1);
          dirty = true;
          if (resolved) {
            store.save();
            return { entry: resolved, fromRepeat: true, dueByTime: false, done: false };
          }
          i--;
        }
      }
      if (dirty) store.save();
    }

    // 2. Time-due weak pool words
    const dueWeakCandidates = state.pool.filter((w) => {
      if (w.score >= 5) return false;
      if (typeof w.nextReviewAt !== 'number' || w.nextReviewAt > now) return false;
      if (!weakOnly && !levelSet.has(w.level)) return false;
      return w.word.toLowerCase() !== lastKey;
    });

    if (dueWeakCandidates.length > 0) {
      const sorted = sortWeakEntries(dueWeakCandidates);
      return { entry: sorted[0], fromRepeat: false, dueByTime: true, done: false };
    }

    // 3. Weak-only mode: pick remaining weak pool words
    if (weakOnly) {
      const allWeak = getWeakWords(null);
      if (allWeak.length === 0) {
        return { done: true, reason: 'no-weak-words' };
      }
      const nonLast = allWeak.filter((w) => w.word.toLowerCase() !== lastKey);
      const poolChoice = nonLast.length > 0 ? nonLast : allWeak;
      const topSlice = poolChoice.slice(0, Math.min(3, poolChoice.length));
      const chosen = topSlice[Math.floor(Math.random() * topSlice.length)];
      return { entry: chosen, fromRepeat: false, dueByTime: false, done: false };
    }

    // 4. Normal mode: weighted mix of weak pool words + unlearned dictionary words
    const futureScheduledKeys = new Set(
      (state.scheduledRepeats || [])
        .filter((r) => r.dueAtStep > upcomingStep)
        .map((r) => normalizeKey(r.word))
    );

    const weakMatching = getWeakWords(selectedLevels).filter(
      (w) => w.word.toLowerCase() !== lastKey && !futureScheduledKeys.has(w.word.toLowerCase())
    );

    if (weakMatching.length > 0 && Math.random() < 0.45) {
      const topSlice = weakMatching.slice(0, Math.min(5, weakMatching.length));
      const chosen = topSlice[Math.floor(Math.random() * topSlice.length)];
      return { entry: chosen, fromRepeat: false, dueByTime: false, done: false };
    }

    const poolMap = new Map(state.pool.map((w) => [w.word.toLowerCase(), w]));
    const levelDict = dict.filter((w) => levelSet.has(w.level));
    const unlearned = levelDict.filter(
      (w) => !poolMap.has(w.word.toLowerCase()) && w.word.toLowerCase() !== lastKey
    );

    if (unlearned.length > 0) {
      const chosen = unlearned[Math.floor(Math.random() * unlearned.length)];
      return { entry: chosen, fromRepeat: false, dueByTime: false, done: false };
    }

    if (weakMatching.length > 0) {
      return { entry: weakMatching[0], fromRepeat: false, dueByTime: false, done: false };
    }

    // Safe fallback if all words in selected levels are mastered
    const fallbackLevel = levelDict.filter((w) => w.word.toLowerCase() !== lastKey);
    const poolFallback = fallbackLevel.length > 0
      ? fallbackLevel
      : (levelDict.length > 0 ? levelDict : dict);
    if (poolFallback.length === 0) {
      return { done: true, reason: 'empty-dictionary' };
    }
    const chosen = poolFallback[Math.floor(Math.random() * poolFallback.length)];
    const existing = poolMap.get(chosen.word.toLowerCase());
    return { entry: existing || chosen, fromRepeat: false, dueByTime: false, done: false };
  }

  function recordAnswer(wordObj, isCorrect, options = {}) {
    const store = getStore();
    if (!store || !wordObj || !wordObj.word) return null;

    const state = store.getState();
    const now = typeof options.now === 'number' ? options.now : Date.now();
    const key = normalizeKey(wordObj.word);
    const existing = findPoolEntry(wordObj.word);
    const prevScore = existing ? existing.score : 0;

    state.reviewStepCounter = (state.reviewStepCounter || 0) + 1;
    const currentStep = state.reviewStepCounter;

    let nextScore;
    let wrongCount = existing ? (existing.wrongCount || 0) : 0;
    let nextReviewAt = null;
    let justMastered = false;

    if (isCorrect) {
      nextScore = existing ? Math.min(5, existing.score + 1) : 5;
      justMastered = prevScore < 5 && nextScore === 5;
      if (nextScore >= 5) {
        nextReviewAt = null;
        state.scheduledRepeats = state.scheduledRepeats.filter(
          (r) => normalizeKey(r.word) !== key
        );
      } else {
        nextReviewAt = now + DAY_MS * nextScore;
      }
    } else {
      nextScore = existing ? Math.max(1, existing.score - 1) : 1;
      wrongCount += 1;
      nextReviewAt = now + DAY_MS;
      state.scheduledRepeats = state.scheduledRepeats.filter(
        (r) => normalizeKey(r.word) !== key
      );
      state.scheduledRepeats.push(
        { word: wordObj.word, dueAtStep: currentStep + 2 },
        { word: wordObj.word, dueAtStep: currentStep + 13 }
      );
    }

    const entry = store.upsertWord({
      word: wordObj.word,
      tr: wordObj.tr,
      sentence: wordObj.sentence || (existing ? existing.sentence : '') || '',
      level: wordObj.level || (existing ? existing.level : 'B2') || 'B2',
      score: nextScore,
      wrongCount,
      lastReviewedAt: now,
      nextReviewAt,
      custom: Boolean((existing && existing.custom) || wordObj.custom)
    });

    const { stats, goalJustReached } = store.recordPractice();
    store.save();

    return {
      entry,
      prevScore,
      nextScore,
      justMastered,
      goalJustCompleted: goalJustReached,
      stats
    };
  }

  root.WordySRS = {
    getNextWord,
    recordAnswer,
    getWeakWords,
    findPoolEntry,
    findDictEntry
  };
})(typeof window !== 'undefined' ? window : globalThis);
