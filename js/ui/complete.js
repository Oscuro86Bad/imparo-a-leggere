/* ============================================================
   IMPARO A LEGGERE — MODO G: COMPLETA LA PAROLA
   1. Compare l'immagine di una parola reale (anche lunga).
   2. La parola è scritta ma mancano le ULTIME DUE lettere.
   3. Il bambino scrive le due lettere mancanti CON IL DITO sulla
      lavagna qui sotto (canvas), poi preme ✅ HO SCRITTO.
   4. L'app mostra le lettere giuste: il bambino confronta e conferma
      (✅ È GIUSTO → stellina, parola pronunciata, passaggio
      automatico) oppure 🔁 RIPROVO (cancella e riscrive la stessa
      parola).
   La sezione è svincolata da lunghezze, livelli e sillabe studiate:
   basta che la parola contenga una consonante attiva e che le due
   lettere da scrivere siano conosciute dal bambino.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Complete = (function () {
  const el = IAL.UI.el;
  let current = null;
  let answered = false;
  let sessionOn = false;
  let canvas = null;
  let ctx = null;
  let padRect = null;
  let drawing = false;
  let hasInk = false;

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

    const card = el('div', { class: 'exercise-card cp-card' }, [
      el('div', { class: 'exercise-type', id: 'cp-type' }, ['Completa la parola']),
      el('div', { class: 'choice-img', id: 'cp-img' }, ['…']),
      el('div', { class: 'word-slots', id: 'cp-slots' }, []),
      el('div', { class: 'feedback-msg', id: 'cp-msg' }, ['']),
      el('canvas', { class: 'draw-pad', id: 'cp-canvas', 'aria-label': 'Scrivi qui le lettere con il dito' }),
      el('div', { id: 'cp-check' }, []),
      el('div', { class: 'actions', id: 'cp-actions' }, [
        el('button', { class: 'btn btn-green', style: 'grid-column: span 2; min-height: 74px;', onclick: showAnswer }, ['✅', 'HO SCRITTO']),
        el('button', { class: 'btn btn-soft', onclick: clearPad }, ['🧽', 'CANCELLA']),
        el('button', { class: 'btn btn-primary', onclick: next }, ['⏭️', 'SALTA'])
      ])
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, [
        'COMPLETA LA PAROLA',
        el('span', { class: 'cloud-badge' }, ['(NEW-BETA)'])
      ]),
      card,
      el('p', { class: 'progress-note', id: 'cp-note' }, ['']),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { hide(); IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);

    bindPad();
  }

  // ---------- Lavagna (canvas) ----------
  function bindPad() {
    canvas = document.getElementById('cp-canvas');
    if (!canvas) return;
    padRect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(padRect.width * dpr));
    canvas.height = Math.max(1, Math.round(padRect.height * dpr));
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2F5E91';
    canvas.addEventListener('pointerdown', padDown);
    canvas.addEventListener('pointermove', padMove);
    canvas.addEventListener('pointerup', padUp);
    canvas.addEventListener('pointercancel', padUp);
    canvas.addEventListener('pointerleave', padUp);
  }

  function padPoint(e) {
    if (!padRect) padRect = canvas.getBoundingClientRect();
    return { x: e.clientX - padRect.left, y: e.clientY - padRect.top };
  }

  function padDown(e) {
    if (!ctx || answered) return;
    e.preventDefault();
    padRect = canvas.getBoundingClientRect();
    drawing = true;
    hasInk = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* non sempre disponibile */ }
    const pt = padPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
    ctx.stroke();
  }

  function padMove(e) {
    if (!drawing || !ctx) return;
    e.preventDefault();
    const pt = padPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  function padUp() {
    drawing = false;
  }

  function clearPad() {
    if (!ctx || !canvas) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    hasInk = false;
  }

  // ---------- Esercizio ----------
  function next() {
    IAL.UI.stopSpeech();
    const p = IAL.Store.active();
    const ex = IAL.Engine.nextComplete(p);

    const imgEl = document.getElementById('cp-img');
    if (!imgEl) return;

    answered = false;
    showCheck(false);
    setMsg('', '');
    clearPad();

    if (!ex) {
      current = null;
      imgEl.textContent = '🤔';
      renderSlots(null, false);
      const noteEl = document.getElementById('cp-note');
      if (noteEl) {
        noteEl.textContent = 'Per questa sezione serve almeno una consonante attiva: ' +
          'attivane una nell’Area Genitori 🔒';
      }
      return;
    }

    current = ex;
    imgEl.innerHTML = '';
    imgEl.appendChild(IAL.UI.pic(ex.img));
    renderSlots(ex, false);
    setMsg('Scrivi le due lettere che mancano, con il dito ✍️', '');
    updateNote();
  }

  function renderSlots(ex, revealed) {
    const slots = document.getElementById('cp-slots');
    if (!slots) return;
    slots.innerHTML = '';
    if (!ex) return;
    // le lettere si rimpiccioliscono nelle parole lunghe, così stanno su una riga
    slots.style.setProperty('--ws-n', ex.word.length);
    Array.from(ex.prefix).forEach(function (ch) {
      slots.appendChild(el('span', { class: 'ws-letter' }, [ch]));
    });
    Array.from(ex.hidden).forEach(function (ch, i) {
      slots.appendChild(el('span', {
        class: 'ws-blank' + (revealed ? ' filled' : ''),
        id: 'cp-b' + i
      }, [revealed ? ch : '']));
    });
  }

  // Il bambino ha finito di scrivere: si mostrano le lettere giuste e si
  // chiede di confrontare (l'app non può leggere la scrittura a mano).
  function showAnswer() {
    if (!current || answered) return;
    if (!hasInk) { IAL.UI.toast('Scrivi le lettere con il dito ✍️'); return; }
    answered = true;
    renderSlots(current, true);
    setMsg('Hai scritto «' + current.hidden + '»? Guarda qui sopra 👆', '');
    showCheck(true);
  }

  function showCheck(on) {
    const box = document.getElementById('cp-check');
    if (!box) return;
    box.innerHTML = '';
    // durante il confronto i pulsanti "HO SCRITTO / CANCELLA / SALTA" non servono
    const actions = document.getElementById('cp-actions');
    if (actions) actions.style.display = on ? 'none' : '';
    if (!on || !current) return;
    box.appendChild(el('div', { class: 'check-question' }, ['È quello che hai scritto?']));
    box.appendChild(el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-green', onclick: confirmOk }, ['✅', 'È GIUSTO']),
      el('button', { class: 'btn btn-orange', onclick: retry }, ['🔁', 'RIPROVO'])
    ]));
  }

  function confirmOk() {
    if (!current || !answered) return;
    const p = IAL.Store.active();
    const ex = current;
    IAL.Store.record(p, ex, true);
    IAL.UI.starBurst('⭐');
    setMsg(IAL.UI.praise(), '');
    showCheck(false);
    updateNote();
    // Pronuncia la parola completa, poi passa alla successiva
    IAL.UI.say(ex.word, function () {
      if (!sessionOn) return;
      setTimeout(function () {
        if (!sessionOn || current !== ex) return;
        next();
      }, 700);
    });
  }

  function retry() {
    if (!current) return;
    answered = false;
    renderSlots(current, false);
    showCheck(false);
    clearPad();
    setMsg('Riprova: scrivi le due lettere che mancano ✍️', 'try');
  }

  function setMsg(text, cls) {
    const msgEl = document.getElementById('cp-msg');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'feedback-msg' + (cls ? ' ' + cls : '');
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('cp-note');
    if (!noteEl) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  return {
    show: show,
    hide: hide,
    currentForTest: function () { return current; },
    drawnForTest: function () { return hasInk; }
  };
})();
