/* ============================================================
   IMPARO A LEGGERE — MODO A: SOLO LETTURA
   Un solo elemento per schermata, caratteri giganti.
   Pulsanti: NUOVO, RIPETI, CORRETTO, RITENTA, MENU.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Reading = (function () {
  const el = IAL.UI.el;
  let current = null;

  function show() {
    current = null;
    render();
    next();
  }

  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu']),
      el('span', { class: 'chip' }, ['⭐ ', String(p.stats.stars)])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type', id: 'ex-type' }, ['…']),
      el('div', { class: 'big-word', id: 'ex-word' }, ['—']),
      el('div', { class: 'feedback-msg', id: 'ex-msg' }, ['']),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-primary', onclick: next }, ['🔄', 'NUOVO']),
        el('button', { class: 'btn btn-purple', onclick: repeat }, ['👀', 'RIPETI']),
        el('button', { class: 'btn btn-green', onclick: markCorrect }, ['✅', 'CORRETTO']),
        el('button', { class: 'btn btn-danger', onclick: retry }, ['💪', 'RITENTA'])
      ])
    ]);

    const avail = IAL.Engine.availability(p);
    const note = el('p', { class: 'progress-note', id: 'ex-note' }, ['']);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['SOLO LETTURA']),
      card,
      note,
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);

    if (avail.letters === 0) {
      noLettersMessage();
    } else if (avail.syllables === 0 && p.settings.categories.syllables && !p.settings.categories.letters) {
      IAL.UI.toast('Attiva prima qualche sillaba nell’Area Genitori 🔒');
    }
  }

  function noLettersMessage() {
    const wordEl = document.getElementById('ex-word');
    const typeEl = document.getElementById('ex-type');
    if (wordEl) wordEl.textContent = '😄';
    if (typeEl) typeEl.textContent = 'Nessuna lettera attiva';
    const msg = document.getElementById('ex-msg');
    if (msg) msg.textContent = 'Chiedi a un adulto di attivare le lettere!';
    IAL.UI.toast('Apri l’Area Genitori per attivare le lettere 🔒');
  }

  function next() {
    const p = IAL.Store.active();
    const ex = IAL.Engine.nextReading(p, {
      categories: p.settings.categories,
      wordType: p.settings.wordType,
      lengths: p.settings.lengths
    });

    const typeEl = document.getElementById('ex-type');
    const wordEl = document.getElementById('ex-word');
    const msgEl = document.getElementById('ex-msg');
    const noteEl = document.getElementById('ex-note');

    if (!ex) {
      current = null;
      if (typeEl) typeEl.textContent = 'Nessun esercizio disponibile';
      if (wordEl) wordEl.textContent = '🤔';
      if (msgEl) {
        msgEl.textContent = '';
        msgEl.className = 'feedback-msg';
      }
      if (noteEl) {
        noteEl.textContent = 'Con le lettere e le impostazioni attuali non ci sono esercizi. ' +
          'Prova ad attivare più sillabe o cambiare le impostazioni nell’Area Genitori.';
      }
      return;
    }

    current = ex;
    if (typeEl) {
      typeEl.textContent = ex.invented ? 'Parola inventata (senza significato!)' : ex.typeLabel;
      typeEl.className = 'exercise-type' + (ex.invented ? ' invented' : '');
    }
    if (wordEl) {
      wordEl.textContent = ex.text;
      wordEl.className = 'big-word';
    }
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
    updateNote();
  }

  function repeat() {
    if (!current) { next(); return; }
    const wordEl = document.getElementById('ex-word');
    if (wordEl) {
      wordEl.className = 'big-word';
      void wordEl.offsetWidth; // riavvia l'animazione
      wordEl.style.animation = 'pop 0.4s ease';
      setTimeout(function () { wordEl.style.animation = ''; }, 450);
    }
  }

  function markCorrect() {
    if (!current) return;
    const p = IAL.Store.active();
    IAL.Store.record(p, current, true);
    IAL.UI.starBurst('⭐');
    const msgEl = document.getElementById('ex-msg');
    if (msgEl) {
      msgEl.textContent = IAL.UI.praise();
      msgEl.className = 'feedback-msg';
    }
    updateNote();
    IAL.UI.maybeSticker(p);
    setTimeout(next, 900);
  }

  function retry() {
    if (!current) return;
    const p = IAL.Store.active();
    IAL.Store.record(p, current, false);
    const wordEl = document.getElementById('ex-word');
    const msgEl = document.getElementById('ex-msg');
    if (wordEl) {
      wordEl.className = 'big-word shake';
    }
    if (msgEl) {
      msgEl.textContent = IAL.UI.retryMsg();
      msgEl.className = 'feedback-msg try';
    }
    updateNote();
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('ex-note');
    if (!noteEl) return;
    const goal = IAL.Store.goalProgress(p);
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · oggi ' + goal.done + '/' + goal.goal + ' corretti';
  }

  return { show: show };
})();
