// API-Tests PLAN NRW – Live-Quiz-Punkte, Lernstand, Fehleranalyse, Gratis-PDF-Freischaltung
// Reines Node (kein Framework, keine Abhaengigkeiten). Supabase/Resend werden ueber ein gemocktes fetch simuliert.
// Lokal: node tests/api-test.mjs
process.env.SUPABASE_URL = 'https://sb.test';
process.env.SUPABASE_SERVICE_ROLE = 'service-test';
delete process.env.RESEND_API_KEY;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (extra !== undefined ? '  → ' + JSON.stringify(extra).slice(0, 300) : '')); if (process.env.GITHUB_ACTIONS) console.log('::error title=API-Test::' + name); }
}

// ── fetch-Mock ───────────────────────────────────────────────────────────────
let routes = [], calls = [];
function json(body, status) { return new Response(JSON.stringify(body), { status: status || 200, headers: { 'Content-Type': 'application/json' } }); }
globalThis.fetch = async (url, opt) => {
  url = String(url); calls.push({ url, body: opt && opt.body ? String(opt.body) : '', headers: (opt && opt.headers) || {} });
  for (const r of routes) if (r.test(url, opt)) return r.reply(url, opt);
  return json([], 200);
};
function call(handler, method, body, query) {
  return new Promise((resolve) => {
    const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; },
      json(b) { resolve({ code: this.code, body: b }); }, send(b) { resolve({ code: this.code, body: b }); }, end() { resolve({ code: this.code }); } };
    handler({ method, body, query: query || {}, headers: {} }, res);
  });
}

const klasse = (await import('../api/klasse.js')).default;
const lead = (await import('../api/lead.js')).default;

// ── 1) Live-Quiz: Punkte ─────────────────────────────────────────────────────
console.log('\n[1] Live-Quiz – Antworten und Punktestand');
function liveSetup(sess, neuAntwort) {
  calls = [];
  routes = [
    { test: u => u.includes('/live_sessions?code='), reply: () => json([sess]) },
    { test: u => u.includes('/live_answers'), reply: () => json(neuAntwort ? [{ id: 1 }] : []) },
    { test: u => u.includes('/rpc/live_punkt'), reply: () => json(null) }
  ];
}
const punktCalls = () => calls.filter(c => c.url.includes('/rpc/live_punkt'));
const SESS = { id: 's1', status: 'frage', runde: 2, frage: { k: 2 }, punkte_an: true, lehrer_email: 'l@schule.de' };

liveSetup(SESS, true);
let r = await call(klasse, 'POST', { action: 'live_answer', code: 'abc123', teilnehmer: 'Lena', antwort: 2 });
check('Richtige Antwort wird als richtig erkannt', r.body.ok && r.body.richtig === true, r.body);
check('Richtige erste Antwort gibt genau 1 Punkt', punktCalls().length === 1 && JSON.parse(punktCalls()[0].body).p_delta === 1, punktCalls());

liveSetup(SESS, true);
r = await call(klasse, 'POST', { action: 'live_answer', code: 'ABC123', teilnehmer: 'Lena', antwort: 1 });
check('Falsche Antwort: richtig=false, kein Punkt', r.body.richtig === false && punktCalls().length === 0, r.body);

liveSetup(SESS, false);
r = await call(klasse, 'POST', { action: 'live_answer', code: 'ABC123', teilnehmer: 'Lena', antwort: 2 });
check('Zweite Antwort derselben Runde gibt keinen weiteren Punkt', r.body.richtig === true && punktCalls().length === 0);

liveSetup(Object.assign({}, SESS, { punkte_an: false }), true);
r = await call(klasse, 'POST', { action: 'live_answer', code: 'ABC123', teilnehmer: 'Lena', antwort: 2 });
check('Punktestand von der Lehrkraft abgeschaltet: kein Punkt', punktCalls().length === 0);

liveSetup(SESS, true);
r = await call(klasse, 'POST', { action: 'live_answer', code: 'ABC123', teilnehmer: 'Lena', antwort: 9 });
check('Ungueltige Antwortnummer wird abgelehnt (400)', r.code === 400);

liveSetup(Object.assign({}, SESS, { status: 'aufgeloest' }), true);
r = await call(klasse, 'POST', { action: 'live_answer', code: 'ABC123', teilnehmer: 'Lena', antwort: 2 });
check('Nach dem Aufloesen keine Antwort mehr', r.body.ok === false && r.body.error === 'keine_frage');

liveSetup(SESS, true);
r = await call(klasse, 'POST', { action: 'live_punkte', code: 'ABC123', lehrer_email: 'fremd@x.de', an: false });
check('Fremde Person darf den Punktestand nicht umschalten (403)', r.code === 403);

