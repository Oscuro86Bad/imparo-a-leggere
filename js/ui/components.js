/* ============================================================
   IMPARO A LEGGERE — componenti UI di base
   Helper DOM, modali, toast, stelle animate, premi.
   ============================================================ */
window.IAL = window.IAL || {};

IAL.UI = (function () {

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      } else if (attrs[k] !== null && attrs[k] !== undefined) {
        node.setAttribute(k, attrs[k]);
      }
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || typeof c === 'boolean') return;
      if (typeof c === 'string' || typeof c === 'number') {
        node.appendChild(document.createTextNode(String(c)));
      } else {
        node.appendChild(c);
      }
    });
    return node;
  }

  // ---------- Schermata ----------
  function renderScreen(nodes, opts) {
    stopSpeech(); // nessuna voce deve continuare sopra la schermata nuova
    const app = document.getElementById('app');
    app.innerHTML = '';
    window.scrollTo(0, 0);
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { app.appendChild(n); });
  }

  // ---------- Voce (sintesi vocale) ----------
  function stopSpeech() {
    if (!('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch (e) { /* nessuna voce attiva */ }
  }

  // Voce italiana preferita (se il dispositivo ne ha una)
  function italianVoice() {
    try {
      const list = window.speechSynthesis.getVoices() || [];
      for (let i = 0; i < list.length; i++) {
        if (/^it([-_]|$)/i.test(list[i].lang || '')) return list[i];
      }
    } catch (e) { /* elenco voci non disponibile */ }
    return null;
  }

  // Pronuncia un testo e chiama done() quando ha finito (o al massimo dopo
  // 4 secondi, per non bloccare mai l'esercizio se il motore voce non
  // risponde). Usata dopo ogni risposta corretta.
  function say(text, done) {
    let finished = false;
    const finish = function () {
      if (finished) return;
      finished = true;
      if (done) done();
    };
    if (!('speechSynthesis' in window) || !text) { finish(); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'it-IT';
      u.rate = 0.85;
      u.pitch = 1.05;
      const v = italianVoice();
      if (v) u.voice = v;
      u.onend = finish;
      u.onerror = finish;
      window.speechSynthesis.speak(u);
      setTimeout(finish, 4000);
    } catch (e) {
      finish();
    }
  }

  // ---------- Overlay / modale ----------
  function closeModal() {
    const o = document.getElementById('overlay');
    o.className = 'overlay hidden';
    o.innerHTML = '';
  }

  function modal(contentNodes, opts) {
    opts = opts || {};
    const o = document.getElementById('overlay');
    const box = el('div', { class: 'modal' }, contentNodes);
    o.innerHTML = '';
    o.appendChild(box);
    o.className = 'overlay';
    o.onclick = function (e) { if (e.target === o && !opts.locked) closeModal(); };
  }

  function alertModal(title, message, emoji, btnLabel) {
    const btn = el('button', { class: 'btn btn-primary', onclick: closeModal }, btnLabel || 'OK');
    modal([
      el('div', { class: 'big-emoji' }, [emoji || '💡']),
      el('h3', {}, [title]),
      el('div', { class: 'modal-body' }, [message]),
      el('div', { class: 'modal-actions' }, [btn])
    ]);
  }

  function confirmModal(title, message, onYes, yesLabel) {
    modal([
      el('div', { class: 'big-emoji' }, ['🤔']),
      el('h3', {}, [title]),
      el('div', { class: 'modal-body' }, [message]),
      el('div', { class: 'modal-actions' }, [
        el('button', { class: 'btn btn-danger', onclick: function () { closeModal(); onYes(); } }, [yesLabel || 'Sì']),
        el('button', { class: 'btn btn-soft', onclick: closeModal }, ['Annulla'])
      ])
    ]);
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = el('div', { class: 'toast' }, [msg]);
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 2600);
  }

  // ---------- Feedback positivo ----------
  function starBurst(emoji) {
    const s = el('div', { class: 'star-burst' }, [emoji || '⭐']);
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 950);
  }

  const rand = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  const praise = function () { return rand(IAL.CONFIG.PRAISE); };
  const retryMsg = function () { return rand(IAL.CONFIG.RETRY); };

  // ---------- immagine di una parola ----------
  // L'archivio può usare un'emoji ('🍞') oppure un disegno del file
  // ('img/mimo.svg'): in quel caso si crea un vero <img>.
  function pic(value) {
    const s = String(value || '');
    if (/\.(svg|png|jpe?g|webp|gif)$/i.test(s)) {
      return el('img', { class: 'pic', src: s, alt: '', draggable: 'false' });
    }
    return document.createTextNode(s);
  }

  return {
    el: el, renderScreen: renderScreen,
    modal: modal, alertModal: alertModal, confirmModal: confirmModal, closeModal: closeModal,
    toast: toast, starBurst: starBurst, praise: praise, retryMsg: retryMsg,
    rand: rand, pic: pic, say: say, stopSpeech: stopSpeech
  };
})();
