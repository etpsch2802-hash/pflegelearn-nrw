import webpush from 'web-push';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

webpush.setVapidDetails('mailto:kontakt@plan-nrw.de', VAPID_PUBLIC, VAPID_PRIVATE);

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };
const jsonHeaders = { ...sbHeaders, 'Content-Type': 'application/json' };

// 1) Neue, noch nicht gemeldete Fehlermeldungen holen
const ffRes = await fetch(
  `${SB_URL}/rest/v1/fragen_feedback?select=id,kategorie,frage,grund&benachrichtigt=is.false&status=eq.offen&order=created_at.asc`,
  { headers: sbHeaders }
);
if (!ffRes.ok) { console.error('Fetch feedback failed', ffRes.status, await ffRes.text()); process.exit(1); }
const neue = await ffRes.json();

if (!neue.length) { console.log(JSON.stringify({ neue: 0 })); process.exit(0); }

// 2) Admin-Geraete holen
const subRes = await fetch(`${SB_URL}/rest/v1/push_subs?select=endpoint,sub&admin=is.true`, { headers: sbHeaders });
if (!subRes.ok) { console.error('Fetch subs failed', subRes.status, await subRes.text()); process.exit(1); }
const subs = await subRes.json();

if (!subs.length) {
  console.log(JSON.stringify({ neue: neue.length, adminGeraete: 0, hinweis: 'Kein Geraet als admin markiert' }));
  process.exit(0);
}

const n = neue.length;
const erste = neue[0];
const kurz = String(erste.frage || '').slice(0, 90) + (String(erste.frage || '').length > 90 ? '…' : '');
const payload = JSON.stringify({
  title: n === 1 ? 'Neue Fehlermeldung' : `${n} neue Fehlermeldungen`,
  body: n === 1
    ? `${erste.grund || 'Ohne Grund'} · ${erste.kategorie || '–'}\n${kurz}`
    : `Zuletzt: ${erste.grund || 'Ohne Grund'} · ${erste.kategorie || '–'}`,
  url: 'https://plan-nrw.de/?admin=meldungen',
  tag: 'pl-feedback'
});

let sent = 0, removed = 0, failed = 0;
for (const r of subs) {
  const sub = typeof r.sub === 'string' ? JSON.parse(r.sub) : r.sub;
  try {
    await webpush.sendNotification(sub, payload);
    sent++;
  } catch (e) {
    if (e && (e.statusCode === 404 || e.statusCode === 410)) {
      await fetch(`${SB_URL}/rest/v1/push_subs?endpoint=eq.${encodeURIComponent(r.endpoint)}`, { method: 'DELETE', headers: sbHeaders });
      removed++;
    } else {
      failed++;
      console.error('send error', e && e.statusCode, e && e.body);
    }
  }
}

// 3) Nur als benachrichtigt markieren, wenn wirklich etwas rausging
if (sent > 0) {
  const ids = neue.map(x => x.id).join(',');
  const upd = await fetch(`${SB_URL}/rest/v1/fragen_feedback?id=in.(${ids})`, {
    method: 'PATCH',
    headers: { ...jsonHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ benachrichtigt: true })
  });
  if (!upd.ok) console.error('Mark failed', upd.status, await upd.text());
}

console.log(JSON.stringify({ neue: n, adminGeraete: subs.length, sent, removed, failed }));