// ── 2) Lernstand ─────────────────────────────────────────────────────────────
console.log('\n[2] Lernstand der Klasse');
calls = [];
routes = [{ test: u => u.includes('/rpc/klasse_stats'), reply: () => json([
  { name: 'Lena', quiz_total: 40, quiz_correct: 30, streak: 3, letzte: new Date().toISOString() },
  { name: 'Tom', quiz_total: 10, quiz_correct: 5, streak: 0, letzte: new Date(Date.now() - 10 * 864e5).toISOString() },
  { name: 'Neu', quiz_total: 0, quiz_correct: 0, streak: 0, letzte: null }]) }];
r = await call(klasse, 'POST', { action: 'stats', klasse_id: 'k1', lehrer_email: 'l@schule.de' });
const lena = r.body.mitglieder.find(m => m.name === 'Lena');
check('Quote pro Azubi = richtig / beantwortet (75 %)', lena.quote === 75, lena);
check('Ohne Antworten keine Quote (null statt 0 %)', r.body.mitglieder.find(m => m.name === 'Neu').quote === null);
check('RPC-Aufruf sendet Content-Type JSON (sonst 404 PGRST202)', calls.some(c => c.url.includes('/rpc/klasse_stats') && /application\/json/.test(c.headers['Content-Type'] || '')), calls.map(c => c.headers));
check('Klassenschnitt gewichtet nach Fragen (35/50 = 70 %)', r.body.schnitt.quote === 70, r.body.schnitt);
check('Aktiv in 7 Tagen zaehlt nur Lena', r.body.schnitt.aktiv_7d === 1, r.body.schnitt);
r = await call(klasse, 'POST', { action: 'stats', klasse_id: 'k1', lehrer_email: 'keine-mail' });
check('Lernstand ohne gueltige Lehrkraft-Mail abgelehnt (400)', r.code === 400);

// ── 3) Fehleranalyse ─────────────────────────────────────────────────────────
console.log('\n[3] Fehleranalyse');
routes = [{ test: u => u.includes('/rpc/klasse_fehler'), reply: () => json([
  { name: 'Lena', daten: { kats: { its_beatmung: { c: 4, t: 12 }, innere: { c: 9, t: 10 } }, begriffe: { Furosemid: 3, Herzinsuffizienz: 1 }, falsch: { q1: { t: 'Was ist PEEP?', kat: 'its_beatmung', n: 2 } } } },
  { name: 'Tom', daten: { kats: { its_beatmung: { c: 2, t: 6 } }, begriffe: { Furosemid: 2 }, falsch: { q1: { t: 'Was ist PEEP?', kat: 'its_beatmung', n: 1 } } } },
  { name: 'Ohne', daten: null }]) }];
r = await call(klasse, 'POST', { action: 'fehler', klasse_id: 'k1', lehrer_email: 'l@schule.de' });
const K = r.body.klasse;
check('Schwaechstes Klassenthema steht oben (Beatmung 6/18 = 33 %)', K.themen[0] && K.themen[0].kat === 'its_beatmung' && K.themen[0].quote === 33, K.themen);
check('Themen mit unter 10 Antworten werden nicht gewertet', !K.themen.some(t => t.kat === 'innere' && t.fragen < 10) && K.themen.length === 2, K.themen);
check('Begriff mit den meisten betroffenen Azubis zuerst (Furosemid, 2 Azubis)', K.begriffe[0].name === 'Furosemid' && K.begriffe[0].azubis === 2, K.begriffe);
check('Gleiche falsche Frage wird ueber Azubis zusammengezaehlt', K.fragen[0].falsch === 3 && K.fragen[0].azubis === 2, K.fragen);
const ra = r.body.azubis.find(a => a.name === 'Lena');
check('Pro Azubi: schwaechstes Thema mit Quote', ra.schwach[0].kat === 'its_beatmung' && ra.schwach[0].quote === 33, ra);
check('Pro Azubi: Thema mit unter 5 Antworten nicht als Schwaeche', r.body.azubis.find(a => a.name === 'Tom').schwach.length === 1);
check('Azubi ohne Daten wird als solcher markiert', r.body.azubis.find(a => a.name === 'Ohne').hat_daten === false);

// ── 4) Gratis-PDF: Freischaltung ─────────────────────────────────────────────
console.log('\n[4] Gratis-PDFs – E-Mail-Pflicht');
routes = [{ test: u => u.includes('/rest/v1/leads'), reply: () => json([], 201) }];
r = await call(lead, 'POST', { email: 'kein-mail', zweck: 'app' });
check('Ungueltige E-Mail wird abgelehnt (400)', r.code === 400);
r = await call(lead, 'POST', { email: 'azubi@example.com', source: 'app-pdf', zweck: 'app' });
check('Ohne Mailversand meldet die Freischaltung keinen Erfolg (kein Fake-OK)', r.code === 502 && r.body.ok === false, r);
calls = [];
routes = [{ test: u => u.includes('/storage/v1/object/authenticated/gratis-pdfs/'), reply: () => new Response(new Uint8Array([37, 80, 68, 70]), { status: 200 }) },
          { test: u => u.includes('raw.githubusercontent.com'), reply: () => new Response('nein', { status: 404 }) }];
