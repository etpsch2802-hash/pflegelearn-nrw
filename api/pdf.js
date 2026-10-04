// PLAN NRW – Gratis-PDF-Download fuer eingeloggte Nutzer
// Route: /api/pdf?p=<slug>  -> liefert das PDF mit korrektem Content-Type als Download
// Grund: raw.githubusercontent liefert application/octet-stream; in der PWA/TWA bleibt der Bildschirm sonst schwarz.
// Nur freigegebene Gratis-PDFs (Whitelist). Beruehrt NICHT: chat.js, vercel.json, Stripe.

const BASE = 'https://raw.githubusercontent.com/etpsch2802-hash/pflegelearn-nrw/main/assets/pdf/';
const FILES = {
  eselsbruecken: 'PLAN-NRW_12-Eselsbruecken.pdf',
  rea: 'PLAN-NRW_Reanimations-Algorithmen.pdf',
  spickzettel: 'PLAN-NRW_Examens-Spickzettel.pdf',
  prophylaxen: 'PLAN-NRW_Prophylaxen-Kompendium.pdf',
  notfallkarten: 'PLAN-NRW_Notfallkarten_Anaesthesie-Intensiv.pdf',
  pflegeplanung: 'PLAN-NRW_Pflegeplanungs-Vorlagen.pdf',
  doku: 'PLAN-NRW_Dokumentationsvorlagen.pdf'
};

export default async function handler(req, res) {
  const slug = String((req.query && req.query.p) || '').toLowerCase();
  const file = FILES[slug];
  if (!file) { res.status(404).json({ error: 'unbekannt' }); return; }
  try {
    const r = await fetch(BASE + file);
    if (!r.ok) { res.status(502).json({ error: 'quelle', status: r.status }); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    const inline = String((req.query && req.query.view) || '') === '1';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', String(buf.length));
    res.setHeader('Content-Disposition', (inline ? 'inline' : 'attachment') + '; filename="' + file + '"');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.status(200).send(buf);
  } catch (e) {
    console.error('[pdf]', e);
    res.status(500).json({ error: 'server' });
  }
}
