/* Service Worker di "Imparo a Leggere"
 * - Precarica l'intera applicazione (app shell): funziona completamente offline.
 * - ONLINE: serve sempre la versione più recente (network-first) →
 *   una sola ricarica della pagina basta per vedere gli aggiornamenti.
 * - OFFLINE: usa la copia salvata in cache.
 */
const CACHE_NAME = 'imparo-a-leggere-v3';
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
  './js/ui/parent.js',
  './js/app.js',
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
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  let url;
  try { url = new URL(event.request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

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
