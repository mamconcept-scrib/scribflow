const CACHE_NAME = 'scribflow-v5';
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
  // Network-first pour les pages HTML (pour toujours avoir la dernière version)
  if (event.request.url.includes('.html') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first pour tout le reste (icônes, manifests, etc.)
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
