// E2E-Tests PLAN NRW – Kernablaeufe (Playwright, ohne Test-Framework)
// Backend wird komplett gemockt (Supabase-RPCs, KI): keine Produktivdaten, keine Secrets, deterministisch.
// Lokal:  python3 -m http.server 8099 --bind 127.0.0.1   +   node tests/app-e2e.js
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8099';
let pass = 0, fail = 0; const fails = [];
function check(name, cond, extra) { if (cond) { pass++; console.log('  ✅ ' + name); } else { fail++; fails.push(name); console.log('  ❌ ' + name + (extra ? '  → ' + extra : '')); if (process.env.GITHUB_ACTIONS) console.log('::error title=E2E::' + name + (extra ? ' – ' + String(extra).slice(0, 300) : '')); } }

// supabase-js lokal ausliefern, falls installiert (stabil, kein CDN-Ausfall im Test)
let SB_LOCAL = null;
try { SB_LOCAL = fs.readFileSync(require.resolve('@supabase/supabase-js/dist/umd/supabase.js'), 'utf8'); } catch (e) {}

// ── Mock-Backend ──────────────────────────────────────────────────────────────
function rpcMock(fn, body, state) {
  state.calls.push(fn + ':' + JSON.stringify(body || {}));
  switch (fn) {
    case 'plc_lookup_token':
      if (body.p_code === 'TEST-ADMIN') return { name: 'Test Admin', bereich: 'alle', ablauf: '2099-12-31', aktiv: true, admin: true };
      if (body.p_code === 'TEST-USER') return { name: 'Test Azubi', bereich: 'alle', ablauf: '2099-12-31', aktiv: true, admin: false };
      if (body.p_code === 'TEST-GESPERRT') return { name: 'X', bereich: 'alle', ablauf: '2099-12-31', aktiv: false, admin: false };
      return null;
    case 'record_answer': return { total: 10, wrong_pct: 50 };
    case 'get_shift_summary': return { scope: 'heute', n: 8, pct: { SPAETDIENST: 50, SCHULE: 50 } };
    case 'get_umfragen': return [];
    case 'get_lerntisch_seats2': return { count: 2, seats: [{ sid: 's1', n: 'Laura M.', a: '4,1,0,1', me: false, c: 0, p: 0 }, { sid: 's2', n: 'Du', a: '', me: true, c: 0, p: 0 }] };
    case 'get_my_gifts': return [];
    case 'my_invite_stats': return { code: 'TEST01', besuche: 0 };
    case 'delete_my_account': return { ok: true, dry: true, admin: false, email: 'test@example.com', abo: null, daten: { fortschritt: 1 } };
    default: return null;
  }
}
async function newPage(browser, state) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  // Erststart-Overlays (Cookie-Banner, Onboarding) vorab als erledigt markieren
  await ctx.addInitScript(() => { try { localStorage.setItem('pl_consent', 'denied'); localStorage.setItem('pl_onboarded', '1'); } catch (e) {} });
  const page = await ctx.newPage();
  state.errors = []; state.calls = state.calls || [];
  page.on('pageerror', e => state.errors.push(String(e.message || e)));
  await page.route(/supabase\.co\//, async route => {
    const url = route.request().url(); let body = {};
    try { body = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    const m = url.match(/\/rest\/v1\/rpc\/([a-z0-9_]+)/i);
    if (m) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rpcMock(m[1], body, state)) });
    if (/\/auth\/v1\//.test(url)) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  if (SB_LOCAL) await page.route(/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: SB_LOCAL }));
  await page.route(/googletagmanager|google-analytics|_vercel\/insights|emailjs/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.route(/\/api\/chat/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Testantwort', content: [{ type: 'text', text: 'Testantwort' }] }) }));
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.checkPW === 'function' && !!window.SB, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  return { ctx, page };
}
async function login(page, code) {
  await page.evaluate(c => { document.getElementById('pw-name').value = 'Test Nutzer'; document.getElementById('pw-input').value = c; return checkPW(); }, code);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { document.querySelectorAll('#onboarding-overlay, #pl-consent, #engage-upsell').forEach(e => e.remove()); try { localStorage.setItem('pl_com_status', JSON.stringify({ d: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }), s: 'FREI' })); } catch (e) {} });
}
const isLoggedIn = page => page.evaluate(() => typeof currentUser !== 'undefined' && !!currentUser);

