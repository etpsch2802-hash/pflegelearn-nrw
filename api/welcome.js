// PLAN NRW – Willkommensmail nach der ersten Anmeldung.
// Route: /api/welcome
//   POST { email }  -> sendet einmalig eine Begruessungsmail via Resend.
//
// Rechtlich: TRANSAKTIONSMAIL (Funktionsueberblick, aktuell kostenlos-Hinweis),
// daher ohne Newsletter-Einwilligung zulaessig. KEIN aggressiver Kaufaufruf.
// Werbliche Update-Mails laufen separat und nur an Newsletter-Abonnenten.
//
// Doppelversand-Schutz: markiert in public.leads (source='signup') via welcome_sent.
// Kein neues Schema noetig - nutzt die bestehende leads-Tabelle.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE, RESEND_API_KEY (alle bereits gesetzt).
// Beruehrt NICHT: lead.js, chat.js, stripe-webhook.js, admin-users.js.
// 04.11.2026: Zeitgrenze für alle externen Aufrufe (Supabase, Resend, Stripe, Groq …). Antwortet ein Dienst nicht,
// bricht der Aufruf nach timeoutMs (Standard 9 s) ab, statt bis zum Vercel-Limit zu hängen. Eigenes signal hat Vorrang.
const _plFetch = globalThis.fetch;
const fetch = (u, o = {}) => _plFetch(u, (o && o.signal) ? o : Object.assign({}, o, { signal: AbortSignal.timeout((o && o.timeoutMs) || 9000) }));

const FROM = 'PLAN NRW <kontakt@plan-nrw.de>';
const REPLY_TO = 'pflegelearn.nrw@gmail.com';

