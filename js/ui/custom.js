/* ============================================================
   IMPARO A LEGGERE - MODO E: PAROLE PERSONALIZZATE
   Parole scelte dal genitore (nomi della famiglia, oggetti della
   casa, parole del quaderno…) che girano in ordine casuale.
   - Aggiunta e rimozione libera, salvataggio automatico sul
     dispositivo (localStorage, nessun dato online).
   - Esercizio: parola grande, CORRETTO (+stellina) / RITENTA,
     NUOVO per cambiare parola a piacere.
   - Sezione svincolata da lettere attive e livelli: la parola
     è stato scelto apposta da un adulto.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Custom = (function () {
  const el = IAL.UI.el;
  let current = null;

  function show() {
    const p = IAL.Store.active();
    if (!p) { IAL.Home.show(); return; }
    if (!(p.customWords || []).length) { manage(); return; }
    current = null;
    render();
    next();
  }

  // ---------- Schermata esercizio ----------
  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu'])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type', id: 'cm-type' }, ['…']),
      el('div', { class: 'big-word', id: 'cm-word' }, ['—']),
      el('div', { class: 'feedback-msg', id: 'cm-msg' }, ['']),
      el('div', { class: 'actions', id: 'cm-actions' }, [
        el('button', { class: 'btn btn-green', onclick: markCorrect }, ['✅', 'CORRETTO']),
        el('button', { class: 'btn btn-danger', onclick: retry }, ['💪', 'RITENTA']),
        el('button', { class: 'btn btn-primary', onclick: next }, ['🔄', 'NUOVO'])
      ])
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['PAROLE PERSONALIZZATE']),
      card,
      el('p', { class: 'progress-note', id: 'cm-note' }, ['']),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: manage }, ['📝 GESTISCI LE PAROLE']),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);
  }

  function next() {
    const p = IAL.Store.active();
    const ex = IAL.Engine.nextCustom(p);

    const typeEl = document.getElementById('cm-type');
    const wordEl = document.getElementById('cm-word');
    const msgEl = document.getElementById('cm-msg');
    if (!wordEl) return;

    if (!ex) {
      current = null;
      if (typeEl) typeEl.textContent = 'Nessuna parola';
      wordEl.textContent = '🤔';
      wordEl.className = 'big-word';
      if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
      updateNote('Aggiungi parole con 📝 GESTISCI LE PAROLE');
      return;
    }

    current = ex;
    if (typeEl) typeEl.textContent = ex.typeLabel;
    wordEl.textContent = ex.text;
    wordEl.className = 'big-word';
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
    updateNote();
  }

  function markCorrect() {
    if (!current) { next(); return; }
    const p = IAL.Store.active();
    IAL.Store.record(p, current, true);
    IAL.UI.starBurst('⭐');
    const msgEl = document.getElementById('cm-msg');
    if (msgEl) { msgEl.textContent = IAL.UI.praise(); msgEl.className = 'feedback-msg'; }
    updateNote();
    setTimeout(next, 900);
  }

  function retry() {
    if (!current) return;
    const p = IAL.Store.active();
    IAL.Store.record(p, current, false);
    const wordEl = document.getElementById('cm-word');
    const msgEl = document.getElementById('cm-msg');
    if (wordEl) wordEl.className = 'big-word shake';
    if (msgEl) { msgEl.textContent = IAL.UI.retryMsg(); msgEl.className = 'feedback-msg try'; }
    updateNote();
  }

  function updateNote(forced) {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('cm-note');
    if (!noteEl) return;
    noteEl.textContent = forced ||
      '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  // ---------- Gestione delle parole ----------
  function normalizeWord(raw) {
    return String(raw || '').toUpperCase()
      .replace(/[ÀÁÂÃÄÅ]/g, 'A').replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I').replace(/[ÒÓÔÖØ]/g, 'O')
      .replace(/[ÙÚÛÜ]/g, 'U').replace(/[^A-Z]/g, '');
  }

  // ---------- Aggiunta da FOTO (OCR sul dispositivo) ----------
  function startPhoto(file) {
    IAL.UI.renderScreen([
      el('div', { class: 'topbar' }, [
        el('button', { class: 'chip', onclick: function () { manage(); } }, ['↩️ Indietro'])
      ]),
      el('h1', { class: 'app-title' }, ['LEGGI LA FOTO']),
      el('div', { class: 'panel' }, [
        el('h2', {}, ['Sto leggendo la foto…']),
        el('p', { class: 'hint' }, [
          'La foto resta sul telefono: nessuna immagine viene inviata a internet.'
        ]),
        el('div', { class: 'ocr-bar' }, [el('div', { class: 'ocr-bar-fill', id: 'ocr-bar' })]),
        el('p', { class: 'ocr-status', id: 'ocr-status' }, ['Preparo la foto…'])
      ])
    ]);

    IAL.OCR.recognize(file, function (label, pct) {
      const bar = document.getElementById('ocr-bar');
      const status = document.getElementById('ocr-status');
      if (bar) bar.style.width = Math.round(pct * 100) + '%';
      if (status && label) status.textContent = label;
    }).then(function (res) {
      photoReview(res.words);
    }).catch(function (err) {
      photoError(err);
    });
  }

  function photoError(err) {
    IAL.UI.renderScreen([
      el('div', { class: 'topbar' }, [
        el('button', { class: 'chip', onclick: function () { manage(); } }, ['↩️ Indietro'])
      ]),
      el('h1', { class: 'app-title' }, ['LEGGI LA FOTO']),
      el('div', { class: 'panel' }, [
        el('div', { class: 'big-emoji' }, ['😕']),
        el('h3', {}, ['Non riesco a leggere la foto']),
        el('p', { class: 'hint' }, [String((err && err.message) || 'Riprova con un’altra foto.')]),
        el('p', { class: 'hint' }, [
          'Consigli: buona luce, foglio appoggiato su un piano, foto dall’alto e parole ben leggibili.'
        ]),
        el('div', { class: 'opt-row' }, [
          el('button', { class: 'btn btn-green', onclick: function () { manage(); } }, ['🔁 Riprova']),
          el('button', { class: 'btn btn-soft', onclick: function () { manage(); } }, ['✍️ Scrivi a mano'])
        ])
      ])
    ]);
  }

  function photoReview(found) {
    const p = IAL.Store.active();
    const existing = (p.customWords || []).slice();
    const candidates = (found || []).filter(function (w) { return existing.indexOf(w) === -1; });
    const skipped = (found || []).length - candidates.length;

    if (!candidates.length) {
      IAL.UI.renderScreen([
        el('div', { class: 'topbar' }, [
          el('button', { class: 'chip', onclick: function () { manage(); } }, ['↩️ Indietro'])
        ]),
        el('h1', { class: 'app-title' }, ['LEGGI LA FOTO']),
        el('div', { class: 'panel' }, [
          el('div', { class: 'big-emoji' }, ['🔍']),
          el('h3', {}, ['Nessuna parola nuova']),
          el('p', { class: 'hint' }, [
            found.length
              ? 'Le parole della foto sono già tutte nel tuo elenco. 😊'
              : 'Non ho trovato parole leggibili. Prova con una foto più vicina, con buona luce e il foglio ben dritto.'
          ]),
          el('div', { class: 'opt-row' }, [
            el('button', { class: 'btn btn-green', onclick: function () { manage(); } }, ['📷 Prova un’altra foto']),
            el('button', { class: 'btn btn-soft', onclick: function () { manage(); } }, ['↩️ Indietro'])
          ])
        ])
      ]);
      return;
    }

    const list = el('div', { class: 'custom-list', id: 'cm-found' }, candidates.map(function (w) {
      return el('div', { class: 'custom-word-row' }, [
        el('input', {
          type: 'text', class: 'cw-input', maxlength: '12', value: w,
          autocomplete: 'off', 'aria-label': 'Parola ' + w
        }),
        el('button', {
          class: 'btn btn-danger btn-sm',
          'aria-label': 'Togli ' + w,
          onclick: function (e) {
            const row = e.currentTarget.parentNode;
            if (row && row.parentNode) row.parentNode.removeChild(row);
            updateCount();
          }
        }, ['🗑️'])
      ]);
    }));

    const countEl = el('p', { class: 'progress-note', id: 'cm-found-count' }, ['']);

    function currentRows() {
      return Array.prototype.slice.call(document.querySelectorAll('#cm-found input.cw-input'));
    }

    function updateCount() {
      const n = currentRows().length;
      if (countEl) countEl.textContent = n ? n + ' parole da aggiungere' : 'Nessuna parola selezionata';
    }

    function addAll() {
      const words = [];
      currentRows().forEach(function (input) {
        const w = normalizeWord(input.value);
        if (w.length < 2) return;
        if (words.indexOf(w) === -1) words.push(w);
      });
      if (!words.length) { IAL.UI.toast('Nessuna parola da aggiungere ✏️'); return; }

      let added = 0, dup = 0;
      IAL.Store.updateActive(function (pr) {
        pr.customWords = pr.customWords || [];
        words.forEach(function (w) {
          if (pr.customWords.indexOf(w) !== -1) { dup++; return; }
          pr.customWords.push(w);
          added++;
        });
      });

      if (!added) { IAL.UI.toast('Erano già tutte in elenco 😊'); manage(); return; }
      IAL.UI.toast(added + (added === 1 ? ' parola aggiunta' : ' parole aggiunte') +
        (dup ? ' · ' + dup + ' già presenti' : '') + ' ✅');
      manage();
    }

    IAL.UI.renderScreen([
      el('div', { class: 'topbar' }, [
        el('button', { class: 'chip', onclick: function () { manage(); } }, ['↩️ Indietro'])
      ]),
      el('h1', { class: 'app-title' }, ['PAROLE TROVATE']),
      el('div', { class: 'panel' }, [
        el('h2', {}, ['Controlla le parole']),
        el('p', { class: 'hint' }, [
          'Queste sono le parole lette nella foto. Correggile se serve e togli con 🗑️ ',
          'quelle sbagliate: verranno aggiunte solo quando tocchi «Aggiungi».'
        ]),
        skipped
          ? el('div', { class: 'note' }, [
              'ℹ️ ' + skipped + (skipped === 1 ? ' parola era già' : ' parole erano già') + ' nel tuo elenco: saltata.'
            ])
          : null,
        list,
        countEl,
        el('div', { class: 'opt-row', style: 'margin-top:12px' }, [
          el('button', { class: 'btn btn-green', onclick: addAll }, ['➕ Aggiungi le parole']),
          el('button', { class: 'btn btn-soft', onclick: function () { manage(); } }, ['↩️ Indietro'])
        ])
      ])
    ]);

    updateCount();
  }

  // ---------- Cancella tutto ----------
  function clearAll() {
    const p = IAL.Store.active();
    const n = (p.customWords || []).length;
    if (!n) { IAL.UI.toast('L’elenco è già vuoto 😊'); return; }
    IAL.UI.confirmModal(
      'Cancellare tutte le parole?',
      'Verranno rimosse tutte le ' + n + ' parole di «Parole personalizzate». Le stelline e i progressi restano.',
      function () {
        IAL.Store.updateActive(function (pr) { pr.customWords = []; });
        IAL.UI.toast('Elenco svuotato 🗑️');
        manage();
      },
      'Sì, cancella tutto'
    );
  }

  function manage() {
    const p = IAL.Store.active();
    const list = (p.customWords || []).slice();
    const input = el('input', {
      type: 'text', maxlength: '12', placeholder: 'Es. NONNA',
      autocomplete: 'off', id: 'cm-new-word'
    });

    // Foto → parole (il file resta sul dispositivo)
    // Due campi distinti: uno apre SUBITO la fotocamera (scatto in tempo reale),
    // l'altro la galleria delle foto già scattate.
    function takeFile(input) {
      const file = (input.files && input.files[0]) || null;
      if (input.value !== '') input.value = '';   // permette di riscegliere lo stesso file
      if (file) startPhoto(file);
    }

    const camInput = el('input', {
      type: 'file', accept: 'image/*', capture: 'environment',
      id: 'cm-photo-cam', class: 'photo-input',
      'aria-label': 'Scatta la foto con la fotocamera',
      onchange: function () { takeFile(camInput); }
    });

    const fileInput = el('input', {
      type: 'file', accept: 'image/*', id: 'cm-photo',
      class: 'photo-input', 'aria-label': 'Scegli una foto già scattata',
      onchange: function () { takeFile(fileInput); }
    });

    function addFromInput() {
      const w = normalizeWord(input.value);
      if (w.length < 2) { IAL.UI.toast('Scrivi una parola (solo lettere) ✏️'); return; }
      if ((p.customWords || []).indexOf(w) !== -1) { IAL.UI.toast('Parola già presente 😊'); return; }
      IAL.Store.updateActive(function (pr) {
        pr.customWords = pr.customWords || [];
        pr.customWords.push(w);
      });
      IAL.UI.toast('«' + w + '» aggiunta ✅');
      manage();
    }

    const rows = list.map(function (w) {
      return el('div', { class: 'custom-word-row' }, [
        el('span', { class: 'cw' }, [w]),
        el('button', {
          class: 'btn btn-danger btn-sm',
          'aria-label': 'Rimuovi ' + w,
          onclick: function () {
            IAL.Store.updateActive(function (pr) {
              pr.customWords = (pr.customWords || []).filter(function (x) { return x !== w; });
            });
            IAL.UI.toast('«' + w + '» rimossa');
            manage();
          }
        }, ['🗑️'])
      ]);
    });

    IAL.UI.renderScreen([
      el('div', { class: 'topbar' }, [
        el('button', { class: 'chip', onclick: function () { IAL.Home.show(); } }, ['🏠 Menu'])
      ]),
      el('h1', { class: 'app-title' }, ['PAROLE PERSONALIZZATE']),
      el('div', { class: 'panel' }, [
        el('h2', {}, ['Parole da leggere']),
        el('p', { class: 'hint' }, [
          'Scrivi le parole da far leggere al bambino (nomi, oggetti, del quaderno…). ',
          'Verranno proposte in ordine casuale, mai ripetute di seguito. ',
          'Restano salvate su questo dispositivo.'
        ]),
        el('div', { class: 'field' }, [input]),
        el('div', { class: 'opt-row' }, [
          el('button', { class: 'btn btn-green btn-sm', onclick: addFromInput }, ['➕ Aggiungi parola'])
        ]),
        el('div', { class: 'opt-row' }, [
          el('button', {
            class: 'btn btn-teal btn-sm',
            onclick: function () { if (camInput) camInput.click(); }
          }, ['📸 Scatta foto']),
          el('button', {
            class: 'btn btn-soft btn-sm',
            onclick: function () { if (fileInput) fileInput.click(); }
          }, ['🖼️ Galleria'])
        ]),
        camInput,
        fileInput,
        el('p', { class: 'hint' }, [
          '«Scatta foto» apre subito la fotocamera; «Galleria» usa una foto già scattata. ',
          'L’app legge le parole e te le fa controllare una per una. La foto non esce dal telefono. ',
          'La prima volta scarica il lettore di testo (circa 8 MB), poi funziona anche offline.'
        ]),
        rows.length
          ? el('div', { class: 'custom-list' }, rows)
          : el('div', { class: 'note' }, ['✍️ Aggiungi la prima parola per iniziare!']),
        el('div', { class: 'opt-row', style: 'margin-top:12px' }, [
          list.length
            ? el('button', { class: 'btn btn-primary', onclick: function () { current = null; render(); next(); } }, ['▶️ GIOCA'])
            : null,
          el('button', { class: 'btn btn-soft', onclick: function () { show(); } }, ['↩️ Indietro'])
        ]),
        list.length
          ? el('div', { class: 'danger-zone' }, [
              el('button', { class: 'btn btn-danger btn-block', onclick: clearAll }, ['🗑️ Cancella tutte le parole'])
            ])
          : null
      ])
    ]);
  }

  return { show: show, manage: manage, normalizeWord: normalizeWord, photoReview: photoReview };
})();
