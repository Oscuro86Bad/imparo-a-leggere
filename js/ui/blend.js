/* ============================================================
   IMPARO A LEGGERE — UNISCI LE SILLABE
   Il bambino tocca le sillabe in ordine: i riquadri, mescolati
   a caso, si avvicinano e si fondono nella parola vera.
   Solo parole reali interamente leggibili con le lettere e le
   sillabe già studiate.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Blend = (function () {
  const el = IAL.UI.el;
  let current = null;
  let displayed = [];
  let chosenOrder = [];
  let step = 0;
  let solved = false;

  // Fisher-Yates. Se per caso esce l'ordine esatto, lo rompiamo:
  // i riquadri devono essere sempre un piccolo rompicapo.
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    const same = a.every(function (s, k) { return s === list[k]; });
    if (same && a.length > 1) a.push(a.shift());
    return a;
  }

  function show() {
    current = null;
    displayed = [];
    chosenOrder = [];
    step = 0;
    solved = false;
    render();
    next();
  }

  function hide() {
    IAL.UI.stopSpeech();
  }

  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { hide(); IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu'])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type', id: 'blend-type' }, ['…']),
      el('p', { class: 'blend-hint', id: 'blend-hint' }, ['Le sillabe sono mescolate: tocca quella giusta 👆']),
      el('div', { class: 'blend-stage', id: 'blend-stage' }, []),
      el('div', { class: 'blend-result', id: 'blend-result' }, ['—']),
      el('div', { class: 'blend-reward', id: 'blend-reward' }, []),
      el('div', { class: 'feedback-msg', id: 'blend-msg' }, ['']),
      el('div', { class: 'word-tools' }, [
        el('button', { class: 'chip', onclick: speakHint, 'aria-label': 'Ascolta la sillaba' }, ['🔊 SENTI'])
      ]),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-lime', onclick: next }, ['🔄', 'NUOVA'])
      ])
    ]);

    const note = el('p', { class: 'progress-note', id: 'blend-note' }, ['']);
    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['UNISCI LE SILLABE']),
      card,
      note,
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { hide(); IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);
    updateNote(p);
  }

  function next() {
    IAL.UI.stopSpeech();
    const p = IAL.Store.active();
    const ex = IAL.Engine.nextBlend(p);
    current = ex;
    displayed = ex ? shuffle(ex.syllables) : [];
    chosenOrder = [];
    step = 0;
    solved = false;

    const typeEl = document.getElementById('blend-type');
    const hintEl = document.getElementById('blend-hint');
    const stageEl = document.getElementById('blend-stage');
    const resultEl = document.getElementById('blend-result');
    const rewardEl = document.getElementById('blend-reward');
    const msgEl = document.getElementById('blend-msg');

    if (!ex) {
      if (typeEl) typeEl.textContent = 'Nessuna parola disponibile';
      if (hintEl) hintEl.textContent = 'Chiedi a un adulto di attivare le lettere!';
      if (stageEl) stageEl.innerHTML = '';
      if (resultEl) resultEl.textContent = '—';
      if (rewardEl) rewardEl.innerHTML = '';
      if (msgEl) msgEl.textContent = '';
      updateNote(p);
      return;
    }

    if (typeEl) typeEl.textContent = ex.syllables.length + ' sillabe · parola reale';
    if (hintEl) hintEl.textContent = 'Le sillabe sono mescolate: tocca quella giusta 👆';
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
    if (resultEl) { resultEl.textContent = '—'; resultEl.classList.remove('done'); }
    if (rewardEl) rewardEl.innerHTML = '';

    if (stageEl) {
      stageEl.innerHTML = '';
      displayed.forEach(function (syl, i) {
        if (i) stageEl.appendChild(el('span', { class: 'blend-plus' }, ['+']));
        stageEl.appendChild(el('button', {
          class: 'syl-tile', 'data-i': i, 'data-syl': syl,
          'aria-label': 'Sillaba ' + syl,
          onclick: function () { tap(this, syl); }
        }, [syl]));
      });
    }
    updateNote(p);
  }

  function tap(tile, syl) {
    if (!current || solved || !tile || tile.classList.contains('chosen')) return;
    const stageEl = document.getElementById('blend-stage');
    const hintEl = document.getElementById('blend-hint');
    const resultEl = document.getElementById('blend-result');

    // Confrontiamo il TESTO della sillaba, non la posizione del riquadro:
    // così funziona anche quando due sillabe uguali sono presenti nella parola.
    if (syl !== current.syllables[step]) {
      // Feedback gentile: nessuna X rossa, si riprova senza penalty.
      if (stageEl) {
        stageEl.classList.remove('shake');
        void stageEl.offsetWidth;
        stageEl.classList.add('shake');
      }
      if (hintEl) {
        hintEl.textContent = 'Prima ' + current.syllables[step] +
          (current.syllables[step + 1] ? ', poi ' + current.syllables[step + 1] : '') + ' 👆';
      }
      return;
    }

    tile.classList.add('chosen');
    chosenOrder.push(syl);
    step++;
    if (resultEl) resultEl.textContent = current.syllables.slice(0, step).join('');
    if (hintEl) hintEl.textContent = step < current.syllables.length ? 'Bene! Continua 👆' : '';

    if (step === current.syllables.length) solve();
  }

  function solve() {
    solved = true;
    const p = IAL.Store.active();
    const resultEl = document.getElementById('blend-result');
    const rewardEl = document.getElementById('blend-reward');
    const msgEl = document.getElementById('blend-msg');
    const hintEl = document.getElementById('blend-hint');

    if (resultEl) {
      resultEl.textContent = current.word;
      resultEl.classList.add('done');
    }
    if (hintEl) hintEl.textContent = 'Sillabe unite! 🎉';
    if (rewardEl && current.img) rewardEl.appendChild(IAL.UI.pic(current.img));
    if (msgEl) { msgEl.textContent = IAL.UI.praise(); msgEl.className = 'feedback-msg'; }

    IAL.Store.record(p, { text: current.word }, true);
    IAL.UI.starBurst('⭐');
    IAL.UI.say(current.word);
    updateNote(p);
  }

  function speakHint() {
    if (!current) return;
    IAL.UI.say(solved ? current.word : current.syllables[step]);
  }

  function updateNote(p) {
    const noteEl = document.getElementById('blend-note');
    if (!noteEl) return;
    const avail = IAL.Engine.availability(p);
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct +
      ' esercizi corretti · ' + avail.blends + ' parole da unire · solo sillabe studiate';
  }

  function currentForTest() { return current; }
  function displayForTest() { return displayed.slice(); }
  function stateForTest() {
    return { step: step, solved: solved, chosen: chosenOrder.slice() };
  }
  function shuffleForTest(list) { return shuffle(list); }

  return {
    show: show, hide: hide, currentForTest: currentForTest,
    displayForTest: displayForTest, stateForTest: stateForTest,
    shuffleForTest: shuffleForTest
  };
})();
