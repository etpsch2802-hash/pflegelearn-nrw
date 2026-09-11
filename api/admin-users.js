// PLAN NRW – Admin: Liste der registrierten Nutzer (E-Mail, Registrierdatum, Newsletter).
// Route: /api/admin-users
//   POST { secret }  -> { count, users:[{email, created_at, newsletter, last_sign_in}] }
//   POST { secret, action:'agent', kontext?, nurDaten? } -> Business-Agent V1 (read-only, nur Aggregate)
//   POST { secret, action:'besucher' } -> Website-Besucher 7 Tage (Vercel Web Analytics, anonym)
//
// Sicherheit:
// - Liest auth.users NUR mit dem Service-Role-Key, der serverseitig in der Env liegt.
//   Der Key verlaesst den Server nie. Der Client bekommt ausschliesslich die Liste.
// - Zugriff nur mit korrektem Admin-Secret (Env ADMIN_API_SECRET). Ohne Secret: 401.
//   Das verhindert, dass jemand die Route einfach aufruft und alle E-Mails abzieht.
//
// Env-Variablen (bestehende Namen des Projekts wiederverwendet):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE  (schon gesetzt, von tester.js/lead.js genutzt)
//   ADMIN_API_SECRET                     (NEU – muss in Vercel gesetzt werden)
//
// Beruehrt NICHT: chat.js, stripe-webhook.js, lead.js, tester.js.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  // GET -> Diagnose: welche Env-Variablen sind vorhanden? (nur Ja/Nein, nie die Werte)
  if (req.method === 'GET') {
    res.status(200).json({
      diag: true,
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
      has_ADMIN_API_SECRET: !!process.env.ADMIN_API_SECRET,
      url_prefix: (process.env.SUPABASE_URL || '').slice(0, 12)
    });
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
  if (!SB_URL || !SB_SERVICE || !ADMIN_SECRET) {
    const fehlt = [];
    if (!SB_URL) fehlt.push('SUPABASE_URL');
    if (!SB_SERVICE) fehlt.push('SUPABASE_SERVICE_ROLE');
    if (!ADMIN_SECRET) fehlt.push('ADMIN_API_SECRET');
    res.status(500).json({ error: 'config', fehlt: fehlt });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  // Wie presence.js: Header oder Body, beidseitig getrimmt (Env-Werte enthalten oft Zeilenumbruch/Leerzeichen).
  const secret = String(req.headers['x-admin-secret'] || (body && body.secret) || '').trim();
  const EXP = String(ADMIN_SECRET).trim();

  // Konstanter Zeitvergleich waere ideal; bei einem einzelnen Secret genuegt der direkte Vergleich.
  if (secret !== EXP) { res.status(401).json({ error: 'unauthorized', got: secret.length, exp: EXP.length }); return; }

  // Business-Agent V1 (read-only): POST { secret, action:'agent', kontext?, nurDaten? }
  // Website-Besucher (Vercel Web Analytics): POST { secret, action:'besucher' }
  if (body.action === 'besucher') {
    try { res.status(200).json(await plBesucher()); }
    catch (e) { console.error('[besucher]', e && e.message); if (!res.headersSent) res.status(500).json({ ok: false, error: 'server' }); }
    return;
  }

  if (body.action === 'agent') {
    try { await plAgent(res, SB_URL, SB_SERVICE, body); }
    catch (e) { console.error('[agent]', e && e.message); if (!res.headersSent) res.status(500).json({ ok: false, error: 'server' }); }
    return;
  }

  try {
    // Admin-Endpoint der GoTrue-API: /auth/v1/admin/users (nur mit Service-Role erreichbar).
    // Paginierung: bis zu 5 Seiten a 200 -> max. 1000 Nutzer. Fuer mehr spaeter erweitern.
    const perPage = 200;
    let page = 1;
    const all = [];
    for (; page <= 5; page++) {
      const r = await fetch(SB_URL + '/auth/v1/admin/users?page=' + page + '&per_page=' + perPage, {
        headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE }
      });
      if (!r.ok) {
        const t = await r.text();
        res.status(502).json({ error: 'supabase', status: r.status, detail: t.slice(0, 200) });
        return;
      }
      const data = await r.json();
      const users = Array.isArray(data) ? data : (data.users || []);
      if (!users.length) break;
      for (const u of users) {
        const meta = u.user_metadata || {};
        all.push({
          email: u.email || '',
          created_at: u.created_at || '',
          last_sign_in: u.last_sign_in_at || '',
          confirmed: !!(u.email_confirmed_at || u.confirmed_at),
          // Newsletter-Einwilligung wird beim Login in user_metadata.newsletter abgelegt.
          newsletter: meta.newsletter === true
        });
      }
      if (users.length < perPage) break;
    }

    // Neueste zuerst
    all.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    res.status(200).json({
      count: all.length,
      newsletter_count: all.filter(u => u.newsletter).length,
      users: all
    });
  } catch (e) {
    console.error('[admin-users]', e);
    res.status(500).json({ error: 'server' });
  }
}

