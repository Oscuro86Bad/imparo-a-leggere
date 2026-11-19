/* ============================================================
   IMPARO A LEGGERE — MODO B: LEGGI E GUARDA
   1. Compare una parola → il bambino legge ad alta voce.
   2. Il genitore conferma con CORRETTO.
   3. Compare l'immagine associata (parola reale completa).
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Match = (function () {
  const el = IAL.UI.el;
  let current = null;
  let revealed = false;

  function show() {
    current = null;
    render();
    next();
  }

  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu'])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type', id: 'mx-type' }, ['…']),
      el('div', { class: 'big-word', id: 'mx-word' }, ['—']),
      el('div', { class: 'feedback-msg', id: 'mx-msg' }, ['']),
      el('div', { id: 'mx-reveal' }),
      el('div', { class: 'actions', id: 'mx-actions' }, [
        el('button', { class: 'btn btn-green', onclick: correct }, ['✅', 'CORRETTO']),
        el('button', { class: 'btn btn-danger', onclick: retry }, ['💪', 'RITENTA'])
      ])
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['LEGGI E GUARDA']),
      card,
      el('p', { class: 'progress-note', id: 'mx-note' }, ['']),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);
  }

  function next() {
    const p = IAL.Store.active();
    // LEGGI E GUARDA: SEMPRE parole reali complete con immagine, svincolate
    // da lunghezze e categorie dell'Area Genitori.
    const ex = IAL.Engine.nextMatch(p);
    revealed = false;

    const typeEl = document.getElementById('mx-type');
    const wordEl = document.getElementById('mx-word');
    const msgEl = document.getElementById('mx-msg');
    const revealEl = document.getElementById('mx-reveal');
    const actions = document.getElementById('mx-actions');

    if (!ex) {
      current = null;
      if (typeEl) typeEl.textContent = 'Nessun esercizio disponibile';
      if (wordEl) wordEl.textContent = '🤔';
      if (msgEl) msgEl.textContent = '';
      if (revealEl) revealEl.innerHTML = '';
      if (actions) {
        actions.innerHTML = '';
        actions.appendChild(el('div', { class: 'span2 note' },
          ['Servono parole reali con immagine: attiva più lettere e sillabe (nell’Area Genitori) per parole come PANE, MELA, PALLA…']));
      }
      return;
    }

    current = ex;
    if (typeEl) {
      typeEl.textContent = ex.typeLabel;
      typeEl.className = 'exercise-type';
    }
    if (wordEl) { wordEl.textContent = ex.text; wordEl.className = 'big-word'; }
    if (msgEl) { msgEl.textContent = 'Leggi ad alta voce! 👄'; msgEl.className = 'feedback-msg'; }
    if (revealEl) revealEl.innerHTML = '';
    if (actions) {
      actions.innerHTML = '';
      actions.appendChild(el('button', { class: 'btn btn-green', onclick: correct }, ['✅', 'CORRETTO']));
      actions.appendChild(el('button', { class: 'btn btn-danger', onclick: retry }, ['💪', 'RITENTA']));
    }
    updateNote();
  }

  function correct() {
    if (!current || revealed) return;
    const p = IAL.Store.active();
    revealed = true;
    IAL.Store.record(p, current, true);
    IAL.UI.starBurst('⭐');

    const msgEl = document.getElementById('mx-msg');
    if (msgEl) { msgEl.textContent = IAL.UI.praise(); msgEl.className = 'feedback-msg'; }

    // Rivela immagine + parola completa (o solo la coppia, se non c'è immagine)
    const revealEl = document.getElementById('mx-reveal');
    const box = el('div', { class: 'associated' });
    if (current.img) box.appendChild(el('div', { class: 'img' }, [IAL.UI.pic(current.img)]));
    box.appendChild(el('div', { class: 'lbl' }, [current.assocWord]));
    if (revealEl) revealEl.innerHTML = '';
    if (revealEl) revealEl.appendChild(box);

    // Sostituisce i pulsanti con AVANTI
    const actions = document.getElementById('mx-actions');
    if (actions) {
      actions.innerHTML = '';
      actions.appendChild(el('button', { class: 'btn btn-primary span2', onclick: next }, ['▶️', 'AVANTI']));
    }
    updateNote();
  }

  function retry() {
    if (!current || revealed) return;
    const p = IAL.Store.active();
    IAL.Store.record(p, current, false);
    const wordEl = document.getElementById('mx-word');
    const msgEl = document.getElementById('mx-msg');
    if (wordEl) wordEl.className = 'big-word shake';
    if (msgEl) { msgEl.textContent = IAL.UI.retryMsg(); msgEl.className = 'feedback-msg try'; }
    updateNote();
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('mx-note');
    if (!noteEl) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  return { show: show };
})();
