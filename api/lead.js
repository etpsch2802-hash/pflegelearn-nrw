// PLAN NRW – Lead-Erfassung (Gratis-PDFs) -> Supabase + PDF-Mail via Resend
// Route: /api/lead   Body: { email, source, paket }
// 1) Speichert E-Mail in public.leads (Service Role / Policy).
// 2) Verschickt das angeforderte Gratis-PDF (paket) als Anhang von kontakt@plan-nrw.de.
// Beruehrt NICHT: chat.js, vercel.json, Stripe-Button, stripe-webhook.js.

// Gratis-PDFs liegen in einem eigenen oeffentlichen Repo, damit das Haupt-Repo privat sein kann.
const BASE = 'https://raw.githubusercontent.com/etpsch2802-hash/plan-nrw-gratis-pdfs/main/';
const FROM = 'PLAN NRW <kontakt@plan-nrw.de>';
const REPLY_TO = 'pflegelearn.nrw@gmail.com';

// Gratis-Pakete: Schluessel = Slug aus plan-nrw.de/gratis/<slug>
const PAKETE = {
  eselsbruecken: { file: 'PLAN-NRW_12-Eselsbruecken.pdf', titel: '12 Eselsbr&uuml;cken f&uuml;rs Pflegeexamen', subject: 'Deine 12 Eselsbr\u00fccken f\u00fcrs Pflegeexamen',
    text: 'Pflegeprozess, PESR, SMART, ATL, AEDL, 10-R-Regel, SBAR, ABCDE und mehr &ndash; kompakt auf einen Blick.' },
  rea: { file: 'PLAN-NRW_Reanimations-Algorithmen.pdf', titel: 'Reanimation &amp; Notfallalgorithmen', subject: 'Deine Reanimations-Poster sind da',
    text: '4 Algorithmus-Poster: BLS, PBLS f&uuml;r Kinder, Fremdk&ouml;rperverlegung und ALS &ndash; zum Ausdrucken und Laminieren.' },
  spickzettel: { file: 'PLAN-NRW_Examens-Spickzettel.pdf', titel: 'Examens-Spickzettel', subject: 'Dein Examens-Spickzettel ist da',
    text: 'Vitalwerte, Scores, Perfusor-Formeln, Hygiene, Recht und Abk&uuml;rzungen &ndash; alle Kernzahlen f&uuml;r die letzten Tage vor der Pr&uuml;fung.' },
  prophylaxen: { file: 'PLAN-NRW_Prophylaxen-Kompendium.pdf', titel: 'Prophylaxen-Kompendium', subject: 'Dein Prophylaxen-Kompendium ist da',
    text: '16 Prophylaxen mit Risikofaktoren, Assessment-Skalen, Ma&szlig;nahmen und Expertenstandards.' },
  notfallkarten: { file: 'PLAN-NRW_Notfallkarten_Anaesthesie-Intensiv.pdf', titel: 'Notfallkarten An&auml;sthesie &amp; Intensiv', subject: 'Deine Notfallkarten sind da',
    text: '19 Medikamente aus An&auml;sthesie, Intensiv- und Notfallmedizin mit Dosierung, Wirkung und Pflegehinweisen.' },
  pflegeplanung: { file: 'PLAN-NRW_Pflegeplanungs-Vorlagen.pdf', titel: 'Pflegeplanungs-Vorlagen', subject: 'Deine Pflegeplanungs-Vorlagen sind da',
    text: '8 Formulare nach AEDL mit Anleitung zu PESR und SMART &ndash; plus zwei ausgef&uuml;llte Musterbeispiele.' },
  doku: { file: 'PLAN-NRW_Dokumentationsvorlagen.pdf', titel: 'Dokumentationsvorlagen', subject: 'Deine Dokumentationsvorlagen sind da',
    text: 'Wunddokumentation, Vitalzeichen, SBAR-&Uuml;bergabe, Pflegebericht und Sturzprotokoll &ndash; 5 Formulare zum Ausdrucken.' },
  laborwerte: { file: 'PLAN-NRW_Laborwerte-kompakt.pdf', titel: 'Laborwerte kompakt', subject: 'Deine Laborwerte-&Uuml;bersicht ist da',
    text: 'Die wichtigsten Laborwerte mit Normbereich und Bedeutung erh&ouml;hter und erniedrigter Werte &ndash; mit Pflege-Fokus.' },
  dosierung: { file: 'PLAN-NRW_Dosierungsrechnen.pdf', titel: 'Dosierungsrechnen', subject: 'Dein Dosierungsrechnen-PDF ist da',
    text: 'Alle Formeln f&uuml;rs Medikamenten- und Infusionsrechnen plus 12 &Uuml;bungsaufgaben mit L&ouml;sungsweg.' },
  lernplan: { file: 'PLAN-NRW_8-Wochen-Lernplan.pdf', titel: '8-Wochen-Lernplan', subject: 'Dein 8-Wochen-Lernplan ist da',
    text: 'Acht Wochen Fahrplan zum Pflegeexamen mit Tracker, Lerntipps und Checkliste f&uuml;r den Pr&uuml;fungstag.' },
  praxiseinsatz: { file: 'PLAN-NRW_Praxiseinsatz-Begleiter.pdf', titel: 'Praxiseinsatz-Begleiter', subject: 'Dein Praxiseinsatz-Begleiter ist da',
    text: 'Checklisten f&uuml;r Erst-, Zwischen- und Abschlussgespr&auml;ch, Lernziele, Reflexionsbogen und Nachweis der Praxisanleitung.' },
  zimmerhygiene: { file: 'PLAN-NRW_Zimmerhygiene-Spickzettel.pdf', titel: 'Zimmerhygiene-Spickzettel', subject: 'Dein Zimmerhygiene-Spickzettel ist da',
    text: 'H&auml;ndehygiene, Schutzausr&uuml;stung, Fl&auml;chen- und Wäschedesinfektion, Isolation. Kompakt nach KRINKO und RKI.' },
  dekubitus: { file: 'PLAN-NRW_Dekubitus-Spickzettel.pdf', titel: 'Dekubitus-Spickzettel', subject: 'Dein Dekubitus-Spickzettel ist da',
    text: 'Braden-Skala, Kategorien 1–4 nach EPUAP/NPIAP/PPPIA, Lagerung, Hautbeobachtung und Ern&auml;hrung. Kompakt nach DNQP.' }
};