// ===================== PLAN Business-Agent V1 (read-only) =====================
// Aufruf: POST /api/admin-users { secret, action:'agent', kontext?:string, nurDaten?:bool }
// - Liest nur Kennzahlen-Spalten, aggregiert serverseitig. E-Mails/Namen/IDs verlassen die Funktion nie.
// - Schreibt nichts (nur GET auf Supabase). Groq erhaelt ausschliesslich Zahlen + Inhaber-Kontext.
// - Eingebaut in admin-users.js statt eigener Datei: api/ hat bereits 12 Functions (Vercel-Hobby-Limit).
const AG_TESTER_ZIEL = 12;
const AG_DAY = 864e5;

async function agRest(SB_URL, KEY, path) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, {
    headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
  });
  if (!r.ok) throw new Error(path.split('?')[0] + ':' + r.status);
  return r.json();
}

async function agUsers(SB_URL, KEY) {
  const out = [];
  for (let p = 1; p <= 10; p++) {
    const r = await fetch(SB_URL + '/auth/v1/admin/users?page=' + p + '&per_page=200', {
      headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
    });
    if (!r.ok) throw new Error('auth:' + r.status);
    const d = await r.json();
    const u = Array.isArray(d) ? d : (d.users || []);
    for (const x of u) out.push({
      c: x.created_at, l: x.last_sign_in_at,
      ok: !!(x.email_confirmed_at || x.confirmed_at),
      nl: (x.user_metadata || {}).newsletter === true
    });
    if (u.length < 200) break;
  }
  return out;
}

function agCount(arr, key) {
  const o = {};
  for (const x of arr) { const k = (x[key] == null || x[key] === '') ? 'unbekannt' : String(x[key]); o[k] = (o[k] || 0) + 1; }
  return o;
}

