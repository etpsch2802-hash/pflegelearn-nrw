// Quiz-Logik & Punktestand im Browser (Playwright, ohne Test-Framework)
// Prueft die reine Rechenlogik der App: Fortschritt, Kategorie-Statistik, Examensnote, Fehleranalyse.
// Lokal: python3 -m http.server 8099 --bind 127.0.0.1  +  node tests/quiz-e2e.js
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (extra !== undefined ? '  → ' + JSON.stringify(extra).slice(0, 300) : '')); if (process.env.GITHUB_ACTIONS) console.log('::error title=Quiz-E2E::' + name); }
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('pl_consent', 'denied'); localStorage.setItem('pl_onboarded', '1'); localStorage.setItem('pl_token', 'GRATIS'); } catch (e) {} });
  await ctx.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof QUIZ_FRAGEN !== 'undefined' && typeof pickAnswer === 'function', null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  // Hilfsfunktion: eine Frage im Quiz beantworten (DOM-Knoepfe werden bei Bedarf angelegt)
  await page.evaluate(() => {
    window.__antworte = function (q, i) {
      quizList = [q]; quizIdx = 0; quizAnswers = []; selectedAns = null;
      if (!document.getElementById('opt-0')) { const c = document.createElement('div'); c.id = '__t'; c.innerHTML = '<button id="opt-0"></button><button id="opt-1"></button><button id="opt-2"></button><button id="opt-3"></button><div id="explanation"></div>'; document.body.appendChild(c); }
      pickAnswer(i);
    };
    localStorage.removeItem('pl_progress_v2'); localStorage.removeItem('pl_fehler_v1');
  });

  console.log('\n[1] Quiz – Fortschritt zaehlen');
  const r1 = await page.evaluate(() => {
    const q = QUIZ_FRAGEN.find(x => x.opt && x.opt.length === 4);
    __antworte(q, q.k);                 // richtig
    __antworte(q, (q.k + 1) % 4);       // falsch
    __antworte(q, q.k);                 // richtig
    return JSON.parse(localStorage.getItem('pl_progress_v2') || '{}');
  });
  check('3 Antworten werden gezaehlt', r1.quizTotal === 3, r1);
  check('Nur richtige Antworten zaehlen als richtig (2)', r1.quizCorrect === 2, r1);

  const r2 = await page.evaluate(() => {
    const q = QUIZ_FRAGEN.find(x => x.opt && x.opt.length === 4);
    quizList = [q]; quizIdx = 0; quizAnswers = []; selectedAns = null;
    pickAnswer(q.k); pickAnswer((q.k + 1) % 4);   // Doppel-Tipp auf dieselbe Frage
    return JSON.parse(localStorage.getItem('pl_progress_v2') || '{}').quizTotal;
  });
  check('Doppelter Tipp auf dieselbe Frage zaehlt nur einmal', r2 === 4, r2);

  console.log('\n[2] Examen-Simulation – Notenschluessel');
  const noten = await page.evaluate(() => [100, 92, 91, 81, 80, 67, 66, 50, 49, 30, 29, 0].map(p => _examGrade(p).note).join(''));
  check('Notengrenzen 92/81/67/50/30 korrekt', noten === '112233445566', noten);

  console.log('\n[3] Fehleranalyse – lokale Erfassung');
  const r3 = await page.evaluate(() => {
    localStorage.removeItem('pl_fehler_v1');
    const q = QUIZ_FRAGEN.find(x => /Herzinsuffizienz/.test(x.frage) && x.opt && x.opt.length === 4);
    __antworte(q, (q.k + 1) % 4); __antworte(q, (q.k + 2) % 4); __antworte(q, q.k);
    return { kat: q.kat, d: plFehlerData() };
  });
  const ks = r3.d.kats[r3.kat] || {};
  check('Kategorie: 3 Antworten, 1 richtig', ks.t === 3 && ks.c === 1, ks);
  const f = Object.values(r3.d.falsch || {});
  check('Falsche Frage einmal gespeichert, 2x falsch', f.length === 1 && f[0].n === 2, f);
  check('Krankheitsbild aus der Frage erkannt (Herzinsuffizienz)', (r3.d.begriffe || {}).Herzinsuffizienz === 2, r3.d.begriffe);
  const r4 = await page.evaluate(() => {
    const qs = QUIZ_FRAGEN.filter(x => x.opt && x.opt.length === 4).slice(0, 170);
    qs.forEach(q => __antworte(q, (q.k + 1) % 4));
    return Object.keys(plFehlerData().falsch).length;
  });
  check('Speicher begrenzt auf 150 falsche Fragen', r4 <= 150, r4);

  check('Keine JS-Fehler', errors.length === 0, errors);
  await browser.close();
  console.log('\n==== ERGEBNIS: ' + pass + ' bestanden, ' + fail + ' fehlgeschlagen ====');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
