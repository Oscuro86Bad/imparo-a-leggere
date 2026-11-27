/* ============================================================
   IMPARO A LEGGERE — LEGGI LA FRASE
   Una frase italiana compiuta in caratteri grandi, senza immagini.
   Compare solo se TUTTE le sue lettere (vocali comprese) sono attive
   nell'Area Genitori; la H è trattata come consonante.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Sentences = (function () {
  const el = IAL.UI.el;
  let current = null;

  const LEVEL_NAMES = {
    1: 'Frase breve',
    2: 'Frase facile',
    3: 'Frase più lunga',
    4: 'Frase ricca'
  };

  function show() {
    current = null;
    render();
    next();
  }

  function hide() {
    IAL.UI.stopSpeech();
  }

  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu'])
    ]);

    const card = el('div', { class: 'comic-card' }, [
      el('div', { class: 'exercise-type', id: 'sentence-level' }, ['…']),
      el('div', { class: 'comic-bubble', id: 'sentence-text' }, ['—']),
      el('div', { class: 'word-tools' }, [
        el('button', { class: 'chip', onclick: speakCurrent, 'aria-label': 'Ascolta la frase' }, ['🔊 SENTI LA FRASE'])
      ]),
      el('div', { class: 'feedback-msg', id: 'sentence-msg' }, ['']),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-gold', onclick: next }, ['🔄', 'NUOVA']),
        el('button', { class: 'btn btn-green', onclick: markRead }, ['✅', 'HO LETTO'])
      ])
    ]);

    const note = el('p', { class: 'progress-note', id: 'sentence-note' }, ['']);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['LEGGI LA FRASE']),
      card,
      note,
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);

    updateNote();
    if (IAL.Engine.availability(p).sentences === 0) {
      IAL.UI.toast('Attiva prima qualche lettera nell’Area Genitori 🔒');
    }
  }

  function next() {
    IAL.UI.stopSpeech();
    const p = IAL.Store.active();
    const entry = IAL.Engine.nextSentence(p);

    const levelEl = document.getElementById('sentence-level');
    const textEl = document.getElementById('sentence-text');
    const msgEl = document.getElementById('sentence-msg');

    if (!entry) {
      current = null;
      if (levelEl) levelEl.textContent = 'Nessuna frase disponibile';
      if (textEl) textEl.textContent = '—';
      if (msgEl) { msgEl.textContent = 'Chiedi a un adulto di attivare le lettere!'; msgEl.className = 'feedback-msg'; }
      updateNote();
      return;
    }

    current = entry;
    if (levelEl) levelEl.textContent = LEVEL_NAMES[entry.d] + ' · ' + entry.w + ' parole';
    if (textEl) textEl.textContent = entry.t;
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
    updateNote();
  }

  function speakCurrent() {
    if (!current) return;
    IAL.UI.say(current.t);
  }

  function markRead() {
    if (!current) return;
    const p = IAL.Store.active();
    IAL.Store.record(p, { text: current.t }, true);
    IAL.UI.starBurst('⭐');
    const msgEl = document.getElementById('sentence-msg');
    if (msgEl) {
      msgEl.textContent = IAL.UI.praise();
      msgEl.className = 'feedback-msg';
    }
    updateNote();

    const read = current;
    IAL.UI.say(read.t, function () {
      setTimeout(function () {
        if (current !== read) return;
        if (!document.getElementById('sentence-text')) return;
        next();
      }, 450);
    });
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('sentence-note');
    if (!noteEl) return;
    const cap = IAL.Engine.sentenceCap(p);
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct +
      ' esercizi corretti · frasi fino a ' + cap.maxWords + ' parole · solo lettere attive';
  }

  function currentForTest() { return current; }

  return { show: show, hide: hide, currentForTest: currentForTest };
})();
