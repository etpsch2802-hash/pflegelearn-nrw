// PLAN NRW – Lead-Erfassung (Gratis-Eselsbruecken) -> Supabase + PDF-Mail via Resend
// Route: /api/lead
// 1) Speichert E-Mail in public.leads (Service Role / Policy).
// 2) Verschickt die 12 Eselsbruecken als PDF-Anhang von kontakt@plan-nrw.de.
// Beruehrt NICHT: chat.js, vercel.json, Stripe-Button, stripe-webhook.js.

const PDF_URL = 'https://raw.githubusercontent.com/etpsch2802-hash/pflegelearn-nrw/main/assets/eselsbruecken.pdf';
const FROM = 'PLAN NRW <kontakt@plan-nrw.de>';
const REPLY_TO = 'pflegelearn.nrw@gmail.com';

function mailHtml() {
  return [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0b1f33;border-radius:14px;overflow:hidden">',
      '<div style="background:#0b1f33;padding:26px 24px 18px;text-align:center;border-bottom:3px solid #10b981">',
        '<div style="color:#22d3ee;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:6px">PLAN NRW</div>',
        '<div style="color:#eaf4fb;font-size:21px;font-weight:800">Deine 12 Eselsbr&uuml;cken sind da</div>',
      '</div>',
      '<div style="background:#0f2942;padding:24px">',
        '<p style="color:#cbd9e6;font-size:15px;line-height:1.6;margin:0 0 14px">Hallo,</p>',
        '<p style="color:#cbd9e6;font-size:15px;line-height:1.6;margin:0 0 14px">im Anhang findest du die <strong style="color:#fff">12 wichtigsten Eselsbr&uuml;cken f&uuml;rs Pflegeexamen</strong> &ndash; Pflegeprozess, Pflegeziele (SMART), Pflegediagnosen (PESR), ATL, AEDL, 10-R-Regel und mehr.</p>',
        '<p style="color:#cbd9e6;font-size:15px;line-height:1.6;margin:0 0 20px">Tipp: Druck dir das PDF aus und h&auml;ng es an deinen Lernplatz.</p>',
        '<div style="background:#0b1f33;border:1px solid rgba(52,211,153,.3);border-radius:11px;padding:18px;text-align:center;margin-bottom:18px">',
          '<p style="color:#9fb6c9;font-size:13px;line-height:1.6;margin:0 0 12px">In der App PLAN NRW gibt es komplette Pflegeplanungen, 627 Pr&uuml;fungsfragen mit Erkl&auml;rungen und einen KI-Pr&uuml;fer f&uuml;r die m&uuml;ndliche &amp; schriftliche Pr&uuml;fung.</p>',
          '<a href="https://plan-nrw.de" style="display:inline-block;background:linear-gradient(135deg,#34d399,#10b981);color:#04231a;font-weight:800;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px">7 Tage kostenlos testen</a>',
        '</div>',
        '<p style="color:#5b7894;font-size:12px;line-height:1.6;margin:0">Viel Erfolg beim Lernen!<br>P. Schenkelberger &middot; Fachpfleger f&uuml;r An&auml;sthesie und Intensivmedizin</p>',
      '</div>',
      '<div style="background:#0b1f33;padding:14px 24px;text-align:center;border-top:1px solid rgba(255,255,255,.06)">',
        '<p style="color:#475569;font-size:11px;line-height:1.5;margin:0">PLAN NRW &middot; plan-nrw.de<br>Du erh&auml;ltst diese Mail, weil du die Gratis-Eselsbr&uuml;cken angefordert hast.</p>',
      '</div>',
    '</div>'
  ].join('');
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
  const source = (body.source ? String(body.source) : 'gratis').slice(0, 60);

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email) || email.length > 200) { res.status(400).json({ error: 'email' }); return; }

  // 1) Lead speichern
  try {
    const r = await fetch(SB_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE,
        'Authorization': 'Bearer ' + SB_SERVICE,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email, source })
    });
    if (!r.ok && r.status !== 409) {
      const t = await r.text();
      console.error('[lead] supabase', r.status, t);
      res.status(500).json({ error: 'store', status: r.status, detail: (t || '').slice(0, 300) });
      return;
    }
  } catch (e) {
    console.error('[lead] store', e);
    res.status(500).json({ error: 'server' });
    return;
  }

  // 2) PDF-Mail via Resend (nicht fatal: Lead ist bereits gespeichert)
  let mail = { sent: false };
  if (RESEND_KEY) {
    try {
      const pdfResp = await fetch(PDF_URL);
      if (!pdfResp.ok) throw new Error('pdf fetch ' + pdfResp.status);
      const buf = Buffer.from(await pdfResp.arrayBuffer());
      const pdfB64 = buf.toString('base64');

      const send = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + RESEND_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM,
          to: [email],
          reply_to: REPLY_TO,
          subject: 'Deine 12 Eselsbr\u00fccken f\u00fcrs Pflegeexamen',
          html: mailHtml(),
          attachments: [{ filename: 'PLAN-NRW_12-Eselsbruecken.pdf', content: pdfB64 }]
        })
      });
      if (send.ok) {
        mail.sent = true;
        // 3) pdf_sent best-effort markieren
        try {
          await fetch(SB_URL + '/rest/v1/leads?email=eq.' + encodeURIComponent(email), {
            method: 'PATCH',
            headers: {
              'apikey': SB_SERVICE,
              'Authorization': 'Bearer ' + SB_SERVICE,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ pdf_sent: true })
          });
        } catch (e) { /* egal */ }
      } else {
        const t = await send.text();
        console.error('[lead] resend', send.status, t);
        mail.error = (t || '').slice(0, 300);
      }
    } catch (e) {
      console.error('[lead] mail', e);
      mail.error = String(e && e.message || e).slice(0, 200);
    }
  } else {
    mail.error = 'no RESEND_API_KEY';
  }

  res.status(200).json({ ok: true, mail });
}
