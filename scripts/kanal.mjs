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
// Wochenplan: Mo Umfrage · Di Auflösung + Eselsbrücke · Mi Mini-Fall · Do Praxisanleiter-Tipp
// (Sprachnachricht) · Fr Spickzettel · Sa/So App-Funktion oder Gratis-PDF. Protokoll: daten.log
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
  const PLAN = { 1: 'umfrage', 2: 'aufloesung+eselsbruecke', 3: 'minifall', 4: 'praxistipp', 5: 'spickzettel', 6: 'app', 0: 'app' };
  const wt = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getDay();
  const tage = d => Math.round((new Date(heute()) - new Date(d)) / 864e5);
  const letzte = F.filter(q => q.gestellt_am).sort((a, b) => a.gestellt_am.localeCompare(b.gestellt_am)).pop();
  let fmt = PLAN[wt];
  console.log(`HEUTE (${heute()}): ${fmt}`);
  if (fmt === 'umfrage' && letzte && tage(letzte.gestellt_am) <= 2) {
    console.log(`Hinweis: Umfrage #${letzte.id} wurde schon am ${letzte.gestellt_am} gestellt → heute KEINE neue Umfrage.`);
  } else if (fmt === 'umfrage') { const q = naechste(); if (q) zeige(q); }
  if (fmt.startsWith('aufloesung') && letzte) console.log(`\nAUFLÖSUNG zu #${letzte.id} (gestellt ${letzte.gestellt_am}):\n${letzte.frage}\n\n${letzte.aufloesung}`);
  const log = (daten.log || []).slice(-15);
  console.log('\nZuletzt gepostet (nicht wiederholen):');
  log.forEach(l => console.log(`  ${l.datum}  ${l.format}  ${l.thema}`));
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
