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
// Wochenplan ab 01.11.2026: jeden Tag eine Umfrage (Mi Mini-Fall, So Mitmach-Umfrage), jeweils mit
// Auflösung der letzten Umfrage oben. Protokoll: daten.log
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
  // Wochenplan ab 01.11.2026 (Wunsch P. Schenkelberger: Azubis wollen mitmachen, nicht nur lesen):
  // JEDEN Tag eine Umfrage. Mo/Di/Do/Fr/Sa Quiz-Umfrage aus dem Vorrat, Mi Mini-Fall als Umfrage,
  // So Mitmach-Umfrage (Meinung/Alltag, keine richtige Antwort). Dazu immer die Auflösung der letzten
  // noch nicht aufgelösten Quiz-Umfrage oben im selben Beitrag.
  const PLAN = { 1: 'umfrage', 2: 'umfrage', 3: 'minifall-umfrage', 4: 'umfrage', 5: 'umfrage', 6: 'umfrage', 0: 'mitmach-umfrage' };
  const wt = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getDay();
  const fmt = PLAN[wt];
  console.log(`HEUTE (${heute()}): ${fmt}`);
  const offen = F.filter(q => q.gestellt_am && !q.aufgeloest_am && q.gestellt_am < heute()).sort((a, b) => a.gestellt_am.localeCompare(b.gestellt_am));
  if (offen.length) {
    console.log('\n1) ZUERST AUFLÖSEN (danach: node scripts/kanal.mjs aufgeloest <id>):');
    offen.forEach(q => console.log(`\n#${q.id} (gestellt ${q.gestellt_am}): ${q.frage}\n${q.aufloesung}`));
  }
  if (fmt === 'umfrage') {
    const q = naechste();
    if (q) { console.log('\n2) NEUE UMFRAGE (danach: node scripts/kanal.mjs gestellt <id>):\n'); zeige(q); }
  } else if (fmt === 'minifall-umfrage') {
    console.log('\n2) MINI-FALL ALS UMFRAGE: 2–3 Sätze Fall (erfundene Person), Frage „Was tust du zuerst?“, 4 Optionen A–D (WhatsApp-Umfrage), Lösung morgen. Danach: node scripts/kanal.mjs log minifall-umfrage <Thema> <richtige Option + kurze Lösung>');
  } else {
    console.log('\n2) MITMACH-UMFRAGE (keine richtige Antwort): Frage aus dem Azubi-Alltag mit 3–4 Optionen, z. B. Lernzeit, Lieblingsfach, Angstthema im Examen, Einsatzort. Danach: node scripts/kanal.mjs log mitmach-umfrage <Thema>');
  }
  const log = (daten.log || []).slice(-10);
  const fallOffen = log.filter(l => l.format === 'minifall-umfrage' && !l.aufgeloest).pop();
  if (fallOffen) console.log(`\nAUCH AUFLÖSEN: Mini-Fall vom ${fallOffen.datum}: ${fallOffen.thema}  (danach: node scripts/kanal.mjs fallgeloest)`);
  console.log('\nZuletzt gepostet (nicht wiederholen):');
  log.forEach(l => console.log(`  ${l.datum}  ${l.format}  ${l.thema}`));
} else if (cmd === 'aufgeloest') {
  const q = F.find(x => x.id === Number(arg));
  if (!q) { console.error('Unbekannte ID: ' + arg); process.exit(1); }
  q.aufgeloest_am = datum || heute(); speichern(); console.log(`#${q.id} als aufgelöst markiert.`);
} else if (cmd === 'fallgeloest') {
  const l = (daten.log || []).filter(x => x.format === 'minifall-umfrage' && !x.aufgeloest).pop();
  if (l) { l.aufgeloest = heute(); speichern(); console.log('Mini-Fall als aufgelöst markiert.'); } else console.log('Kein offener Mini-Fall.');
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
