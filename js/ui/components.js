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
  // Accorgimenti indispensabili perché la voce si senta davvero:
  // 1. su iPhone/iPad e Chrome la sintesi va "sbloccata" con un tocco
  //    dell'utente (primo speak dentro un gesto);
  // 2. chiamare cancel() subito prima di speak() fa perdere la frase su
  //    molti dispositivi: qui si cancella solo se una voce è già in corso;
  // 3. se la voce scelta non è installata, si riprova senza indicarla;
  // 4. su iPhone la voce può essere mutata dall'interruttore del silenzioso:
  //    un piccolo audio in riproduzione sposta la sessione su "musica".
  let voices = [];
  let preferredVoice = null;
  let unlockDone = false;
  let unlockAudio = null;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
    const exact = [];
    const other = [];
    voices.forEach(function (v) {
      const lang = String(v.lang || '');
      const name = String(v.name || '');
      if (/^it[-_]?IT$/i.test(lang)) exact.push(v);
      else if (/^it([-_]|$)/i.test(lang) || /italian|italiano/i.test(name)) other.push(v);
    });
    const pool = exact.length ? exact : other;
    const local = pool.filter(function (v) { return v.localService; });
    preferredVoice = local[0] || pool[0] || null;
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    try {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } catch (e) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  function unlockSpeech() {
    if (unlockDone || !('speechSynthesis' in window)) return;
    unlockDone = true;
    loadVoices();
    // sblocca la sintesi dentro il gesto dell'utente
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.lang = 'it-IT';
      window.speechSynthesis.speak(u);
    } catch (e) { /* niente sintesi: pazienza */ }
    // iPhone: un brevissimo audio silenzioso sposta la sessione audio su
    // "riproduzione": la voce si sente anche con l'interruttore del
    // silenzioso attivo. Dura un attimo e non resta in riproduzione.
    try {
      if (!unlockAudio) {
        unlockAudio = new Audio(silentWav());
        unlockAudio.volume = 0.01;
        unlockAudio.setAttribute('playsinline', '');
        const pr = unlockAudio.play();
        if (pr && pr.catch) pr.catch(function () { /* autoplay bloccato */ });
      }
    } catch (e) { /* audio non disponibile */ }
  }

  // WAV di 0,3 secondi completamente silenzioso (nessun file esterno)
  function silentWav() {
    const rate = 8000;
    const n = Math.floor(rate * 0.3);
    const size = 44 + n;
    const buf = new Uint8Array(size);
    const dv = new DataView(buf.buffer);
    function chars(off, s) { for (let i = 0; i < s.length; i++) buf[off + i] = s.charCodeAt(i); }
    chars(0, 'RIFF'); dv.setUint32(4, size - 8, true); chars(8, 'WAVE');
    chars(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true); dv.setUint32(24, rate, true); dv.setUint32(28, rate, true);
    dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
    chars(36, 'data'); dv.setUint32(40, n, true);
    for (let i = 44; i < size; i++) buf[i] = 128; // silenzio (PCM 8 bit)
    let bin = '';
    for (let i = 0; i < size; i++) bin += String.fromCharCode(buf[i]);
    try { return 'data:audio/wav;base64,' + btoa(bin); } catch (e) { return ''; }
  }

  if (typeof document !== 'undefined') {
    ['pointerdown', 'touchstart', 'click'].forEach(function (ev) {
      document.addEventListener(ev, unlockSpeech, true);
    });
  }

  let activeSay = null;

  function stopSpeech() {
    if (activeSay) {
      try { activeSay.cancel(); } catch (e) { /* ignora */ }
      activeSay = null;
    }
    if (!('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch (e) { /* nessuna voce attiva */ }
  }

  // Pronuncia un testo e chiama done() quando ha finito (o al massimo dopo
  // 6 secondi, per non bloccare mai l'esercizio se il motore voce non
  // risponde). Usata dopo ogni risposta corretta.
  function say(text, done) {
    let finished = false;
    let started = false;
    let retried = false;
    let watchdog = null;
    let safety = null;
    let retryTimer = null;

    const clearTimers = function () {
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
      if (safety) { clearTimeout(safety); safety = null; }
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    };

    // annullamento (cambio schermata): niente voce, niente done()
    const cancel = function () {
      if (finished) return;
      finished = true;
      clearTimers();
      if (activeSay && activeSay.cancel === cancel) activeSay = null;
    };

    const finish = function () {
      if (finished) return;
      finished = true;
      clearTimers();
      if (activeSay && activeSay.cancel === cancel) activeSay = null;
      if (done) done();
    };

    if (!('speechSynthesis' in window) || !text) { finish(); return; }
    unlockSpeech();
    const synth = window.speechSynthesis;
    if (!voices.length) loadVoices();
    const voice = preferredVoice;
    activeSay = { cancel: cancel };

    function attempt(useVoice) {
      if (finished) return;
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'it-IT';
      u.rate = 0.85;
      u.pitch = 1.05;
      u.volume = 1;
      if (useVoice && voice) u.voice = voice;
      u.onstart = function () { started = true; };
      u.onend = finish;
      u.onerror = function () {
        if (!started && !retried) retry();
        else finish();
      };
      try { synth.resume(); } catch (e) { /* non tutti i browser hanno resume */ }
      try {
        synth.speak(u);
      } catch (e) {
        finish();
        return;
      }
      if (watchdog) clearTimeout(watchdog);
      watchdog = setTimeout(function () {
        if (finished || started) return;
        if (!retried) retry(); else finish();
      }, 1200);
    }

    function retry() {
      if (finished) return;
      retried = true;
      started = false;
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
      try { synth.cancel(); } catch (e) { /* ignora */ }
      // seconda possibilità senza voce specifica: a volte la voce scelta
      // non è installata e il motore resta muto
      retryTimer = setTimeout(function () { attempt(false); }, 160);
    }

    safety = setTimeout(finish, 6000);

    let busy = false;
    try { busy = synth.speaking || synth.pending; } catch (e) { busy = false; }
    if (busy) {
      try { synth.cancel(); } catch (e) { /* ignora */ }
      retryTimer = setTimeout(function () { attempt(true); }, 160);
    } else {
      attempt(true);
    }
  }

  // Informazioni sulla voce (per il collaudo nell'Area Genitori)
  function speechInfo() {
    if (!('speechSynthesis' in window)) return { ok: false, count: 0, voice: '' };
    if (!voices.length) loadVoices();
    return {
      ok: true,
      count: voices.length,
      voice: preferredVoice ? String(preferredVoice.name || '') : ''
    };
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
    rand: rand, pic: pic, say: say, stopSpeech: stopSpeech, speechInfo: speechInfo
  };
})();
