/* ══ Filemon POS — Service Worker ══ */
const CACHE = 'filemon-pos-v1';
const ASSETS = [
  './pos.html',
  './manifest-pos.json',
  './icon.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.add('./pos.html').then(() => cache.addAll(ASSETS).catch(()=>{}))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if(url.includes('192.168.') || url.includes('127.0.0.1') || url.includes('formspree')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.status === 200 && res.type === 'basic'){
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => {
        if(e.request.mode === 'navigate') return caches.match('./pos.html');
      });
    })
  );
});
