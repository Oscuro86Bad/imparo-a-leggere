/* ============================================================
   IMPARO A LEGGERE — avvio dell'applicazione
   - Inizializza i dati (localStorage)
   - Mostra la schermata iniziale o l'onboarding
   - Registra il service worker (funzionamento offline / PWA)
   ============================================================ */
(function () {
  'use strict';

  IAL.Store.init();

  // Prima schermata: onboarding se non esistono profili, altrimenti home
  IAL.Home.show();

  // Service worker: solo su http/https (su file:// viene ignorato senza errori)
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        if (window.console) console.info('Service worker non registrato:', err);
      });
    });
  }

  // Precarica in background gli audio delle parole (voce registrata): dopo
  // il primo download restano disponibili anche offline. Non blocca l'app e
  // non parte sulle connessioni molto lente o con risparmio dati attivo.
  function warmAudio() {
    if (!IAL.AUDIO_MAP || !('caches' in window)) return;
    const conn = navigator.connection || {};
    if (conn.saveData) return;
    if (conn.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;
    const CACHE = 'imparo-a-leggere-audio-v1';
    const queue = Object.keys(IAL.AUDIO_MAP).map(function (k) { return IAL.AUDIO_MAP[k]; });
    function next() {
      if (!queue.length) return;
      const url = queue.shift();
      caches.open(CACHE).then(function (cache) {
        return cache.match(url).then(function (hit) {
          if (hit) return null;
          return fetch(url).then(function (res) {
            if (res && res.ok) return cache.put(url, res.clone());
          });
        });
      }).catch(function () { /* rete assente: si riproverà */ })
        .then(next);
    }
    // tre alla volta: enough per finire in pochi minuti senza saturare la rete
    for (let i = 0; i < 3; i++) next();
  }

  window.addEventListener('load', function () {
    if (window.requestIdleCallback) requestIdleCallback(warmAudio, { timeout: 4000 });
    else setTimeout(warmAudio, 2500);
  });
})();
