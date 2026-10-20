// Now : coquille de l'appli en cache (hors-ligne), données en « réseau d'abord » avec repli sur la dernière copie.
const V = 'now-v1';
const COQUILLE = ['./', 'index.html', 'manifest.webmanifest', 'fonts/fonts.css', 'fonts/atkinson-400.woff2', 'fonts/atkinson-700.woff2',
  'fonts/bricolage-500-800.woff2', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'intro/poster.jpg', 'intro/intro.mp4', 'intro/intro.webm'];

self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (u.pathname.endsWith('/now.enc.json')) {            // données : toujours fraîches si possible
    e.respondWith(fetch(r, {cache: 'no-store'}).then(rep => { const c = rep.clone(); caches.open(V).then(ca => ca.put('now.enc.json', c)); return rep; })
      .catch(() => caches.match('now.enc.json')));
    return;
  }
  if (r.headers.has('range')) return;                    // la vidéo en plage d'octets passe en direct (déjà en cache entière via addAll)
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(c => c || fetch(r).then(rep => { if (rep.ok) caches.open(V).then(ca => ca.put(r, rep.clone())); return rep; })));
});
