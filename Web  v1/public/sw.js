const CACHE_NAME = 'sophia-codex-v2-static';
const PRECACHE_ASSETS = [
  '/',
  '/css/app.css',
  '/js/core/api.js',
  '/js/core/auth.js',
  '/js/core/dom.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Never cache requests with Authorization header
  if (request.headers.has('Authorization')) {
    return;
  }

  // API requests: ALWAYS bypass cache (network-only)
  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // HTML Navigation: Network-first with cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
        });
      })
    );
    return;
  }

  // Static assets (images, fonts, scripts): Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request);
    })
  );
});
