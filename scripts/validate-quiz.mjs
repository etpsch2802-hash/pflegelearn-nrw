// QA fuer QUIZ_FRAGEN in index.html – strukturelle Validierung + Dubletten + Verteilung.
// Aufruf: node scripts/validate-quiz.mjs
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// QUIZ_FRAGEN-Array-Literal extrahieren und als JS auswerten (trailing commas erlaubt)
const m = html.match(/const QUIZ_FRAGEN\s*=\s*(\[[\s\S]*?\n\s*\]);/);
if (!m) { console.error('❌ QUIZ_FRAGEN nicht gefunden'); process.exit(1); }
let FRAGEN;
try { FRAGEN = Function('return ' + m[1])(); }
catch (e) { console.error('❌ Array nicht auswertbar (Syntaxfehler in QUIZ_FRAGEN):', e.message); process.exit(1); }

const VALID_KATS = new Set(['ana_herz','ana_atmung','ana_niere','ana_hormone','ana_verdauung','ana_nerven','ana_bewegung','ana_sinne','ana_blut','ana_grundlagen','pflegeplanung','altenpflege','anerkennung','gpa','anaesthesie',
  'psychiatrie','paediatrie','pflegehelfer','ata','its_beatmung','its_haemo','its_sepsis','its_neuro','its_organersatz','its_medikamente','its_elyt','its_pflege','ota','rehabilitation','palliation',
  'praevention','innere','chirurgie','psychologie','notfall','mobilitaet']);
const VALID_S = new Set(['leicht','mittel','schwer']);

const errors = [];
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\wäöüß ]/g, '').trim();
const seen = new Map();
const perKat = {};
const perKatK = {}; // pro Kategorie: [c0,c1,c2,c3] – Verteilung der richtigen Antwortposition

FRAGEN.forEach((q, i) => {
  const at = `#${i} "${String(q && q.frage || '').slice(0, 55)}…"`;
  if (!q || typeof q !== 'object') { errors.push(`${at}: kein Objekt`); return; }
  if (!q.kat || !VALID_KATS.has(q.kat)) errors.push(`${at}: ungueltige/fehlende kat "${q.kat}"`);
  if (!q.frage || typeof q.frage !== 'string' || q.frage.trim().length < 8) errors.push(`${at}: frage fehlt/zu kurz`);
  if (!Array.isArray(q.opt) || q.opt.length !== 4) errors.push(`${at}: opt muss genau 4 Optionen haben (hat ${q.opt ? q.opt.length : 'keine'})`);
  else {
    q.opt.forEach((o, j) => { if (!o || String(o).trim().length < 1) errors.push(`${at}: Option ${j} leer`); });
    if (new Set(q.opt.map(norm)).size !== 4) errors.push(`${at}: doppelte Optionen`);
  }
  if (!(Number.isInteger(q.k) && q.k >= 0 && q.k <= 3)) errors.push(`${at}: k muss 0..3 sein (ist ${q.k})`);
  if (!q.erkl || typeof q.erkl !== 'string' || q.erkl.trim().length < 10) errors.push(`${at}: erkl fehlt/zu kurz`);
  if (q.s && !VALID_S.has(q.s)) errors.push(`${at}: s ungueltig "${q.s}"`);
  // Dubletten (normalisierte Frage)
  const nf = norm(q.frage);
  if (nf) { if (seen.has(nf)) errors.push(`${at}: DUBLETTE zu #${seen.get(nf)}`); else seen.set(nf, i); }
  perKat[q.kat] = (perKat[q.kat] || 0) + 1;
  if (Number.isInteger(q.k) && q.k >= 0 && q.k <= 3) {
    (perKatK[q.kat] = perKatK[q.kat] || [0, 0, 0, 0])[q.k]++;
  }
});

console.log('Fragen gesamt:', FRAGEN.length);
console.log('\nVerteilung pro Kategorie:');
Object.entries(perKat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

// ── k-Verteilungs-Warnung (nicht-fatal): erkennt „ratbare" Kategorien ──
// Ideal ist ~25 % je Position. Gewarnt wird bei genug Fragen (>=16), wenn EINE
// Position stark dominiert (>45 %) oder eine Position gar nicht vorkommt (0 %).
// Ziel: Positions-Bias (wie einst in anatomie: 93 % auf B) früh sichtbar machen.
const K_MIN_N = 16;      // erst ab so vielen Fragen aussagekräftig
const K_DOMINANZ = 0.45; // Warnschwelle für die häufigste Position
const kWarnings = [];
Object.entries(perKatK).forEach(([kat, c]) => {
  const n = c[0] + c[1] + c[2] + c[3];
  if (n < K_MIN_N) return;
  const maxShare = Math.max(...c) / n;
  const leer = c.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
  const verteilung = c.map((v, i) => `${'ABCD'[i]}:${v}`).join(' ');
  if (maxShare > K_DOMINANZ) {
    kWarnings.push(`${kat} (n=${n}): eine Position dominiert mit ${(maxShare * 100).toFixed(0)} %  [${verteilung}]`);
  } else if (leer.length) {
    kWarnings.push(`${kat} (n=${n}): Position(en) ${leer.map(i => 'ABCD'[i]).join('/')} nie genutzt  [${verteilung}]`);
  }
});
if (kWarnings.length) {
  console.log(`\n⚠️  k-Verteilung – ${kWarnings.length} Kategorie(n) mit auffälliger Antwortposition (nur Hinweis, kein Fehler):`);
  kWarnings.forEach(w => console.log('  - ' + w));
  console.log('  → richtige Antwort bewusst über A/B/C/D streuen, damit das Quiz nicht ratbar wird.');
}

if (errors.length) {
  console.log(`\n❌ ${errors.length} Problem(e):`);
  errors.slice(0, 60).forEach(e => console.log('  - ' + e));
  process.exit(1);
}
console.log('\n✅ Alle Fragen strukturell valide, keine Dubletten.');
