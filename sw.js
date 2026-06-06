const CACHE_NAME = 'scribflow-v6';
const ASSETS = [
  '/scribflow/',
  '/scribflow/index.html',
  '/scribflow/app.html',
  '/scribflow/manifest.json',
  '/scribflow/manifest-app.json',
  '/scribflow/apple-touch-icon.png',
  '/scribflow/icons/icon-192x192.png',
  '/scribflow/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first STRICT pour les pages HTML : on tente TOUJOURS le réseau d'abord.
  // Le cache n'est utilisé QUE si le réseau échoue complètement (hors-ligne).
  if (event.request.url.includes('.html') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first pour les assets statiques (icônes, manifests)
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
