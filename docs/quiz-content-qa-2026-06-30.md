# Quiz-Content-QA-Report – 2026-06-30

> Automatisierte, **rein lesende** Qualitätsanalyse des `QUIZ_FRAGEN`-Arrays (`index.html`, ~Z. 1549).
> **Keine medizinischen Inhalte wurden verändert** – fachliche Korrekturen gehören in die Hand einer Fachperson (P. Schenkelberger). Dieser Report listet nur Fundstellen/Beobachtungen.

## Methodik
Strukturelle Heuristiken per `grep`/`awk` über das JSON-Format `{"kat","frage","opt":[…],"k","e"}`. Geprüft: Fragenzahl, Optionsvollständigkeit, abgeschnittene Texte, Dubletten, Kategorie-Konsistenz (Abgleich gegen `KATS`), Kategorie-Verteilung.

## Strukturelle Qualität – durchweg sauber ✅
| Prüfung | Ergebnis |
|---|---|
| Anzahl Quizfragen | **627** (`"frage"`, `"opt"`, `"kat"` je 627) – stimmt **exakt** mit der überall kommunizierten Marketing-Zahl überein |
| Antwortoptionen pro Frage | **alle 627 haben genau 4** – keine strukturell unvollständige Frage |
| Abgeschnittene Fragetexte | **0** (kein Fragetext endet auffällig auf `,`/`:`) |
| Dubletten (identische Fragetexte) | **0** |
| Kategorie-Konsistenz | **alle 20 Quiz-Kategorien sind in `KATS` definiert** → keine Filter-Lücke; jede Frage erscheint in Examen & Prüfungsreife |

→ Die historischen Bug-Klassen (abgeschnittene Antworten, Dubletten, fehlende Kategorien aus dem Decision Log) sind **vollständig behoben**. Die „Content-Qualitätsoffensive" hat strukturell gewirkt.

## Einziger nennenswerter Befund: starke Themen-Unwucht ⚠️
Die 627 Fragen verteilen sich **sehr ungleich** auf die 20 Kategorien:

| Kategorie | Fragen | Anteil |
|---|---:|---:|
| **anatomie** | **315** | **50,2 %** |
| pflegeplanung | 31 | 4,9 % |
| altenpflege | 21 | 3,3 % |
| psychiatrie / paediatrie / gpa / anerkennung / anaesthesie | je 20 | je 3,2 % |
| pflegehelfer / intensiv / ata | je 19 | je 3,0 % |
| ota | 16 | 2,6 % |
| rehabilitation / palliation | je 14 | je 2,2 % |
| praevention | 13 | 2,1 % |
| psychologie / notfall / innere / chirurgie | je 10 | je 1,6 % |
| mobilitaet | 6 | 1,0 % |

**Bewertung:** Für eine **Examens-Vorbereitungs-App** ist das didaktisch suboptimal. Anatomie & Physiologie stellt allein die Hälfte aller Fragen, während prüfungsrelevante klinisch-pflegerische Kernbereiche dünn besetzt sind – v. a. **Innere Medizin (10), Chirurgie (10), Notfall (10), Mobilität/Prophylaxen (6)**. Die generalistische Abschlussprüfung gewichtet diese Felder deutlich höher als reine Anatomie.

### Empfehlung (Priorität: mittel, conversion-/lernwertrelevant)
- **Kein Löschen von Anatomie-Fragen**, sondern **gezieltes Auffüllen** der unterrepräsentierten Kernbereiche (Innere, Chirurgie, Notfall, Mobilität/Prophylaxen, Pflegeplanung) auf je ~20–30 Fragen.
- Zielbild: ausgewogenere Verteilung, in der kein Einzelthema > ~25 % stellt.
- Fachliche Erstellung/Review durch P. Schenkelberger; technisch ist das additive Anhängen an `QUIZ_FRAGEN` (gleiches JSON-Format) risikoarm.

## Nicht geprüft (bräuchte Fachurteil, nicht automatisierbar)
- Fachliche Richtigkeit der als korrekt markierten Antwort (`"k"`-Index).
- Qualität/Plausibilität der Distraktoren inhaltlich (nur Struktur, nicht Sinn geprüft).
- Aktualität von Leitlinien/Expertenstandards in den Erklärungstexten (`"e"`).

---
*Erstellt automatisiert via Claude Code (rein lesende Analyse). Stand: 2026-06-30.*
