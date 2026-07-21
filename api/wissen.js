// PLAN NRW – SEO-Wissensseiten (servergerendert aus Supabase `lerninhalte`)
//
// Routen (ohne vercel.json-Aenderung erreichbar, da Route 1 `/api/(.*)` durchlaesst):
//   /api/wissen                      -> Index aller Kategorien + Lerneinheiten
//   /api/wissen?kategorie=Anaesthesie-> Kategorieseite
//   /api/wissen?slug=dekubitus       -> Detailseite
//
// SAUBERE URLS (/wissen/<slug>) – optional, spaeter:
//   In vercel.json VOR der Catch-All-Route additiv einfuegen:
//     { "src": "/wissen/?$",     "dest": "/api/wissen" },
//     { "src": "/wissen/(.*)$",  "dest": "/api/wissen?slug=$1" },
//   danach unten CLEAN_URLS = true setzen. Die Function akzeptiert beide Eingangspfade.
//
// Kein Vollinhalt: Definition + Anriss + Merksatz + max. 3 Fragen. Rest in der App.
// Beruehrt NICHT: chat.js, vercel.json, Stripe, index.html.

const SB_URL = 'https://tpgverrpznsujvzbntmj.supabase.co';
const SB_KEY = 'sb_publishable_37Wquc-WmPgV82HqtvWEFg_tjolOcMl';
const SITE = 'https://plan-nrw.de';

// Auf true stellen, sobald die Rewrites in vercel.json stehen.
const CLEAN_URLS = false;

/* ---------- Helfer ---------- */

