/* ============================================================
   IMPARO A LEGGERE — MODO C: DICO LA PAROLA
   1. Compare una parola completa reale → il bambino la legge
      a voce alta quando è pronto.
   2. SOLO quando preme il pulsante 🎤 VERIFICA l'app ascolta
      (riconoscimento vocale in italiano): nessun microfono
      attivo in automatico.
   3. Feedback immediato: parola VERDE se pronunciata bene
      (passa automaticamente alla successiva), ROSSA se
      sbagliata (l'app ripete la parola corretta e torna il
      pulsante 🎤 per riprovare sulla stessa parola).
   4. Se il microfono non è disponibile (es. iPhone/iPad con
      Safari) il genitore conferma con i pulsanti ✅ / ❌.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Speech = (function () {
  const el = IAL.UI.el;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let current = null;      // esercizio corrente
  let judged = false;      // già dato un giudizio su questa parola
  let listening = false;   // registrazione in corso
  let sessionOn = false;   // la modalità è attiva (per fermare i loop)
  let rec = null;          // istanza SpeechRecognition
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
    // DICO LA PAROLA: SEMPRE parole reali complete (mai sillabe o coppie di
    // vocali). Sezione svincolata da lunghezze e categorie: conta solo ciò
    // che la bambina sa leggere (lettere e sillabe conosciute).
    const ex = IAL.Engine.nextSpeech(p);

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
      if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
      setStatus('Nessuna parola disponibile: attiva più lettere e sillabe nell’Area Genitori 🔒', 'off');
      if (actions) actions.innerHTML = '';
      updateNote();
      return;
    }

    current = ex;
    judged = false;
    if (typeEl) {
      typeEl.textContent = ex.invented ? 'Parola inventata (senza significato!)' : ex.typeLabel;
      typeEl.className = 'exercise-type' + (ex.invented ? ' invented' : '');
    }
    wordEl.textContent = ex.text;
    wordEl.className = 'big-word';
    if (msgEl) { msgEl.textContent = 'Leggi la parola a voce alta! 👄'; msgEl.className = 'feedback-msg'; }
    setStatus('Premi 🎤 quando sei pronto', 'ready');
    setActions();
    updateNote();
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
    if (!manualMode && SR) {
      actions.appendChild(el('button', { class: 'btn btn-orange big', onclick: startListening }, ['🎤', 'VERIFICA']));
    } else {
      actions.appendChild(el('button', { class: 'btn btn-green', onclick: manualCorrect }, ['✅', 'CORRETTO']));
      actions.appendChild(el('button', { class: 'btn btn-danger', onclick: manualWrong }, ['❌', 'SBAGLIATO']));
    }
    actions.appendChild(el('button', { class: 'btn btn-soft', onclick: skip }, ['⏭️', 'SALTA']));
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('sp-note');
    if (!noteEl) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  // ---------- Riconoscimento vocale (solo su richiesta) ----------
  function startListening() {
    if (!sessionOn || !current || judged || listening) return;
    if (!SR) { manualMode = true; setActions(); return; }
    stopListening();
    try {
      rec = new SR();
      rec.lang = 'it-IT';
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.onresult = function (e) {
        if (judged || !current) return;
        let said = '';
        for (let i = 0; i < e.results[e.results.length - 1].length; i++) {
          said += ' ' + e.results[e.results.length - 1][i].transcript;
        }
        judge(said);
      };
      rec.onerror = function (e) {
        listening = false;
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          // Microfono negato o non disponibile (es. Safari su iPad):
          // si passa alla conferma manuale del genitore.
          manualMode = true;
          setStatus('Microfono non disponibile: conferma qui sotto', 'off');
          setActions();
        } else if (!judged) {
          setStatus('Non ho sentito nulla… premi di nuovo 🎤', 'off');
        }
      };
      rec.onend = function () {
        listening = false;
        if (!judged && sessionOn && current) {
          setStatus('Premi di nuovo 🎤 per farci riprovare', 'ready');
        }
      };
      rec.start();
      listening = true;
      setStatus('🎤 Sto ascoltando…', 'on');
    } catch (err) {
      listening = false;
      setStatus('Premi di nuovo 🎤 per farci riprovare', 'ready');
    }
  }

  function stopListening() {
    if (rec) {
      try { rec.onend = null; rec.stop(); } catch (e) { /* già fermo */ }
      rec = null;
    }
    listening = false;
  }

  function skip() {
    judged = true;
    stopListening();
    next();
  }

  // Valuta la pronuncia: parola riconosciuta?
  function judge(said) {
    if (!current || judged) return;
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
    if (!current || judged) return;
    judged = true;
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
    if (!current || judged) return;
    judged = true;
    stopListening();
    const p = IAL.Store.active();
    IAL.Store.record(p, current, false);

    const wordEl = document.getElementById('sp-word');
    if (wordEl) wordEl.className = 'big-word ko shake';
    setMsg(IAL.UI.retryMsg(), 'try');

    // Ripete la pronuncia corretta, poi torna il pulsante 🎤
    // per riprovare sulla STESSA parola.
    hearAgain(function () {
      if (!sessionOn) return;
      judged = false;
      setStatus('Premi 🎤 quando sei pronto', 'ready');
      setActions();
    });
    updateNote();
  }

  // Conferma manuale (microfono non disponibile)
  function manualCorrect() { if (!judged) correct(); }
  function manualWrong() { if (!judged) wrong(); }

  // ---------- Sintesi vocale ----------
  function hearAgain(done) {
    if (!current) { if (done) done(); return; }
    const text = current.text;
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
