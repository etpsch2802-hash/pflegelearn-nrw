import webpush from 'web-push';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;

webpush.setVapidDetails('mailto:kontakt@plan-nrw.de', VAPID_PUBLIC, VAPID_PRIVATE);

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const res = await fetch(`${SB_URL}/rest/v1/push_subs?select=endpoint,sub`, { headers: sbHeaders });
if (!res.ok) { console.error('Fetch subs failed', res.status, await res.text()); process.exit(1); }
const rows = await res.json();

const payload = JSON.stringify({
  title: 'Zeit zum Lernen \u2013 PLAN NRW',
  body: 'Halte deine Serie am Leben. Schon 1 Quiz reicht heute.',
  url: 'https://plan-nrw.de',
  tag: 'pl-reminder'
});

let sent = 0, removed = 0;
for (const r of rows) {
  const sub = typeof r.sub === 'string' ? JSON.parse(r.sub) : r.sub;
  try {
    await webpush.sendNotification(sub, payload);
    sent++;
  } catch (e) {
    if (e && (e.statusCode === 404 || e.statusCode === 410)) {
      await fetch(`${SB_URL}/rest/v1/push_subs?endpoint=eq.${encodeURIComponent(r.endpoint)}`, { method: 'DELETE', headers: sbHeaders });
      removed++;
    } else {
      console.error('send error', e && e.statusCode, e && e.body);
    }
  }
}
console.log(JSON.stringify({ sent, removed }));
