// PflegeLearn NRW – Service Worker v5.0
const CACHE = 'pflegelearn-v161';
// 30.10.2026: Schnellstart (Stale-While-Revalidate) für die App-Hülle. Für alle: SWR_PUBLIC = true.
// Bis dahin nur, wenn ein Admin-Client {type:'PL_SWR', on:true} meldet (Merker im Speicher CACHE).
const SWR_PUBLIC = false;
const SWR_FLAG = '/__pl_swr_flag';
function swrAn() {
  if (SWR_PUBLIC) return Promise.resolve(true);
  return caches.open(CACHE).then(c => c.match(SWR_FLAG)).then(r => !!r).catch(() => false);
}
function istHuelle(req) {
  try {
    const u = new URL(req.url);
    if (u.origin !== self.location.origin) return false;
    const p = u.pathname;
    if (p.startsWith('/api/') || p.startsWith('/wissen') || p.startsWith('/gratis') || p.startsWith('/fach/')) return false;
    if (req.mode === 'navigate' || req.destination === 'document') return p === '/' || p === '/index.html';
    return p.startsWith('/data/') || /\.(png|jpg|jpeg|svg|webp|ico|json)$/.test(p);
  } catch (_) { return false; }
}
function netzZuerst(req, isDoc) {
  return fetch(req, isDoc ? { cache: 'no-store' } : undefined).then(res => {
    if (res && res.ok && sameOrigin(req)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(isDoc ? '/index.html' : req, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(isDoc ? '/index.html' : req).then(r => r || caches.match(req)).then(r => r || caches.match('/')));
}
function swrAntwort(req, e) {
  const doc = req.mode === 'navigate' || req.destination === 'document';
  const key = doc ? '/index.html' : req;
  const netz = fetch(req, doc ? { cache: 'no-store' } : undefined).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}); }
    return res;
  });
  return caches.open(CACHE).then(c => c.match(key)).then(hit => {
    if (hit) { try { e.waitUntil(netz.catch(() => {})); } catch (_) { netz.catch(() => {}); } return hit; }
    return netz.catch(() => caches.match(key));
  });
}

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

  if (istHuelle(req)) {
    e.respondWith(swrAn().then(an => an ? swrAntwort(req, e) : netzZuerst(req, isDoc)));
    return;
  }

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
  if (e.data && e.data.type === 'PL_SWR') {
    e.waitUntil(caches.open(CACHE).then(c => e.data.on ? c.put(SWR_FLAG, new Response('1')) : c.delete(SWR_FLAG)).catch(() => {}));
  }
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
