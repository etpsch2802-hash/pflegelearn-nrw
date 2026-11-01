#!/usr/bin/env node
// WhatsApp-Kanal „PLAN – Pflegeexamen NRW“: Umfragen abrufen und als gestellt markieren.
// Daten: data/whatsapp-kanal.json (gestellt_am = Datum der Veröffentlichung, null = noch frei)
//
//   node scripts/kanal.mjs                  → nächste freie Frage anzeigen (markiert NICHT)
//   node scripts/kanal.mjs gestellt <id> [JJJJ-MM-TT]  → Frage als gestellt markieren (Standard: heute)
//   node scripts/kanal.mjs frei <id>        → Markierung zurücknehmen
//   node scripts/kanal.mjs status           → Übersicht
//   node scripts/kanal.mjs heute            → Format des Tages + Material (Wochenplan, 18.10.2026)
//   node scripts/kanal.mjs log <format> <thema…>  → anderen Beitrag (Eselsbrücke, Fall …) protokollieren
//
//   node scripts/kanal.mjs aufgeloest <id>  → Quiz-Umfrage als aufgelöst markieren
//   node scripts/kanal.mjs fallgeloest      → letzten Mini-Fall als aufgelöst markieren
//
// Wochenplan ab 01.11.2026: Mo Umfrage · Di Auflösung · Mi Mini-Fall-Umfrage · Do Auflösung + Wissen für
// Examinierte · Fr Umfrage für Examinierte · Sa Auflösung · So Pause. Protokoll: daten.log
//
// Auswahl der nächsten Frage: niedrigste freie ID, deren Thema nicht unter den
// letzten 3 gestellten Themen ist (damit nicht 5x Medikamente hintereinander kommt).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATEI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'whatsapp-kanal.json');
const daten = JSON.parse(fs.readFileSync(DATEI, 'utf8'));
const F = daten.fragen;
const BUCHST = ['A', 'B', 'C', 'D'];
const heute = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
const speichern = () => fs.writeFileSync(DATEI, JSON.stringify(daten, null, 1) + '\n');

function naechste() {
  const gestellt = F.filter(q => q.gestellt_am).sort((a, b) => (a.gestellt_am + String(a.id).padStart(4, '0')).localeCompare(b.gestellt_am + String(b.id).padStart(4, '0')));
  const letzte = gestellt.slice(-3).map(q => q.thema);
  const frei = F.filter(q => !q.gestellt_am);
  return frei.find(q => !letzte.includes(q.thema)) || frei[0] || null;
}
function zeige(q) {
  console.log(`#${q.id} · ${q.thema}\n`);
  console.log('UMFRAGE – Frage:\n' + q.frage + '\n');
  q.optionen.forEach((o, i) => console.log(`Option ${BUCHST[i]}: ${o}`));
  console.log('\n(„Mehrere Antworten erlauben“ AUS)\n');
  console.log('AUFLÖSUNG (1–2 Tage später):\n' + q.aufloesung);
}

