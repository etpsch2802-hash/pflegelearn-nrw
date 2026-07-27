# Konzept: Probeklausur / Examens-Simulation

Stand 26.07.2026 · Status: **Rahmen entschieden, Umsetzung als Nächstes (Prototyp Schritt 1)**

Zeitbegrenzte Prüfung, die die schriftliche Abschlussprüfung nach PflBG 2020
nachbildet. Fragen gemischt aus dem vorhandenen Bestand (1.420) und neuen,
klausur-spezifischen Fragen.

---

## 1. Was die echte Prüfung ist (Rechtsgrundlage: PflAPrV § 14)

Verbindlich geregelt durch die bundesweite Ausbildungs- und Prüfungsverordnung
für die Pflegeberufe (PflAPrV), nicht durch die Bezirksregierung Arnsberg. Die
Behörde überwacht nur das Verfahren; die Aufgaben wählt sie auf Vorschlag der
Pflegeschule aus und kann landeseinheitliche zentrale Aufgaben vorgeben (in NRW
der Fall, aber nicht öffentlich).

**Struktur des schriftlichen Teils (§ 14 PflAPrV):**
- **Drei Aufsichtsarbeiten**, jede **120 Minuten**, an drei aufeinander-
  folgenden Werktagen.
- Jede Arbeit bezieht sich auf einen der drei Prüfungsbereiche und stellt
  **fallbezogene Aufgaben** — also eine Fallsituation, zu der ausgearbeitete
  Aufgaben zu bearbeiten sind. KEINE losen Einzelfragen.
- Die Fallsituationen werden über die drei Arbeiten hinweg **variiert**:
  unterschiedliche Versorgungskontexte, Altersstufen, Pflegeanlässe.
- Bestanden, wenn **jede** der drei Arbeiten mindestens „ausreichend" ist.

**Wichtige Konsequenz für die App:** Die echte Prüfung ist komplett
**fallbasiert und frei ausformuliert** — nicht Multiple Choice. Eine App kann
freie Textantworten nicht automatisch bewerten. Realistische Annäherung:
**fallbasierte MC-Fragen** (ein Fall, mehrere MC-Aufgaben dazu). Das ist
deutlich näher am Examen als lose Einzelfragen, aber keine 1:1-Nachbildung.

**Benennung in der App:** „examensnahe Übung" / „Probeklausur", NICHT „echte
Prüfungssimulation" — um nichts zu versprechen, was über das hinausgeht, was
das Format leisten kann.

Für die App bilden wir **eine Aufsichtsarbeit** nach (nicht alle drei Tage),
mit dem Ziel: echtes Prüfungsgefühl (Zeitdruck, kein Feedback, Fallbezug).

## 2. Kernunterschied zum normalen Quiz

| | Quiz (bestehend) | Probeklausur (neu) |
|---|---|---|
| Feedback | sofort nach jeder Frage | erst am Ende |
| Zeit | keine | Countdown, z. B. 120 Min |
| Abbruch | jederzeit ohne Folge | Timer läuft weiter, Warnung |
| Reihenfolge | frei | fest, mit Navigation vor/zurück |
| Zusammenhang | Einzelfragen | teils Fallblöcke (mehrere Fragen zu einem Fall) |
| Auswertung | Punktzahl | Punktzahl + Bestehensgrenze + Themen-Schwächen + Zeit |

Das „kein Sofort-Feedback" ist der psychologisch wichtigste Punkt. Erst dadurch
entsteht echter Prüfungsstress und die Nutzerin lernt, mit Unsicherheit zu
arbeiten, statt sich nach jeder Frage bestätigen zu lassen.

---

## 3. Aufbau einer Probeklausur

**Länge / Zeit:** konfigurierbar. Vorschlag:
- Kurz: 20 Fragen / 40 Min
- Mittel: 40 Fragen / 80 Min
- Voll: 60 Fragen / 120 Min (nah an der echten Aufsichtsarbeit)

