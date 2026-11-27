/* ============================================================
   IMPARO A LEGGERE — SEZIONE: COLLEGA L'IMMAGINE
   ------------------------------------------------------------
   8 immagini di parole che il bambino sa già leggere e, sotto,
   i loro inizi (le prime due lettere) dentro riquadri bianchi.
   Tutto si può trascinare (dito o mouse):
     • inizio giusto sopra la sua immagine → i due riquadri
       diventano verdi e spariscono, con una stellina;
     • inizio sbagliato → i riquadri diventano rossi per un
       attimo e quello trascinato torna al suo posto.
   In alternativa al trascinamento si può toccare l'inizio e poi
   l'immagine (più facile per le dita più piccole).
   Quando tutte le coppie sono state collegate, il pulsante
   RICOMINCIA (sempre presente sotto) prepara parole nuove.
   Le parole sono reali e interamente leggibili con le lettere e
   le sillabe attive: niente lettere mai studiate.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.Link = (function () {
  const el = IAL.UI.el;
  const MAX_PAIRS = 8;

  let sessionOn = false;
  let round = null;          // { pairs: [{ word, key, img }] }
  let selected = null;       // riquadro scelto con un tocco
  let drag = null;           // trascinamento in corso
  let matchedCount = 0;

  function show() {
    sessionOn = true;
    newRound();
  }

  function hide() {
    sessionOn = false;
    selected = null;
    endDrag();
    IAL.UI.stopSpeech();
  }

  // ---------- Nuova partita ----------
  function newRound() {
    endDrag();
    selected = null;
    matchedCount = 0;

    const p = IAL.Store.active();
    const pairs = p ? IAL.Engine.linkPairs(p, MAX_PAIRS) : [];
    round = { pairs: pairs };

    const topbar = el('div', { class: 'topbar' }, [
      el('button', {
        class: 'chip',
        onclick: function () { hide(); IAL.Home.show(); },
        'aria-label': 'Torna al menu'
      }, ['🏠 Menu'])
    ]);

    const cardItems = [
      el('div', { class: 'exercise-type' }, ['Collega l’immagine'])
    ];

    if (pairs.length >= 2) {
      cardItems.push(
        el('p', { class: 'link-hint' }, ['Trascina le prime due lettere sull’immagine giusta.']),
        el('div', { class: 'link-label' }, ['IMMAGINI']),
        el('div', { class: 'link-grid', id: 'link-images' }, shuffle(pairs).map(imageTile)),
        el('div', { class: 'link-arrow' }, ['⬇️']),
        el('div', { class: 'link-label' }, ['INIZI DELLE PAROLE']),
        el('div', { class: 'link-grid', id: 'link-letters' }, shuffle(pairs).map(letterTile)),
        el('div', { class: 'feedback-msg', id: 'link-msg' }, [''])
      );
    } else {
      cardItems.push(el('p', { class: 'link-hint' }, [
        'Per giocare servono almeno 2 parole con immagine che il bambino sa già leggere. ',
        'Attiva altre lettere nell’Area Genitori 🔒 e riprova.'
      ]));
    }

    const restart = el('button', {
      class: 'btn btn-indigo btn-block',
      id: 'link-restart',
      onclick: newRound
    }, ['🔄', 'RICOMINCIA']);

    const note = el('p', { class: 'progress-note', id: 'link-note' }, ['']);
    if (pairs.length < MAX_PAIRS) {
      note.textContent = pairs.length ?
        'Con le lettere attive ci sono ' + pairs.length + ' parole disponibili.' :
        'Nessuna parola disponibile con le lettere attive.';
    }

    IAL.UI.renderScreen([
      topbar,
      el('h1', { class: 'app-title' }, [
        'COLLEGA L’IMMAGINE',
        el('span', { class: 'cloud-badge' }, ['(NEW-BETA)'])
      ]),
      el('div', { class: 'exercise-card link-card' }, cardItems),
      restart,
      note,
      el('button', {
        class: 'btn btn-soft btn-block',
        style: 'margin-top:10px',
        onclick: function () { hide(); IAL.Home.show(); }
      }, ['🏠 TORNA AL MENU'])
    ]);

    updateNote();
  }

  // ---------- Riquadri ----------
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeTile(kind, pair) {
    const isImg = kind === 'img';
    const node = el('div', {
      class: 'link-tile ' + (isImg ? 'link-img' : 'link-letters'),
      'data-key': pair.key,
      'data-word': pair.word,
      role: 'button',
      tabindex: '0',
      'aria-label': isImg ? 'Immagine da collegare' : 'Inizio ' + pair.key
    }, isImg ? [IAL.UI.pic(pair.img)] : [pair.key]);

    const tile = { kind: kind, key: pair.key, word: pair.word, node: node, done: false };
    node.__link = tile;
    node.addEventListener('pointerdown', function (e) { startDrag(e, tile); });
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTap(tile);
      }
    });
    return node;
  }

  function imageTile(pair) { return makeTile('img', pair); }
  function letterTile(pair) { return makeTile('letters', pair); }

  // ---------- Trascinamento (Pointer Events: dito e mouse) ----------
  function startDrag(e, tile) {
    if (!sessionOn || tile.done || drag) return;
    if (e.button !== undefined && e.button !== 0) return;

    drag = {
      tile: tile,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false
    };
    tile.node.classList.add('dragging');
    tile.node.style.transition = 'none';
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  function onMove(e) {
    if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.pointerId)) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    if (!drag.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) drag.moved = true;
    drag.tile.node.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    if (drag.moved) {
      highlight(findTarget(e.clientX, e.clientY, drag.tile));
      if (e.cancelable) e.preventDefault();
    }
  }

  function onUp(e) {
    if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.pointerId)) return;
    const moved = drag.moved;
    const tile = drag.tile;
    const x = drag.lastX;
    const y = drag.lastY;
    endDrag();

    tile.node.classList.remove('dragging');
    tile.node.style.transition = '';
    const target = moved ? findTarget(x, y, tile) : null;
    tile.node.style.transform = '';

    if (!moved) {
      handleTap(tile);
      return;
    }
    if (!target) {
      setMsg('Riprova! 🤔', 'try');
      return;
    }
    attempt(tile, target, tile);
  }

  function endDrag() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (drag) {
      drag.tile.node.classList.remove('dragging');
      drag.tile.node.style.transition = '';
      drag.tile.node.style.transform = '';
      drag = null;
    }
    highlight(null);
  }

  // Il riquadro (immagine o inizio) sotto il dito, con un po' di margine:
  // per un bambino è più facile "centrare" il bersaglio.
  function findTarget(x, y, tile) {
    const wantImg = tile.kind === 'letters';
    const nodes = document.querySelectorAll(wantImg ? '.link-img' : '.link-letters');
    let best = null;
    let bestD = Infinity;
    Array.prototype.forEach.call(nodes, function (node) {
      const t = node.__link;
      if (!t || t.done) return;
      const r = node.getBoundingClientRect();
      const pad = 12;
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d < bestD) { bestD = d; best = t; }
    });
    return best;
  }

  function highlight(tile) {
    const old = document.querySelectorAll('.link-tile.hot');
    Array.prototype.forEach.call(old, function (n) { n.classList.remove('hot'); });
    if (tile && !tile.done) tile.node.classList.add('hot');
  }

  // ---------- Tocco (alternativa al trascinamento) ----------
  function handleTap(tile) {
    if (!sessionOn || tile.done) return;
    if (!selected) { select(tile); return; }
    if (selected === tile) { clearSelection(); return; }
    if (selected.kind === tile.kind) { clearSelection(); select(tile); return; }
    const first = selected;
    clearSelection();
    attempt(first, tile, first);
  }

  function select(tile) {
    clearSelection();
    selected = tile;
    tile.node.classList.add('sel');
    setMsg('Ora tocca l’immagine giusta 👆', '');
  }

  function clearSelection() {
    if (selected && selected.node) selected.node.classList.remove('sel');
    selected = null;
  }

  // ---------- Giusto / sbagliato ----------
  function attempt(a, b, flashed) {
    if (!a || !b || a.done || b.done) return;
    const letter = a.kind === 'letters' ? a : b;
    const image = a.kind === 'img' ? a : b;
    if (letter.key === image.key) succeed(letter, image);
    else fail(letter, image, flashed || letter);
  }

  function succeed(letter, image) {
    const p = IAL.Store.active();
    letter.done = true;
    image.done = true;
    clearSelection();

    letter.node.classList.add('ok');
    image.node.classList.add('ok');
    IAL.Store.record(p, { text: letter.word }, true);
    IAL.UI.starBurst('⭐');

    const word = letter.word;
    const rest = round.pairs.length - matchedCount - 1;
    const myRound = round;
    setMsg(rest > 0 ? IAL.UI.praise() : 'Bravo! Hai collegato tutte le parole 🎉', '');
    IAL.UI.say(word);

    setTimeout(function () {
      if (!sessionOn || round !== myRound) return;
      letter.node.classList.add('gone');
      image.node.classList.add('gone');
      matchedCount += 1;
      updateNote();
      if (matchedCount >= round.pairs.length && round.pairs.length) {
        const btn = document.getElementById('link-restart');
        if (btn) btn.classList.add('ready');
        IAL.UI.starBurst('🌟');
        setMsg('Bravo! Hai collegato tutte le parole 🎉', '');
      }
    }, 260);
  }

  function fail(letter, image, flashed) {
    const p = IAL.Store.active();
    IAL.Store.record(p, { text: letter.word }, false);
    clearSelection();

    // Rosso per un attimo; la voce NON rivela la parola.
    [flashed, image, letter].forEach(function (t) {
      if (!t || t.done || !t.node) return;
      t.node.classList.add('ko');
      setTimeout(function () { t.node.classList.remove('ko'); }, 520);
    });
    setMsg(IAL.UI.retryMsg(), 'try');
  }

  // ---------- Testi ----------
  function setMsg(text, cls) {
    const msgEl = document.getElementById('link-msg');
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'feedback-msg' + (cls ? ' ' + cls : '');
  }

  function updateNote() {
    const noteEl = document.getElementById('link-note');
    if (!noteEl) return;
    const p = IAL.Store.active();
    const total = round ? round.pairs.length : 0;
    if (!total) return;
    noteEl.textContent = '⭐ ' + p.stats.stars + ' stelline · ' +
      matchedCount + ' di ' + total + ' collegati' +
      (total < MAX_PAIRS ? ' · ' + total + ' parole disponibili con le lettere attive' : '');
  }

  return {
    show: show,
    hide: hide,
    currentForTest: function () { return round; },
    matchedForTest: function () { return matchedCount; }
  };
})();
