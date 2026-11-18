/* Service Worker di "Imparo a Leggere"
 * - Precarica l'intera applicazione (app shell): funziona completamente offline.
 * - ONLINE: serve sempre la versione più recente (network-first) →
 *   una sola ricarica della pagina basta per vedere gli aggiornamenti.
 * - OFFLINE: usa la copia salvata in cache.
 */
const CACHE_NAME = 'imparo-a-leggere-v16';
// Cache separata per i file del motore OCR (CDN): non vengono cancellati
// a ogni aggiornamento dell'app, così la lettura da foto resta offline.
const VENDOR_CACHE = 'imparo-a-leggere-vendor-v1';
const CDN_HOSTS = ['cdn.jsdelivr.net'];
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/config.js',
  './js/data/words.js',
  './js/data/associations.js',
  './js/state/store.js',
  './js/engine/generator.js',
  './js/ui/components.js',
  './js/ui/home.js',
  './js/ui/reading.js',
  './js/ui/match.js',
  './js/ui/speech.js',
  './js/ui/choice.js',
  './js/ui/ocr.js',
  './js/ui/custom.js',
  './js/ui/parent.js',
  './js/app.js',
  './img/mimo.svg',
  './img/magia.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== VENDOR_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  let url;
  try { url = new URL(event.request.url); } catch (e) { return; }

  // File del motore OCR serviti da CDN: dopo il primo download restano
  // in cache (il dizionario italiano è già in cache nel browser).
  if (url.origin !== self.location.origin) {
    if (CDN_HOSTS.indexOf(url.hostname) !== -1 && url.pathname.indexOf('.traineddata') === -1) {
      event.respondWith(
        caches.open(VENDOR_CACHE).then((cache) =>
          cache.match(event.request).then((hit) => {
            if (hit) return hit;
            return fetch(event.request).then((response) => {
              if (response && response.ok) cache.put(event.request, response.clone());
              return response;
            });
          })
        )
      );
    }
    return;
  }

  // Online: sempre l'ultima versione (e aggiorna la cache in background).
  // Offline: risponde con la copia in cache.
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