r = await call(lead, 'GET', null, { pdf: 'unbekannt' });
check('Unbekanntes PDF liefert 404', r.code === 404);
r = await call(lead, 'GET', null, { pdf: 'demenz' });
check('PDF ohne bestaetigte E-Mail gesperrt (401)', r.code === 401, r.code);
r = await call(lead, 'GET', null, { pdf: 'demenz', k: 'YUBiLmRl.00000000000000000000000000000000' });
check('Gefaelschter Freischalt-Schluessel gesperrt (401)', r.code === 401, r.code);
{ const { createHmac } = await import('node:crypto');
  const em = 'azubi@example.com', key = Buffer.from(em).toString('base64url') + '.' + createHmac('sha256', 'service-test:pdf').update(em).digest('hex').slice(0, 32);
  r = await call(lead, 'GET', null, { pdf: 'demenz', k: key });
  check('Gueltiger Freischalt-Schluessel liefert das PDF (200)', r.code === 200, r.code); }
check('PDF kommt aus dem privaten Supabase-Speicher, nicht aus GitHub', calls.some(c => c.url.includes('/storage/v1/object/authenticated/gratis-pdfs/PLAN-NRW_Demenzkarte.pdf')) && !calls.some(c => c.url.includes('raw.githubusercontent.com')));

// ── 5) Missbrauchsschutz ─────────────────────────────────────────────────────
console.log('\n[5] Gratis-PDFs – Schutz vor Massenversand');
function limitSetup(proMail, proIp, gesamt) {
  calls = [];
  routes = [
    { test: u => u.includes('/rest/v1/lead_limits?select=email') && u.includes('&email=eq.'), reply: () => json(proMail) },
    { test: u => u.includes('/rest/v1/lead_limits?select=email') && u.includes('&ip_hash=eq.'), reply: () => json(proIp) },
    { test: u => u.includes('/rest/v1/lead_limits?select=id'), reply: () => new Response('[]', { status: 200, headers: { 'content-range': '0-0/' + gesamt } }) },
    { test: u => u.includes('/rest/v1/lead_limits'), reply: () => json(null, 201) },
    { test: u => u.includes('/rest/v1/leads'), reply: () => json([], 201) }
  ];
}
const req5 = (b) => call(lead, 'POST', b);
limitSetup([{ email: 'a@x.de' }, { email: 'a@x.de' }, { email: 'a@x.de' }], [], 0);
r = await req5({ email: 'a@x.de', zweck: 'app' });
check('4. Mail an dieselbe Adresse in 24 h wird gestoppt (429)', r.code === 429 && r.body.grund === 'email', r);
limitSetup([], ['b@x.de', 'c@x.de', 'd@x.de', 'e@x.de', 'f@x.de'].map(e => ({ email: e })), 0);
r = await req5({ email: 'neu@x.de', zweck: 'app' });
check('6. fremde Adresse vom selben Geraet in 24 h wird gestoppt (429)', r.code === 429 && r.body.grund === 'ip', r);
limitSetup([], [], 300);
r = await req5({ email: 'neu@x.de', zweck: 'app' });
check('Tagesobergrenze 300 Mails insgesamt greift (429)', r.code === 429 && r.body.grund === 'gesamt', r);
limitSetup([], [{ email: 'b@x.de' }], 10);
r = await req5({ email: 'neu@x.de', zweck: 'app' });
check('Normale Anfrage geht durch und wird gezaehlt', r.code !== 429 && calls.some(c => c.url.endsWith('/rest/v1/lead_limits') && c.body.includes('neu@x.de')), r);
check('IP wird nur als Hash gespeichert, nicht im Klartext', !calls.some(c => /\d+\.\d+\.\d+\.\d+/.test(c.body)));
limitSetup([], [], 0); routes.unshift({ test: u => u.includes('/rest/v1/lead_limits?select=email'), reply: () => json({ message: 'kaputt' }, 500) });
r = await req5({ email: 'neu@x.de', zweck: 'app' });
check('Faellt die Zaehlung aus, wird der Versand nicht blockiert', r.code !== 429, r);

console.log('\n==== ERGEBNIS: ' + pass + ' bestanden, ' + fail + ' fehlgeschlagen ====');
process.exit(fail ? 1 : 0);