async function plAgent(res, SB_URL, KEY, body) {
  const GROQ = process.env.GROQ_API_KEY;
  const now = Date.now();
  const t = v => { const n = v ? Date.parse(v) : NaN; return isNaN(n) ? null : n; };
  const seit = (v, d) => { const n = t(v); return n !== null && n <= now && now - n <= d * AG_DAY; };
  const bis = (v, d) => { const n = t(v); return n !== null && n >= now && n - now <= d * AG_DAY; };
  const vorbei = v => { const n = t(v); return n !== null && n < now; };
  const L = 'limit=10000';

  const quellen = {
    nutzer: agUsers(SB_URL, KEY),
    leads: agRest(SB_URL, KEY, 'leads?select=source,pdf_sent,welcome_sent,created_at&' + L),
    abos: agRest(SB_URL, KEY, 'subscriptions?select=status,plan,current_period_end&' + L),
    klassen: agRest(SB_URL, KEY, 'klassen?select=schule,lizenz_bis,sitzplaetze&' + L),
    mitglieder: agRest(SB_URL, KEY, 'klassen_mitglieder?select=beigetreten_at&' + L),
    tokens: agRest(SB_URL, KEY, 'tokens?select=aktiv,ablauf,admin,trial_max,trial_used&' + L),
    progress: agRest(SB_URL, KEY, 'progress?select=user_id,modul,updated_at&' + L),
    feedback: agRest(SB_URL, KEY, 'fragen_feedback?select=status,created_at&' + L),
    push: agRest(SB_URL, KEY, 'push_subs?select=admin&' + L),
    testimonials: agRest(SB_URL, KEY, 'testimonials?select=published&' + L)
  };
  const keys = Object.keys(quellen);
  const erg = await Promise.allSettled(keys.map(k => quellen[k]));
  const D = {}, fehlt = [];
  erg.forEach((r, i) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) D[keys[i]] = r.value;
    else { D[keys[i]] = []; fehlt.push(keys[i]); console.error('[agent] Quelle', keys[i], r.reason && r.reason.message); }
  });
  const abgeschnitten = keys.filter(k => D[k].length >= 10000);
  let web = null; try { web = await plBesucher(); } catch (e) { web = null; }

  const U = D.nutzer, Ld = D.leads, A = D.abos, K = D.klassen, T = D.tokens.filter(x => !x.admin), P = D.progress;
  const sitze = K.reduce((s, k) => s + (Number(k.sitzplaetze) || 0), 0);
  const lernende = new Set(P.map(p => p.user_id)).size;
  const lernende7 = new Set(P.filter(p => seit(p.updated_at, 7)).map(p => p.user_id)).size;
  const tester = Ld.filter(l => l.source === 'tester').length;
  const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : null;

  const data = {
    stand: new Date(now).toISOString(),
    nutzer: {
      gesamt: U.length, bestaetigt: U.filter(u => u.ok).length,
      neu_7d: U.filter(u => seit(u.c, 7)).length, neu_30d: U.filter(u => seit(u.c, 30)).length,
      aktiv_7d: U.filter(u => seit(u.l, 7)).length, aktiv_30d: U.filter(u => seit(u.l, 30)).length,
      newsletter: U.filter(u => u.nl).length
    },
    leads: {
      gesamt: Ld.length, neu_7d: Ld.filter(l => seit(l.created_at, 7)).length, neu_30d: Ld.filter(l => seit(l.created_at, 30)).length,
      pdf_versendet: Ld.filter(l => l.pdf_sent).length, welcome_versendet: Ld.filter(l => l.welcome_sent).length,
      nach_quelle: agCount(Ld, 'source')
    },
    play_closed_test: { tester_registriert: tester, ziel: AG_TESTER_ZIEL, fehlen: Math.max(0, AG_TESTER_ZIEL - tester) },
    abos: {
      gesamt: A.length, status: agCount(A, 'status'), plaene: agCount(A, 'plan'),
      enden_30d: A.filter(a => bis(a.current_period_end, 30)).length
    },
    schulen: {
      klassen: K.length, schulen: new Set(K.map(k => (k.schule || '').trim().toLowerCase()).filter(Boolean)).size,
      sitzplaetze: sitze, mitglieder: D.mitglieder.length, auslastung_pct: pct(D.mitglieder.length, sitze),
      lizenzen_abgelaufen: K.filter(k => vorbei(k.lizenz_bis)).length, lizenzen_enden_60d: K.filter(k => bis(k.lizenz_bis, 60)).length
    },
    zugangscodes: {
      aktiv: T.filter(x => x.aktiv).length, laufen_ab_14d: T.filter(x => x.aktiv && bis(x.ablauf, 14)).length,
      abgelaufen_aber_aktiv: T.filter(x => x.aktiv && vorbei(x.ablauf)).length,
      trial_genutzt: T.reduce((s, x) => s + (Number(x.trial_used) || 0), 0),
      trial_max: T.reduce((s, x) => s + (Number(x.trial_max) || 0), 0)
    },
    lernaktivitaet: { lernende_gesamt: lernende, lernende_aktiv_7d: lernende7, datensaetze_nach_modul: agCount(P, 'modul') },
    qualitaet: { feedback_offen: D.feedback.filter(f => f.status === 'offen').length, feedback_30d: D.feedback.filter(f => seit(f.created_at, 30)).length },
    push_abonnenten: D.push.filter(p => !p.admin).length,
    testimonials: { veroeffentlicht: D.testimonials.filter(x => x.published).length, unveroeffentlicht: D.testimonials.filter(x => !x.published).length },
    website_7d: (web && web.ok) ? { heute: web.heute, woche: web.woche, herkunft: web.quellen, utm: web.utm, seiten: web.seiten, geraete: web.geraete } : { nicht_verfuegbar: true },
    kennzahlen: {
      lead_pdf_quote_pct: pct(Ld.filter(l => l.pdf_sent).length, Ld.length),
      nutzer_aktiv_7d_pct: pct(U.filter(u => seit(u.l, 7)).length, U.length)
    },
    datenbasis: {
      kleine_stichprobe: U.length < 30 || Ld.length < 30,
      fehlende_quellen: fehlt, abgeschnitten: abgeschnitten
    }
  };

  if (body.nurDaten === true || !GROQ) {
    res.status(200).json({ ok: true, mode: 'read-only', data: data, analysis: null, hinweis: GROQ ? 'nurDaten' : 'GROQ_API_KEY fehlt' });
    return;
  }

  // Inhaber-Kontext: max 600 Zeichen, E-Mail-Muster entfernt (keine personenbezogenen Daten an Groq).
  const kontext = String(body.kontext || '').replace(/[^\s@]+@[^\s@]+/g, '[entfernt]').slice(0, 600);

  const system = [
    'Du bist der Business-Analyst von PLAN NRW / PLAN Digital (Pruefungsvorbereitungs-PWA fuer Pflege-Azubis in NRW, Solo-Gruender).',
    'Du arbeitest READ-ONLY: Du fuehrst nichts aus, du schlaegst nur vor. Jede Aktion braucht die Freigabe des Inhabers.',
    'Regeln:',
    '1. Nutze ausschliesslich die gelieferten Zahlen und den Inhaber-Kontext. Erfinde keine Werte, Benchmarks oder Trends.',
    '2. Jede Aussage nennt die zugrundeliegende Kennzahl (Feldname und Wert).',
    '3. Wenn datenbasis.kleine_stichprobe true ist: keine Prozent- oder Trendaussagen als belastbar darstellen; Fokus auf Datenaufbau und naechste konkrete Schritte.',
    '4. Fordere keine personenbezogenen Daten an. Nenne keine Personen.',
    '5. Priorisiere nach Hebel fuer einen Solo-Gruender mit wenig Zeit.',
    'Antworte auf Deutsch, knapp und konkret, ausschliesslich als JSON-Objekt mit genau diesen Schluesseln:',
    '{"lage":"string (max 3 Saetze)","auffaelligkeiten":["string"],"chancen":["string"],"risiken":["string"],',
    '"top3_aktionen":[{"aktion":"string","kpi_bezug":"string","aufwand":"S|M|L","erwarteter_effekt":"string"}],',
    '"freigabe":[{"vorschlag":"string","warum_freigabe":"string"}],"datenluecken":["string (welche Daten fuer bessere Analyse fehlen)"]}'
  ].join('\n');

  const user = 'Aggregierte Geschaeftsdaten:\n' + JSON.stringify(data) + (kontext ? '\n\nKontext vom Inhaber:\n' + kontext : '');

  async function groq(json) {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 25000);
    try {
      const payload = {
        model: 'openai/gpt-oss-120b', temperature: 0.2, max_tokens: 2500,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
      };
      if (json) payload.response_format = { type: 'json_object' };
      return await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ },
        body: JSON.stringify(payload)
      });
    } finally { clearTimeout(to); }
  }

  let gr = await groq(true);
  if (gr.status === 400) gr = await groq(false); // Fallback, falls JSON-Mode abgelehnt wird
  if (!gr.ok) {
    console.error('[agent] Groq', gr.status);
    res.status(502).json({ ok: false, mode: 'read-only', error: 'groq', status: gr.status, data: data });
    return;
  }
  const gj = await gr.json();
  const txt = (gj && gj.choices && gj.choices[0] && gj.choices[0].message && gj.choices[0].message.content) || '';
  let analysis = null;
  try { analysis = JSON.parse(txt.replace(/```json|```/g, '').trim()); } catch (e) { analysis = null; }

  res.status(200).json({
    ok: true, mode: 'read-only', data: data,
    analysis: analysis, analysis_raw: analysis ? undefined : txt
  });
}