function mailHtml(p) {
  return [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0b1f33;border-radius:14px;overflow:hidden">',
      '<div style="background:#0b1f33;padding:26px 24px 18px;text-align:center;border-bottom:3px solid #10b981">',
        '<div style="color:#22d3ee;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:6px">PLAN NRW &middot; Bestehen ist planbar.</div>',
        '<div style="color:#eaf4fb;font-size:21px;font-weight:800">' + p.titel + '</div>',
      '</div>',
      '<div style="background:#0f2942;padding:24px">',
        '<p style="color:#cbd9e6;font-size:15px;line-height:1.6;margin:0 0 14px">Hallo,</p>',
        '<p style="color:#cbd9e6;font-size:15px;line-height:1.6;margin:0 0 14px">im Anhang findest du dein Gratis-PDF <strong style="color:#fff">' + p.titel + '</strong>. ' + p.text + '</p>',
        '<p style="color:#cbd9e6;font-size:15px;line-height:1.6;margin:0 0 20px">Tipp: Druck es dir aus und h&auml;ng es an deinen Lernplatz.</p>',
        '<div style="background:#0b1f33;border:1px solid rgba(52,211,153,.3);border-radius:11px;padding:18px;text-align:center;margin-bottom:18px">',
          '<p style="color:#9fb6c9;font-size:13px;line-height:1.6;margin:0 0 12px">In der App PLAN NRW findest du 2.000+ Pr&uuml;fungsfragen mit Erkl&auml;rungen, 400 Lerneinheiten und einen KI-Lernassistenten &ndash; aktuell komplett kostenlos.</p>',
          '<a href="https://plan-nrw.de" style="display:inline-block;background:linear-gradient(135deg,#34d399,#10b981);color:#04231a;font-weight:800;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px">Jetzt kostenlos loslegen</a>',
        '</div>',
        '<p style="color:#5b7894;font-size:12px;line-height:1.6;margin:0">Viel Erfolg beim Lernen!<br>Patrick Schenkelberger &middot; Fachpfleger An&auml;sthesie &amp; Intensivmedizin, Praxisanleiter</p>',
      '</div>',
      '<div style="background:#0b1f33;padding:14px 24px;text-align:center;border-top:1px solid rgba(255,255,255,.06)">',
        '<p style="color:#475569;font-size:11px;line-height:1.5;margin:0">PLAN NRW &middot; plan-nrw.de<br>Du erh&auml;ltst diese Mail, weil du ein Gratis-PDF angefordert hast.</p>',
      '</div>',
    '</div>'
  ].join('');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  // GET /api/lead?pdf=<slug>: Direkt-Download fuer eingeloggte App-Nutzer (in lead.js, da Vercel-Hobby max. 12 Functions)
  if (req.method === 'GET') {
    const ds = String((req.query && req.query.pdf) || '').toLowerCase();
    const dp = PAKETE[ds];
    if (!dp) { res.status(404).json({ error: 'unbekannt' }); return; }
    try {
      const r = await fetch(BASE + dp.file);
      if (!r.ok) { res.status(502).json({ error: 'quelle', status: r.status }); return; }
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', String(buf.length));
      res.setHeader('Content-Disposition', 'attachment; filename="' + dp.file + '"');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.status(200).send(buf);
    } catch (e) { console.error('[lead] pdf', e); res.status(500).json({ error: 'server' }); }
    return;
  }
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
  const slug = (body.paket ? String(body.paket) : 'eselsbruecken').toLowerCase();
  const paket = PAKETE[slug] || PAKETE.eselsbruecken;

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
      const pdfResp = await fetch(BASE + paket.file);
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
          subject: paket.subject,
          html: mailHtml(paket),
          attachments: [{ filename: paket.file, content: pdfB64 }]
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

  res.status(200).json({ ok: true, paket: PAKETE[slug] ? slug : 'eselsbruecken', mail });
}
