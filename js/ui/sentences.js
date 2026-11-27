/* ============================================================
   IMPARO A LEGGERE — LEGGI LA FRASE
   Una frase italiana compiuta in caratteri grandi, senza immagini.
   Compare solo se TUTTE le sue lettere (vocali comprese) sono attive
   nell'Area Genitori; la H è trattata come consonante.

   ASCOLTA LENTO: la frase resta solo testo; la parola letta viene
   evidenziata (e dentro di essa anche la sillaba corrente), con voce
   rallentata e fallback a timer per i browser che non inviano onboundary.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Sentences = (function () {
  const el = IAL.UI.el;
  let current = null;
  let slowActive = false;
  let slowMode = false;
  let sylTimer = null;

  // Il comando è disattivato per ora: il codice resta ma non appare nella UI.
  function slowEnabled() { return IAL.CONFIG.SHOW_SLOW_LISTEN === true; }

  const LEVEL_NAMES = {
    1: 'Frase breve',
    2: 'Frase facile',
    3: 'Frase più lunga',
    4: 'Frase ricca'
  };

  // Sillabazione italiana semplificata ma corretta sui casi dell'app:
  // V.CV (MELA → ME LA), VC.CV (PENTOLA → PEN TO LA), V.CCV (MAMMA → MA MMA).
  function splitSyllables(word) {
    const w = String(word || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!w) return [];
    function isV(ch) { return 'AEIOU'.indexOf(ch) !== -1; }
    const out = [];
    let start = 0;
    let i = 0;
    while (i < w.length) {
      if (!isV(w[i])) { i++; continue; }
      let j = i;
      while (j < w.length && isV(w[j])) j++;
      let end = j;
      if (j < w.length && !isV(w[j])) {
        const c1 = w[j];
        const c2 = j + 1 < w.length ? w[j + 1] : '';
        if (c2 && c2 === c1) end = j;            // doppia: MA + MMA
        else if (c2 && !isV(c2)) end = j + 1;    // gruppo: PEN + TO + LA
        // altrimenti la consonante singola apre la sillaba successiva
      }
      out.push(w.slice(start, end));
      start = end;
      i = end;
    }
    if (start < w.length) {
      if (out.length) out[out.length - 1] += w.slice(start);
      else out.push(w.slice(start));
    }
    return out.filter(Boolean);
  }

  function show(opts) {
    opts = opts || {};
    slowMode = slowEnabled() && !!opts.slow;
    current = null;
    slowActive = false;
    render();
    next();
  }

  // Voce dall'icona del menu: apre la frase e la legge subito piano.
  // Se il comando è nascosto non fa nulla.
  function showSlow() { if (!slowEnabled()) return; show({ slow: true }); }

  function hide() {
    IAL.UI.stopSpeech();
    slowActive = false;
    clearHighlight();
  }

  function render() {
    const p = IAL.Store.active();
    const back = function () { hide(); IAL.Home.show(); };
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: back, 'aria-label': 'Torna al menu' }, ['🏠 Menu'])
    ]);

    const card = el('div', { class: 'comic-card' }, [
      el('div', {
        class: 'exercise-type', id: 'sentence-level'
      }, ['…']),
      el('div', { class: 'comic-bubble', id: 'sentence-text' }, ['—']),
      el('div', { class: 'word-tools' }, [
        el('button', { class: 'chip', onclick: speakCurrent, 'aria-label': 'Ascolta la frase' }, ['🔊 SENTI LA FRASE']),
        slowEnabled()
          ? el('button', { class: 'chip chip-slow', onclick: speakSlow, 'aria-label': 'Ascolta la frase lentamente' }, ['🐢 ASCOLTA LENTO'])
          : null
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
      el('h1', { class: 'app-title' }, [slowMode ? 'ASCOLTA LENTO' : 'LEGGI LA FRASE']),
      slowMode
        ? el('p', { class: 'app-subtitle' }, ['La frase si legge piano 🐢 e le parole si illuminano'])
        : null,
      card,
      note,
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: back }, ['🏠 TORNA AL MENU'])
    ]);

    updateNote();
    if (IAL.Engine.availability(p).sentences === 0) {
      IAL.UI.toast('Attiva prima qualche lettera nell’Area Genitori 🔒');
    }
  }

  // Ogni parola è uno span: così la voce può evidenziarla senza immagini.
  // Il textContent del fumetto resta ESATTAMENTE la frase originale.
  function paintText(entry) {
    const textEl = document.getElementById('sentence-text');
    if (!textEl) return;
    textEl.innerHTML = '';
    if (!entry) { textEl.textContent = '—'; return; }
    const words = IAL.UI.wordSpans(entry.t);
    words.forEach(function (w, i) {
      if (i) textEl.appendChild(document.createTextNode(' '));
      const span = el('span', { class: 'word-token', 'data-i': i });
      const core = w.text.replace(/[^A-Za-z]/g, '');
      const first = core ? w.text.indexOf(core[0]) : 0;
      const last = core ? w.text.lastIndexOf(core[core.length - 1]) + 1 : w.text.length;
      if (first > 0) span.appendChild(document.createTextNode(w.text.slice(0, first)));
      const syls = core ? splitSyllables(core) : [];
      if (syls.length) {
        syls.forEach(function (s) { span.appendChild(el('span', { class: 'syl-token' }, [s])); });
      } else {
        span.appendChild(document.createTextNode(core || w.text));
      }
      if (last < w.text.length) span.appendChild(document.createTextNode(w.text.slice(last)));
      textEl.appendChild(span);
    });
  }

  function clearHighlight() {
    if (sylTimer) { clearInterval(sylTimer); sylTimer = null; }
    const tokens = document.querySelectorAll('#sentence-text .word-token');
    Array.prototype.forEach.call(tokens, function (n) {
      n.classList.remove('active');
      Array.prototype.forEach.call(n.querySelectorAll('.syl-token'), function (s) {
        s.classList.remove('active');
      });
    });
  }

  function highlightWord(i) {
    clearHighlight();
    if (i < 0 || !slowActive) return;
    const tokens = document.querySelectorAll('#sentence-text .word-token');
    if (!tokens[i]) return;
    tokens[i].classList.add('active');
    const syls = tokens[i].querySelectorAll('.syl-token');
    if (!syls.length) return;
    let k = 0;
    syls[k].classList.add('active');
    sylTimer = setInterval(function () {
      if (!slowActive || !document.getElementById('sentence-text')) { clearHighlight(); return; }
      if (k >= syls.length - 1) {
        if (sylTimer) { clearInterval(sylTimer); sylTimer = null; }
        return;
      }
      syls[k].classList.remove('active');
      k++;
      syls[k].classList.add('active');
    }, 330);
  }

  function next() {
    IAL.UI.stopSpeech();
    slowActive = false;
    clearHighlight();
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
    paintText(entry);
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'feedback-msg'; }
    updateNote();
    if (slowMode && slowEnabled()) speakSlow();
  }

  function speakCurrent() {
    if (!current) return;
    slowActive = false;
    clearHighlight();
    IAL.UI.say(current.t);
  }

  function speakSlow() {
    if (!current) return;
    IAL.UI.stopSpeech();
    clearHighlight();
    slowActive = true;
    IAL.UI.readAloud(current.t, {
      rate: 0.6,
      onWord: highlightWord,
      onCancel: clearHighlight,
      onDone: function () {
        setTimeout(function () { slowActive = false; clearHighlight(); }, 400);
      }
    });
  }

  function markRead() {
    if (!current) return;
    IAL.UI.stopSpeech();
    slowActive = false;
    clearHighlight();
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
    const advance = function () {
      setTimeout(function () {
        if (current !== read) return;
        if (!document.getElementById('sentence-text')) return;
        next();
      }, 450);
    };
    // In modalità lenta la frase successiva viene riletta piano da next():
    // evitiamo di sovrapporre la voce normale a quella lenta.
    if (slowMode) advance();
    else IAL.UI.say(read.t, advance);
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
  function highlightedForTest() {
    const n = document.querySelector('#sentence-text .word-token.active');
    return n ? Number(n.getAttribute('data-i')) : -1;
  }
  function syllablesForTest(word) { return splitSyllables(word); }

  return {
    show: show, showSlow: showSlow, hide: hide, currentForTest: currentForTest,
    highlightedForTest: highlightedForTest, syllablesForTest: syllablesForTest
  };
})();
