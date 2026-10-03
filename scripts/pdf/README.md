# PLAN NRW – PDF-Generator

Erzeugt alle PLAN-Lernhilfen im einheitlichen Design (Logo + „Bestehen ist planbar." auf jeder Seite, A4, druckfreundlich).

## Voraussetzungen
- `pip install weasyprint pypdf`
- Schriften in `../fonts/`: Montserrat (Regular/SemiBold/Bold/ExtraBold, github.com/JulietaUla/Montserrat) und Source Sans 3 (github.com/adobe-fonts/source-sans)
- `logo.png` = `icon-512.png` aus dem Repo-Root

## Skripte
| Skript | PDF | Datenquelle |
|---|---|---|
| base.py | Designsystem (Deckblatt, Kopf-/Fußzeile, Komponenten) | – |
| rea.py | Reanimations-Algorithmen | im Skript |
| spick.py | Examens-Spickzettel | im Skript |
| proph.py | Prophylaxen-Kompendium | Text des alten PDFs (/tmp/Prophylaxen-Kompendium.txt) |
| notf.py | Notfallkarten Anästhesie & Intensiv | Text des alten PDFs |
| forms.py | Pflegeplanungs- und Dokumentationsvorlagen | im Skript |
| tk.py | Taschenkarten-Set | TASCHENKARTEN-Array aus index.html (/tmp/tk.json) |
| mp.py | Mündliche Prüfungssimulation | Text des alten PDFs |
| pf.py | Prüfungsfragen-Sammlung (300) | data/quiz-fragen.js (/tmp/q.json), seed 42 |
| kp.py | Komplettpaket (Zusammenführung) | fertige PDFs |

Stand: 03.10.2026. Fertige PDFs liegen in `assets/pdf/`.