// 10.11.2026 (Go P. Schenkelberger): Lerntipps-Serie mit Double-Opt-In.
//   POST { email, tipps:true }  -> Willkommensmail enthaelt Knopf „Lerntipps bestaetigen“
//                                  (nutzt die bestehenden Newsletter-Spalten in leads + GET /api/lead?nl=<token>).
//                                  War die Willkommensmail schon raus, kommt nur eine kurze Bestaetigungsmail.
//   POST { serie:true } + Header x-plan-cron = HMAC-SHA256(SUPABASE_SERVICE_ROLE, Tag in Berlin)
//                               -> schickt Tipp 1/2/3 an alle, die vor genau 2/4/7 Tagen bestaetigt haben
//                                  und nicht abgemeldet sind. Aufruf taeglich durch .github/workflows/lerntipps.yml.
//   Jede Tipp-Mail hat den Abmeldelink /api/lead?nl_ab=<token>. Nur Inhalte, die schon in der App freigegeben sind.
const APP = 'https://plan-nrw.de';
function kopf(inhalt, fuss) {
  return `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#f4f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#050c18;border-radius:16px 16px 0 0;padding:24px;text-align:center">
    <div style="color:#38bdf8;font-size:20px;font-weight:800;letter-spacing:.5px">PLAN</div>
    <div style="color:#9fc3da;font-size:12px;margin-top:2px">Pflege Learn App NRW</div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:26px 24px;line-height:1.6;font-size:15px">${inhalt}
    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.7;border-top:1px solid #e2e8f0;padding-top:14px">${fuss || ''}
      PLAN Digital &middot; Patrick Schenkelberger &middot; Am Steinknapp 20a, 44795 Bochum &middot; kontakt@plan-nrw.de
    </p>
  </div>
</div>
</body></html>`;
}
const knopf = (href, text) => `<p style="margin:0 0 22px;text-align:center"><a href="${href}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;padding:13px 26px;border-radius:12px">${text}</a></p>`;
function doiBox(token) {
  return `<div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;padding:16px;text-align:center;margin:0 0 20px">
      <p style="margin:0 0 12px;font-size:14px;color:#155e75">Du m&ouml;chtest Erinnerungen &amp; Lerntipps per E-Mail. Bitte best&auml;tige das mit einem Klick &ndash; ohne Best&auml;tigung schreiben wir dir nichts weiter.</p>
      <a href="${APP}/api/lead?nl=${token}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;padding:11px 20px;border-radius:10px">Lerntipps best&auml;tigen</a></div>`;
}
function doiHtml(token) {
  return kopf(`<p style="margin:0 0 14px">Hi,</p>${doiBox(token)}<p style="margin:0 0 20px;color:#475569;font-size:14px">Du bekommst dann in der ersten Woche drei kurze Mails mit Tipps f&uuml;r PLAN. Abmelden kannst du dich jederzeit &uuml;ber den Link in jeder Mail.</p>`,
    'Du hast das nicht angefordert? Dann ignoriere diese E-Mail einfach.<br>');
}
const TIPPS = [
  { tag: 2, betreff: '5 Minuten f\u00fcr heute \u2013 dein Lerntipp von PLAN', html: `
    <p style="margin:0 0 14px">Hi,</p>
    <p style="margin:0 0 14px">kurzer Tipp: Du musst nicht stundenlang lernen. Jeden Tag ein paar Minuten bringen mehr als ein Marathon kurz vor der Pr&uuml;fung.</p>
    <p style="margin:0 0 6px"><b>So geht&rsquo;s in PLAN</b></p>
    <p style="margin:0 0 16px;color:#475569">Auf der Startseite findest du den Knopf f&uuml;r deine 5 Minuten. Fragen, die du falsch beantwortest, kommen automatisch sp&auml;ter wieder &ndash; so bleibt das Wissen h&auml;ngen.</p>
    <p style="margin:0 0 6px"><b>Schon entdeckt?</b></p>
    <p style="margin:0 0 20px;color:#475569">Der Perfusor-Rechner rechnet mit deinen eigenen Werten und zeigt dir den Rechenweg &ndash; gut zum &Uuml;ben f&uuml;r die Pr&uuml;fung.</p>
    ${knopf(APP + '/?quelle=mail-tipp1', 'Jetzt 5 Minuten lernen')}` },
  { tag: 4, betreff: 'Kostenlos f\u00fcr dich: Gratis-PDFs zum Ausdrucken', html: `
    <p style="margin:0 0 14px">Hi,</p>
    <p style="margin:0 0 14px">manchmal lernt es sich auf Papier einfach besser &ndash; im Zug, in der Pause oder kurz vor dem Dienst.</p>
    <p style="margin:0 0 6px"><b>Gratis-PDFs in PLAN</b></p>
    <p style="margin:0 0 20px;color:#475569">Eselsbr&uuml;cken, Handgriffe Schritt f&uuml;r Schritt, Isolationsmanagement und mehr: alles kostenlos zum Herunterladen und Ausdrucken. Dazu gibt es in der App Taschenkarten zum Nachschlagen auf Station.</p>
    ${knopf(APP + '/links.html?quelle=mail-tipp2', 'Gratis-PDFs ansehen')}` },
  { tag: 7, betreff: 'Eine Woche PLAN \u2013 das solltest du noch kennen', html: `
    <p style="margin:0 0 14px">Hi,</p>
    <p style="margin:0 0 14px">du bist jetzt seit einer Woche dabei &ndash; sch&ouml;n! Drei Dinge, die viele erst sp&auml;t entdecken:</p>
    <p style="margin:0 0 6px"><b>1. Patientengespr&auml;ch &uuml;ben</b></p>
    <p style="margin:0 0 12px;color:#475569">Die KI spielt Patientin, Angeh&ouml;rige oder den Dienstarzt, du antwortest als Pflegefachkraft und bekommst danach eine Auswertung.</p>
    <p style="margin:0 0 6px"><b>2. Erinnerung am Abend</b></p>
    <p style="margin:0 0 12px;color:#475569">Im Profil kannst du eine kurze t&auml;gliche Erinnerung einschalten &ndash; damit du dranbleibst.</p>
    <p style="margin:0 0 6px"><b>3. Mit dem Kurs lernen</b></p>
    <p style="margin:0 0 20px;color:#475569">Zusammen geht es leichter. Schick PLAN einfach in eure Kursgruppe &ndash; f&uuml;r alle kostenlos.</p>
    ${knopf(APP + '/?quelle=mail-tipp3', 'PLAN &ouml;ffnen')}
    <p style="margin:0 0 20px;color:#475569;font-size:14px">Das war die letzte Tipp-Mail. Ab jetzt melden wir uns nur noch, wenn es in PLAN wirklich etwas Neues gibt.</p>` }
];
const tagBerlin = (d) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });

