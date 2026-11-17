/* ============================================================
   IMPARO A LEGGERE — MODO E: PAROLE MIE
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
      el('button', { class: 'chip', onclick: function () { IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu']),
      el('span', { class: 'chip' }, ['⭐ ', String(p.stats.stars)])
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
      el('h1', { class: 'app-title' }, ['PAROLE MIE']),
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

  function manage() {
    const p = IAL.Store.active();
    const list = (p.customWords || []).slice();
    const input = el('input', {
      type: 'text', maxlength: '12', placeholder: 'Es. NONNA',
      autocomplete: 'off', id: 'cm-new-word'
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
      el('h1', { class: 'app-title' }, ['LE MIE PAROLE']),
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
        rows.length
          ? el('div', { class: 'custom-list' }, rows)
          : el('div', { class: 'note' }, ['✍️ Aggiungi la prima parola per iniziare!']),
        el('div', { class: 'opt-row', style: 'margin-top:12px' }, [
          list.length
            ? el('button', { class: 'btn btn-primary', onclick: function () { current = null; render(); next(); } }, ['▶️ GIOCA'])
            : null,
          el('button', { class: 'btn btn-soft', onclick: function () { show(); } }, ['↩️ Indietro'])
        ])
      ])
    ]);
  }

  return { show: show, manage: manage };
})();
