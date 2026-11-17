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
})();