function esc(x) {
  return String(x == null ? '' : x)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function jsonEsc(x) {
  return String(x == null ? '' : x).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    .replace(/[\n\r\t]/g, ' ').replace(/</g, '\\u003c');
}
function katSlug(k) {
  return String(k || 'sonstiges').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
// Anriss an der letzten Satzgrenze vor `max`
function anriss(t, max) {
  const s = String(t || '').trim();
  if (!s) return '';
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const p = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (p > max * 0.5 ? cut.slice(0, p + 1) : cut.replace(/\s+\S*$/, '') + ' …');
}
function datumDE(d) {
  if (!d) return '';
  const s = String(d).substring(0, 10).split('-');
  return s.length === 3 ? s[2] + '.' + s[1] + '.' + s[0] : String(d);
}
function urlSlug(slug) {
  return CLEAN_URLS ? SITE + '/wissen/' + encodeURIComponent(slug)
                    : SITE + '/api/wissen?slug=' + encodeURIComponent(slug);
}
function urlKat(kat) {
  return CLEAN_URLS ? SITE + '/wissen/kategorie/' + katSlug(kat)
                    : SITE + '/api/wissen?kategorie=' + encodeURIComponent(kat);
}
function urlIndex() {
  return CLEAN_URLS ? SITE + '/wissen' : SITE + '/api/wissen';
}

async function sb(query) {
  const r = await fetch(SB_URL + '/rest/v1/' + query, {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, Accept: 'application/json' }
  });
  if (!r.ok) throw new Error('Supabase ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
}

/* ---------- Layout ---------- */

const CSS = `*{box-sizing:border-box}body{margin:0;background:#050c18;color:#e2e8f0;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:#7dd3fc}main{max-width:760px;margin:0 auto;padding:20px 18px 64px}
header{border-bottom:1px solid rgba(56,189,248,.18);background:rgba(255,255,255,.03)}
header .in{max-width:760px;margin:0 auto;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.brand{font-weight:800;letter-spacing:.5px;color:#e8f3fb;text-decoration:none;font-size:16px}
.brand span{color:#38bdf8}
nav.bc{font-size:12.5px;color:#8ba6bd;margin:16px 0 6px}nav.bc a{color:#8ba6bd;text-decoration:none}nav.bc a:hover{color:#7dd3fc}
h1{font-size:27px;line-height:1.25;margin:6px 0 10px;color:#f1f5f9;font-weight:800;letter-spacing:-.4px}
h2{font-size:19px;margin:30px 0 10px;color:#e8f3fb;font-weight:700}
h3{font-size:12px;letter-spacing:.9px;text-transform:uppercase;color:#5eb8e6;margin:20px 0 5px;font-weight:800}
p{margin:0 0 12px;color:#cbd5e1}
.kat{display:inline-block;font-size:11.5px;letter-spacing:.7px;text-transform:uppercase;color:#5eb8e6;font-weight:800;text-decoration:none}
.lead{font-size:17px;color:#dbe7f1}
.box{background:rgba(255,255,255,.055);border:1px solid rgba(56,189,248,.16);border-radius:14px;padding:15px 17px;margin:14px 0}
.merk{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.28);border-radius:14px;padding:14px 17px;margin:16px 0;color:#d5f2e6}
.merk b{color:#6ee7b7;display:block;font-size:11px;letter-spacing:.9px;text-transform:uppercase;margin-bottom:4px}
.faq{border-top:1px solid rgba(255,255,255,.09);padding:14px 0}
.faq:last-child{border-bottom:1px solid rgba(255,255,255,.09)}
.faq .q{font-weight:700;color:#f1f5f9;margin-bottom:5px}
.faq .a{color:#cbd5e1;font-size:15px}
.cta{display:block;text-align:center;background:linear-gradient(135deg,#22d3ee,#38bdf8);color:#04121f;font-weight:800;font-size:16px;text-decoration:none;padding:15px 20px;border-radius:14px;margin:26px 0 8px}
.cta-sub{text-align:center;font-size:12.5px;color:#8ba6bd;margin:0 0 22px}
ul.links{list-style:none;padding:0;margin:8px 0 0;display:grid;grid-template-columns:1fr;gap:2px}
@media(min-width:620px){ul.links{grid-template-columns:1fr 1fr}}
ul.links a{display:block;padding:8px 11px;border-radius:9px;text-decoration:none;color:#cbd5e1;font-size:14.5px;border:1px solid transparent}
ul.links a:hover{background:rgba(255,255,255,.06);border-color:rgba(56,189,248,.2);color:#e8f3fb}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 0}
.tags a{font-size:13px;text-decoration:none;color:#cbd5e1;background:rgba(255,255,255,.06);border:1px solid rgba(56,189,248,.18);border-radius:999px;padding:6px 13px}
.quelle{margin-top:26px;padding-top:13px;border-top:1px solid rgba(255,255,255,.1);font-size:12px;color:#8ba6bd;line-height:1.7}
.mehr{font-size:14px;color:#9fb6c9}.mehr b{color:#cbd5e1;font-weight:600}
footer{border-top:1px solid rgba(255,255,255,.09);margin-top:40px;padding:18px 0 0;font-size:12px;color:#7e97ac}
footer a{color:#8ba6bd;text-decoration:none;margin-right:14px}`;

function page(o) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${esc(o.canonical)}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PLAN – Pflege Learn App NRW">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${esc(o.canonical)}">
<meta property="og:image" content="${SITE}/icon-512.png">
<meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${SITE}/favicon.png">
<link rel="apple-touch-icon" href="${SITE}/apple-touch-icon.png">
<style>${CSS}</style>
${o.ld ? '<script type="application/ld+json">' + o.ld + '</script>' : ''}
</head>
<body>
<header><div class="in">
<a class="brand" href="${SITE}/">PLAN <span>· Pflege Learn App NRW</span></a>
<a class="kat" href="${urlIndex()}">Wissensdatenbank</a>
</div></header>
<main>
${o.body}
<footer>
<a href="${SITE}/">App</a><a href="${urlIndex()}">Wissensdatenbank</a><a href="${SITE}/impressum.html">Impressum</a><a href="${SITE}/datenschutz.html">Datenschutz</a>
<div style="margin-top:9px">Redaktion: Patrick Schenkelberger, Fachpfleger Anästhesie &amp; Intensivmedizin, Praxisanleiter · Fachliche Freigabe: Jessica Schenkelberger, Krankenschwester Intensivpflege.<br>Die Inhalte ersetzen keine gültige Leitlinie, keine hausinterne Verfahrensanweisung und keine ärztliche Anordnung.</div>
</footer>
</main>
</body>
</html>`;
}

function ctaBlock(t) {
  return `<a class="cta" href="${SITE}/">${esc(t || 'Vollständigen Inhalt in der App öffnen')}</a>
<p class="cta-sub">Über 2.000 Prüfungsfragen · 429 Lerneinheiten · 159 Krankheitsbilder · 92 Fallbeispiele – 7 Tage kostenlos.</p>`;
}

/* ---------- FAQ aus den Fragen bauen ---------- */

function faqPairs(d) {
  const out = [];
  if (Array.isArray(d.mcq)) {
    d.mcq.forEach(function (m) {
      if (out.length >= 3) return;
      if (!m || !m.frage || !Array.isArray(m.optionen) || m.optionen.length < 2) return;
      const i = typeof m.richtig === 'number' ? m.richtig : 0;
      const a = m.optionen[i];
      if (a) out.push({ q: String(m.frage), a: String(a) });
    });
  }
  if (out.length < 3 && d.haeufige_pruefungsfrage && typeof d.haeufige_pruefungsfrage === 'string') {
    const s = d.haeufige_pruefungsfrage.trim();
    const qm = s.indexOf('?');
    if (qm > 0 && qm < s.length - 2) out.push({ q: s.slice(0, qm + 1), a: anriss(s.slice(qm + 1).trim(), 220) });
    else if (d.pruefungswissen) out.push({ q: s.replace(/\?*$/, '?'), a: anriss(d.pruefungswissen, 220) });
  }
  return out.slice(0, 3);
}

/* ---------- Detailseite ---------- */

const FELD_LABEL = {
  aufbau: 'Aufbau', funktion: 'Funktion', wirkkette: 'Wirkkette', physiologie: 'Physiologie',
  indikation: 'Indikationen', kontraindikation: 'Kontraindikationen', material: 'Material',
  vorbereitung: 'Vorbereitung', durchfuehrung: 'Durchführung', nachsorge: 'Nachsorge',
  komplikationen: 'Komplikationen', pflegeschwerpunkt: 'Pflegeschwerpunkt',
  klinische_relevanz: 'Klinische Relevanz'
};

function renderDetail(e, geschwister) {
  const d = e.daten || {};
  const kat = e.kategorie || 'Sonstiges';
  const url = urlSlug(e.slug);
  const definition = String(d.definition || '').trim();
  const pw = anriss(d.pruefungswissen, 300);
  const rel = anriss(d.klinische_relevanz || d.pflegeschwerpunkt, 220);
  const faqs = faqPairs(d);

  const desc = anriss(definition || pw || (kat + ': ' + e.titel), 155);

  // Felder, die es gibt, hier aber bewusst nicht ausgespielt werden
  const mehr = Object.keys(FELD_LABEL)
    .filter(function (k) { return typeof d[k] === 'string' && d[k].trim().length > 20; })
    .map(function (k) { return FELD_LABEL[k]; });

  const graph = [];
  graph.push('{"@type":"MedicalWebPage","@id":"' + jsonEsc(url) + '#page","url":"' + jsonEsc(url) + '"'
    + ',"name":"' + jsonEsc(e.titel) + '"'
    + ',"description":"' + jsonEsc(desc) + '"'
    + ',"inLanguage":"de"'
    + ',"audience":{"@type":"EducationalAudience","educationalRole":"student"}'
    + ',"about":{"@type":"Thing","name":"' + jsonEsc(kat) + '"}'
    + (e.stand ? ',"dateModified":"' + jsonEsc(String(e.stand).slice(0, 10)) + '"' : '')
    + ',"reviewedBy":{"@type":"Person","name":"' + jsonEsc(e.geprueft_von || 'Jessica Schenkelberger') + '"}'
    + ',"publisher":{"@type":"Organization","name":"PLAN – Pflege Learn App NRW","url":"' + SITE + '"}'
    + (e.quelle ? ',"citation":"' + jsonEsc(e.quelle) + '"' : '')
    + '}');
  graph.push('{"@type":"BreadcrumbList","itemListElement":['
    + '{"@type":"ListItem","position":1,"name":"Wissensdatenbank","item":"' + jsonEsc(urlIndex()) + '"},'
    + '{"@type":"ListItem","position":2,"name":"' + jsonEsc(kat) + '","item":"' + jsonEsc(urlKat(kat)) + '"},'
    + '{"@type":"ListItem","position":3,"name":"' + jsonEsc(e.titel) + '","item":"' + jsonEsc(url) + '"}]}');
  if (faqs.length) {
    graph.push('{"@type":"FAQPage","mainEntity":[' + faqs.map(function (f) {
      return '{"@type":"Question","name":"' + jsonEsc(f.q) + '","acceptedAnswer":{"@type":"Answer","text":"' + jsonEsc(f.a) + '"}}';
    }).join(',') + ']}');
  }
  const ld = '{"@context":"https://schema.org","@graph":[' + graph.join(',') + ']}';

  let b = '';
  b += `<nav class="bc"><a href="${urlIndex()}">Wissensdatenbank</a> › <a href="${urlKat(kat)}">${esc(kat)}</a></nav>`;
  b += `<h1>${esc(e.titel)}</h1>`;
  if (definition) b += `<p class="lead">${esc(definition)}</p>`;
  if (pw) b += `<h3>Prüfungswissen</h3><p>${esc(pw)}</p>`;
  if (d.merksatz) b += `<div class="merk"><b>Merksatz</b>${esc(d.merksatz)}</div>`;
  if (rel) b += `<h3>Warum es in der Prüfung vorkommt</h3><p>${esc(rel)}</p>`;

  if (faqs.length) {
    b += '<h2>Häufige Prüfungsfragen zu ' + esc(e.titel) + '</h2>';
    faqs.forEach(function (f) {
      b += `<div class="faq"><div class="q">${esc(f.q)}</div><div class="a">${esc(f.a)}</div></div>`;
    });
  }

  if (mehr.length) {
    b += `<div class="box mehr">In der App vollständig enthalten: <b>${esc(mehr.join(' · '))}</b>`
      + (Array.isArray(d.mcq) && d.mcq.length ? ` · <b>${d.mcq.length} Prüfungsfragen mit Erklärung</b>` : '')
      + `.</div>`;
  }

  b += ctaBlock('„' + e.titel + '" vollständig in der App lernen');

  const q = [];
  if (e.quelle) q.push('Quelle: ' + esc(e.quelle));
  if (e.stand) q.push('Stand: ' + esc(datumDE(e.stand)));
  if (e.geprueft_von) q.push('Fachlich geprüft: ' + esc(e.geprueft_von) + (e.geprueft_am ? ', ' + esc(datumDE(e.geprueft_am)) : ''));
  if (q.length) b += `<div class="quelle">${q.join(' · ')}</div>`;

  if (geschwister && geschwister.length) {
    b += `<h2>Weitere Lerneinheiten aus ${esc(kat)}</h2><ul class="links">`;
    geschwister.forEach(function (g) {
      b += `<li><a href="${urlSlug(g.slug)}">${esc(g.titel)}</a></li>`;
    });
    b += `</ul><p style="margin-top:12px"><a href="${urlKat(kat)}">Alle Lerneinheiten in ${esc(kat)} ansehen →</a></p>`;
  }

  return page({
    title: e.titel + ' – Prüfungswissen Pflege | PLAN NRW',
    desc: desc,
    canonical: url,
    ld: ld,
    body: b
  });
}

/* ---------- Kategorieseite ---------- */

function renderKategorie(kat, items, alleKats) {
  const url = urlKat(kat);
  const desc = kat + ' für die Pflegeausbildung: ' + items.length
    + ' Lerneinheiten mit Definition, Prüfungswissen und Merksätzen – fachlich geprüft, kostenlos lesbar.';
  const ld = '{"@context":"https://schema.org","@graph":['
    + '{"@type":"CollectionPage","url":"' + jsonEsc(url) + '","name":"' + jsonEsc(kat) + ' – Wissensdatenbank Pflege","description":"' + jsonEsc(desc) + '","inLanguage":"de"},'
    + '{"@type":"BreadcrumbList","itemListElement":['
    + '{"@type":"ListItem","position":1,"name":"Wissensdatenbank","item":"' + jsonEsc(urlIndex()) + '"},'
    + '{"@type":"ListItem","position":2,"name":"' + jsonEsc(kat) + '","item":"' + jsonEsc(url) + '"}]},'
    + '{"@type":"ItemList","itemListElement":[' + items.slice(0, 100).map(function (it, i) {
      return '{"@type":"ListItem","position":' + (i + 1) + ',"name":"' + jsonEsc(it.titel) + '","url":"' + jsonEsc(urlSlug(it.slug)) + '"}';
    }).join(',') + ']}]}';

  let b = '';
  b += `<nav class="bc"><a href="${urlIndex()}">Wissensdatenbank</a></nav>`;
  b += `<h1>${esc(kat)}</h1>`;
  b += `<p class="lead">${items.length} Lerneinheiten für die generalistische Pflegeausbildung – jeweils mit Definition, Prüfungswissen, Merksatz und Quelle.</p>`;
  b += '<ul class="links">';
  items.forEach(function (it) { b += `<li><a href="${urlSlug(it.slug)}">${esc(it.titel)}</a></li>`; });
  b += '</ul>';
  b += ctaBlock('Alle Inhalte in der App öffnen');
  if (alleKats && alleKats.length) {
    b += '<h2>Weitere Bereiche</h2><div class="tags">';
    alleKats.forEach(function (k) { if (k !== kat) b += `<a href="${urlKat(k)}">${esc(k)}</a>`; });
    b += '</div>';
  }
  return page({ title: kat + ' – Wissensdatenbank Pflege | PLAN NRW', desc: desc, canonical: url, ld: ld, body: b });
}

/* ---------- Index ---------- */

function renderIndex(rows) {
  const groups = {};
  rows.forEach(function (r) { const k = r.kategorie || 'Sonstiges'; (groups[k] = groups[k] || []).push(r); });
  const kats = Object.keys(groups).sort(function (a, b) { return a.localeCompare(b, 'de'); });
  const url = urlIndex();
  const desc = 'Wissensdatenbank Pflege: ' + rows.length + ' Lerneinheiten in ' + kats.length
    + ' Bereichen – Definition, Prüfungswissen und Merksätze für die generalistische Pflegeausbildung nach PflBG 2020.';
  const ld = '{"@context":"https://schema.org","@graph":['
    + '{"@type":"CollectionPage","url":"' + jsonEsc(url) + '","name":"Wissensdatenbank Pflege","description":"' + jsonEsc(desc) + '","inLanguage":"de"},'
    + '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Wissensdatenbank","item":"' + jsonEsc(url) + '"}]}]}';

  let b = '';
  b += `<h1>Wissensdatenbank Pflege</h1>`;
  b += `<p class="lead">${rows.length} fachlich geprüfte Lerneinheiten in ${kats.length} Bereichen – Definition, Prüfungswissen und Merksatz zu jedem Thema. Kostenlos lesbar, vollständig in der App.</p>`;
  b += '<div class="tags">';
  kats.forEach(function (k) { b += `<a href="${urlKat(k)}">${esc(k)} (${groups[k].length})</a>`; });
  b += '</div>';
  b += ctaBlock('App öffnen und loslernen');
  kats.forEach(function (k) {
    b += `<h2><a href="${urlKat(k)}" style="text-decoration:none">${esc(k)}</a></h2><ul class="links">`;
    groups[k].forEach(function (it) { b += `<li><a href="${urlSlug(it.slug)}">${esc(it.titel)}</a></li>`; });
    b += '</ul>';
  });
  return page({ title: 'Wissensdatenbank Pflege – ' + rows.length + ' Lerneinheiten | PLAN NRW', desc: desc, canonical: url, ld: ld, body: b });
}

/* ---------- Handler ---------- */

export default async function handler(req, res) {
  try {
    const raw = String(req.url || '');
    const qs = raw.indexOf('?') >= 0 ? raw.slice(raw.indexOf('?') + 1) : '';
    const p = new URLSearchParams(qs);
    const path = raw.split('?')[0];

    // Slug/Kategorie auch aus einem sauberen Pfad akzeptieren
    let slug = p.get('slug') || '';
    let kategorie = p.get('kategorie') || '';
    const m = path.match(/^\/wissen\/(kategorie\/)?(.+?)\/?$/);
    if (m && !slug && !kategorie) {
      if (m[1]) kategorie = decodeURIComponent(m[2]); else slug = decodeURIComponent(m[2]);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');

    /* Detailseite */
    if (slug) {
      const rows = await sb('lerninhalte?select=kategorie,titel,slug,daten,quelle,stand,geprueft_von,geprueft_am&aktiv=is.true&slug=eq.'
        + encodeURIComponent(slug) + '&limit=1');
      if (!rows.length) {
        res.statusCode = 404;
        res.setHeader('Cache-Control', 'public, s-maxage=300');
        return res.end(page({
          title: 'Nicht gefunden | PLAN NRW', desc: 'Diese Lerneinheit existiert nicht.',
          canonical: urlIndex(), ld: '',
          body: '<h1>Nicht gefunden</h1><p>Diese Lerneinheit gibt es nicht (mehr).</p>'
            + `<p><a href="${urlIndex()}">Zur Wissensdatenbank →</a></p>`
        }));
      }
      const e = rows[0];
      let gesch = [];
      try {
        gesch = await sb('lerninhalte?select=titel,slug&aktiv=is.true&kategorie=eq.'
          + encodeURIComponent(e.kategorie || '') + '&slug=neq.' + encodeURIComponent(slug)
          + '&order=titel.asc&limit=10');
      } catch (_) { /* Geschwister sind optional */ }
      return res.end(renderDetail(e, gesch));
    }

    /* Kategorieseite – Kategorie kann als Klartext oder als Slug kommen */
    if (kategorie) {
      const alle = await sb('lerninhalte?select=kategorie&aktiv=is.true');
      const kats = Array.from(new Set(alle.map(function (r) { return r.kategorie || 'Sonstiges'; })))
        .sort(function (a, b) { return a.localeCompare(b, 'de'); });
      const treffer = kats.find(function (k) { return k === kategorie || katSlug(k) === katSlug(kategorie); });
      if (!treffer) {
        res.statusCode = 404;
        res.setHeader('Cache-Control', 'public, s-maxage=300');
        return res.end(page({
          title: 'Bereich nicht gefunden | PLAN NRW', desc: 'Diesen Bereich gibt es nicht.',
          canonical: urlIndex(), ld: '',
          body: '<h1>Bereich nicht gefunden</h1>' + `<p><a href="${urlIndex()}">Zur Wissensdatenbank →</a></p>`
        }));
      }
      const items = await sb('lerninhalte?select=titel,slug&aktiv=is.true&kategorie=eq.'
        + encodeURIComponent(treffer) + '&order=titel.asc&limit=1000');
      return res.end(renderKategorie(treffer, items, kats));
    }

    /* Index */
    const rows = await sb('lerninhalte?select=kategorie,titel,slug&aktiv=is.true&order=kategorie.asc,titel.asc&limit=1000');
    return res.end(renderIndex(rows));

  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(page({
      title: 'Vorübergehend nicht verfügbar | PLAN NRW',
      desc: 'Die Wissensdatenbank ist gerade nicht erreichbar.',
      canonical: urlIndex(), ld: '',
      body: '<h1>Vorübergehend nicht verfügbar</h1><p>Bitte in einigen Minuten erneut versuchen.</p>'
        + `<p><a href="${SITE}/">Zur App →</a></p>`
    }));
  }
}
