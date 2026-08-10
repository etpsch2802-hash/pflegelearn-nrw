// PLAN NRW – Registrierung mit E-Mail-Bestaetigung (Double-Opt-In), Schritt 1.
// Route: POST /api/register  { name, email, ausbildung }
//   Legt einen INAKTIVEN 7-aktive-Tage-Trial-Token an (aktiv=false) und schickt
//   eine Bestaetigungsmail via Resend. Erst /api/confirm schaltet den Zugang frei.
//   1 Trial pro E-Mail (Missbrauchsschutz).
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE, RESEND_API_KEY (bereits gesetzt).
// Beruehrt NICHT: chat.js, welcome.js, lead.js, stripe-webhook.js, admin-users.js.

const FROM = 'PLAN NRW <kontakt@plan-nrw.de>';
const REPLY_TO = 'pflegelearn.nrw@gmail.com';
const APP_URL = 'https://plan-nrw.de';

function rnd(n, upper) {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)];
  return upper ? s.toUpperCase().replace(/[^A-Z0-9]/g, x => x) : s;
}

function mailHtml(name, link) {
  const hi = name ? ('Hi ' + name.replace(/[<>&]/g, '')) : 'Hi';
  return `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#f4f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#050c18;border-radius:16px 16px 0 0;padding:24px;text-align:center">
    <div style="color:#38bdf8;font-size:20px;font-weight:800;letter-spacing:.5px">PLAN</div>
    <div style="color:#9fc3da;font-size:12px;margin-top:2px">Pflege Learn App NRW</div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:26px 24px;line-height:1.6;font-size:15px">
    <p style="margin:0 0 14px">${hi},</p>
    <p style="margin:0 0 18px">nur noch ein Klick und dein <b>7-Tage-Vollzugang</b> ist aktiv. Die 7 Tage z&auml;hlen nur an Tagen, an denen du wirklich lernst.</p>
    <p style="margin:0 0 24px;text-align:center">
      <a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:800;font-size:16px;padding:14px 30px;border-radius:12px">Zugang aktivieren</a>
    </p>
    <p style="margin:0 0 8px;color:#475569;font-size:13px">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
    <p style="margin:0 0 18px;color:#0369a1;font-size:12px;word-break:break-all">${link}</p>
    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.7;border-top:1px solid #e2e8f0;padding-top:14px">
      Du hast dich nicht bei PLAN registriert? Dann ignoriere diese E-Mail einfach.<br>
      PLAN Digital &middot; Patrick Schenkelberger &middot; Am Steinknapp 20a, 44795 Bochum &middot; kontakt@plan-nrw.de
    </p>
  </div>
</div>
</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!SB_URL || !SB_SERVICE) { res.status(500).json({ error: 'config' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};
  const name = (body.name ? String(body.name) : '').trim().substring(0, 80);
  const email = (body.email ? String(body.email) : '').trim().toLowerCase();
  const ausbildung = (body.ausbildung ? String(body.ausbildung) : '').substring(0, 60);
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name) { res.status(400).json({ error: 'name' }); return; }
  if (!re.test(email) || email.length > 200) { res.status(400).json({ error: 'email' }); return; }

  const H = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE };

  // 1 Trial pro E-Mail
  try {
    const chk = await fetch(SB_URL + '/rest/v1/tokens?email=eq.' + encodeURIComponent(email) + '&trial_max=not.is.null&select=token&limit=1', { headers: H });
    if (chk.ok) {
      const rows = await chk.json();
      if (Array.isArray(rows) && rows.length) { res.status(200).json({ ok: true, already: true }); return; }
    }
  } catch (e) { /* nicht fatal */ }

  const nachname = (name.split(' ').pop() || '').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 8) || 'PLAN';
  const token = 'TRIAL-' + new Date().getFullYear() + '-' + rnd(5, true) + '-' + nachname;
  const code = rnd(28, false);

  // Inaktiven Trial-Token anlegen
  try {
    const ins = await fetch(SB_URL + '/rest/v1/tokens', {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ token, name, bereich: 'alle', ablauf: '2099-12-31', aktiv: false, trial_max: 7, trial_used: 0, email, confirm_code: code })
    });
    if (!ins.ok) { const t = await ins.text(); console.error('[register] insert', ins.status, t); res.status(502).json({ error: 'db' }); return; }
  } catch (e) { console.error('[register] insert', e); res.status(500).json({ error: 'server' }); return; }

  // Bestaetigungsmail
  if (!RESEND_KEY) { res.status(200).json({ ok: false, reason: 'no RESEND_API_KEY' }); return; }
  const link = APP_URL + '/?confirm=' + encodeURIComponent(code);
  try {
    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [email], reply_to: REPLY_TO, subject: 'Bestätige deinen PLAN-Zugang', html: mailHtml(name, link) })
    });
    if (!send.ok) { const t = await send.text(); console.error('[register] resend', send.status, t); res.status(502).json({ ok: false, status: send.status }); return; }
  } catch (e) { console.error('[register] send', e); res.status(500).json({ ok: false, error: 'server' }); return; }

  res.status(200).json({ ok: true, sent: true });
}
