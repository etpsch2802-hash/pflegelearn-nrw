#!/usr/bin/env node
// Landingpages pro Fachgebiet aus data/fachgebiete.json erzeugen (17.10.2026).
// Strategie: eine App, viele Module – jede Seite führt in dieselbe App (plan-nrw.de/?fach=<id>).
// Ausgabe: private/landing/<slug>.html (VORSCHAU, per .vercelignore nicht ausgeliefert).
// Nach Go:  node scripts/landingpages.mjs --live  → schreibt nach fach/<slug>.html (wird ausgeliefert).
// Regeln: keine erfundenen Zahlen/Testimonials (UWG); nur kanonische Marketing-Zahlen;
//         Praxisanleitung = Arbeitshilfe, kein anrechenbarer Fortbildungsnachweis.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = process.argv.includes('--live');
const OUT = path.join(ROOT, LIVE ? 'fach' : 'private/landing');
const MITENTWURF = process.argv.includes('--alle');   // auch status 'entwurf'
// Google Analytics + Einwilligung (gleich wie App), nur in der Live-Version
const GA_HEAD = fs.readFileSync(new URL('./snippets/ga-head.html', import.meta.url), 'utf8');
const GA_BODY = fs.readFileSync(new URL('./snippets/ga-body.html', import.meta.url), 'utf8');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fachgebiete.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function seite(f) {
  const L = f.landing, url = 'https://plan-nrw.de/' + (LIVE ? 'fach/' + L.slug + '.html' : L.slug);
  const app = 'https://plan-nrw.de/?fach=' + encodeURIComponent(f.id) + '&utm_source=landing&utm_campaign=' + encodeURIComponent(L.slug);
  const hinweis = f.hinweis_recht ? `<p class="recht">${esc(f.hinweis_recht)}</p>` : '';
  const ld = { '@context': 'https://schema.org', '@type': 'MobileApplication', name: f.name, applicationCategory: 'EducationalApplication', operatingSystem: 'Android, Web',
    description: L.untertitel, url, inLanguage: 'de', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    author: { '@type': 'Person', name: 'Patrick Schenkelberger', jobTitle: 'Fachpfleger Anästhesie & Intensivmedizin, Praxisanleiter NRW' } };
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(L.titel)} – ${esc(f.name)}</title>
<meta name="description" content="${esc(L.untertitel)}">
<meta name="keywords" content="${esc(L.keywords)}">
<link rel="canonical" href="${url}">
${LIVE ? '' : '<meta name="robots" content="noindex">\n'}<meta property="og:title" content="${esc(L.titel)} – ${esc(f.name)}">
<meta property="og:description" content="${esc(L.untertitel)}">
<meta property="og:image" content="https://plan-nrw.de/icon-512.png">
<link rel="icon" href="/favicon.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${LIVE ? GA_HEAD + '<script defer src="/_vercel/insights/script.js"></script>\n' : ''}<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,700;9..40,900&family=DM+Serif+Display&display=swap');
:root{--navy:#0b1a35;--text:#ddf0fb;--muted:#9fb6c9;--akzent:${f.farbe}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:var(--navy);color:var(--text);line-height:1.6}
body::before{content:'';position:fixed;inset:0;z-index:-1;background:radial-gradient(ellipse 80% 60% at 100% 0%,rgba(30,64,128,.5),transparent 60%),radial-gradient(ellipse 60% 50% at 0% 100%,rgba(3,105,161,.25),transparent 60%)}
.w{max-width:760px;margin:0 auto;padding:28px 18px 40px}
.top{display:flex;align-items:center;gap:10px;margin-bottom:34px}.top img{width:44px;height:44px}.top b{font-family:'DM Serif Display',serif;font-size:20px}
.tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--akzent);border:1px solid var(--akzent);border-radius:20px;padding:4px 12px;margin-bottom:14px}
h1{font-family:'DM Serif Display',serif;font-size:clamp(30px,6vw,44px);line-height:1.15;margin-bottom:12px}
.lead{font-size:17px;color:var(--muted);margin-bottom:24px}
.cta{display:inline-block;background:var(--akzent);color:#04121f;font-weight:900;text-decoration:none;padding:15px 26px;border-radius:12px;font-size:16px}
.klein{font-size:13px;color:var(--muted);margin-top:10px}
ul.v{list-style:none;margin:34px 0;display:grid;gap:10px}
ul.v li{background:rgba(13,33,53,.8);border:1px solid rgba(56,189,248,.15);border-left:4px solid var(--akzent);border-radius:12px;padding:14px 16px;font-weight:700}
.zahlen{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 30px}.zahlen span{background:rgba(255,255,255,.06);border-radius:20px;padding:6px 12px;font-size:13px}
.autor{background:rgba(13,33,53,.8);border:1px solid rgba(56,189,248,.15);border-radius:14px;padding:16px;margin:28px 0}
.autor b{display:block;margin-bottom:4px}
.recht{font-size:13px;color:#fcd34d;border:1px solid rgba(252,211,77,.35);border-radius:10px;padding:10px 12px;margin:18px 0}
h2.wh{font-family:'DM Serif Display',serif;font-size:24px;margin:30px 0 10px}ul.wl{list-style:none;display:flex;flex-wrap:wrap;gap:8px}ul.wl a{display:inline-block;color:var(--text);text-decoration:none;border:1px solid rgba(56,189,248,.25);border-radius:20px;padding:6px 12px;font-size:14px}ul.wl a:hover{border-color:var(--akzent)}.klein a{color:var(--muted)}
footer{font-size:12px;color:var(--muted);margin-top:30px}footer a{color:var(--muted)}
</style>
</head>
<body>
<div class="w">
  <div class="top"><img src="/icon-512.png" alt="PLAN"><b>PLAN</b></div>
  <span class="tag">${esc(f.kurz)}</span>
  <h1>${esc(L.titel)}</h1>
  <p class="lead">${esc(L.untertitel)}</p>
  <a class="cta" href="${app}">Kostenlos starten</a>
  <p class="klein">Direkt im Browser oder als App für Android.</p>
  <ul class="v">${L.vorteile.map(v => `<li>${esc(v)}</li>`).join('')}</ul>
  <div class="zahlen"><span>2.000+ Prüfungsfragen</span><span>400 Lerneinheiten</span><span>80+ Wirkstoffe</span><span>KI-Lernassistent</span></div>
  ${hinweis}
  ${(f.wissen || []).length ? `<h2 class="wh">Kostenlos nachlesen</h2><ul class="wl">${f.wissen.map(w => `<li><a href="/wissen/${esc(w[0])}">${esc(w[1])}</a></li>`).join('')}</ul><p class="klein"><a href="/wissen">Alle Lerneinheiten der Wissensdatenbank →</a></p>` : ''}
  <div class="autor"><b>Wer dahinter steht</b>Patrick Schenkelberger · Fachpfleger Anästhesie &amp; Intensivmedizin · Praxisanleiter NRW</div>
  <p class="lead" style="font-size:15px">Für: ${esc(f.zielgruppe)}.</p>
  <a class="cta" href="${app}">Jetzt kostenlos loslegen</a>
  <footer><a href="/impressum.html">Impressum</a> · <a href="/datenschutz.html">Datenschutz</a> · <a href="#" onclick="window.plOpenConsent&&plOpenConsent();return false">Cookie-Einstellungen</a> · PLAN Digital</footer>
</div>
${LIVE ? GA_BODY : ''}</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const f of cfg.fachgebiete) {
  if (!f.landing || !f.landing.slug) continue;
  if (f.status !== 'live' && !MITENTWURF) continue;
  fs.writeFileSync(path.join(OUT, f.landing.slug + '.html'), seite(f));
  console.log('OK ' + path.relative(ROOT, path.join(OUT, f.landing.slug + '.html')) + (f.status !== 'live' ? '  (' + f.status + ')' : ''));
  n++;
}
if (LIVE) {   // eigene Sitemap für die Landingpages (im Sitemap-Index sitemap.xml eingetragen)
  const heute = new Date().toISOString().slice(0, 10);
  const urls = cfg.fachgebiete.filter(f => f.landing && f.landing.slug && f.status === 'live')
    .map(f => `  <url><loc>https://plan-nrw.de/fach/${f.landing.slug}.html</loc><lastmod>${heute}</lastmod></url>`).join('\n');
  fs.writeFileSync(path.join(ROOT, 'sitemap-fach.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  console.log('OK sitemap-fach.xml');
}
console.log(n + ' Landingpages erzeugt' + (LIVE ? ' (LIVE)' : ' (Vorschau, nicht ausgeliefert)'));
