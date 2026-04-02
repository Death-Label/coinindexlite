const CACHE = 'btclite-v7';
const ASSETS = [
  './index.html',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.allSettled(
        ASSETS.map(function(url) { return cache.add(url); })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // APIs externas — sempre online, nunca intercepta
  if (url.indexOf('binance.com') > -1 ||
      url.indexOf('coingecko.com') > -1 ||
      url.indexOf('chrome-extension') > -1) {
    return;
  }

  // Assets locais — cache first, sem erro se falhar
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).catch(function() {
        // falha silenciosa — não quebra o app
      });
    })
  );
});
