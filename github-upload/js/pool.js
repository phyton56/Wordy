(function (root) {
  'use strict';

  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const state = {
    filter: 'ALL',
    sort: 'recent',
    search: '',
    editingKey: null,
    pendingImportText: null,
    pendingImportName: '',
    lastExportedJSON: '',
    callbacks: {
      onChange: () => {},
      highlightWord: null,
      createMasteryTray: null
    }
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getStore() {
    return root.WordyStore;
  }

  function getAudio() {
    return root.WordyAudio;
  }

  function getEffects() {
    return root.WordyEffects;
  }

  function getDict() {
    return Array.isArray(root.WORDY_DICTIONARY) ? root.WORDY_DICTIONARY : [];
  }

  function findPoolEntry(word) {
    const key = String(word || '').trim().toLowerCase();
    return getStore().getState().pool.find((w) => w.word.toLowerCase() === key) || null;
  }

  function findDictEntry(word) {
    const key = String(word || '').trim().toLowerCase();
    return getDict().find((w) => w.word.toLowerCase() === key) || null;
  }

  function isValidWordSyntax(raw) {
    if (!raw || raw.length > 80) return false;
    return /^[a-zA-Z][a-zA-Z\s'-]*$/.test(raw);
  }

  function highlightSentence(el, sentence, targetWord) {
    if (typeof state.callbacks.highlightWord === 'function') {
      state.callbacks.highlightWord(el, sentence, targetWord);
      return;
    }
    el.textContent = sentence || '';
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

  function notifyChange() {
    if (typeof state.callbacks.onChange === 'function') {
      state.callbacks.onChange();
    }
  }

  function renderFilterPills() {
    const container = $('pool-filter-pills');
    if (!container) return;
    container.textContent = '';
    const filters = ['ALL', ...LEVELS];
    filters.forEach((code) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-pill';
      btn.textContent = code === 'ALL' ? 'Tümü' : code;
      btn.setAttribute('aria-pressed', String(state.filter === code));
      btn.addEventListener('click', () => {
        state.filter = code;
        renderFilterPills();
        renderList();
      });
      container.appendChild(btn);
    });
  }

  function createInlineEditForm(item) {
    const form = document.createElement('form');
    form.className = 'pool-edit-form';
    form.noValidate = true;

    const head = document.createElement('div');
    head.className = 'pool-edit-head';
    const heading = document.createElement('span');
    heading.className = 'pool-edit-title';
    heading.textContent = `"${item.word}" kartını düzenle`;
    head.appendChild(heading);
    form.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'pool-edit-grid';

    // Turkish meaning field
    const trField = document.createElement('div');
    trField.className = 'form-field';
    const trLabel = document.createElement('label');
    const trId = `edit-tr-${item.word.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    trLabel.setAttribute('for', trId);
    trLabel.className = 'field-label';
    trLabel.textContent = 'Türkçe Anlam';
    const trInput = document.createElement('input');
    trInput.type = 'text';
    trInput.id = trId;
    trInput.className = 'text-input text-input-sm';
    trInput.value = item.tr;
    trInput.maxLength = 240;
    trInput.required = true;
    trField.appendChild(trLabel);
    trField.appendChild(trInput);

    // CEFR level select
    const lvlField = document.createElement('div');
    lvlField.className = 'form-field form-field-level';
    const lvlLabel = document.createElement('label');
    const lvlId = `edit-lvl-${item.word.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    lvlLabel.setAttribute('for', lvlId);
    lvlLabel.className = 'field-label';
    lvlLabel.textContent = 'Seviye';
    const lvlSelect = document.createElement('select');
    lvlSelect.id = lvlId;
    lvlSelect.className = 'select-input';
    LEVELS.forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l;
      if (l === (item.level || 'B2')) opt.selected = true;
      lvlSelect.appendChild(opt);
    });
    lvlField.appendChild(lvlLabel);
    lvlField.appendChild(lvlSelect);

    grid.appendChild(trField);
    grid.appendChild(lvlField);
    form.appendChild(grid);

    // Sentence field
    const sentField = document.createElement('div');
    sentField.className = 'form-field';
    const sentLabel = document.createElement('label');
    const sentId = `edit-sent-${item.word.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    sentLabel.setAttribute('for', sentId);
    sentLabel.className = 'field-label';
    sentLabel.textContent = 'Örnek Cümle (isteğe bağlı)';
    const sentInput = document.createElement('input');
    sentInput.type = 'text';
    sentInput.id = sentId;
    sentInput.className = 'text-input text-input-sm';
    sentInput.value = item.sentence || '';
    sentInput.maxLength = 500;
    sentField.appendChild(sentLabel);
    sentField.appendChild(sentInput);
    form.appendChild(sentField);

    const errEl = document.createElement('div');
    errEl.className = 'form-status is-error';
    errEl.setAttribute('role', 'status');
    errEl.setAttribute('aria-live', 'polite');
    errEl.hidden = true;
    form.appendChild(errEl);

    const actions = document.createElement('div');
    actions.className = 'pool-edit-actions';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn-primary btn-compact';
    saveBtn.textContent = 'Kaydet';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-secondary btn-compact';
    cancelBtn.textContent = 'Vazgeç';
    cancelBtn.addEventListener('click', () => {
      state.editingKey = null;
      renderList();
    });

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    form.appendChild(actions);

    form.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        state.editingKey = null;
        renderList();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nextTr = trInput.value.trim();
      const nextLevel = lvlSelect.value;
      const nextSentence = sentInput.value.trim();

      if (!nextTr) {
        errEl.textContent = 'Türkçe anlam boş bırakılamaz.';
        errEl.hidden = false;
        trInput.focus();
        return;
      }

      getStore().upsertWord({
        ...item,
        tr: nextTr,
        level: nextLevel,
        sentence: nextSentence
      });

      state.editingKey = null;
      getAudio().haptic('success');
      renderList();
      notifyChange();
      getEffects().showToast(`"${item.word}" güncellendi.`, { duration: 2400 });
    });

    requestAnimationFrame(() => trInput.focus());
    return form;
  }

  function renderList() {
    const listEl = $('pool-list');
    if (!listEl) return;

    const pool = getStore().getState().pool.slice();
    const query = state.search.trim().toLocaleLowerCase('tr');

    let filtered = state.filter === 'ALL'
      ? pool
      : pool.filter((w) => w.level === state.filter);

    if (query) {
      filtered = filtered.filter((w) => {
        const wText = (w.word || '').toLowerCase();
        const trText = (w.tr || '').toLocaleLowerCase('tr');
        const sentText = (w.sentence || '').toLowerCase();
        return wText.includes(query) || trText.includes(query) || sentText.includes(query);
      });
    }

    if (state.sort === 'score-asc') {
      filtered.sort((a, b) => a.score - b.score || a.word.localeCompare(b.word));
    } else if (state.sort === 'score-desc') {
      filtered.sort((a, b) => b.score - a.score || a.word.localeCompare(b.word));
    } else if (state.sort === 'alpha') {
      filtered.sort((a, b) => a.word.localeCompare(b.word));
    }

    listEl.textContent = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const title = document.createElement('h3');
      title.className = 'empty-state-title';
      const desc = document.createElement('p');
      desc.className = 'empty-state-desc';

      if (pool.length === 0) {
        title.textContent = 'Havuzun henüz boş';
        desc.textContent = 'Yukarıdan kelime ekle ya da Tekrar Et ile çalışmaya başla.';
      } else if (query) {
        title.textContent = 'Eşleşen kelime bulunamadı';
        desc.textContent = `"${state.search.trim()}" için farklı bir kelime veya seviye dene.`;
      } else {
        title.textContent = 'Bu seviyede kelime yok';
        desc.textContent = 'Başka bir seviye seç veya yeni kelime ekle.';
      }

      empty.appendChild(title);
      empty.appendChild(desc);
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'pool-item';
      card.dataset.wordKey = item.word.toLowerCase();

      const top = document.createElement('div');
      top.className = 'pool-item-top';

      const wordGroup = document.createElement('div');
      wordGroup.className = 'pool-word-group';

      const wordTitle = document.createElement('h3');
      wordTitle.className = 'pool-word';
      wordTitle.textContent = item.word;

      const lvlBadge = document.createElement('span');
      lvlBadge.className = 'cefr-chip';
      lvlBadge.textContent = item.level || 'B2';

      wordGroup.appendChild(wordTitle);
      wordGroup.appendChild(lvlBadge);
      top.appendChild(wordGroup);
      top.appendChild(makeMasteryTray(item.score));
      card.appendChild(top);

      if (state.editingKey === item.word.toLowerCase()) {
        card.appendChild(createInlineEditForm(item));
        listEl.appendChild(card);
        return;
      }

      const meaning = document.createElement('p');
      meaning.className = 'pool-meaning';
      meaning.textContent = item.tr;
      card.appendChild(meaning);

      if (item.sentence) {
        const sentenceEl = document.createElement('p');
        sentenceEl.className = 'pool-sentence';
        highlightSentence(sentenceEl, item.sentence, item.word);
        card.appendChild(sentenceEl);
      }

      const actions = document.createElement('div');
      actions.className = 'pool-item-actions';

      const audioGroup = document.createElement('div');
      audioGroup.className = 'pool-audio-group';

      const speakWordBtn = document.createElement('button');
      speakWordBtn.type = 'button';
      speakWordBtn.className = 'icon-btn-subtle';
      speakWordBtn.textContent = 'Kelimeyi Dinle';
      speakWordBtn.addEventListener('click', () => getAudio().speak(item.word, { btnEl: speakWordBtn }));
      audioGroup.appendChild(speakWordBtn);

      if (item.sentence) {
        const speakSentBtn = document.createElement('button');
        speakSentBtn.type = 'button';
        speakSentBtn.className = 'icon-btn-subtle';
        speakSentBtn.textContent = 'Cümleyi Dinle';
        speakSentBtn.addEventListener('click', () => getAudio().speak(item.sentence, { btnEl: speakSentBtn }));
        audioGroup.appendChild(speakSentBtn);
      }

      const manageGroup = document.createElement('div');
      manageGroup.className = 'pool-manage-group';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'icon-btn-subtle';
      editBtn.setAttribute('aria-label', `${item.word} kelimesini düzenle`);
      editBtn.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg><span>Düzenle</span>';
      editBtn.addEventListener('click', () => {
        state.editingKey = item.word.toLowerCase();
        renderList();
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'icon-btn-subtle icon-btn-danger';
      removeBtn.setAttribute('aria-label', `${item.word} kelimesini havuzdan sil`);
      removeBtn.textContent = 'Sil';
      removeBtn.addEventListener('click', () => {
        const removed = getStore().removeWord(item.word);
        if (!removed) return;
        getAudio().haptic('light');
        renderList();
        notifyChange();
        getEffects().showToast(`"${removed.item.word}" havuzdan silindi.`, {
          actionLabel: 'Geri Al',
          duration: 5000,
          onAction: () => {
            getStore().restoreWord(removed.item, removed.index);
            renderList();
            notifyChange();
          }
        });
      });

      manageGroup.appendChild(editBtn);
      manageGroup.appendChild(removeBtn);

      actions.appendChild(audioGroup);
      actions.appendChild(manageGroup);
      card.appendChild(actions);
      listEl.appendChild(card);
    });
  }

  /* ==================== CUSTOM WORD COMPOSER ==================== */

  function openCustomComposer({ word, enDefinition = '', example = '', note = '' }) {
    const composer = $('pool-custom-composer');
    if (!composer) return;

    const wordInput = $('custom-word-input');
    const enRef = $('custom-en-ref');
    const trInput = $('custom-tr-input');
    const levelSelect = $('custom-level-select');
    const sentInput = $('custom-sentence-input');
    const errEl = $('custom-composer-error');

    wordInput.value = word;
    trInput.value = '';
    levelSelect.value = 'B2';
    sentInput.value = example || '';
    errEl.textContent = '';
    errEl.hidden = true;

    if (enDefinition) {
      enRef.textContent = `İngilizce tanım: ${enDefinition}`;
      enRef.hidden = false;
    } else if (note) {
      enRef.textContent = note;
      enRef.hidden = false;
    } else {
      enRef.textContent = '';
      enRef.hidden = true;
    }

    composer.hidden = false;
    requestAnimationFrame(() => trInput.focus());
  }

  function closeCustomComposer() {
    const composer = $('pool-custom-composer');
    if (composer) composer.hidden = true;
    const errEl = $('custom-composer-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.hidden = true;
    }
  }

  async function handleAddSubmit(event) {
    event.preventDefault();
    const input = $('pool-add-input');
    const statusEl = $('pool-add-status');
    const submitBtn = $('btn-pool-add');
    const raw = input.value.trim();

    statusEl.className = 'form-status';
    if (!raw) {
      statusEl.className = 'form-status is-error';
      statusEl.textContent = 'Bir İngilizce kelime yaz.';
      return;
    }

    if (!isValidWordSyntax(raw)) {
      statusEl.className = 'form-status is-error';
      statusEl.textContent = 'Sadece harf, boşluk veya tire kullan.';
      return;
    }

    const existing = findPoolEntry(raw);
    if (existing) {
      statusEl.className = 'form-status is-error';
      statusEl.textContent = `"${existing.word}" zaten havuzunda var.`;
      return;
    }

    const dictMatch = findDictEntry(raw);
    if (dictMatch) {
      closeCustomComposer();
      getStore().upsertWord({
        word: dictMatch.word,
        tr: dictMatch.tr,
        sentence: dictMatch.sentence || '',
        level: dictMatch.level || 'B2',
        score: 1,
        wrongCount: 0,
        custom: false
      });
      input.value = '';
      statusEl.className = 'form-status is-success';
      statusEl.textContent = `"${dictMatch.word}" (${dictMatch.level}) havuzuna eklendi.`;
      getAudio().playTone('correct');
      getAudio().haptic('success');
      renderList();
      notifyChange();
      return;
    }

    // Lookup English reference on dictionaryapi.dev, but NEVER force English definition into Turkish field!
    submitBtn.disabled = true;
    statusEl.textContent = `"${raw}" sözlükte aranıyor...`;

    let apiWord = raw;
    let enDefinition = '';
    let apiExample = '';
    let note = '';

    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 4500) : null;
      const resp = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(raw.toLowerCase())}`,
        controller ? { signal: controller.signal } : undefined
      );
      if (timer) clearTimeout(timer);

      if (resp.ok) {
        const data = await resp.json();
        const first = Array.isArray(data) ? data[0] : null;
        if (first && typeof first.word === 'string' && first.word.trim()) {
          apiWord = first.word.trim();
        }
        const meanings = first && Array.isArray(first.meanings) ? first.meanings : [];
        for (const m of meanings) {
          const defs = Array.isArray(m.definitions) ? m.definitions : [];
          for (const d of defs) {
            if (!enDefinition && d.definition) enDefinition = d.definition;
            if (!apiExample && d.example) apiExample = d.example;
            if (enDefinition && apiExample) break;
          }
          if (enDefinition && apiExample) break;
        }
      } else {
        note = 'Sözlükte bulunamadı. Türkçe anlamını yazıp kendin ekleyebilirsin.';
      }
    } catch {
      note = 'Sözlüğe ulaşılamadı. Anlamını yazıp kendin ekleyebilirsin.';
    } finally {
      submitBtn.disabled = false;
    }

    statusEl.textContent = 'Türkçe anlamını ve seviyesini girip kaydet.';
    openCustomComposer({
      word: apiWord,
      enDefinition,
      example: apiExample,
      note
    });
  }

  function handleCustomSave(event) {
    event.preventDefault();
    const wordVal = $('custom-word-input').value.trim();
    const trVal = $('custom-tr-input').value.trim();
    const levelVal = $('custom-level-select').value;
    const sentVal = $('custom-sentence-input').value.trim();
    const errEl = $('custom-composer-error');
    const statusEl = $('pool-add-status');

    if (!isValidWordSyntax(wordVal)) {
      errEl.textContent = 'Geçerli bir İngilizce kelime gir.';
      errEl.hidden = false;
      $('custom-word-input').focus();
      return;
    }
    if (!trVal) {
      errEl.textContent = 'Türkçe anlamı yaz.';
      errEl.hidden = false;
      $('custom-tr-input').focus();
      return;
    }
    if (findPoolEntry(wordVal)) {
      errEl.textContent = `"${wordVal}" zaten havuzunda var.`;
      errEl.hidden = false;
      return;
    }

    getStore().upsertWord({
      word: wordVal,
      tr: trVal,
      sentence: sentVal,
      level: levelVal,
      score: 1,
      wrongCount: 0,
      custom: true
    });

    closeCustomComposer();
    $('pool-add-input').value = '';
    statusEl.className = 'form-status is-success';
    statusEl.textContent = `"${wordVal}" (${levelVal}) havuzuna eklendi.`;
    getAudio().playTone('correct');
    getAudio().haptic('success');
    renderList();
    notifyChange();
  }

  /* ==================== JSON BACKUP / RESTORE ==================== */

  function exportBackup() {
    const json = getStore().exportJSON();
    state.lastExportedJSON = json;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = `wordy-backup-${dateStr}.json`;

    try {
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      getEffects().showToast(`Yedek indirildi: ${filename}`, { duration: 3000 });
    } catch {
      getEffects().showToast('Yedek dosyası oluşturulamadı.', { duration: 3000, tone: 'danger' });
    }
  }

  function clearImportChooser() {
    state.pendingImportText = null;
    state.pendingImportName = '';
    const chooser = $('pool-import-chooser');
    if (chooser) chooser.hidden = true;
    const fileInput = $('pool-import-file');
    if (fileInput) fileInput.value = '';
  }

  function handleImportFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const statusEl = $('pool-import-status');
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    const reader = new FileReader();
    reader.onload = () => {
      state.pendingImportText = typeof reader.result === 'string' ? reader.result : '';
      state.pendingImportName = file.name || 'yedek.json';
      $('pool-import-filename').textContent = `Seçilen dosya: ${state.pendingImportName}`;
      $('pool-import-chooser').hidden = false;
    };
    reader.onerror = () => {
      statusEl.className = 'form-status is-error';
      statusEl.textContent = 'Dosya okunamadı.';
      getEffects().showToast('Yedek dosyası okunamadı.', { duration: 3200, tone: 'danger' });
      clearImportChooser();
    };
    reader.readAsText(file, 'utf-8');
  }

  function executeImport(mode) {
    const statusEl = $('pool-import-status');
    if (state.pendingImportText === null) return;

    const result = getStore().importJSON(state.pendingImportText, mode);
    clearImportChooser();

    if (!result.ok) {
      statusEl.className = 'form-status is-error';
      statusEl.textContent = result.error;
      getAudio().playTone('wrong');
      getEffects().showToast(result.error, { duration: 4200, tone: 'danger' });
      return;
    }

    const msg = mode === 'replace'
      ? `Havuz yedekten geri yüklendi (${result.total} kelime).`
      : `İçe aktarma tamamlandı: ${result.added} yeni, ${result.updated} güncellendi.`;
    statusEl.className = 'form-status is-success';
    statusEl.textContent = msg;
    getAudio().playTone('correct');
    getAudio().haptic('success');
    renderList();
    notifyChange();
    getEffects().showToast(msg, { duration: 3600 });
  }

  /* ==================== HOLD TO RESET ==================== */

  function initHoldToConfirmReset() {
    const btn = $('btn-reset-pool');
    if (!btn) return;
    let holdTimer = null;
    let holding = false;

    const cancelHold = (notifyShortPress) => {
      if (!holding) return;
      holding = false;
      btn.classList.remove('is-holding');
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
        if (notifyShortPress) {
          getEffects().showToast('Sıfırlamak için basılı tut.', { duration: 2400 });
        }
      }
    };

    const startHold = () => {
      if (holding) return;
      if (getStore().getState().pool.length === 0) {
        getEffects().showToast('Havuzun zaten boş.', { duration: 2200 });
        return;
      }
      holding = true;
      btn.classList.add('is-holding');
      holdTimer = setTimeout(() => {
        holdTimer = null;
        holding = false;
        btn.classList.remove('is-holding');
        getStore().resetPool();
        state.editingKey = null;
        getAudio().haptic('error');
        renderList();
        notifyChange();
        getEffects().showToast('Kelime havuzu sıfırlandı.', { duration: 3200 });
      }, 1500);
    };

    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      startHold();
    });
    btn.addEventListener('pointerup', () => cancelHold(true));
    btn.addEventListener('pointerleave', () => cancelHold(false));
    btn.addEventListener('pointercancel', () => cancelHold(false));

    btn.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        startHold();
      }
    });
    btn.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        cancelHold(true);
      }
    });
  }

  function init(callbacks = {}) {
    state.callbacks = { ...state.callbacks, ...callbacks };

    const addForm = $('pool-add-form');
    if (addForm) addForm.addEventListener('submit', handleAddSubmit);

    const customForm = $('pool-custom-form');
    if (customForm) customForm.addEventListener('submit', handleCustomSave);

    const customCancel = $('btn-custom-cancel');
    if (customCancel) customCancel.addEventListener('click', closeCustomComposer);

    const searchInput = $('pool-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.search = e.target.value || '';
        renderList();
      });
    }

    const sortSelect = $('pool-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sort = e.target.value;
        renderList();
      });
    }

    const exportBtn = $('btn-pool-export');
    if (exportBtn) exportBtn.addEventListener('click', exportBackup);

    const importTrigger = $('btn-pool-import-trigger');
    const importFile = $('pool-import-file');
    if (importTrigger && importFile) {
      importTrigger.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', handleImportFileSelected);
    }

    const mergeBtn = $('btn-import-merge');
    if (mergeBtn) mergeBtn.addEventListener('click', () => executeImport('merge'));

    const replaceBtn = $('btn-import-replace');
    if (replaceBtn) replaceBtn.addEventListener('click', () => executeImport('replace'));

    const cancelImportBtn = $('btn-import-cancel');
    if (cancelImportBtn) cancelImportBtn.addEventListener('click', clearImportChooser);

    initHoldToConfirmReset();
  }

  function open() {
    state.editingKey = null;
    closeCustomComposer();
    clearImportChooser();
    const statusEl = $('pool-add-status');
    if (statusEl) {
      statusEl.className = 'form-status';
      statusEl.textContent = '';
    }
    const importStatus = $('pool-import-status');
    if (importStatus) {
      importStatus.className = 'form-status';
      importStatus.textContent = '';
    }
    renderFilterPills();
    renderList();
  }

  root.WordyPool = {
    init,
    open,
    renderList,
    renderFilterPills,
    isEditing: () => Boolean(state.editingKey),
    cancelEditing: () => {
      state.editingKey = null;
      renderList();
    },
    getLastExport: () => state.lastExportedJSON
  };
})(typeof window !== 'undefined' ? window : globalThis);
