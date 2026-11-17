/* ============================================================
   IMPARO A LEGGERE — MODO D: VEDI E SCEGLI
   1. Compare l'immagine della parola (senza scriverla).
   2. Sotto, scelta multipla: l'inizio della parola (prime
      due lettere) tra 2–4 opzioni.
   3. Le opzioni sono SOLO sillabe studiate e attive
      (nell'Area Genitori): mai elementi fuori dal percorso.
   4. Risposta giusta → opzione VERDE, stellina, parola
      completa rivelata, pronuncia della parola e passaggio
      automatico alla successiva.
      Risposta sbagliata → opzione ROSSA (disabilitata) e
      si può riprovare sulle altre.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Choice = (function () {
  const el = IAL.UI.el;
  let current = null;
  let answered = false;
  let sessionOn = false;

  function show() {
    sessionOn = true;
    render();
    next();
  }

  function hide() {
    sessionOn = false;
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ } }
  }

  function render() {
    const p = IAL.Store.active();
    const topbar = el('div', { class: 'topbar' }, [
      el('button', { class: 'chip', onclick: function () { hide(); IAL.Home.show(); }, 'aria-label': 'Torna al menu' }, ['🏠 Menu']),
      el('span', { class: 'chip' }, ['⭐ ', String(p.stats.stars)])
    ]);

    const card = el('div', { class: 'exercise-card' }, [
      el('div', { class: 'exercise-type' }, ['Che cosa vedi?']),
      el('div', { class: 'choice-img', id: 'vc-img' }, ['…']),
      el('div', { class: 'feedback-msg', id: 'vc-msg' }, ['']),
      el('div', { class: 'choice-grid', id: 'vc-options' }, []),
      el('div', { id: 'vc-reveal' })
    ]);

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, ['VEDI E SCEGLI']),
      card,
      el('p', { class: 'progress-note', id: 'vc-note' }, ['']),
      el('button', { class: 'btn btn-soft btn-block', style: 'margin-top:10px', onclick: function () { hide(); IAL.Home.show(); } }, ['🏠 TORNA AL MENU'])
    ]);
  }

  function next() {
    const p = IAL.Store.active();
    const ex = IAL.Engine.nextChoice(p, { lengths: p.settings.lengths });

    const imgEl = document.getElementById('vc-img');
    const msgEl = document.getElementById('vc-msg');
    const optsEl = document.getElementById('vc-options');
    const revealEl = document.getElementById('vc-reveal');
    if (!imgEl) return;

    if (!ex) {
      current = null;
      imgEl.textContent = '🤔';
      setMsg('', '');
      if (optsEl) optsEl.innerHTML = '';
      if (revealEl) revealEl.innerHTML = '';
      const noteEl = document.getElementById('vc-note');
      if (noteEl) {
        noteEl.textContent = 'Con le sillabe attuali non ci sono parole con immagine. ' +
          'Attiva più sillabe nell’Area Genitori per esercizi come PANE, PALLA, MELA…';
      }
      return;
    }

    current = ex;
    answered = false;
    imgEl.textContent = ex.img;
    setMsg('Dove inizia la parola? 🔍', '');
    if (revealEl) revealEl.innerHTML = '';
    if (optsEl) {
      optsEl.innerHTML = '';
      ex.options.forEach(function (syl) {
        optsEl.appendChild(el('button', {
          class: 'choice-btn',
          onclick: function (e) { choose(e.currentTarget, syl); }
        }, [syl]));
      });
    }
    updateNote();
  }

  function choose(btn, syl) {
    if (!current || answered || btn.disabled) return;
    const p = IAL.Store.active();

    if (syl === current.syllable) {
      answered = true;
      IAL.Store.record(p, current, true);
      IAL.UI.starBurst('⭐');
      btn.classList.add('good');
      setMsg(IAL.UI.praise(), '');

      // Rivela immagine + parola completa
      const revealEl = document.getElementById('vc-reveal');
      if (revealEl) {
        revealEl.innerHTML = '';
        const box = el('div', { class: 'associated' });
        box.appendChild(el('div', { class: 'img' }, [current.img]));
        box.appendChild(el('div', { class: 'lbl' }, [current.word]));
        revealEl.appendChild(box);
      }
      speakWord(current.word);
      if (sessionOn) setTimeout(function () { if (sessionOn) next(); }, 1800);
    } else {
      IAL.Store.record(p, current, false);
      btn.classList.add('ko');
      btn.disabled = true;
      setMsg(IAL.UI.retryMsg(), 'try');
    }
    updateNote();
  }

  function setMsg(text, cls) {
    const msgEl = document.getElementById('vc-msg');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'feedback-msg' + (cls ? ' ' + cls : '');
  }

  function updateNote() {
    const p = IAL.Store.active();
    const noteEl = document.getElementById('vc-note');
    if (!noteEl) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' + p.stats.correct + ' esercizi corretti';
  }

  // ---------- Pronuncia della parola (sintesi vocale) ----------
  function speakWord(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT';
      u.rate = 0.8;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } catch (e) { /* la voce è un extra: mai bloccare l'esercizio */ }
  }

  return { show: show, hide: hide };
})();
