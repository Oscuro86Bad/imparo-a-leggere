/* ============================================================
   IMPARO A LEGGERE — MODO C: DICO LA PAROLA
   1. Compare una parola → il bambino la pronuncia a voce alta.
   2. L'app ascolta con il microfono (riconoscimento vocale).
   3. Feedback immediato: sfondo VERDE se pronunciata bene,
      sfondo ROSSO se sbagliata; in entrambi i casi l'app
      ripete la pronuncia corretta della parola.
   4. Parola corretta → passa automaticamente alla successiva;
      parola sbagliata → ripete automaticamente la stessa parola.
   Se il microfono non è disponibile (es. iPhone con Safari),
   il genitore conferma con i pulsanti ✅ / ❌.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Speech = (function () {
  const el = IAL.UI.el;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let current = null;      // esercizio corrente
  let answered = false;    // già dato un giudizio su questa parola
  let sessionOn = false;   // la modalità è attiva (per fermare i loop)
  let rec = null;          // istanza SpeechRecognition
  let listenTries = 0;     // riavvii automatici per la parola corrente
  let manualMode = !SR;    // conferma manuale (microfono non disponibile)

  function show() {
    sessionOn = true;
    stopListening();
    render();
    next();
  }

  function hide() {
    sessionOn = false;
    stopListening();
  }

  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { hide(); IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu']),
      el('span', { class: 'chip' }, ['⭐ ', String(p.stats.stars)])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type', id: 'sp-type' }, ['…']),
      el('div', { class: 'big-word', id: 'sp-word' }, ['—']),
      el('div', { class: 'feedback-msg', id: 'sp-msg' }, ['']),
      el('div', { class: 'speech-status', id: 'sp-status' }, [
        el('span', { class: 'dot' }, ['']),
        el('span', { id: 'sp-status-txt' }, ['…'])
      ]),
      el('div', { class: 'actions', id: 'sp-actions' }, [])
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['DICO LA PAROLA']),
      card,
      el('p', { class: 'progress-note', id: 'sp-note' }, ['']),
      el('p', { class: 'footer-note' }, [
        'Il microfono funziona solo con internet; il resto dell’app resta offline.'
      ]),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { hide(); IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);
  }

  function next() {
    const p = IAL.Store.active();
    // Le categorie scelte dall'Area Genitori valgono anche qui:
    // solo sillabe → sillabe, solo coppie di vocali → coppie, ecc.
    const ex = IAL.Engine.nextReading(p, {
      categories: p.settings.categories,
      wordType: p.settings.wordType,
      lengths: p.settings.lengths
    });

    const typeEl = document.getElementById('sp-type');
    const wordEl = document.getElementById('sp-word');
    const msgEl = document.getElementById('sp-msg');
    const actions = document.getElementById('sp-actions');
    if (!wordEl) return;

    if (!ex) {
      current = null;
      if (typeEl) typeEl.textContent = 'Nessun esercizio disponibile';
      wordEl.textContent = '🤔';
      wordEl.className = 'big-word';
      setMsg('', '');
      setStatus('Nessun esercizio con le impostazioni attuali: attiva lettere, sillabe o parole nell’Area Genitori 🔒', 'off');
      if (actions) actions.innerHTML = '';
      updateNote();
      return;
    }

    current = ex;
    answered = false;
    listenTries = 0;
    if (typeEl) {
      typeEl.textContent = ex.invented ? 'Parola inventata (senza significato!)' : ex.typeLabel;
      typeEl.className = 'exercise-type' + (ex.invented ? ' invented' : '');
    }
    wordEl.textContent = ex.text;
    wordEl.className = 'big-word';
    setMsg('Leggi a voce alta! 👄', '');
    setActions();
    updateNote();
    startListening();
  }

  // Ripresenta la STESSA parola (dopo un errore)
  let pendingWord = '', pendingInv = false;

  function keepWordTrigger(text, invented) {
    pendingWord = text;
    pendingInv = invented;
  }

  function again() {
    if (!pendingWord) return;
    current = { kind: 'word', text: pendingWord, invented: pendingInv, img: null, typeLabel: 'Parola' };
    answered = false;
    listenTries = 0;
    const wordEl = document.getElementById('sp-word');
    if (wordEl) { wordEl.textContent = current.text; wordEl.className = 'big-word'; }
    setMsg('Riprova! 🎤', '');
    setActions();
    updateNote();
    startListening();
  }

  function setMsg(text, cls) {
    const msgEl = document.getElementById('sp-msg');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'feedback-msg' + (cls ? ' ' + cls : '');
  }

  function setStatus(text, state) {
    const box = document.getElementById('sp-status');
    const txt = document.getElementById('sp-status-txt');
    if (box) box.className = 'speech-status' + (state ? ' ' + state : '');
    if (txt) txt.textContent = text;
  }

  function setActions() {
    const actions = document.getElementById('sp-actions');
    if (!actions) return;
    actions.innerHTML = '';
    actions.appendChild(el('button', { class: 'btn btn-purple', onclick: hearAgain }, ['🔊', 'ASCOLTA']));
    if (SR) {
      actions.appendChild(el('button', { class: 'btn btn-primary', onclick: retryListen }, ['🎤', 'RIPROVA']));
    } else {
      actions.appendChild(el('button', { class: 'btn btn-green', onclick: manualCorrect }, ['✅', 'CORRETTO']));
      actions.appendChild(el('button', { class: 'btn btn-danger', onclick: manualWrong }, ['❌', 'SBAGLIATO']));
    }
    actions.appendChild(el('button', { class: 'btn btn-soft', onclick: function () { answered = true; stopListening(); next(); } }, ['⏭️', 'SALTA']));
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('sp-note');
    if (!noteEl) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  // ---------- Riconoscimento vocale ----------
  function startListening() {
    if (!sessionOn || !current || answered) return;
    if (!SR) {
      setStatus('Microfono non disponibile: il genitore conferma qui sotto', 'off');
      return;
    }
    stopListening();
    listenTries += 1;
    if (listenTries > 6) {
      setStatus('Premi 🎤 RIPROVA per ascoltare di nuovo', 'off');
      return;
    }
    try {
      rec = new SR();
      rec.lang = 'it-IT';
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.onresult = function (e) {
        if (answered || !current) return;
        let said = '';
        for (let i = 0; i < e.results[e.results.length - 1].length; i++) {
          said += ' ' + e.results[e.results.length - 1][i].transcript;
        }
        judge(said);
      };
      rec.onerror = function (e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setStatus('Permesso microfono negato: consentilo dal browser 🔒', 'off');
          manualMode = true;
          setActions();
        } else if (!answered) {
          setStatus('Non ho sentito nulla… 🎤', 'off');
        }
      };
      rec.onend = function () {
        if (!answered && sessionOn && current && !manualMode) {
          setTimeout(function () { if (!answered && sessionOn && current) startListening(); }, 700);
        }
      };
      rec.start();
      setStatus('🎤 Sto ascoltando…', 'on');
    } catch (err) {
      setStatus('Premi 🎤 RIPROVA per ascoltare di nuovo', 'off');
    }
  }

  function stopListening() {
    if (rec) {
      try { rec.onend = null; rec.stop(); } catch (e) { /* già fermo */ }
      rec = null;
    }
  }

  function retryListen() {
    answered = false;
    listenTries = 0;
    startListening();
  }

  // Valuta la pronuncia: parola riconosciuta?
  function judge(said) {
    if (!current || answered) return;
    const target = normalize(current.text);
    const heard = normalize(said);
    const ok = heard.length > 0 && (heard === target || heard.indexOf(target) !== -1);
    if (ok) correct(); else wrong();
  }

  function normalize(s) {
    return String(s).toUpperCase()
      .replace(/[ÀÁÂÃÄÅ]/g, 'A').replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I').replace(/[ÒÓÔÖØ]/g, 'O').replace(/[ÙÚÛÜ]/g, 'U')
      .replace(/[^A-Z]/g, '');
  }

  // ---------- Feedback ----------
  function correct() {
    if (!current || answered) return;
    answered = true;
    stopListening();
    const p = IAL.Store.active();
    IAL.Store.record(p, current, true);
    IAL.UI.starBurst('⭐');

    const wordEl = document.getElementById('sp-word');
    if (wordEl) wordEl.className = 'big-word ok';
    setMsg(IAL.UI.praise(), '');

    hearAgain(function () {
      if (sessionOn) setTimeout(next, 500); // passa automaticamente alla successiva
    });
    updateNote();
  }

  function wrong() {
    if (!current || answered) return;
    answered = true;
    stopListening();
    const p = IAL.Store.active();
    IAL.Store.record(p, current, false);

    const wordEl = document.getElementById('sp-word');
    if (wordEl) wordEl.className = 'big-word ko shake';
    setMsg(IAL.UI.retryMsg(), 'try');

    keepWordTrigger(current.text, current.invented);
    // Ripete la pronuncia corretta, poi ripresenta la STESSA parola
    hearAgain(function () {
      if (sessionOn) again();
    });
    updateNote();
  }

  // Conferma manuale (microfono non disponibile)
  function manualCorrect() { if (!answered) correct(); }
  function manualWrong() { if (!answered) wrong(); }

  // ---------- Sintesi vocale ----------
  function hearAgain(done) {
    if (!current && !pendingWord) { if (done) done(); return; }
    const text = (current && current.text) ? current.text : pendingWord;
    if (!('speechSynthesis' in window)) { if (done) done(); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT';
      u.rate = 0.8;
      u.pitch = 1.05;
      if (done) {
        let called = false;
        const once = function () { if (!called) { called = true; done(); } };
        u.onend = once;
        u.onerror = once;
        // Rete di sicurezza: se onend non scatta mai, procede comunque
        setTimeout(once, 4000);
      }
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (done) done();
    }
  }

  return { show: show, hide: hide };
})();
