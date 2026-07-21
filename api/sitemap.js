// PLAN NRW – dynamische Sitemap aller Wissensseiten
// Route: /api/sitemap   (in robots.txt als zweite Sitemap-Zeile eingetragen)
// Enthaelt: Startseite, statische Seiten, Wissens-Index, alle Kategorien, alle Lerneinheiten.
// Beruehrt NICHT: chat.js, vercel.json, Stripe, index.html.

const SB_URL = 'https://tpgverrpznsujvzbntmj.supabase.co';
const SB_KEY = 'sb_publishable_37Wquc-WmPgV82HqtvWEFg_tjolOcMl';
const SITE = 'https://plan-nrw.de';

// Muss zu api/wissen.js passen.
const CLEAN_URLS = true;

function katSlug(k) {
  return String(k || 'sonstiges').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function xesc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
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

function eintrag(loc, lastmod, changefreq, prio) {
  return '  <url>\n    <loc>' + xesc(loc) + '</loc>\n'
    + (lastmod ? '    <lastmod>' + xesc(lastmod) + '</lastmod>\n' : '')
    + '    <changefreq>' + changefreq + '</changefreq>\n'
    + '    <priority>' + prio + '</priority>\n  </url>\n';
}

export default async function handler(req, res) {
  const heute = new Date().toISOString().slice(0, 10);
  try {
    const r = await fetch(SB_URL + '/rest/v1/lerninhalte?select=kategorie,titel,slug,stand&aktiv=is.true&order=kategorie.asc,titel.asc&limit=1000', {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, Accept: 'application/json' }
    });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const rows = await r.json();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    xml += eintrag(SITE + '/', heute, 'weekly', '1.0');
    xml += eintrag(urlIndex(), heute, 'weekly', '0.9');

    const kats = Array.from(new Set(rows.map(function (x) { return x.kategorie || 'Sonstiges'; })));
    kats.sort(function (a, b) { return a.localeCompare(b, 'de'); });
    kats.forEach(function (k) { xml += eintrag(urlKat(k), heute, 'weekly', '0.8'); });

    rows.forEach(function (x) {
      if (!x.slug) return;
      xml += eintrag(urlSlug(x.slug), x.stand ? String(x.stand).slice(0, 10) : heute, 'monthly', '0.7');
    });

    xml += eintrag(SITE + '/impressum.html', null, 'yearly', '0.2');
    xml += eintrag(SITE + '/datenschutz.html', null, 'yearly', '0.2');
    xml += '</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end(xml);

  } catch (err) {
    // Minimal-Sitemap, damit der Crawler nie einen 500er sieht
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + eintrag(SITE + '/', heute, 'weekly', '1.0')
      + eintrag(urlIndex(), heute, 'weekly', '0.9')
      + '</urlset>\n';
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(xml);
  }
}