const [cmd, arg, datum] = process.argv.slice(2);
if (!cmd) {
  const q = naechste();
  if (!q) { console.log('Alle Fragen sind gestellt.'); process.exit(0); }
  zeige(q);
} else if (cmd === 'gestellt' || cmd === 'frei') {
  const q = F.find(x => x.id === Number(arg));
  if (!q) { console.error('Unbekannte ID: ' + arg); process.exit(1); }
  if (cmd === 'gestellt' && q.gestellt_am) { console.error(`#${q.id} wurde bereits am ${q.gestellt_am} gestellt.`); process.exit(1); }
  q.gestellt_am = cmd === 'gestellt' ? (datum || heute()) : null;
  speichern();
  console.log(cmd === 'gestellt' ? `#${q.id} als gestellt markiert (${q.gestellt_am}).` : `#${q.id} wieder freigegeben.`);
} else if (cmd === 'heute') {
  // Wochenplan ab 01.11.2026 (P. Schenkelberger): 3 Umfragen pro Woche, dazwischen Auflösungen, Sonntag Pause.
  // Im Kanal kann nur Patrick schreiben → Mitmachen NUR über Umfragen (keine „schreib uns“-Fragen).
  // Mo Quiz-Umfrage (Azubis) · Di Auflösung + Eselsbrücke · Mi Mini-Fall als Umfrage · Do Auflösung + Praxiswissen
  // für Examinierte · Fr Umfrage für Examinierte (Fachwissen) · Sa Auflösung · So Pause.
  const PLAN = { 1: 'umfrage', 2: 'aufloesung', 3: 'minifall-umfrage', 4: 'aufloesung+examiniert-wissen', 5: 'examiniert-umfrage', 6: 'aufloesung', 0: 'pause' };
  const wt = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getDay();
  const fmt = PLAN[wt];
  console.log(`HEUTE (${heute()}): ${fmt}`);
  if (fmt === 'pause') { console.log('Sonntag: kein Beitrag.'); process.exit(0); }
  const log = daten.log || [];
  if (fmt.startsWith('aufloesung')) {
    const offen = F.filter(q => q.gestellt_am && !q.aufgeloest_am && q.gestellt_am < heute());
    offen.forEach(q => console.log(`\nAUFLÖSEN #${q.id} (gestellt ${q.gestellt_am}): ${q.frage}\n${q.aufloesung}\n(danach: node scripts/kanal.mjs aufgeloest ${q.id})`));
    log.filter(l => /umfrage$/.test(l.format) && l.format !== 'umfrage' && !l.aufgeloest).forEach(l => console.log(`\nAUFLÖSEN (${l.format} vom ${l.datum}): ${l.thema}\n(danach: node scripts/kanal.mjs fallgeloest)`));
    if (fmt.endsWith('examiniert-wissen')) console.log('\nDAZU „FÜR EXAMINIERTE“: kurzes Praxiswissen (4–6 Zeilen) mit Beispiel und Erklärung – z. B. Medikament/Perfusor, Beatmung, Notfall, Expertenstandard-Update, Delegation/Recht. Danach: node scripts/kanal.mjs log examiniert-wissen <Thema>');
  }
  if (fmt === 'umfrage') { const q = naechste(); if (q) { console.log('\nNEUE UMFRAGE (danach: node scripts/kanal.mjs gestellt <id>):\n'); zeige(q); } }
  if (fmt === 'minifall-umfrage') console.log('\nMINI-FALL ALS UMFRAGE: 2–3 Sätze Fall (erfundene Person), „Was tust du zuerst?“, 4 Optionen. Abwechselnd für Azubis und Examinierte. Danach: node scripts/kanal.mjs log minifall-umfrage <richtige Option + 1 Satz Lösung>');
  if (fmt === 'examiniert-umfrage') {
    try {
      const src = fs.readFileSync(path.join(path.dirname(DATEI), 'quiz-fragen.js'), 'utf8');
      const Q = eval(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
      const genutzt = new Set(log.filter(l => l.format === 'examiniert-umfrage').map(l => l.thema));
      const kand = Q.filter(q => q.s === 'schwer' && /^(its_|an_|notfall|innere|chirurgie)/.test(q.kat) && !genutzt.has(q.frage));
      const tag = Math.floor(new Date(heute()) / 864e5);
      const q = kand[tag % kand.length];
      console.log('\nUMFRAGE FÜR EXAMINIERTE (Vorlage aus der App, Optionen ggf. sauber ausformulieren, je max. 100 Zeichen):');
      console.log(`[${q.kat}] ${q.frage}`); q.opt.forEach((o, i) => console.log(`Option ${BUCHST[i]}: ${o}${i === q.k ? '   ← richtig' : ''}`));
      console.log('Erklärung: ' + q.erkl);
      console.log(`\n(danach: node scripts/kanal.mjs log examiniert-umfrage "${q.frage.replace(/"/g, "'")}")`);
    } catch (e) { console.log('\nUMFRAGE FÜR EXAMINIERTE: Frage selbst aus data/quiz-fragen.js (schwer, Intensiv/Anästhesie/Notfall) wählen.'); }
  }
  console.log('\nZuletzt gepostet (nicht wiederholen):');
  log.slice(-10).forEach(l => console.log(`  ${l.datum}  ${l.format}  ${l.thema}`));
} else if (cmd === 'aufgeloest') {
  const q = F.find(x => x.id === Number(arg));
  if (!q) { console.error('Unbekannte ID: ' + arg); process.exit(1); }
  q.aufgeloest_am = datum || heute(); speichern(); console.log(`#${q.id} als aufgelöst markiert.`);
} else if (cmd === 'fallgeloest') {
  const offen = (daten.log || []).filter(x => /umfrage$/.test(x.format) && x.format !== 'umfrage' && !x.aufgeloest);
  offen.forEach(l => { l.aufgeloest = heute(); });
  if (offen.length) { speichern(); console.log(offen.length + ' Umfrage(n) als aufgelöst markiert.'); } else console.log('Nichts offen.');
} else if (cmd === 'log') {
  const thema = process.argv.slice(4).join(' ');
  if (!arg || !thema) { console.error('Aufruf: log <format> <thema>'); process.exit(1); }
  (daten.log = daten.log || []).push({ datum: heute(), format: arg, thema });
  speichern(); console.log(`Protokolliert: ${arg} – ${thema}`);
} else if (cmd === 'status') {
  const g = F.filter(q => q.gestellt_am).length;
  console.log(`${g} von ${F.length} gestellt, ${F.length - g} frei.`);
  F.filter(q => q.gestellt_am).forEach(q => console.log(`  ${q.gestellt_am}  #${q.id}  ${q.thema}`));
} else {
  console.error('Unbekannter Befehl. Siehe Kopfkommentar in scripts/kanal.mjs');
  process.exit(1);
}
