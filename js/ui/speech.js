/* ============================================================
   IMPARO A LEGGERE — MODO C: DICO LA PAROLA
   1. Compare una parola completa reale → il bambino la legge
      a voce alta quando è pronto.
   2. SOLO quando preme 🎤 VERIFICA l'app ascolta (nessun
      microfono attivo in automatico). Dentro la stessa
      pressione l'app RIASCOLTA finché non capisce (o per un
      massimo di tentativi), senza che il bambino debba
      ripremere insieme.
   3. Valutazione tollerante: usa TUTTE le alternative del
      riconoscitore e un confronto "fuzzy" (distanza di
      Levenshtein), perché la voce di un bambino viene spesso
      trascritta con piccoli errori (P/B, T/D…). Un fotogramma
      di rumore (interiezioni, "eh") viene ignorato.
   4. Feedback: parola VERDE → passa alla successiva; ROSSA →
      l'app ripete la parola corretta ("Ho sentito: …") e torna
      il pulsante 🎤 per riprovare sulla stessa parola.
   5. Se il microfono non è disponibile (iPhone/iPad Safari)
      il genitore conferma con ✅ / ❌.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Speech = (function () {
  const el = IAL.UI.el;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let current = null;      // esercizio corrente
  let judged = false;      // già dato un giudizio su questa parola
  let listening = false;   // registrazione in corso
  let sessionOn = false;   // la modalità è attiva
  let rec = null;          // istanza SpeechRecognition
  let pressSeq = 0;        // identificativo della pressione di VERIFICA
  let listenFails = 0;     // ri-ascolti già fatti in questa pressione
  let manualMode = !SR;    // conferma manuale (microfono non disponibile)
  const MAX_RELISTEN = 3;  // quanti ri-ascolti dentro la stessa pressione

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
    // DICO LA PAROLA: SEMPRE parole reali complete (mai sillabe).
    // Sezione svincolata da lunghezze e categorie: conta solo ciò
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
    if (typeEl) typeEl.textContent = ex.typeLabel;
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

  // ---------- Riconoscimento vocale (solo su 🎤) ----------
  function startListening() {
    if (!sessionOn || !current || judged) return;
    if (!SR) { manualMode = true; setActions(); return; }
    stopListening();
    pressSeq += 1;          // ogni pressione ha il suo "canale"
    listenFails = 0;
    tryListen(pressSeq);
  }

  function tryListen(seq) {
    if (!sessionOn || !current || judged || seq !== pressSeq) return;
    stopListening();
    try {
      rec = new SR();
      rec.lang = 'it-IT';
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 6;

      rec.onresult = function (e) {
        if (judged || !current || seq !== pressSeq) return;
        const last = e.results[e.results.length - 1];
        const alts = [];
        for (let i = 0; i < last.length; i++) alts.push(last[i].transcript);
        judge(alts);
      };

      rec.onerror = function (e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          // Microfono negato o non disponibile (es. Safari su iPad):
          // si passa alla conferma manuale del genitore.
          manualMode = true;
          setStatus('Microfono non disponibile: conferma qui sotto', 'off');
          setActions();
        } else if (e.error === 'no-speech' || e.error === 'aborted' || e.error === 'network') {
          // gestito da onend / ri-ascolto; network lo riproviamo una volta
        }
        // gli altri errori finiscono nel normale flusso di ri-ascolto
      };

      rec.onend = function () {
        listening = false;
        rec = null;
        if (judged || !sessionOn || !current || seq !== pressSeq) return;
        listenFails += 1;
        if (listenFails < MAX_RELISTEN) {
          setStatus('Non ho sentito bene… riprovo 🎤', 'on');
          setTimeout(function () { tryListen(seq); }, 600);
        } else {
          setStatus('Non ho sentito nulla: premi di nuovo 🎤', 'ready');
        }
      };

      rec.start();
      listening = true;
      setStatus('🎤 Sto ascoltando… parla ad alta voce!', 'on');
    } catch (err) {
      listening = false;
      rec = null;
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

  // ---------- Valutazione tollerante ----------
  // Numero minimo di modifiche per trasformare a in b (Levenshtein)
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = new Array(n + 1), cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      const t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }

  // Parole chiave: MAIUSCOLE, accenti ridotti, solo lettere
  function normalize(s) {
    return String(s).toUpperCase()
      .replace(/[ÀÁÂÃÄÅ]/g, 'A').replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I').replace(/[ÒÓÔÖØ]/g, 'O').replace(/[ÙÚÛÜ]/g, 'U')
      .replace(/[^A-Z]/g, '');
  }

  // Token del discorso: "Il pane!" → ['IL','PANE']
  function tokens(s) {
    return String(s).toUpperCase()
      .replace(/[ÀÁÂÃÄÅ]/g, 'A').replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I').replace(/[ÒÓÔÖØ]/g, 'O').replace(/[ÙÚÛÜ]/g, 'U')
      .split(/[^A-Z]+/).filter(Boolean);
  }

  // Migliore corrispondenza tra target e alternative del riconoscitore.
  // Restituisce { dist, transcript }: dist = 0 trovata esatta (anche come
  // parte di una frase, "il PANE"), Infinity = nessuna parola plausibile.
  function bestMatch(target, alts) {
    let best = Infinity, heard = '';
    for (let k = 0; k < alts.length; k++) {
      const tk = tokens(alts[k]);
      const joined = tk.join('');
      if (target && joined.indexOf(target) !== -1) return { dist: 0, transcript: alts[k] };
      for (let i = 0; i < tk.length; i++) {
        const t = tk[i];
        if (t.length < 2 && target.length > 1) continue; // rumore tipo "E"
        if (Math.abs(t.length - target.length) > 3) continue; // troppo lontana
        const d = lev(t, target);
        if (d < best) { best = d; heard = alts[k]; }
      }
    }
    return { dist: best, transcript: heard };
  }

  // Quanto il discorso è vicino al target?
  // 'good' = riconosciuta, 'close' = quasi, 'miss' = non riconosciuta
  function matchQuality(target, alts) {
    const maxDist = target.length <= 3 ? 0 : target.length <= 5 ? 1 : 2;
    // tolleranza: le voci dei bambini vengono spesso trascritte con
    // piccoli errori (P/B, T/D, vocali incerte…)
    const d = bestMatch(target, alts).dist;
    if (d <= maxDist) return 'good';
    if (d <= maxDist + 2) return 'close';
    return 'miss';
  }

  // Valuta le alternative del riconoscitore
  function judge(alts) {
    if (!current || judged) return;
    const target = normalize(current.text);
    const clean = (alts || []).filter(function (s) {
      return s && normalize(s).length >= 2;
    });
    if (!clean.length) return; // solo rumore: si ri-ascolta

    const m = bestMatch(target, clean);
    const q = matchQuality(target, clean);
    if (q === 'good') {
      correct();
    } else {
      // "Ho sentito" riporta l'alternativa che ha ottenuto il punteggio migliore
      const heard = m.transcript || clean[0];
      wrong((q === 'close' ? 'Quasi! ' : '') + 'Ho sentito: «' + heard + '» — ');
    }
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
    setStatus('Perfetto! 🎉', 'off');

    hearAgain(function () {
      if (sessionOn) setTimeout(next, 500); // passa automaticamente alla successiva
    });
    updateNote();
  }

  function wrong(heardPrefix) {
    if (!current || judged) return;
    judged = true;
    stopListening();
    const p = IAL.Store.active();
    IAL.Store.record(p, current, false);

    const wordEl = document.getElementById('sp-word');
    if (wordEl) wordEl.className = 'big-word ko shake';
    setMsg((heardPrefix || '') + IAL.UI.retryMsg(), 'try');
    setStatus('Ci riproviamo! 💪', 'off');

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
  function manualWrong() { if (!judged) wrong(''); }

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

  // Per i collaudi automatici (senza microfono)
  function matchTest(target, heard) {
    return matchQuality(normalize(target), [heard]) === 'good';
  }

  return { show: show, hide: hide, matchTest: matchTest };
})();