(async () => {
  const launch = { };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launch);
  const S = { calls: [] };

  console.log('1) Start & Login');
  {
    const { ctx, page } = await newPage(browser, S);
    check('Startseite ohne JS-Fehler', S.errors.length === 0, S.errors.join(' | '));
    check('Token-Lookup nur per RPC (kein Tabellenzugriff)', !/from\('tokens'\)\.select/.test(await page.content()));
    await login(page, 'FALSCH-123');
    check('Unbekannter Code wird abgelehnt', !(await isLoggedIn(page)));
    await login(page, 'TEST-GESPERRT');
    check('Gesperrter Code wird abgelehnt', !(await isLoggedIn(page)));
    await login(page, 'TEST-USER');
    check('Gültiger Code meldet an', await isLoggedIn(page));
    check('Normaler Nutzer ist kein Admin', !(await page.evaluate(() => isAdmin())));
    await page.evaluate(() => showScreen('home')); await page.waitForTimeout(500);
    check('Beta-Funktionen für normale Nutzer unsichtbar', (await page.locator('#plc-home').count()) === 0);
    check('Keine JS-Fehler nach Login', S.errors.length === 0, S.errors.join(' | '));
    await ctx.close();
  }

  console.log('2) Admin, Quiz, Fehler-Orakel, Sprach-Hilfe');
  {
    const { ctx, page } = await newPage(browser, S);
    await login(page, 'TEST-ADMIN');
    check('Admin-Code: isAdmin() = true', await page.evaluate(() => isAdmin()));
    await page.evaluate(() => showScreen('home')); await page.waitForTimeout(600);
    check('Community-Bereich für Admin sichtbar', (await page.locator('#plc-home').count()) === 1);
    const kat = await page.evaluate(() => { const k = (typeof KATS !== 'undefined' && KATS.find(x => QUIZ_FRAGEN.some(q => q.kat === x.id))) || null; if (k) startQuiz(k.id); return k && k.id; });
    await page.waitForTimeout(500);
    check('Quiz startet (' + kat + ')', (await page.evaluate(() => quizList.length)) > 0);
    const wrong = await page.evaluate(() => { const q = quizList[quizIdx]; return (q.k + 1) % q.opt.length; });
    await page.evaluate(i => pickAnswer(i), wrong); await page.waitForTimeout(900);
    check('Erklärung erscheint', await page.locator('#explanation').isVisible());
    check('Fehler-Orakel-Hinweis bei falscher Antwort', (await page.locator('#explanation .plc-orakel').count()) === 1);
    check('Sprach-Hilfe-Knöpfe vorhanden', (await page.locator('#explanation .plc-lh button').count()) === 2);
    check('Antwort wurde gezählt (record_answer)', S.calls.some(c => c.startsWith('record_answer')));
    check('Keine JS-Fehler im Quiz', S.errors.length === 0, S.errors.join(' | '));
    await ctx.close();
  }

  console.log('3) Lerntisch: Navigation & Rückweg');
  {
    const { ctx, page } = await newPage(browser, S);
    await login(page, 'TEST-ADMIN');
    await page.evaluate(() => showScreen('home')); await page.waitForTimeout(400);
    await page.evaluate(() => plcOpenLerntisch()); await page.waitForTimeout(500);
    check('Lerntisch öffnet', (await page.locator('#plc-lt').count()) === 1);
    check('Szene wird gezeichnet', (await page.locator('#plc-lt-scene svg').count()) === 1);
    check('Mitlernende werden angezeigt', (await page.locator('#plc-lt-scene .plc-hit').count()) >= 1);
    for (const [go, screen] of [['quiz', 'quizSelect'], ['karteikarten', null], ['krankheitsbilder', 'krankheitsbilder'], ['wissensdb', null]]) {
      if (!(await page.locator('#plc-lt').count())) { await page.evaluate(() => plcOpenLerntisch()); await page.waitForTimeout(300); }
      await page.click('.plc-quick button[data-go=' + go + ']'); await page.waitForTimeout(500);
      const cur = await page.evaluate(() => typeof currentScreen !== 'undefined' ? currentScreen : '');
      check('Knopf ' + go + ' öffnet ' + (screen || 'Ziel'), (await page.locator('#plc-lt').count()) === 0 && (!screen || cur === screen), 'currentScreen=' + cur);
      await page.goBack(); await page.waitForTimeout(600);
      check('Zurück von ' + go + ' führt an den Tisch', (await page.locator('#plc-lt').count()) === 1);
    }
    check('Mini-Timer läuft (Einheit aktiv)', await page.evaluate(() => +localStorage.getItem('pl_lt_end') > Date.now()));
    await page.click('#plc-lt-close'); await page.waitForTimeout(500);
    check('Tisch schließt per Zurück-Knopf', (await page.locator('#plc-lt').count()) === 0);
    check('Mini-Timer sichtbar außerhalb des Tischs', (await page.locator('#plc-lt-pill').count()) === 1);
    const unnamed = await page.evaluate(() => { plcOpenLerntisch(); return [...document.querySelectorAll('#plc-lt button')].filter(b => !(b.textContent.trim() || b.getAttribute('aria-label'))).length; });
    check('Alle Knöpfe am Tisch haben einen Namen (a11y)', unnamed === 0, unnamed + ' ohne Namen');
    check('Keine JS-Fehler am Lerntisch', S.errors.length === 0, S.errors.join(' | '));
    await ctx.close();
  }

  console.log('4) Themen-Paket');
  {
    const { ctx, page } = await newPage(browser, S);
    await login(page, 'TEST-ADMIN');
    await page.evaluate(() => plcOpenLerntisch()); await page.waitForTimeout(400);
    await page.click('#plc-lt-topic [data-t="Lunge"]'); await page.waitForTimeout(800);
    const btn = page.locator('#plc-topic-quiz');
    check('Themen-Quiz für „Lunge“ verfügbar', (await btn.count()) === 1);
    if (await btn.count()) { await btn.click(); await page.waitForTimeout(500); }
    const n = await page.evaluate(() => quizList.length);
    check('Themen-Quiz startet mit Fragen', n > 0, 'n=' + n);
    check('Quiz-Bildschirm wird angezeigt', (await page.evaluate(() => currentScreen)) === 'quiz');
    check('Keine JS-Fehler im Themen-Paket', S.errors.length === 0, S.errors.join(' | '));
    await ctx.close();
  }

  console.log('5) Konto löschen (Admin = Testmodus) & Datenschutz');
  {
    const { ctx, page } = await newPage(browser, S);
    await login(page, 'TEST-ADMIN');
    S.calls.length = 0;
    await page.evaluate(() => plKontoLoeschen()); await page.waitForTimeout(700);
    check('Lösch-Dialog öffnet', (await page.locator('#pl-del-ov').count()) === 1);
    check('Admin sieht Testmodus-Hinweis', (await page.locator('#pl-del-ov').innerText()).includes('Testmodus'));
    check('Es wird nie echt gelöscht (kein p_dry:false)', !S.calls.some(c => c.includes('"p_dry":false')));
    await page.evaluate(() => { const o = document.getElementById('pl-del-ov'); if (o) o.remove(); showDatenschutz(); }); await page.waitForTimeout(300);
    check('Datenschutz-Dialog lädt datenschutz.html', (await page.locator('iframe[src="/datenschutz.html"]').count()) === 1);
    check('Keine JS-Fehler', S.errors.length === 0, S.errors.join(' | '));
    await ctx.close();
  }

  await browser.close();
  console.log('\n==== ERGEBNIS: ' + pass + ' bestanden, ' + fail + ' fehlgeschlagen ====');
  if (fail) console.log('Fehlgeschlagen:\n - ' + fails.join('\n - '));
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('TEST-FEHLER:', e); if (process.env.GITHUB_ACTIONS) console.log('::error title=E2E-Abbruch::' + String(e && e.message || e).split('\n')[0].slice(0, 300)); process.exit(2); });
