/* ══ Filemon Kocia Kawiarnia — Service Worker ══ */
const CACHE = 'filemon-v1';
const ASSETS = [
  './ciasto.html',
  './manifest.json',
  './icon.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap'
];

/* Instalacja: cache plików */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // jeśli font Google niedostępny offline — pomijamy
        return cache.add('./ciasto.html');
      });
    }).then(() => self.skipWaiting())
  );
});

/* Aktywacja: usuń stare cache */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch: najpierw cache, potem sieć */
self.addEventListener('fetch', e => {
  // Pomijamy żądania do drukarki i Formspree (zawsze przez sieć)
  const url = e.request.url;
  if (url.includes('formspree.io') || url.includes('192.168.') || url.includes('127.0.0.1')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache nowych zasobów dynamicznie
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback dla nawigacji
        if (e.request.mode === 'navigate') {
          return caches.match('./ciasto.html');
        }
      });
    })
  );
});
