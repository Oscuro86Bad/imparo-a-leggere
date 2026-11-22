/* ============================================================
   IMPARO A LEGGERE — MODO F: ASCOLTA E SELEZIONA
   1. L'app pronuncia una parola reale (senza scriverla).
   2. Sotto compaiono 4 parole scritte: si sceglie quella sentita.
   3. RIPETI riascolta, CORRETTO controlla, SALTA cambia parola.
   4. Risposta giusta → parola VERDE, stellina, pronuncia della
      parola e passaggio automatico alla successiva.
      Risposta sbagliata → parola ROSSA (disabilitata): si sceglie
      un'altra parola e si riprova.
   Le parole proposte sono solo reali e leggibili con le lettere e
   le sillabe studiate (come LEGGI E GUARDA).
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Listen = (function () {
  const el = IAL.UI.el;
  let current = null;
  let selected = null;   // { btn, word }
  let answered = false;
  let sessionOn = false;

  function show() {
    sessionOn = true;
    render();
    next();
  }

  function hide() {
    sessionOn = false;
    IAL.UI.stopSpeech();
  }

  function render() {
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { hide(); IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu'])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type', id: 'as-type' }, ['Ascolta la parola']),
      el('div', { class: 'listen-ico', id: 'as-ico' }, ['🔊']),
      el('div', { class: 'feedback-msg', id: 'as-msg' }, ['']),
      el('div', { class: 'choice-grid', id: 'as-options' }, []),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-purple', onclick: repeat }, ['🔊', 'RIPETI']),
        el('button', { class: 'btn btn-green', onclick: check }, ['✅', 'CORRETTO']),
        el('button', { class: 'btn btn-primary', onclick: next }, ['⏭️', 'SALTA'])
      ])
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, [
        'ASCOLTA E SELEZIONA',
        el('span', { class: 'cloud-badge' }, ['(NEW-BETA)'])
      ]),
      card,
      el('p', { class: 'progress-note', id: 'as-note' }, ['']),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { hide(); IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);
  }

  function next() {
    IAL.UI.stopSpeech();
    const p = IAL.Store.active();
    const ex = IAL.Engine.nextListen(p);

    const typeEl = document.getElementById('as-type');
    const optsEl = document.getElementById('as-options');
    if (!optsEl) return;

    selected = null;
    answered = false;
    optsEl.innerHTML = '';

    if (!ex) {
      current = null;
      if (typeEl) typeEl.textContent = 'Nessun esercizio disponibile';
      setMsg('', '');
      const noteEl = document.getElementById('as-note');
      if (noteEl) {
        noteEl.textContent = 'Servono almeno 2 parole leggibili con le lettere e le sillabe attive. ' +
          'Attivane di più nell’Area Genitori 🔒';
      }
      return;
    }

    current = ex;
    if (typeEl) typeEl.textContent = ex.typeLabel;
    ex.options.forEach(function (word) {
      optsEl.appendChild(el('button', {
        class: 'choice-btn word',
        onclick: function (e) { choose(e.currentTarget, word); }
      }, [word]));
    });

    setMsg('Quale parola hai sentito? 👂', '');
    updateNote();
    speakWord(); // la parola parte appena compare l'esercizio
  }

  function speakWord() {
    if (!current) return;
    pulseIcon();
    IAL.UI.say(current.word);
  }

  function repeat() {
    if (!current) { next(); return; }
    speakWord();
  }

  function pulseIcon() {
    const ico = document.getElementById('as-ico');
    if (!ico) return;
    ico.classList.remove('pulse');
    void ico.offsetWidth; // riavvia l'animazione
    ico.classList.add('pulse');
  }

  function choose(btn, word) {
    if (!current || answered || btn.disabled) return;
    Array.from(document.querySelectorAll('#as-options .choice-btn')).forEach(function (b) {
      b.classList.remove('sel');
    });
    btn.classList.add('sel');
    selected = { btn: btn, word: word };
    setMsg('Ora premi ✅ CORRETTO', '');
  }

  function check() {
    if (!current || answered) return;
    if (!selected) { IAL.UI.toast('Scegli prima una parola 👆'); return; }
    const p = IAL.Store.active();

    if (selected.word === current.word) {
      answered = true;
      IAL.Store.record(p, current, true);
      IAL.UI.starBurst('⭐');
      selected.btn.classList.remove('sel');
      selected.btn.classList.add('good');
      setMsg(IAL.UI.praise(), '');
      updateNote();

      // Pronuncia la parola corretta, poi passa alla successiva
      const ex = current;
      IAL.UI.say(ex.word, function () {
        if (!sessionOn || !answered) return;
        setTimeout(function () {
          if (!sessionOn || !answered) return;
          if (current !== ex) return;
          next();
        }, 600);
      });
    } else {
      IAL.Store.record(p, current, false);
      selected.btn.classList.remove('sel');
      selected.btn.classList.add('ko');
      selected.btn.disabled = true;
      selected = null;
      setMsg(IAL.UI.retryMsg(), 'try');
      updateNote();
    }
  }

  function setMsg(text, cls) {
    const msgEl = document.getElementById('as-msg');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'feedback-msg' + (cls ? ' ' + cls : '');
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('as-note');
    if (!noteEl) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  return { show: show, hide: hide, currentForTest: function () { return current; } };
})();