// ===================== Website-Besucher (Vercel Web Analytics API, read-only) =====================
// POST /api/admin-users { secret, action:'besucher' }  -> aggregierte, anonyme Besucherzahlen (7 Tage)
// Env: VERCEL_TOKEN (Pflicht), optional VERCEL_PROJECT, VERCEL_TEAM_SLUG
async function plBesucher() {
  const TOKEN = process.env.VERCEL_TOKEN;
  if (!TOKEN) return { ok: false, error: 'VERCEL_TOKEN fehlt' };
  const PRJ = process.env.VERCEL_PROJECT || 'pflegelearn-nrw';
  const SLUG = process.env.VERCEL_TEAM_SLUG || 'patrick-schenkelberger-s-projects';
  const now = new Date();
  const heute = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const woche = new Date(heute.getTime() - 6 * 864e5);
  const until = String(now.getTime());

  async function vq(ep, extra) {
    const p = new URLSearchParams(Object.assign({ projectId: PRJ, slug: SLUG, until: until }, extra));
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 10000);
    try {
      const r = await fetch('https://api.vercel.com/v1/query/web-analytics/visits/' + ep + '?' + p.toString(), {
        headers: { 'Authorization': 'Bearer ' + TOKEN }, signal: ctl.signal
      });
      if (!r.ok) throw new Error(ep + ':' + r.status);
      const j = await r.json();
      return j.data;
    } finally { clearTimeout(to); }
  }
  const s7 = String(woche.getTime()), s0 = String(heute.getTime());
  const q = {
    heute: vq('count', { since: s0 }),
    woche: vq('count', { since: s7 }),
    tage: vq('aggregate', { since: s7, by: 'day' }),
    quellen: vq('aggregate', { since: s7, by: 'referrerHostname', limit: '6' }),
    seiten: vq('aggregate', { since: s7, by: 'requestPath', limit: '6' }),
    utm: vq('aggregate', { since: s7, by: 'utmSource', limit: '6' }),
    geraete: vq('aggregate', { since: s7, by: 'deviceType', limit: '4' })
  };
  const keys = Object.keys(q);
  const erg = await Promise.allSettled(keys.map(k => q[k]));
  const R = {}, fehler = [];
  erg.forEach((r, i) => {
    if (r.status === 'fulfilled') R[keys[i]] = r.value;
    else { R[keys[i]] = null; fehler.push(String(r.reason && r.reason.message || 'fehler')); }
  });
  if (fehler.length === keys.length) {
    console.error('[besucher]', fehler.join(', '));
    return { ok: false, error: 'Vercel-API: ' + fehler[0] };
  }
  const zahl = d => ({ besucher: (d && d.visitors) || 0, aufrufe: (d && d.pageviews) || 0 });
  const liste = (arr, key) => (Array.isArray(arr) ? arr : []).map(x => ({
    name: (x[key] == null || x[key] === '') ? '(direkt/unbekannt)' : String(x[key]),
    besucher: x.visitors || 0, aufrufe: x.pageviews || 0
  }));
  return {
    ok: true, quelle: 'Vercel Web Analytics', zeitraum_tage: 7,
    heute: zahl(R.heute), woche: zahl(R.woche),
    tage: (Array.isArray(R.tage) ? R.tage : []).map(x => ({ tag: String(x.timestamp || '').slice(0, 10), besucher: x.visitors || 0, aufrufe: x.pageviews || 0 })),
    quellen: liste(R.quellen, 'referrerHostname'),
    seiten: liste(R.seiten, 'requestPath'),
    utm: liste(R.utm, 'utmSource'),
    geraete: liste(R.geraete, 'deviceType'),
    fehler: fehler
  };
}
