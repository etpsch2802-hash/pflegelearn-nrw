// E2E-Test Sprint 1.5 – Trial 21 Tage + Engagement-Upsell (Playwright)
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8099';
let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('  ✅ ' + name); } else { fail++; console.log('  ❌ ' + name); } }

async function freshPage(browser) {
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.plCheckEngagementUpsell === 'function', { timeout: 20000 });
  await page.waitForTimeout(400); // Stabilisierung
  return { ctx, page };
}

async function triggerAndCheck(page, setupObj) {
  await page.evaluate(obj => {
    localStorage.clear();
    Object.keys(obj).forEach(k => localStorage.setItem(k, obj[k]));
  }, setupObj);
  // Seite kann bei leerem localStorage neu laden -> warten bis Funktion (wieder) da ist
  await page.waitForFunction(() => typeof window.plCheckEngagementUpsell === 'function', { timeout: 10000 });
  await page.evaluate(() => window.plCheckEngagementUpsell());   // getrennter Trigger (Debug-Muster)
  await page.waitForTimeout(1300);                               // > setTimeout(700)
  return (await page.locator('#engage-upsell').count()) > 0;
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // (06.10.2026) Test 1 (Trial-Texte 21/7 Tage) entfernt: Trial-Laenge wurde produktseitig geaendert,
  // die App ist derzeit kostenlos. Upsell-Logik (Tests 2-5) bleibt geprueft.

  console.log('Test 2: Upsell erscheint bei erster Examens-Sim (Trigger B)');
  {
    const { ctx, page } = await freshPage(browser);
    const appeared = await triggerAndCheck(page, { pl_exam_history: JSON.stringify([{ note: 2, datum: '2026-07-01' }]) });
    check('Upsell-Overlay erscheint', appeared);
    check('CTA-Button vorhanden', (await page.locator('#engage-upsell-cta').count()) === 1);
    check('pl_engage_upsell_shown = 1 gesetzt', (await page.evaluate(() => localStorage.getItem('pl_engage_upsell_shown'))) === '1');
    await page.evaluate(() => { const el = document.getElementById('engage-upsell'); if (el) el.remove(); window.plCheckEngagementUpsell(); });
    await page.waitForTimeout(1100);
    check('Einmaligkeit: kein 2. Overlay', (await page.locator('#engage-upsell').count()) === 0);
    await ctx.close();
  }

  console.log('Test 3: kein Upsell bei 10 Fragen & keinem Examen');
  {
    const { ctx, page } = await freshPage(browser);
    const appeared = await triggerAndCheck(page, { pl_progress_v2: JSON.stringify({ quizTotal: 10 }) });
    check('kein Upsell unter Schwelle', appeared === false);
    await ctx.close();
  }

  console.log('Test 4: kein Upsell fuer Bezahlte (pl_paid_until Zukunft)');
  {
    const { ctx, page } = await freshPage(browser);
    const future = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const appeared = await triggerAndCheck(page, { pl_paid_until: future, pl_exam_history: JSON.stringify([{ note: 1 }]) });
    check('kein Upsell trotz Examen (bezahlt)', appeared === false);
    await ctx.close();
  }

  console.log('Test 5: kein Upsell fuer aktives Abo (pl_sub_active)');
  {
    const { ctx, page } = await freshPage(browser);
    const appeared = await triggerAndCheck(page, { pl_sub_active: '1', pl_exam_history: JSON.stringify([{ note: 1 }]) });
    check('kein Upsell trotz Examen (Abo aktiv)', appeared === false);
    await ctx.close();
  }

  await browser.close();
  console.log('\n==== ERGEBNIS: ' + pass + ' bestanden, ' + fail + ' fehlgeschlagen ====');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('TEST-FEHLER:', e); process.exit(2); });
