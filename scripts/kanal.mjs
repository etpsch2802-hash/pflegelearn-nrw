#!/usr/bin/env node
// WhatsApp-Kanal „PLAN – Pflegeexamen NRW“: Umfragen abrufen und als gestellt markieren.
// Daten: data/whatsapp-kanal.json (gestellt_am = Datum der Veröffentlichung, null = noch frei)
//
//   node scripts/kanal.mjs                  → nächste freie Frage anzeigen (markiert NICHT)
//   node scripts/kanal.mjs gestellt <id> [JJJJ-MM-TT]  → Frage als gestellt markieren (Standard: heute)
//   node scripts/kanal.mjs frei <id>        → Markierung zurücknehmen
//   node scripts/kanal.mjs status           → Übersicht
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
} else if (cmd === 'status') {
  const g = F.filter(q => q.gestellt_am).length;
  console.log(`${g} von ${F.length} gestellt, ${F.length - g} frei.`);
  F.filter(q => q.gestellt_am).forEach(q => console.log(`  ${q.gestellt_am}  #${q.id}  ${q.thema}`));
} else {
  console.error('Unbekannter Befehl. Siehe Kopfkommentar in scripts/kanal.mjs');
  process.exit(1);
}
