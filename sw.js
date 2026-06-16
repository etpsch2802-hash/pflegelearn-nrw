// PflegeLearn NRW – Service Worker v5.0
const CACHE = 'pflegelearn-v5';

function sameOrigin(req) {
  try { return new URL(req.url).origin === self.location.origin; }
  catch (_) { return false; }
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const isDoc = req.mode === 'navigate' || req.destination === 'document';

  // HTML / Navigationen: IMMER frisch aus dem Netz (kein veralteter Browser-Cache),
  // nur wenn offline auf den zuletzt gespeicherten Stand zurueckfallen.
  if (isDoc) {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          if (res && res.ok && sameOrigin(req)) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }

  // Uebrige GET-Requests: Netz zuerst, Cache nur als Offline-Fallback.
  // Nur eigene (same-origin) erfolgreiche Antworten cachen (kein Stripe/3rd-party).
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok && sameOrigin(req)) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