function mailHtml(token) {
  return `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#f4f7fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#050c18;border-radius:16px 16px 0 0;padding:24px;text-align:center">
    <div style="color:#38bdf8;font-size:20px;font-weight:800;letter-spacing:.5px">PLAN</div>
    <div style="color:#9fc3da;font-size:12px;margin-top:2px">Pflege Learn App NRW</div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:26px 24px;line-height:1.6;font-size:15px">
    <p style="margin:0 0 14px">Hi,</p>
    <p style="margin:0 0 14px">sch&ouml;n, dass du dabei bist. PLAN begleitet dich durch die Pflegeausbildung &ndash; hier das Wichtigste auf einen Blick:</p>${token ? doiBox(token) : ''}
    <p style="margin:0 0 6px"><b>Was drin ist</b></p>
    <p style="margin:0 0 16px;color:#475569">2.000+ Pr&uuml;fungsfragen, 400 Lerneinheiten, &uuml;ber 150 Krankheitsbilder, Fallbeispiele, Karteikarten und ein KI-Lernassistent, der dir Fragen erkl&auml;rt.</p>
    <p style="margin:0 0 6px"><b>Dein Fortschritt</b></p>
    <p style="margin:0 0 16px;color:#475569">Solange du angemeldet bist, wird dein Lernstand gesichert und ist auf jedem Ger&auml;t verf&uuml;gbar.</p>
    <p style="margin:0 0 6px"><b>Aktuell kostenlos</b></p>
    <p style="margin:0 0 16px;color:#475569">PLAN ist derzeit komplett kostenlos &ndash; voller Zugang zu allen Pr&uuml;fungsfragen, F&auml;llen und dem KI-Pr&uuml;fer, ohne versteckte Kosten. Nutze die Zeit und komm gut vorbereitet in deine Pr&uuml;fung.</p>
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-plan-cron');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!SB_URL || !SB_SERVICE) { res.status(500).json({ error: 'config' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};
  const SBH = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE };

  // ── Lerntipps-Serie (taeglicher Aufruf aus GitHub Actions) ──
  if (body.serie === true) {
    const { createHmac, timingSafeEqual } = await import('node:crypto');
    const heute = tagBerlin(Date.now());
    const soll = createHmac('sha256', String(SB_SERVICE)).update('lerntipps|' + heute).digest('hex');
    const ist = String(req.headers['x-plan-cron'] || '');
    if (ist.length !== soll.length || !timingSafeEqual(Buffer.from(ist), Buffer.from(soll))) { res.status(401).json({ error: 'auth' }); return; }
    if (!RESEND_KEY) { res.status(200).json({ ok: false, reason: 'no RESEND_API_KEY' }); return; }
    const erg = {};
    for (const t of TIPPS) {
      const ziel = tagBerlin(Date.now() - t.tag * 864e5);
      // Bestaetigungen in einem 3-Tage-Fenster holen und auf den Berliner Kalendertag filtern
      const von = new Date(Date.now() - (t.tag + 2) * 864e5).toISOString(), bis = new Date(Date.now() - (t.tag - 2) * 864e5).toISOString();
      let rows = [];
      try {
        const r = await fetch(SB_URL + '/rest/v1/leads?select=email,newsletter_token,newsletter_bestaetigt_at&newsletter_abgemeldet_at=is.null&newsletter_token=not.is.null'
          + '&newsletter_bestaetigt_at=gte.' + encodeURIComponent(von) + '&newsletter_bestaetigt_at=lt.' + encodeURIComponent(bis) + '&limit=500', { headers: SBH });
        if (r.ok) rows = (await r.json()).filter(x => tagBerlin(x.newsletter_bestaetigt_at) === ziel);
      } catch (e) { console.error('[welcome] serie lesen', e); }
      const mails = rows.map(x => ({ from: FROM, to: [x.email], reply_to: REPLY_TO, subject: t.betreff,
        headers: { 'List-Unsubscribe': '<' + APP + '/api/lead?nl_ab=' + x.newsletter_token + '>' },
        html: kopf(t.html, '<a href="' + APP + '/api/lead?nl_ab=' + x.newsletter_token + '" style="color:#64748b">Lerntipps abbestellen</a><br>') }));
      let gesendet = 0;
      for (let i = 0; i < mails.length; i += 100) {
        try {
          const r = await fetch('https://api.resend.com/emails/batch', { method: 'POST', timeoutMs: 15000,
            headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(mails.slice(i, i + 100)) });
          if (r.ok) gesendet += Math.min(100, mails.length - i); else console.error('[welcome] serie resend', r.status, (await r.text()).slice(0, 300));
        } catch (e) { console.error('[welcome] serie senden', e); }
      }
      erg['tipp_tag' + t.tag] = { faellig: mails.length, gesendet };
    }
    res.status(200).json({ ok: true, tag: heute, erg });
    return;
  }

  const email = (body.email ? String(body.email) : '').trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email) || email.length > 200) { res.status(400).json({ error: 'email' }); return; }

  // Lerntipps gewuenscht → Token fuer Double-Opt-In (nicht, wenn schon bestaetigt und nicht abgemeldet)
  let token = null;
  if (body.tipps === true) {
    try {
      let schon = false;
      const c = await fetch(SB_URL + '/rest/v1/leads?email=eq.' + encodeURIComponent(email) + '&select=newsletter_bestaetigt_at,newsletter_abgemeldet_at&limit=1', { headers: SBH });
      if (c.ok) { const x = (await c.json())[0]; schon = !!(x && x.newsletter_bestaetigt_at && !x.newsletter_abgemeldet_at); }
      if (!schon) {
        const { randomBytes } = await import('node:crypto');
        const t = randomBytes(16).toString('hex');
        const r = await fetch(SB_URL + '/rest/v1/leads?on_conflict=email', { method: 'POST',
          headers: Object.assign({}, SBH, { 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify({ email, source: 'signup', newsletter_token: t, newsletter_angefragt_at: new Date().toISOString() }) });
        if (r.ok) token = t; else console.error('[welcome] tipps', r.status, (await r.text()).slice(0, 200));
      }
    } catch (e) { console.error('[welcome] tipps', e); }
  }

  // Doppelversand-Schutz: schon eine Signup-Zeile mit welcome_sent=true?
  try {
    const chk = await fetch(SB_URL + '/rest/v1/leads?source=eq.signup&welcome_sent=eq.true&email=eq.'
      + encodeURIComponent(email) + '&select=email&limit=1', {
      headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE }
    });
    if (chk.ok) {
      const rows = await chk.json();
      if (Array.isArray(rows) && rows.length) {
        // Willkommensmail schon raus → bei Lerntipps-Wunsch nur die kurze Bestaetigungsmail
        if (token && RESEND_KEY) {
          try { await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: FROM, to: [email], reply_to: REPLY_TO, subject: 'Bitte best\u00e4tige deine PLAN-Lerntipps', html: doiHtml(token) }) }); } catch (e) {}
        }
        res.status(200).json({ ok: true, already: true, tipps: !!token }); return;
      }
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
        html: mailHtml(token)
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
