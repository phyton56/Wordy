(function (root) {
  'use strict';

  const MIXED_SEQUENCE = ['matching', 'fillblank', 'listening', 'flashcard', 'spelling'];

  const state = {
    callbacks: {
      onDashboardSync: () => {},
      onCloseModal: () => {},
      onOpenWeakReview: () => {},
      highlightWord: null,
      createMasteryTray: null
    },
    session: {
      source: 'review',
      mode: 'en-tr',
      total: 0,
      correct: 0,
      wrong: 0,
      newlyMastered: [],
      struggled: [],
      lastSummaryAt: 0,
      summaryVisible: false
    },
    review: {
      active: false,
      direction: 'en-tr',
      activeDirection: 'en-tr',
      weakOnly: false,
      questionIndex: 0,
      currentWord: null,
      answered: false,
      options: [],
      lastWordKey: ''
    },
    activities: {
      mode: null,
      activeView: 'menu',
      mixedCursor: 0,
      lastWordKey: '',
      matching: {
        pairs: [],
        selectedEn: null,
        selectedTr: null,
        matchedKeys: new Set(),
        wrongAttempts: 0
      },
      fillBlank: {
        currentWord: null,
        answered: false,
        options: [],
        hintShown: false
      },
      listening: {
        currentWord: null,
        answered: false,
        options: [],
        slowMode: false
      },
      flashcard: {
        currentWord: null,
        flipped: false,
        evaluated: false,
        count: 0,
        drag: {
          active: false,
          pointerId: null,
          startX: 0,
          startY: 0,
          dx: 0,
          startTime: 0,
          moved: false
        }
      },
      spelling: {
        currentWord: null,
        answered: false,
        revealedIndices: new Set()
      }
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getStore() { return root.WordyStore; }
  function getSRS() { return root.WordySRS; }
  function getAudio() { return root.WordyAudio; }
  function getEffects() { return root.WordyEffects; }
  function getDict() { return Array.isArray(root.WORDY_DICTIONARY) ? root.WORDY_DICTIONARY : []; }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightWord(container, sentence, targetWord) {
    if (typeof state.callbacks.highlightWord === 'function') {
      state.callbacks.highlightWord(container, sentence, targetWord);
      return;
    }
    container.textContent = sentence || '';
  }

  function maskWordInSentence(sentence, word) {
    const cleanSentence = String(sentence || '').trim();
    const cleanWord = String(word || '').trim();
    if (!cleanSentence) return '______';
    const regex = new RegExp(`\\b${escapeRegExp(cleanWord)}\\w*`, 'ig');
    if (regex.test(cleanSentence)) {
      return cleanSentence.replace(regex, '______');
    }
    return `${cleanSentence} (______)`;
  }

  function makeMasteryTray(score) {
    if (typeof state.callbacks.createMasteryTray === 'function') {
      return state.callbacks.createMasteryTray(score);
    }
    const span = document.createElement('span');
    span.className = 'count-badge';
    span.textContent = `${score}/5`;
    return span;
  }

  function syncDashboard() {
    if (typeof state.callbacks.onDashboardSync === 'function') {
      state.callbacks.onDashboardSync();
    }
  }

  function buildDistractors(targetWord, sourceList, count) {
    const targetTr = String(targetWord.tr || '').trim().toLowerCase();
    const targetKey = String(targetWord.word || '').trim().toLowerCase();
    const dict = getDict();
    const pool = Array.isArray(sourceList) && sourceList.length > 0 ? sourceList : dict;

    const sameLevel = pool.filter(
      (w) => w.level === targetWord.level && w.word.toLowerCase() !== targetKey && w.tr.trim().toLowerCase() !== targetTr
    );
    const others = pool.filter(
      (w) => w.level !== targetWord.level && w.word.toLowerCase() !== targetKey && w.tr.trim().toLowerCase() !== targetTr
    );
    const dictFallback = pool === dict ? [] : dict.filter(
      (w) => w.word.toLowerCase() !== targetKey && w.tr.trim().toLowerCase() !== targetTr
    );

    const picked = [];
    const usedWords = new Set([targetKey]);
    const usedTr = new Set([targetTr]);
    for (const cand of [...shuffle(sameLevel), ...shuffle(others), ...shuffle(dictFallback)]) {
      const wKey = cand.word.trim().toLowerCase();
      const tKey = cand.tr.trim().toLowerCase();
      if (usedWords.has(wKey) || usedTr.has(tKey)) continue;
      usedWords.add(wKey);
      usedTr.add(tKey);
      picked.push(cand);
      if (picked.length >= count) break;
    }
    return picked;
  }

  function pickPoolWord(excludeKey, preferWithSentence) {
    const pool = getStore().getState().pool;
    if (pool.length === 0) return null;
    const base = preferWithSentence
      ? pool.filter((w) => w.sentence && w.sentence.trim().length > 0)
      : pool;
    const source = base.length > 0 ? base : pool;
    const filtered = source.filter((w) => w.word.toLowerCase() !== excludeKey);
    const candidates = filtered.length > 0 ? filtered : source;

    // Slight bias toward weak words (< 5) so activities reinforce learning
    const weak = candidates.filter((w) => w.score < 5);
    if (weak.length > 0 && Math.random() < 0.6) {
      return weak[Math.floor(Math.random() * weak.length)];
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /* ==================== SHARED SESSION TRACKER & SUMMARY ==================== */

  function resetSession(source, mode) {
    state.session = {
      source,
      mode,
      total: 0,
      correct: 0,
      wrong: 0,
      newlyMastered: [],
      struggled: [],
      lastSummaryAt: 0,
      summaryVisible: false
    };
  }

  function trackSessionResult(wordObj, isCorrect, justMastered) {
    const s = state.session;
    s.total += 1;
    if (isCorrect) s.correct += 1;
    else s.wrong += 1;

    if (wordObj && wordObj.word) {
      const key = wordObj.word.toLowerCase();
      if (justMastered && !s.newlyMastered.some((w) => w.word.toLowerCase() === key)) {
        s.newlyMastered.push({ word: wordObj.word, tr: wordObj.tr, level: wordObj.level });
      }
      if (!isCorrect && !s.struggled.some((w) => w.word.toLowerCase() === key)) {
        s.struggled.push({ word: wordObj.word, tr: wordObj.tr, level: wordObj.level });
      }
    }
  }

  function shouldAutoSummarize() {
    const s = state.session;
    return s.total > 0 && s.total % 10 === 0 && s.total !== s.lastSummaryAt;
  }

  function shouldSummarizeOnExit() {
    const s = state.session;
    return !s.summaryVisible && s.total >= 3 && s.total !== s.lastSummaryAt;
  }

  function renderSummaryInto(containerId, { onContinue, onHome, onRetryWeak }) {
    const container = $(containerId);
    if (!container) return;

    const s = state.session;
    s.lastSummaryAt = s.total;
    s.summaryVisible = true;
    const accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;

    container.textContent = '';

    const card = document.createElement('div');
    card.className = 'summary-card';

    const header = document.createElement('div');
    header.className = 'summary-header';
    const title = document.createElement('h3');
    title.className = 'summary-title';
    title.textContent = 'Oturum Özeti';
    const badge = document.createElement('span');
    badge.className = 'cefr-chip cefr-chip-accent';
    badge.textContent = `${s.total} soru`;
    header.appendChild(title);
    header.appendChild(badge);
    card.appendChild(header);

    const kpiGrid = document.createElement('div');
    kpiGrid.className = 'summary-kpi-grid';

    const kpis = [
      { label: 'Toplam', value: String(s.total), tone: 'neutral' },
      { label: 'Doğruluk', value: `${accuracy}%`, tone: accuracy >= 70 ? 'mastery' : 'weak' },
      { label: 'Doğru / Yanlış', value: `${s.correct} / ${s.wrong}`, tone: 'neutral' }
    ];

    kpis.forEach((k) => {
      const box = document.createElement('div');
      box.className = `summary-kpi summary-kpi-${k.tone}`;
      const lbl = document.createElement('span');
      lbl.className = 'summary-kpi-label';
      lbl.textContent = k.label;
      const val = document.createElement('strong');
      val.className = 'summary-kpi-value mono-num';
      val.textContent = k.value;
      box.appendChild(lbl);
      box.appendChild(val);
      kpiGrid.appendChild(box);
    });
    card.appendChild(kpiGrid);

    if (s.newlyMastered.length > 0) {
      const block = document.createElement('div');
      block.className = 'summary-section';
      const h = document.createElement('h4');
      h.className = 'summary-section-title';
      h.textContent = `Öğrenilen Kelimeler (${s.newlyMastered.length})`;
      const chips = document.createElement('div');
      chips.className = 'summary-chips';
      s.newlyMastered.forEach((w) => {
        const chip = document.createElement('span');
        chip.className = 'summary-chip summary-chip-mastered';
        chip.textContent = w.word;
        chips.appendChild(chip);
      });
      block.appendChild(h);
      block.appendChild(chips);
      card.appendChild(block);
    }

    if (s.struggled.length > 0) {
      const block = document.createElement('div');
      block.className = 'summary-section';
      const h = document.createElement('h4');
      h.className = 'summary-section-title';
      h.textContent = `Tekrar Gerekenler (${s.struggled.length})`;
      const list = document.createElement('ul');
      list.className = 'summary-struggled-list';
      s.struggled.forEach((w) => {
        const li = document.createElement('li');
        li.className = 'summary-struggled-item';
        const en = document.createElement('strong');
        en.textContent = w.word;
        const tr = document.createElement('span');
        tr.textContent = w.tr;
        li.appendChild(en);
        li.appendChild(tr);
        list.appendChild(li);
      });
      block.appendChild(h);
      block.appendChild(list);
      card.appendChild(block);
    }

    const actions = document.createElement('div');
    actions.className = 'summary-actions';

    if (s.struggled.length > 0 && typeof onRetryWeak === 'function') {
      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.id = `${containerId}-retry-weak`;
      retryBtn.className = 'btn-weak-cta';
      retryBtn.textContent = `Bunları Tekrar Et (${s.struggled.length})`;
      retryBtn.addEventListener('click', () => {
        s.summaryVisible = false;
        onRetryWeak();
      });
      actions.appendChild(retryBtn);
    }

    const row = document.createElement('div');
    row.className = 'summary-actions-row';

    if (typeof onContinue === 'function') {
      const contBtn = document.createElement('button');
      contBtn.type = 'button';
      contBtn.id = `${containerId}-continue`;
      contBtn.className = 'btn-primary';
      contBtn.textContent = 'Devam Et';
      contBtn.addEventListener('click', () => {
        s.summaryVisible = false;
        onContinue();
      });
      row.appendChild(contBtn);
    }

    const homeBtn = document.createElement('button');
    homeBtn.type = 'button';
    homeBtn.id = `${containerId}-home`;
    homeBtn.className = 'btn-secondary';
    homeBtn.textContent = 'Ana Ekrana Dön';
    homeBtn.addEventListener('click', () => {
      s.summaryVisible = false;
      resetSession('review', 'en-tr');
      if (typeof onHome === 'function') onHome();
    });
    row.appendChild(homeBtn);

    actions.appendChild(row);
    card.appendChild(actions);
    container.appendChild(card);
  }

  /* ==================== 1. REVIEW (TEKRAR ET: EN→TR, TR→EN, KARIŞIK, ZAYIF) ==================== */

  function syncDirectionButtons() {
    document.querySelectorAll('#review-direction-group [data-direction]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.direction === state.review.direction));
    });
  }

  function syncWeakButtons() {
    const weakCount = getSRS().getWeakWords().length;
    const setupWeakBtn = $('btn-start-weak-review');
    if (setupWeakBtn) {
      setupWeakBtn.disabled = weakCount === 0;
      setupWeakBtn.textContent = weakCount > 0
        ? `Zorlandıklarımı Çalış (${weakCount})`
        : 'Tekrar Gereken Kelime Yok';
    }
  }

  function showReviewPanel(panelId) {
    ['review-setup-view', 'review-quiz-view', 'review-empty-weak-view', 'review-summary-view'].forEach((id) => {
      const el = $(id);
      if (el) el.hidden = id !== panelId;
    });
  }

  function showReviewSetup() {
    state.review.active = false;
    state.session.summaryVisible = false;
    showReviewPanel('review-setup-view');
    syncDirectionButtons();
    syncWeakButtons();
  }

  function startReviewSession({ weakOnly = false } = {}) {
    state.review.weakOnly = Boolean(weakOnly);
    state.review.questionIndex = 0;
    state.review.lastWordKey = '';
    resetSession('review', weakOnly ? 'weak' : state.review.direction);
    loadNextReviewQuestion();
  }

  function showReviewSummary() {
    state.review.active = false;
    showReviewPanel('review-summary-view');
    renderSummaryInto('review-summary-view', {
      onContinue: () => loadNextReviewQuestion(),
      onHome: () => state.callbacks.onCloseModal('modal-review'),
      onRetryWeak: () => startReviewSession({ weakOnly: true })
    });
  }

  function resolveReviewDirection() {
    if (state.review.direction === 'mixed') {
      return Math.random() < 0.5 ? 'en-tr' : 'tr-en';
    }
    return state.review.direction;
  }

  function loadNextReviewQuestion() {
    const picked = getSRS().getNextWord({
      selectedLevels: getStore().getState().selectedLevels,
      weakOnly: state.review.weakOnly,
      lastWord: state.review.lastWordKey
    });

    if (!picked || picked.done || !picked.entry) {
      state.review.active = false;
      showReviewPanel('review-empty-weak-view');
      return;
    }

    const wordEntry = picked.entry;
    const dir = resolveReviewDirection();
    state.review.active = true;
    state.review.activeDirection = dir;
    state.review.answered = false;
    state.review.questionIndex += 1;
    state.review.currentWord = wordEntry;
    state.review.lastWordKey = wordEntry.word.toLowerCase();

    const poolItem = getSRS().findPoolEntry(wordEntry.word);
    const currentScore = poolItem ? poolItem.score : 0;

    showReviewPanel('review-quiz-view');
    const reviewCard = document.querySelector('#review-quiz-view .quiz-card');
    if (reviewCard) {
      reviewCard.classList.remove('is-entering');
      void reviewCard.offsetWidth;
      reviewCard.classList.add('is-entering');
    }
    const stepBadge = $('review-step-badge');
    if (stepBadge) stepBadge.textContent = `Soru ${state.review.questionIndex}`;

    const modeChip = $('review-mode-chip');
    if (modeChip) {
      const dirLabel = dir === 'tr-en' ? 'TR → EN' : 'EN → TR';
      modeChip.textContent = state.review.weakOnly ? `Zayıf · ${dirLabel}` : dirLabel;
    }

    const levelEl = $('review-word-level');
    if (levelEl) levelEl.textContent = wordEntry.level || 'B2';

    const masterySlot = $('review-mastery-slot');
    if (masterySlot) {
      masterySlot.textContent = '';
      masterySlot.appendChild(makeMasteryTray(currentScore));
    }

    const wordTextEl = $('review-word-text');
    const speakWordBtn = $('btn-speak-word');
    const sentenceBox = $('review-sentence-box');
    const sentenceText = $('review-sentence-text');
    const speakSentBtn = $('btn-speak-sentence');

    if (dir === 'tr-en') {
      if (wordTextEl) {
        wordTextEl.textContent = wordEntry.tr;
        wordTextEl.classList.add('quiz-word-tr');
      }
      if (speakWordBtn) speakWordBtn.hidden = true;
      if (sentenceBox) {
        if (wordEntry.sentence) {
          sentenceBox.hidden = false;
          if (sentenceText) sentenceText.textContent = maskWordInSentence(wordEntry.sentence, wordEntry.word);
          if (speakSentBtn) speakSentBtn.hidden = true;
        } else {
          sentenceBox.hidden = true;
        }
      }
    } else {
      if (wordTextEl) {
        wordTextEl.textContent = wordEntry.word;
        wordTextEl.classList.remove('quiz-word-tr');
      }
      if (speakWordBtn) speakWordBtn.hidden = false;
      if (sentenceBox) {
        if (wordEntry.sentence) {
          sentenceBox.hidden = false;
          if (sentenceText) highlightWord(sentenceText, wordEntry.sentence, wordEntry.word);
          if (speakSentBtn) speakSentBtn.hidden = false;
        } else {
          sentenceBox.hidden = true;
        }
      }
    }

    const distractors = buildDistractors(wordEntry, getDict(), 3);
    const options = shuffle([
      { label: dir === 'tr-en' ? wordEntry.word : wordEntry.tr, isCorrect: true },
      ...distractors.map((d) => ({ label: dir === 'tr-en' ? d.word : d.tr, isCorrect: false }))
    ]);
    state.review.options = options;

    const optContainer = $('review-options');
    if (optContainer) {
      optContainer.classList.remove('is-instant');
      optContainer.setAttribute('aria-label', dir === 'tr-en' ? 'İngilizce kelime seçenekleri' : 'Türkçe anlam seçenekleri');
      optContainer.textContent = '';
      options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.dataset.index = String(idx);

        const keyCap = document.createElement('span');
        keyCap.className = 'option-key';
        keyCap.textContent = String(idx + 1);

        const label = document.createElement('span');
        label.textContent = opt.label;

        btn.appendChild(keyCap);
        btn.appendChild(label);
        btn.addEventListener('click', () => handleReviewAnswer(idx, btn));
        optContainer.appendChild(btn);
      });
    }

    const queueNote = $('review-queue-note');
    if (queueNote) {
      if (picked.fromRepeat) queueNote.textContent = 'Daha önce zorlandığın kelime';
      else if (picked.dueByTime) queueNote.textContent = 'Tekrar zamanı geldi';
      else queueNote.textContent = '';
    }

    const nextBtn = $('btn-review-next');
    if (nextBtn) nextBtn.hidden = true;
  }

  function handleReviewAnswer(selectedIdx, btnEl, opts = {}) {
    if (state.review.answered) return;
    const wordEntry = state.review.currentWord;
    if (!wordEntry) return;
    state.review.answered = true;

    const chosen = state.review.options[selectedIdx];
    const isCorrect = Boolean(chosen && chosen.isCorrect);
    const dir = state.review.activeDirection;

    const result = getSRS().recordAnswer(wordEntry, isCorrect);
    const nextScore = result ? result.nextScore : 1;
    const justMastered = Boolean(result && result.justMastered);
    const goalJustCompleted = Boolean(result && result.goalJustCompleted);

    trackSessionResult(wordEntry, isCorrect, justMastered);

    const masterySlot = $('review-mastery-slot');
    if (masterySlot) {
      masterySlot.textContent = '';
      masterySlot.appendChild(makeMasteryTray(nextScore));
    }

    if (dir === 'tr-en') {
      const speakWordBtn = $('btn-speak-word');
      if (speakWordBtn) speakWordBtn.hidden = false;
      if (wordEntry.sentence) {
        const sentenceText = $('review-sentence-text');
        if (sentenceText) highlightWord(sentenceText, wordEntry.sentence, wordEntry.word);
        const speakSentBtn = $('btn-speak-sentence');
        if (speakSentBtn) speakSentBtn.hidden = false;
      }
    }

    const optContainer = $('review-options');
    if (optContainer) {
      optContainer.classList.toggle('is-instant', Boolean(opts.instant));
      optContainer.querySelectorAll('.option-btn').forEach((b, idx) => {
        b.disabled = true;
        const opt = state.review.options[idx];
        if (opt && opt.isCorrect) b.classList.add('is-correct');
        else if (idx === selectedIdx) b.classList.add('is-wrong');
        else b.classList.add('is-dimmed');
      });
    }

    const nextBtn = $('btn-review-next');
    if (nextBtn) nextBtn.hidden = false;

    if (isCorrect) {
      getAudio().playTone(justMastered ? 'mastered' : 'correct');
      getAudio().haptic('success');
      if (justMastered || goalJustCompleted) getEffects().celebrateFull();
      else if (btnEl) getEffects().microBurst(btnEl);
    } else {
      getAudio().playTone('wrong');
      getAudio().haptic('error');
    }

    syncDashboard();
  }

  function advanceReview() {
    if (shouldAutoSummarize()) {
      showReviewSummary();
      return;
    }
    loadNextReviewQuestion();
  }

  /* ==================== ACTIVITIES SHARED NAVIGATION ==================== */

  function showActivityPanel(panelId) {
    const panels = [
      'act-menu-view',
      'act-matching-view',
      'act-fillblank-view',
      'act-listening-view',
      'act-flashcard-view',
      'act-spelling-view',
      'act-summary-view'
    ];
    panels.forEach((id) => {
      const el = $(id);
      if (el) el.hidden = id !== panelId;
    });
    state.activities.activeView = panelId;
  }

  function showActivitiesMenu() {
    state.activities.mode = null;
    state.session.summaryVisible = false;
    showActivityPanel('act-menu-view');
    const hasEnough = getStore().getState().pool.length >= 4;
    $('act-empty-notice').hidden = hasEnough;
    $('act-menu-list').hidden = !hasEnough;
  }

  function showActivitySummary() {
    showActivityPanel('act-summary-view');
    renderSummaryInto('act-summary-view', {
      onContinue: () => advanceActivity(true),
      onHome: () => state.callbacks.onCloseModal('modal-activities'),
      onRetryWeak: () => {
        state.callbacks.onOpenWeakReview();
      }
    });
  }

  function startActivityMode(mode) {
    if (getStore().getState().pool.length < 4) {
      showActivitiesMenu();
      return;
    }
    state.activities.mode = mode;
    state.activities.mixedCursor = 0;
    state.activities.lastWordKey = '';
    resetSession('activities', mode);
    advanceActivity(true);
  }

  function advanceActivity(skipAutoSummary = false) {
    if (!skipAutoSummary && shouldAutoSummarize()) {
      showActivitySummary();
      return;
    }
    const mode = state.activities.mode;
    if (mode === 'mixed') {
      const next = MIXED_SEQUENCE[state.activities.mixedCursor % MIXED_SEQUENCE.length];
      state.activities.mixedCursor += 1;
      launchActivitySubmode(next);
      return;
    }
    launchActivitySubmode(mode);
  }

  function launchActivitySubmode(sub) {
    if (sub === 'matching') startMatchingRound();
    else if (sub === 'fillblank') startFillBlankQuestion();
    else if (sub === 'listening') startListeningQuestion();
    else if (sub === 'flashcard') startFlashcardQuestion();
    else if (sub === 'spelling') startSpellingQuestion();
    else showActivitiesMenu();
  }

  /* ==================== 2A. MATCHING (EŞLEŞTİRME) ==================== */

  function startMatchingRound() {
    const pool = getStore().getState().pool;
    if (pool.length < 4) {
      showActivitiesMenu();
      return;
    }

    showActivityPanel('act-matching-view');
    const pairs = shuffle(pool).slice(0, 4);
    state.activities.matching = {
      pairs,
      selectedEn: null,
      selectedTr: null,
      matchedKeys: new Set(),
      wrongAttempts: 0
    };

    const enCol = $('match-en-col');
    const trCol = $('match-tr-col');
    enCol.textContent = '';
    trCol.textContent = '';
    $('match-progress-badge').textContent = `0 / ${pairs.length}`;
    $('match-feedback').className = 'feedback-banner';
    $('match-feedback').textContent = '';
    $('btn-match-next').hidden = true;

    shuffle(pairs).forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'match-tile';
      btn.dataset.key = item.word.toLowerCase();
      btn.textContent = item.word;
      btn.addEventListener('click', () => handleMatchSelect('en', item.word.toLowerCase(), btn));
      enCol.appendChild(btn);
    });

    shuffle(pairs).forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'match-tile';
      btn.dataset.key = item.word.toLowerCase();
      btn.textContent = item.tr;
      btn.addEventListener('click', () => handleMatchSelect('tr', item.word.toLowerCase(), btn));
      trCol.appendChild(btn);
    });
  }

  function handleMatchSelect(side, key, btnEl) {
    const st = state.activities.matching;
    if (st.matchedKeys.has(key)) return;

    const colId = side === 'en' ? 'match-en-col' : 'match-tr-col';
    $(colId).querySelectorAll('.match-tile.is-selected').forEach((b) => b.classList.remove('is-selected'));
    btnEl.classList.add('is-selected');

    if (side === 'en') st.selectedEn = { key, btnEl };
    else st.selectedTr = { key, btnEl };

    if (!st.selectedEn || !st.selectedTr) return;

    const enPick = st.selectedEn;
    const trPick = st.selectedTr;
    st.selectedEn = null;
    st.selectedTr = null;

    if (enPick.key === trPick.key) {
      st.matchedKeys.add(enPick.key);
      enPick.btnEl.classList.remove('is-selected');
      trPick.btnEl.classList.remove('is-selected');
      enPick.btnEl.classList.add('is-matched');
      trPick.btnEl.classList.add('is-matched');
      enPick.btnEl.disabled = true;
      trPick.btnEl.disabled = true;

      const matchedPair = st.pairs.find((p) => p.word.toLowerCase() === enPick.key);
      trackSessionResult(matchedPair, true, false);

      $('match-progress-badge').textContent = `${st.matchedKeys.size} / ${st.pairs.length}`;
      getAudio().playTone('correct');
      getAudio().haptic('success');

      if (st.matchedKeys.size === st.pairs.length) {
        getStore().recordPractice();
        const fb = $('match-feedback');
        fb.className = 'feedback-banner is-visible is-correct';
        fb.textContent = 'Hepsi eşleşti.';
        getAudio().playTone('mastered');
        getEffects().celebrateFull();
        $('btn-match-next').hidden = false;
        syncDashboard();
      } else {
        getEffects().microBurst(trPick.btnEl);
      }
    } else {
      st.wrongAttempts += 1;
      const wrongPair = st.pairs.find((p) => p.word.toLowerCase() === enPick.key);
      trackSessionResult(wrongPair, false, false);
      enPick.btnEl.classList.add('is-wrong');
      trPick.btnEl.classList.add('is-wrong');
      getAudio().playTone('wrong');
      getAudio().haptic('error');
      setTimeout(() => {
        enPick.btnEl.classList.remove('is-wrong', 'is-selected');
        trPick.btnEl.classList.remove('is-wrong', 'is-selected');
      }, 440);
    }
  }

  /* ==================== 2B. FILL IN THE BLANK (BOŞLUK DOLDURMA) ==================== */

  function startFillBlankQuestion() {
    const pool = getStore().getState().pool;
    if (pool.length < 4) {
      showActivitiesMenu();
      return;
    }

    showActivityPanel('act-fillblank-view');
    const target = pickPoolWord(state.activities.lastWordKey, true);
    state.activities.lastWordKey = target.word.toLowerCase();

    const distractors = buildDistractors(target, pool, 3);
    const options = shuffle([
      { word: target.word, isCorrect: true },
      ...distractors.map((d) => ({ word: d.word, isCorrect: false }))
    ]);

    state.activities.fillBlank = {
      currentWord: target,
      answered: false,
      options,
      hintShown: false
    };

    $('fb-word-level').textContent = target.level || 'B2';
    const masterySlot = $('fb-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(target.score));

    $('fb-sentence-text').textContent = maskWordInSentence(target.sentence, target.word);
    $('fb-hint-box').hidden = true;
    $('fb-hint-box').textContent = '';
    const speakSentBtn = $('btn-fb-speak-sentence');
    if (speakSentBtn) speakSentBtn.hidden = true;

    const optEl = $('fb-options');
    optEl.classList.remove('is-instant');
    optEl.textContent = '';
    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';

      const keyCap = document.createElement('span');
      keyCap.className = 'option-key';
      keyCap.textContent = String(idx + 1);

      const label = document.createElement('span');
      label.textContent = opt.word;

      btn.appendChild(keyCap);
      btn.appendChild(label);
      btn.addEventListener('click', () => handleFillBlankAnswer(idx, btn));
      optEl.appendChild(btn);
    });

    $('fb-feedback').className = 'feedback-banner';
    $('fb-feedback').textContent = '';
    $('btn-fb-next').hidden = true;
  }

  function handleFillBlankAnswer(selectedIdx, btnEl, opts = {}) {
    const st = state.activities.fillBlank;
    if (st.answered) return;
    st.answered = true;

    const target = st.currentWord;
    const chosen = st.options[selectedIdx];
    const isCorrect = Boolean(chosen && chosen.isCorrect);

    const res = getSRS().recordAnswer(target, isCorrect);
    const nextScore = res ? res.nextScore : target.score;
    const justMastered = Boolean(res && res.justMastered);
    const goalJustCompleted = Boolean(res && res.goalJustCompleted);
    trackSessionResult(target, isCorrect, justMastered);

    const masterySlot = $('fb-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(nextScore));

    if (target.sentence) {
      highlightWord($('fb-sentence-text'), target.sentence, target.word);
      const speakSentBtn = $('btn-fb-speak-sentence');
      if (speakSentBtn) speakSentBtn.hidden = false;
    }

    const fbOpts = $('fb-options');
    fbOpts.classList.toggle('is-instant', Boolean(opts.instant));
    fbOpts.querySelectorAll('.option-btn').forEach((b, idx) => {
      b.disabled = true;
      if (st.options[idx].isCorrect) b.classList.add('is-correct');
      else if (idx === selectedIdx) b.classList.add('is-wrong');
      else b.classList.add('is-dimmed');
    });

    const fb = $('fb-feedback');
    if (isCorrect) {
      fb.className = 'feedback-banner is-visible is-correct';
      fb.textContent = justMastered
        ? `"${target.word}" artık öğrenildi.`
        : `Doğru: ${target.word} (${target.tr})`;
      getAudio().playTone(justMastered ? 'mastered' : 'correct');
      getAudio().haptic('success');
      if (justMastered || goalJustCompleted) getEffects().celebrateFull();
      else getEffects().microBurst(btnEl);
    } else {
      fb.className = 'feedback-banner is-visible is-wrong';
      fb.textContent = `Doğru kelime: ${target.word} (${target.tr})`;
      getAudio().playTone('wrong');
      getAudio().haptic('error');
    }

    $('btn-fb-next').hidden = false;
    syncDashboard();
  }

  /* ==================== 2C. DINLE & BIL (LISTENING MODE) ==================== */

  function speakListeningWord(btnEl) {
    const st = state.activities.listening;
    if (!st.currentWord) return;
    const rate = st.slowMode ? 0.78 : 0.95;
    getAudio().speak(st.currentWord.word, { rate, btnEl: btnEl || $('btn-listen-play') });
  }

  function startListeningQuestion() {
    const pool = getStore().getState().pool;
    if (pool.length < 4) {
      showActivitiesMenu();
      return;
    }

    showActivityPanel('act-listening-view');
    const target = pickPoolWord(state.activities.lastWordKey, false);
    state.activities.lastWordKey = target.word.toLowerCase();

    const distractors = buildDistractors(target, pool, 3);
    const options = shuffle([
      { tr: target.tr, isCorrect: true },
      ...distractors.map((d) => ({ tr: d.tr, isCorrect: false }))
    ]);

    state.activities.listening.currentWord = target;
    state.activities.listening.answered = false;
    state.activities.listening.options = options;

    $('listen-word-level').textContent = target.level || 'B2';
    const masterySlot = $('listen-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(target.score));

    $('btn-listen-slow').setAttribute('aria-pressed', String(state.activities.listening.slowMode));

    const revealBox = $('listen-reveal-box');
    revealBox.hidden = true;
    $('listen-revealed-word').textContent = '';
    $('listen-sentence-text').textContent = '';

    const optEl = $('listen-options');
    optEl.classList.remove('is-instant');
    optEl.textContent = '';
    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';

      const keyCap = document.createElement('span');
      keyCap.className = 'option-key';
      keyCap.textContent = String(idx + 1);

      const label = document.createElement('span');
      label.textContent = opt.tr;

      btn.appendChild(keyCap);
      btn.appendChild(label);
      btn.addEventListener('click', () => handleListeningAnswer(idx, btn));
      optEl.appendChild(btn);
    });

    $('listen-feedback').className = 'feedback-banner';
    $('listen-feedback').textContent = '';
    $('btn-listen-next').hidden = true;
  }

  function handleListeningAnswer(selectedIdx, btnEl, opts = {}) {
    const st = state.activities.listening;
    if (st.answered) return;
    st.answered = true;

    const target = st.currentWord;
    const chosen = st.options[selectedIdx];
    const isCorrect = Boolean(chosen && chosen.isCorrect);

    const res = getSRS().recordAnswer(target, isCorrect);
    const nextScore = res ? res.nextScore : target.score;
    const justMastered = Boolean(res && res.justMastered);
    const goalJustCompleted = Boolean(res && res.goalJustCompleted);
    trackSessionResult(target, isCorrect, justMastered);

    const masterySlot = $('listen-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(nextScore));

    // Reveal hidden English word & highlighted sentence
    $('listen-revealed-word').textContent = target.word;
    const sentRow = $('listen-sentence-row');
    if (target.sentence) {
      sentRow.hidden = false;
      highlightWord($('listen-sentence-text'), target.sentence, target.word);
    } else {
      sentRow.hidden = true;
    }
    $('listen-reveal-box').hidden = false;

    const listenOpts = $('listen-options');
    listenOpts.classList.toggle('is-instant', Boolean(opts.instant));
    listenOpts.querySelectorAll('.option-btn').forEach((b, idx) => {
      b.disabled = true;
      if (st.options[idx].isCorrect) b.classList.add('is-correct');
      else if (idx === selectedIdx) b.classList.add('is-wrong');
      else b.classList.add('is-dimmed');
    });

    const fb = $('listen-feedback');
    if (isCorrect) {
      fb.className = 'feedback-banner is-visible is-correct';
      fb.textContent = justMastered
        ? `"${target.word}" artık öğrenildi.`
        : `Doğru: ${target.word} (${target.tr})`;
      getAudio().playTone(justMastered ? 'mastered' : 'correct');
      getAudio().haptic('success');
      if (justMastered || goalJustCompleted) getEffects().celebrateFull();
      else getEffects().microBurst(btnEl);
    } else {
      fb.className = 'feedback-banner is-visible is-wrong';
      fb.textContent = `Duyduğun kelime: ${target.word} (${target.tr})`;
      getAudio().playTone('wrong');
      getAudio().haptic('error');
    }

    $('btn-listen-next').hidden = false;
    syncDashboard();
  }

  /* ==================== 2D. FLASHCARD (3D FLIP + POINTER DRAG + WCAG BUTTONS) ==================== */

  function clearFlashcardDragVisuals() {
    const card = $('fc-card');
    if (!card) return;
    card.classList.remove('is-dragging', 'drag-right', 'drag-left', 'dismiss-right', 'dismiss-left');
    card.removeAttribute('style');
  }

  function setFlashcardFlipped(flipped) {
    const st = state.activities.flashcard;
    st.flipped = Boolean(flipped);
    const card = $('fc-card');
    if (card) {
      card.classList.toggle('is-flipped', st.flipped);
      card.setAttribute('aria-pressed', String(st.flipped));
    }
  }

  function startFlashcardQuestion() {
    const pool = getStore().getState().pool;
    if (pool.length < 4) {
      showActivitiesMenu();
      return;
    }

    showActivityPanel('act-flashcard-view');
    const target = pickPoolWord(state.activities.lastWordKey, false);
    state.activities.lastWordKey = target.word.toLowerCase();

    const st = state.activities.flashcard;
    st.currentWord = target;
    st.evaluated = false;
    st.count += 1;

    clearFlashcardDragVisuals();
    setFlashcardFlipped(false);

    $('fc-step-badge').textContent = `Kart ${st.count}`;
    $('fc-word-level').textContent = target.level || 'B2';
    const masterySlot = $('fc-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(target.score));

    $('fc-word-text').textContent = target.word;
    $('fc-back-word').textContent = target.word;
    $('fc-meaning-text').textContent = target.tr;

    const sentBox = $('fc-sentence-box');
    if (target.sentence) {
      sentBox.hidden = false;
      highlightWord($('fc-sentence-text'), target.sentence, target.word);
    } else {
      sentBox.hidden = true;
    }

    $('fc-feedback').className = 'feedback-banner';
    $('fc-feedback').textContent = '';
  }

  function evaluateFlashcard(isKnown, triggerEl, opts = {}) {
    const st = state.activities.flashcard;
    if (!st.currentWord || st.evaluated) return;
    st.evaluated = true;

    const target = st.currentWord;
    const res = getSRS().recordAnswer(target, isKnown);
    const nextScore = res ? res.nextScore : target.score;
    const justMastered = Boolean(res && res.justMastered);
    const goalJustCompleted = Boolean(res && res.goalJustCompleted);
    trackSessionResult(target, isKnown, justMastered);

    const masterySlot = $('fc-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(nextScore));

    const fb = $('fc-feedback');
    if (isKnown) {
      fb.className = 'feedback-banner is-visible is-correct';
      fb.textContent = justMastered
        ? `"${target.word}" artık öğrenildi.`
        : `"${target.word}" kaydedildi (${nextScore}/5).`;
      getAudio().playTone(justMastered ? 'mastered' : 'correct');
      getAudio().haptic('success');
      if (justMastered || goalJustCompleted) getEffects().celebrateFull();
      else getEffects().microBurst(triggerEl || $('btn-fc-know'));
    } else {
      fb.className = 'feedback-banner is-visible is-wrong';
      fb.textContent = `"${target.word}" kısa süre sonra tekrar gelecek (${nextScore}/5).`;
      getAudio().playTone('wrong');
      getAudio().haptic('error');
    }

    syncDashboard();

    const card = $('fc-card');
    if (card) {
      card.removeAttribute('style');
      card.classList.remove('is-dragging', 'drag-right', 'drag-left');
      card.classList.add(isKnown ? 'dismiss-right' : 'dismiss-left');
    }

    const reducedMotion = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dismissDelay = reducedMotion ? 160 : 340;
    setTimeout(() => {
      if (state.activities.activeView !== 'act-flashcard-view') return;
      clearFlashcardDragVisuals();
      advanceActivity();
    }, dismissDelay);
  }

  function initFlashcardGesture() {
    const card = $('fc-card');
    if (!card) return;

    const drag = state.activities.flashcard.drag;

    const damp = (val) => {
      const limit = 130;
      const abs = Math.abs(val);
      if (abs <= limit) return val;
      const extra = abs - limit;
      return Math.sign(val) * (limit + extra * 0.35);
    };

    card.addEventListener('pointerdown', (e) => {
      if (state.activities.flashcard.evaluated) return;
      if (e.target.closest('button')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      drag.active = true;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.dx = 0;
      drag.startTime = performance.now();
      drag.moved = false;
      try { card.setPointerCapture(e.pointerId); } catch {}
    });

    card.addEventListener('pointermove', (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      const rawDx = e.clientX - drag.startX;
      const rawDy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(rawDx) < 8 && Math.abs(rawDy) < 8) return;

      if (!drag.moved && Math.abs(rawDy) > Math.abs(rawDx) * 1.3) {
        drag.active = false;
        return;
      }

      drag.moved = true;
      drag.dx = damp(rawDx);
      card.classList.add('is-dragging');
      card.classList.toggle('drag-right', drag.dx > 36);
      card.classList.toggle('drag-left', drag.dx < -36);

      const flipDeg = state.activities.flashcard.flipped ? 180 : 0;
      const rot = (drag.dx * 0.045).toFixed(2);
      card.style.transform = `translate3d(${drag.dx.toFixed(1)}px, 0, 0) rotate(${rot}deg) rotateY(${flipDeg}deg)`;
    });

    const finishDrag = (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      drag.active = false;
      try { card.releasePointerCapture(e.pointerId); } catch {}

      if (!drag.moved) {
        setFlashcardFlipped(!state.activities.flashcard.flipped);
        getAudio().haptic('light');
        return;
      }

      const elapsed = Math.max(1, performance.now() - drag.startTime);
      const velocity = Math.abs(drag.dx) / elapsed;

      if (velocity > 0.11 || Math.abs(drag.dx) > 95) {
        evaluateFlashcard(drag.dx > 0, card);
      } else {
        card.classList.remove('is-dragging', 'drag-right', 'drag-left');
        card.removeAttribute('style');
      }
    };

    card.addEventListener('pointerup', finishDrag);
    card.addEventListener('pointercancel', (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      drag.active = false;
      card.classList.remove('is-dragging', 'drag-right', 'drag-left');
      card.removeAttribute('style');
    });
  }

  /* ==================== 2E. YAZARAK PRATİK (SPELLING MODE) ==================== */

  function buildSpellingMask(word, revealedIndices) {
    const chars = Array.from(word);
    let letterCount = 0;
    const masked = chars.map((ch, idx) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      letterCount += 1;
      return revealedIndices.has(idx) ? ch : '_';
    });
    return `${masked.join(' ')} · ${letterCount} harf`;
  }

  function renderSpellingDiff(container, userRaw, targetWord) {
    container.textContent = '';
    const user = userRaw.trim().toLowerCase();
    const target = targetWord.trim().toLowerCase();
    const maxLen = Math.max(user.length, target.length);

    const row = document.createElement('div');
    row.className = 'spell-diff-row';
    row.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < maxLen; i++) {
      const uCh = user[i];
      const tCh = target[i];
      const cell = document.createElement('span');
      if (uCh !== undefined && tCh !== undefined && uCh === tCh) {
        cell.className = 'spell-char is-ok';
        cell.textContent = targetWord[i];
      } else if (uCh !== undefined && tCh !== undefined) {
        cell.className = 'spell-char is-err';
        cell.textContent = uCh;
      } else if (uCh === undefined && tCh !== undefined) {
        cell.className = 'spell-char is-missing';
        cell.textContent = targetWord[i];
      } else {
        cell.className = 'spell-char is-extra';
        cell.textContent = uCh;
      }
      row.appendChild(cell);
    }

    const note = document.createElement('p');
    note.className = 'spell-diff-note';
    note.textContent = user === target
      ? `Doğru yazdın: "${targetWord}"`
      : `Yazdığın: "${userRaw.trim() || 'boş'}", doğrusu: "${targetWord}"`;

    container.appendChild(row);
    container.appendChild(note);
  }

  function updateSpellingMaskUI() {
    const st = state.activities.spelling;
    if (!st.currentWord) return;
    const word = st.currentWord.word;
    $('spell-mask').textContent = buildSpellingMask(word, st.revealedIndices);

    const unrevealed = [];
    for (let i = 0; i < word.length; i++) {
      if (/[a-zA-Z]/.test(word[i]) && !st.revealedIndices.has(i)) {
        unrevealed.push(i);
      }
    }
    const hintBtn = $('btn-spell-hint');
    if (hintBtn) {
      hintBtn.disabled = st.answered || unrevealed.length === 0;
    }
  }

  function startSpellingQuestion() {
    const pool = getStore().getState().pool;
    if (pool.length < 4) {
      showActivitiesMenu();
      return;
    }

    showActivityPanel('act-spelling-view');
    const target = pickPoolWord(state.activities.lastWordKey, false);
    state.activities.lastWordKey = target.word.toLowerCase();

    const revealed = new Set();
    const word = target.word;
    const letterIndices = [];
    for (let i = 0; i < word.length; i++) {
      if (/[a-zA-Z]/.test(word[i])) letterIndices.push(i);
    }
    if (letterIndices.length >= 1) revealed.add(letterIndices[0]);
    if (letterIndices.length >= 4) revealed.add(letterIndices[letterIndices.length - 1]);

    state.activities.spelling = {
      currentWord: target,
      answered: false,
      revealedIndices: revealed
    };

    $('spell-word-level').textContent = target.level || 'B2';
    const masterySlot = $('spell-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(target.score));

    $('spell-meaning').textContent = target.tr;

    const sentBox = $('spell-sentence-box');
    if (target.sentence) {
      sentBox.hidden = false;
      $('spell-sentence-text').textContent = maskWordInSentence(target.sentence, target.word);
    } else {
      sentBox.hidden = true;
    }
    $('btn-spell-speak-word').hidden = true;
    $('btn-spell-speak-sentence').hidden = true;

    updateSpellingMaskUI();

    const input = $('spell-input');
    input.value = '';
    input.disabled = false;
    $('btn-spell-submit').disabled = false;

    $('spell-diff').hidden = true;
    $('spell-diff').textContent = '';
    $('spell-feedback').className = 'feedback-banner';
    $('spell-feedback').textContent = '';
    $('btn-spell-next').hidden = true;

    requestAnimationFrame(() => input.focus());
  }

  function handleSpellingHint() {
    const st = state.activities.spelling;
    if (!st.currentWord || st.answered) return;
    const word = st.currentWord.word;
    for (let i = 0; i < word.length; i++) {
      if (/[a-zA-Z]/.test(word[i]) && !st.revealedIndices.has(i)) {
        st.revealedIndices.add(i);
        break;
      }
    }
    updateSpellingMaskUI();
    getAudio().haptic('light');
  }

  function handleSpellingSubmit(event) {
    event.preventDefault();
    const st = state.activities.spelling;
    if (!st.currentWord) return;
    if (st.answered) {
      advanceActivity();
      return;
    }

    const input = $('spell-input');
    const userRaw = input.value.trim();
    const target = st.currentWord;
    const isCorrect = userRaw.toLowerCase() === target.word.trim().toLowerCase();

    st.answered = true;
    input.disabled = true;
    $('btn-spell-submit').disabled = true;
    $('btn-spell-hint').disabled = true;

    const res = getSRS().recordAnswer(target, isCorrect);
    const nextScore = res ? res.nextScore : target.score;
    const justMastered = Boolean(res && res.justMastered);
    const goalJustCompleted = Boolean(res && res.goalJustCompleted);
    trackSessionResult(target, isCorrect, justMastered);

    const masterySlot = $('spell-mastery-slot');
    masterySlot.textContent = '';
    masterySlot.appendChild(makeMasteryTray(nextScore));

    // Reveal full highlighted sentence & audio buttons
    if (target.sentence) {
      highlightWord($('spell-sentence-text'), target.sentence, target.word);
      $('btn-spell-speak-sentence').hidden = false;
    }
    $('btn-spell-speak-word').hidden = false;

    // Render character-by-character comparison
    const diffBox = $('spell-diff');
    renderSpellingDiff(diffBox, userRaw, target.word);
    diffBox.hidden = false;

    const fb = $('spell-feedback');
    if (isCorrect) {
      fb.className = 'feedback-banner is-visible is-correct';
      fb.textContent = justMastered
        ? `"${target.word}" artık öğrenildi.`
        : `Doğru: ${target.word}`;
      getAudio().playTone(justMastered ? 'mastered' : 'correct');
      getAudio().haptic('success');
      if (justMastered || goalJustCompleted) getEffects().celebrateFull();
      else getEffects().microBurst($('btn-spell-submit'));
    } else {
      fb.className = 'feedback-banner is-visible is-wrong';
      fb.textContent = `Doğru yazılış: ${target.word}`;
      getAudio().playTone('wrong');
      getAudio().haptic('error');
    }

    const nextBtn = $('btn-spell-next');
    nextBtn.hidden = false;
    requestAnimationFrame(() => nextBtn.focus());
    syncDashboard();
  }

  /* ==================== KEYBOARD & BACK/EXIT HANDLERS ==================== */

  function handleBackOrEscape(modalId) {
    if (modalId === 'modal-review') {
      if (state.review.active && shouldSummarizeOnExit()) {
        showReviewSummary();
        return true;
      }
      return false;
    }
    if (modalId === 'modal-activities') {
      if (state.activities.activeView !== 'act-menu-view' && state.activities.activeView !== 'act-summary-view' && shouldSummarizeOnExit()) {
        showActivitySummary();
        return true;
      }
      return false;
    }
    return false;
  }

  function handleKeydown(e, activeModal) {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (activeModal === 'modal-review' && state.review.active && !inInput) {
      if (['1', '2', '3', '4'].includes(e.key) && !state.review.answered) {
        const idx = Number(e.key) - 1;
        const btn = $('review-options').children[idx];
        if (btn) handleReviewAnswer(idx, btn, { instant: true });
        return true;
      }
      if (e.code === 'Space' && state.review.currentWord) {
        if (state.review.activeDirection === 'en-tr' || state.review.answered) {
          e.preventDefault();
          getAudio().speak(state.review.currentWord.word, { btnEl: $('btn-speak-word') });
          return true;
        }
      }
      if (e.key === 'Enter' && state.review.answered) {
        e.preventDefault();
        advanceReview();
        return true;
      }
    }

    if (activeModal === 'modal-activities') {
      const view = state.activities.activeView;

      if (view === 'act-fillblank-view' && !inInput) {
        if (['1', '2', '3', '4'].includes(e.key) && !state.activities.fillBlank.answered) {
          const idx = Number(e.key) - 1;
          const btn = $('fb-options').children[idx];
          if (btn) handleFillBlankAnswer(idx, btn, { instant: true });
          return true;
        }
        if (e.key === 'Enter' && state.activities.fillBlank.answered) {
          e.preventDefault();
          advanceActivity();
          return true;
        }
      }

      if (view === 'act-listening-view' && !inInput) {
        if (['1', '2', '3', '4'].includes(e.key) && !state.activities.listening.answered) {
          const idx = Number(e.key) - 1;
          const btn = $('listen-options').children[idx];
          if (btn) handleListeningAnswer(idx, btn, { instant: true });
          return true;
        }
        if (e.code === 'Space' && state.activities.listening.currentWord) {
          e.preventDefault();
          speakListeningWord($('btn-listen-play'));
          return true;
        }
        if (e.key === 'Enter' && state.activities.listening.answered) {
          e.preventDefault();
          advanceActivity();
          return true;
        }
      }

      if (view === 'act-flashcard-view' && !inInput) {
        if (e.code === 'Space') {
          e.preventDefault();
          setFlashcardFlipped(!state.activities.flashcard.flipped);
          getAudio().haptic('light');
          return true;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          evaluateFlashcard(true, $('btn-fc-know'));
          return true;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          evaluateFlashcard(false, $('btn-fc-again'));
          return true;
        }
      }

      if (view === 'act-spelling-view' && !inInput && e.key === 'Enter' && state.activities.spelling.answered) {
        e.preventDefault();
        advanceActivity();
        return true;
      }
    }

    return false;
  }

  /* ==================== INIT & BINDINGS ==================== */

  function init(callbacks = {}) {
    state.callbacks = { ...state.callbacks, ...callbacks };

    // Review direction segmented controls
    document.querySelectorAll('#review-direction-group [data-direction]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.review.direction = btn.dataset.direction;
        syncDirectionButtons();
        getAudio().haptic('light');
      });
    });

    const startBtn = $('btn-start-review');
    if (startBtn) startBtn.addEventListener('click', () => startReviewSession({ weakOnly: false }));

    const startWeakBtn = $('btn-start-weak-review');
    if (startWeakBtn) startWeakBtn.addEventListener('click', () => startReviewSession({ weakOnly: true }));

    const reviewBackBtn = $('btn-review-back');
    if (reviewBackBtn) {
      reviewBackBtn.addEventListener('click', () => {
        if (shouldSummarizeOnExit()) {
          showReviewSummary();
        } else {
          showReviewSetup();
        }
      });
    }

    const reviewNextBtn = $('btn-review-next');
    if (reviewNextBtn) reviewNextBtn.addEventListener('click', advanceReview);

    const speakWordBtn = $('btn-speak-word');
    if (speakWordBtn) {
      speakWordBtn.addEventListener('click', (e) => {
        if (state.review.currentWord) {
          getAudio().speak(state.review.currentWord.word, { btnEl: e.currentTarget });
        }
      });
    }

    const speakSentBtn = $('btn-speak-sentence');
    if (speakSentBtn) {
      speakSentBtn.addEventListener('click', (e) => {
        if (state.review.currentWord && state.review.currentWord.sentence) {
          getAudio().speak(state.review.currentWord.sentence, { btnEl: e.currentTarget });
        }
      });
    }

    const weakDoneSetup = $('btn-weak-done-setup');
    if (weakDoneSetup) weakDoneSetup.addEventListener('click', showReviewSetup);

    const weakDoneClose = $('btn-weak-done-close');
    if (weakDoneClose) weakDoneClose.addEventListener('click', () => state.callbacks.onCloseModal('modal-review'));

    // Activity menu cards
    document.querySelectorAll('[data-activity]').forEach((btn) => {
      btn.addEventListener('click', () => startActivityMode(btn.dataset.activity));
    });

    document.querySelectorAll('[data-act-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (shouldSummarizeOnExit()) {
          showActivitySummary();
        } else {
          showActivitiesMenu();
        }
      });
    });

    // Matching & Fill-Blank
    const matchNext = $('btn-match-next');
    if (matchNext) matchNext.addEventListener('click', () => advanceActivity());

    const fbNext = $('btn-fb-next');
    if (fbNext) fbNext.addEventListener('click', () => advanceActivity());

    const fbHint = $('btn-fb-hint');
    if (fbHint) {
      fbHint.addEventListener('click', () => {
        const st = state.activities.fillBlank;
        if (!st.currentWord) return;
        const hintBox = $('fb-hint-box');
        const firstLetter = st.currentWord.word.slice(0, 1).toUpperCase();
        hintBox.textContent = `Anlamı: ${st.currentWord.tr}. "${firstLetter}" harfiyle başlar, ${st.currentWord.word.length} harf.`;
        hintBox.hidden = false;
        st.hintShown = true;
        getAudio().haptic('light');
      });
    }

    const fbSpeakSent = $('btn-fb-speak-sentence');
    if (fbSpeakSent) {
      fbSpeakSent.addEventListener('click', (e) => {
        const w = state.activities.fillBlank.currentWord;
        if (w && w.sentence) getAudio().speak(w.sentence, { btnEl: e.currentTarget });
      });
    }

    // Listening
    const listenPlay = $('btn-listen-play');
    if (listenPlay) listenPlay.addEventListener('click', (e) => speakListeningWord(e.currentTarget));

    const listenSlow = $('btn-listen-slow');
    if (listenSlow) {
      listenSlow.addEventListener('click', () => {
        state.activities.listening.slowMode = !state.activities.listening.slowMode;
        listenSlow.setAttribute('aria-pressed', String(state.activities.listening.slowMode));
        getAudio().haptic('light');
        speakListeningWord($('btn-listen-play'));
      });
    }

    const listenSpeakSent = $('btn-listen-speak-sentence');
    if (listenSpeakSent) {
      listenSpeakSent.addEventListener('click', (e) => {
        const w = state.activities.listening.currentWord;
        if (w && w.sentence) getAudio().speak(w.sentence, { btnEl: e.currentTarget });
      });
    }

    const listenNext = $('btn-listen-next');
    if (listenNext) listenNext.addEventListener('click', () => advanceActivity());

    // Flashcard
    initFlashcardGesture();

    const fcFlip = $('btn-fc-flip');
    if (fcFlip) {
      fcFlip.addEventListener('click', () => {
        setFlashcardFlipped(!state.activities.flashcard.flipped);
        getAudio().haptic('light');
      });
    }

    const fcAgain = $('btn-fc-again');
    if (fcAgain) fcAgain.addEventListener('click', (e) => evaluateFlashcard(false, e.currentTarget));

    const fcKnow = $('btn-fc-know');
    if (fcKnow) fcKnow.addEventListener('click', (e) => evaluateFlashcard(true, e.currentTarget));

    const fcSpeakWord = $('btn-fc-speak-word');
    if (fcSpeakWord) {
      fcSpeakWord.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = state.activities.flashcard.currentWord;
        if (w) getAudio().speak(w.word, { btnEl: e.currentTarget });
      });
    }

    const fcSpeakSent = $('btn-fc-speak-sentence');
    if (fcSpeakSent) {
      fcSpeakSent.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = state.activities.flashcard.currentWord;
        if (w && w.sentence) getAudio().speak(w.sentence, { btnEl: e.currentTarget });
      });
    }

    // Spelling
    const spellForm = $('spell-form');
    if (spellForm) spellForm.addEventListener('submit', handleSpellingSubmit);

    const spellHint = $('btn-spell-hint');
    if (spellHint) spellHint.addEventListener('click', handleSpellingHint);

    const spellNext = $('btn-spell-next');
    if (spellNext) spellNext.addEventListener('click', () => advanceActivity());

    const spellSpeakWord = $('btn-spell-speak-word');
    if (spellSpeakWord) {
      spellSpeakWord.addEventListener('click', (e) => {
        const w = state.activities.spelling.currentWord;
        if (w) getAudio().speak(w.word, { btnEl: e.currentTarget });
      });
    }

    const spellSpeakSent = $('btn-spell-speak-sentence');
    if (spellSpeakSent) {
      spellSpeakSent.addEventListener('click', (e) => {
        const w = state.activities.spelling.currentWord;
        if (w && w.sentence) getAudio().speak(w.sentence, { btnEl: e.currentTarget });
      });
    }
  }

  root.WordyModes = {
    init,
    showReviewSetup,
    startReviewSession,
    showActivitiesMenu,
    startActivityMode,
    handleBackOrEscape,
    handleKeydown,
    syncWeakButtons,
    getSessionState: () => ({ ...state.session })
  };
})(typeof window !== 'undefined' ? window : globalThis);
