// BrickPulse Valuator service worker
// Caches the app shell so it loads instantly and works offline.
// API calls to api.anthropic.com are NEVER cached — always live.

const CACHE_NAME = 'brickpulse-valuator-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll fails atomically; use individual adds so 1 bad URL doesn't kill the install
      Promise.all(SHELL.map((u) => cache.add(u).catch((e) => console.warn('SW skip:', u, e))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER cache or intercept API calls — always go to network
  if (url.hostname === 'api.anthropic.com') {
    return; // browser handles normally
  }

  // For navigation requests (the HTML shell), use network-first then fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For everything else: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          // Only cache successful, basic/cors responses
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        }).catch(() => cached)
      );
    })
  );
});
