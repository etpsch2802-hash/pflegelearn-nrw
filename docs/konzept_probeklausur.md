# Konzept: Probeklausur / Examens-Simulation

Stand 26.07.2026 · Status: **Planung, noch nicht gebaut**

Zeitbegrenzte Prüfung, die die schriftliche Abschlussprüfung nach PflBG 2020
nachbildet. Fragen gemischt aus dem vorhandenen Bestand (1.420) und neuen,
klausur-spezifischen Fragen.

---

## 1. Was die echte Prüfung ist (Zielbild)

Die schriftliche Abschlussprüfung der generalistischen Pflegeausbildung besteht
aus **drei Aufsichtsarbeiten** (Klausuren) an drei Tagen, jeweils bezogen auf
Kompetenzbereiche und Fallsituationen. Jede dauert **120 Minuten**.

Für die App bilden wir eine **einzelne Aufsichtsarbeit** als Modul nach — nicht
alle drei Tage am Stück, das wäre für eine Lern-App unrealistisch. Ziel ist,
dass die Nutzerin das Gefühl echter Prüfungsbedingungen bekommt: Zeitdruck,
kein Sofort-Feedback, zusammenhängende Fallfragen, Auswertung erst am Ende.

---

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

## 6. Neue Fragen — Umfang

Für den ersten Wurf brauchen wir **klausur-spezifische Fallblöcke**, weil die
im Bestand fehlen. Vorschlag:
- 8–10 Fallblöcke à 4–5 Fragen = ~40 neue Fragen.
- Themen breit gestreut: ein internistischer Fall, ein chirurgischer, ein
  geriatrischer, ein pädiatrischer, ein psychiatrischer, ein Notfall,
  ein palliativer, einer aus der ambulanten Pflege.

Diese neuen Fragen durchlaufen dieselbe Freigabe wie alle anderen:
Erst `aktiv=false` bzw. separat markiert, dann Kontrolle durch Jessica,
dann scharf. (CHECKS 1.9b)

---

## 7. Reihenfolge der Umsetzung

1. **Prototyp Prüfungs-Screen** mit Timer + „kein Feedback bis Ende" +
   Auswertung, gespeist NUR aus den vorhandenen 1.420 Fragen. So sieht man
   das Gefühl, ohne dass neue Fragen nötig sind.
2. **Fallblöcke** entwerfen (die ~40 neuen Fragen), Jessica-Freigabe.
3. **Fallblöcke einbauen**, 70/30-Mischung scharfschalten.
4. **Ergebnis-Verlauf** (optional) für angemeldete Nutzer.

Schritt 1 ist in sich nutzbar und kostet wenig — ein guter erster Meilenstein.

---

## 8. Offene Fragen an Patrick

- Bestehensgrenze: 50 %? Oder anlehnen an die konkrete NRW-Prüfungsordnung?
- Soll „bestanden/nicht bestanden" angezeigt werden, oder nur die Prozentzahl?
  (Manche Azubis demotiviert ein „nicht bestanden" in der Übung.)
- Timer bei Tab-Wechsel pausieren (nutzerfreundlich) oder weiterlaufen lassen
  (prüfungsnah)? Vorschlag: weiterlaufen, mit Hinweis vorab.
- Probeklausur gratis für alle, oder Premium-Feature? (Starkes Verkaufsargument.)