**Fragenmischung** (das war deine Wahl „beides mischen"):
- ca. 70 % aus den vorhandenen 1.420 Fragen, gleichmäßig über die
  Kompetenzbereiche gestreut
- ca. 30 % neue, klausur-spezifische Fragen — vor allem **Fallblöcke**:
  eine Fallsituation, dann 3–5 Fragen dazu (Assessment, Maßnahme, Priorität,
  Begründung). Solche Blöcke gibt es im normalen Quiz nicht.

**Fallblöcke** nutzen die bestehende `FAELLE`-Struktur als Grundlage, ergänzt um
zugehörige MCQ. So bleibt es konsistent mit dem, was schon da ist.

**Bestehensgrenze:** frei setzbar, Vorschlag 50 % (wie viele Prüfungsordnungen).
Wird in der Auswertung als „bestanden / nicht bestanden" angezeigt — mit dem
klaren Hinweis, dass dies eine Übung ist und keine amtliche Bewertung.

---

## 4. Ablauf aus Nutzersicht

1. **Start-Screen:** Länge wählen, kurze Erklärung („kein Feedback bis zum Ende,
   Timer läuft"), Button „Klausur starten".
2. **Prüfungs-Screen:** oben ein Countdown, Fortschritt (Frage 12/40), unten
   vor/zurück und „markieren für später". Kein Richtig/Falsch sichtbar.
3. **Fallblöcke:** Fall-Text oben fixiert, darunter die zugehörige Frage.
4. **Zeit abgelaufen ODER „Abgeben":** automatische Auswertung.
5. **Auswertung:** Gesamtpunktzahl, bestanden-Linie, Aufschlüsselung nach
   Themenbereich (wo waren die Fehler?), Zeit gebraucht, Möglichkeit, falsche
   Fragen einzeln mit Erklärung durchzugehen.

---

## 5. Technisches Konzept (später umzusetzen)

### 5.1 Neuer Screen `screen-klausur`
Eigenständig, nicht in den Quiz-Screen gequetscht — die Logik unterscheidet
sich zu stark (kein Sofort-Feedback, Timer, Navigation). Setzt aber auf
denselben Fragen-Renderern auf, wo möglich.

### 5.2 Datenquellen
- `QUIZ_FRAGEN` (bestehend, 1.420) — für die 70 % Streufragen.
- `FAELLE` (bestehend) + neue Fall-MCQ — für die Fallblöcke.
- Neue Datei `data/klausur-faelle.js` für die klausur-spezifischen Fallblöcke,
  konsistent mit dem Sprint-3-Split (Daten in `/data/`).

### 5.3 Zusammenstellungs-Logik
Eine Funktion `baueKlausur(anzahl)`:
- zieht gewichtet über die Kompetenzbereiche (nicht 40x dieselbe Kategorie),
- mischt Streufragen und Fallblöcke im Verhältnis ~70/30,
- friert die Reihenfolge für den Durchgang ein,
- speichert die Antworten lokal, wertet erst bei „Abgeben" aus.

### 5.4 Timer
Reiner Client-Countdown (kein Server nötig). Läuft im Screen-State, pausiert
NICHT bei Tab-Wechsel (sonst ist der Prüfungscharakter weg — bewusst so).
Bei Ablauf: automatische Abgabe.

### 5.5 Ergebnis speichern (optional, später)
Für angemeldete Nutzer: Klausurergebnisse in einer Tabelle
`klausur_ergebnisse` (user_id, datum, punkte, prozent, zeit_sek, schwaechen).
Damit später ein Verlauf sichtbar wird („deine letzten 5 Probeklausuren").
GRANT für anon, authenticated, service_role (Dauerregel).

---

## 6. Neue Fragen — Fallblöcke (Schritt 2)

Nach PflAPrV variieren die Fälle über Versorgungskontext, Altersstufe und
Pflegeanlass. Genau das bilden die Fallblöcke ab: eine Fallsituation, dann
4–5 fallbezogene MC-Aufgaben (Assessment → Priorität → Maßnahme → Begründung).

Erster Satz (Schritt 2): **8 Fallblöcke**, breit variiert:
1. Internistisch, Erwachsener, Krankenhaus (z. B. Herzinsuffizienz)
2. Chirurgisch/postoperativ, Erwachsener, Krankenhaus
3. Geriatrisch, alter Mensch, stationäre Langzeitpflege
4. Pädiatrisch, Kind, Krankenhaus
5. Psychiatrisch, Erwachsener/Jugendlicher
6. Notfall/Akut, Erwachsener (ABCDE)
7. Palliativ, alter Mensch, Hospiz/ambulant
8. Ambulante Pflege, chronisch Kranker, häuslich

Jeder Fall durchläuft die reguläre Freigabe (CHECKS 1.9b): Kontrolle durch
Jessica Schenkelberger vor Aktivierung.

## 7. Reihenfolge der Umsetzung

1. **Prototyp Prüfungs-Screen** mit Timer + „kein Feedback bis Ende" +
   Auswertung, gespeist NUR aus den vorhandenen 1.420 Fragen. So sieht man
   das Gefühl, ohne dass neue Fragen nötig sind.
2. **Fallblöcke** entwerfen (die ~40 neuen Fragen), Jessica-Freigabe.
3. **Fallblöcke einbauen**, 70/30-Mischung scharfschalten.
4. **Ergebnis-Verlauf** (optional) für angemeldete Nutzer.

Schritt 1 ist in sich nutzbar und kostet wenig — ein guter erster Meilenstein.

---

## 8. Entschiedene Rahmenbedingungen (Patrick, 26.07.2026)

- **Bestehensgrenze: 50 %**, angelehnt an die NRW-Prüfungsordnung (jede
  Aufsichtsarbeit mind. „ausreichend").
- **Keine harten Stempel.** Statt „NICHT BESTANDEN" immer Prozentzahl + eine
  ermutigende Einordnung und der nächste Schritt. Beispiele:
  - ab 50 %: „68 % – über der Bestehensgrenze, stark! Deine schwächsten Themen: …"
  - unter 50 %: „42 % – noch unter 50 %, aber hier sind genau deine Lücken: …"
  Ergebnis ehrlich, nie als Urteil. (Wellbeing: keine Demotivation kurz vorm Examen.)
- **Timer läuft bei Tab-Wechsel weiter** (prüfungsnah), mit klarem Hinweis vor
  dem Start: „Der Timer läuft durch, auch wenn du die App verlässt – wie in der
  echten Prüfung."
- **Monetarisierung: erste Probeklausur gratis, weitere Premium.** Jede Nutzerin
  spürt das Feature einmal voll; wer regelmäßig üben will, löst dafür das Abo.
  Stärkstes Verkaufsargument, weil die Zahlungsbereitschaft kurz vorm Examen
  am höchsten ist.
