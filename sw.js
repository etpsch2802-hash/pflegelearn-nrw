// PflegeLearn NRW – Service Worker v5.0
const CACHE = 'pflegelearn-v80';

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

// ── Web Push (Erinnerungen) ──────────────────────────────────────────────────
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'PLAN NRW';
  const body  = d.body  || 'Zeit zum Lernen – halte deine Serie am Leben!';
  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/icon192.png',
    badge: '/favicon.png',
    tag: d.tag || 'pl-reminder',
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cl => {
      for (const c of cl) { if ('focus' in c) { c.navigate && c.navigate(url); return c.focus(); } }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
