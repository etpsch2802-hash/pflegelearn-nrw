import webpush from 'web-push';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

webpush.setVapidDetails('mailto:kontakt@plan-nrw.de', VAPID_PUBLIC, VAPID_PRIVATE);

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const res = await fetch(`${SB_URL}/rest/v1/push_subs?select=endpoint,sub,name`, { headers: sbHeaders });
if (!res.ok) { console.error('Fetch subs failed', res.status, await res.text()); process.exit(1); }
const rows = await res.json();

// Nur echte Vornamen verwenden, keine Platzhalter oder Einzelbuchstaben
function cleanName(n) {
  if (!n || typeof n !== 'string') return '';
  const t = n.trim();
  if (t.length < 2 || t.length > 20) return '';
  if (!/^[A-Za-zÄÖÜäöüß' -]+$/.test(t)) return '';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const TEXTE = [
  'Halte deine Serie am Leben. Schon ein Quiz reicht heute.',
  'Zehn Minuten heute sind mehr wert als drei Stunden vor der Prüfung.',
  'Ein Fach, fünf Fragen, fertig. Mehr braucht es heute nicht.',
  'Dein Radar zeigt, wo es hakt. Schau kurz rein.',
  'Kurz üben, dann Feierabend. Deine Serie dankt es dir.'
];
const text = TEXTE[new Date().getDate() % TEXTE.length];

let sent = 0, removed = 0, failed = 0;
for (const r of rows) {
  const sub = typeof r.sub === 'string' ? JSON.parse(r.sub) : r.sub;
  const name = cleanName(r.name);
  const payload = JSON.stringify({
    title: name ? `Hallo ${name}, Zeit zum Lernen` : 'Zeit zum Lernen – PLAN NRW',
    body: text,
    url: 'https://plan-nrw.de',
    tag: 'pl-reminder'
  });
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
console.log(JSON.stringify({ sent, removed, failed, total: rows.length }));
