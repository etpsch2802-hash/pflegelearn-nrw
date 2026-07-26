// PLAN NRW – Willkommensmail nach der ersten Anmeldung.
// Route: /api/welcome
//   POST { email }  -> sendet einmalig eine Begruessungsmail via Resend.
//
// Rechtlich: TRANSAKTIONSMAIL (Funktionsueberblick + neutrale Rabattcode-Erklaerung),
// daher ohne Newsletter-Einwilligung zulaessig. KEIN aggressiver Kaufaufruf.
// Werbliche Update-Mails laufen separat und nur an Newsletter-Abonnenten.
//
// Doppelversand-Schutz: markiert in public.leads (source='signup') via welcome_sent.
// Kein neues Schema noetig - nutzt die bestehende leads-Tabelle.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE, RESEND_API_KEY (alle bereits gesetzt).
// Beruehrt NICHT: lead.js, chat.js, stripe-webhook.js, admin-users.js.

const FROM = 'PLAN NRW <kontakt@plan-nrw.de>';
const REPLY_TO = 'pflegelearn.nrw@gmail.com';

function mailHtml() {
  return `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#f4f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#050c18;border-radius:16px 16px 0 0;padding:24px;text-align:center">
    <div style="color:#38bdf8;font-size:20px;font-weight:800;letter-spacing:.5px">PLAN</div>
    <div style="color:#9fc3da;font-size:12px;margin-top:2px">Pflege Learn App NRW</div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:26px 24px;line-height:1.6;font-size:15px">
    <p style="margin:0 0 14px">Hi,</p>
    <p style="margin:0 0 14px">sch&ouml;n, dass du dabei bist. PLAN begleitet dich durch die Pflegeausbildung &ndash; hier das Wichtigste auf einen Blick:</p>
    <p style="margin:0 0 6px"><b>Was drin ist</b></p>
    <p style="margin:0 0 16px;color:#475569">&uuml;ber 2.200 Pr&uuml;fungsfragen, 429 Lerneinheiten, 159 Krankheitsbilder, Fallbeispiele, Karteikarten und ein KI-Lernassistent, der dir Fragen erkl&auml;rt.</p>
    <p style="margin:0 0 6px"><b>Dein Fortschritt</b></p>
    <p style="margin:0 0 16px;color:#475569">Solange du angemeldet bist, wird dein Lernstand gesichert und ist auf jedem Ger&auml;t verf&uuml;gbar.</p>
    <p style="margin:0 0 6px"><b>Rabattcodes</b></p>
    <p style="margin:0 0 16px;color:#475569">PLAN bietet immer wieder Startrabatte an. Einen Code gibst du beim Bezahlvorgang im Feld &bdquo;Gutscheincode&ldquo; ein &ndash; der Preis passt sich sofort an. Aktuell l&auml;uft der Code <b style="color:#0f766e">START5</b> f&uuml;r 40&nbsp;% Rabatt.</p>
    <p style="margin:0 0 6px"><b>Loslegen</b></p>
    <p style="margin:0 0 20px;color:#475569">&Ouml;ffne die App und starte mit &bdquo;Frage des Tages&ldquo; oder such dir im Bereich &Uuml;ben dein Thema.</p>
    <p style="margin:0 0 4px">Viel Erfolg beim Lernen,</p>
    <p style="margin:0 0 20px">dein PLAN-Team</p>
    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.7;border-top:1px solid #e2e8f0;padding-top:14px">
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
  const email = (body.email ? String(body.email) : '').trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email) || email.length > 200) { res.status(400).json({ error: 'email' }); return; }

  // Doppelversand-Schutz: schon eine Signup-Zeile mit welcome_sent=true?
  try {
    const chk = await fetch(SB_URL + '/rest/v1/leads?source=eq.signup&welcome_sent=eq.true&email=eq.'
      + encodeURIComponent(email) + '&select=email&limit=1', {
      headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE }
    });
    if (chk.ok) {
      const rows = await chk.json();
      if (Array.isArray(rows) && rows.length) { res.status(200).json({ ok: true, already: true }); return; }
    }
  } catch (e) { /* nicht fatal, dann eben senden */ }

  if (!RESEND_KEY) { res.status(200).json({ ok: false, reason: 'no RESEND_API_KEY' }); return; }

  // Senden
  try {
    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        reply_to: REPLY_TO,
        subject: 'Willkommen bei PLAN \u2013 so holst du alles raus',
        html: mailHtml()
      })
    });
    if (!send.ok) {
      const t = await send.text();
      console.error('[welcome] resend', send.status, t);
      res.status(502).json({ ok: false, status: send.status });
      return;
    }
  } catch (e) {
    console.error('[welcome] send', e);
    res.status(500).json({ ok: false, error: 'server' });
    return;
  }

  // Merken (best effort): Signup-Zeile anlegen/aktualisieren. Upsert via on_conflict.
  try {
    await fetch(SB_URL + '/rest/v1/leads?on_conflict=email', {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ email, source: 'signup', welcome_sent: true })
    });
  } catch (e) { /* egal */ }

  res.status(200).json({ ok: true, sent: true });
}
