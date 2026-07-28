# Arbeitsanweisung: Längen-Bias in Quizfragen beheben

## Das Problem

In rund 832 von 1.420 Fragen ist die **richtige** Antwort deutlich länger und
ausführlicher als die falschen. Dadurch kann man die richtige Antwort erraten,
ohne die Frage zu lesen — einfach „die längste nehmen". Das entwertet die
Prüfungsvorbereitung komplett.

Beispiel des Problems:
```
Frage: Welche Maßnahme gehört zur Sturzprophylaxe?
  A) Bettgitter hochziehen                              (kurz, falsch)
  B) Sedierende Medikamente großzügig geben             (kurz, falsch)
  C) Patienten im Bett belassen                         (kurz, falsch)
  D) Rutschfeste Schuhe, freie Wege und angepasste      (LANG, richtig ← erkennbar)
     Hilfsmittel
```

## Deine Aufgabe

Du bekommst Fragen im JSON-Format. Für jede Frage gilt:

1. **Die richtige Antwort NICHT verändern.** Sie ist fachlich geprüft. Finger weg.
2. **Die falschen Antworten (Distraktoren) so überarbeiten, dass sie:**
   - **ungefähr so lang sind wie die richtige** (± wenige Wörter),
   - **fachlich plausibel klingen** — ein echter Denkfehler, den jemand machen
     könnte, nicht offensichtlicher Unsinn,
   - **inhaltlich eindeutig falsch bleiben** (nicht versehentlich auch richtig
     werden!).

Das Ziel: Alle vier Antworten sind gleich lang und gleich plausibel formuliert.
Nur wer den Inhalt kennt, erkennt die richtige.

## So machst du eine falsche Antwort besser

**Vorher (zu kurz, zu offensichtlich):**
`"Bettgitter hochziehen"`

**Nachher (gleiche Länge wie richtige, plausibler Denkfehler):**
`"Bettgitter durchgehend hochziehen und die Mobilität einschränken"`

Das ist immer noch falsch (Bettgitter sind eine freiheitsentziehende Maßnahme,
keine Sturzprophylaxe), klingt aber wie eine überlegenswerte Option und ist
ähnlich lang.

## Regeln

- Länge angleichen heißt: keine falsche Antwort darf mehr als ~30 % kürzer sein
  als die richtige.
- Keine Negationen als billiger Trick („... ist NICHT nötig").
- Keine Distraktoren, die durch Übertreibung sofort auffallen („immer", „nie",
  „grundsätzlich alle") — es sei denn, die richtige nutzt ähnliche Wörter.
- Wenn eine falsche Antwort inhaltlich zu nah an die richtige rückt und dadurch
  auch vertretbar würde: anders formulieren, klar falsch halten.
- Bei fachlicher Unsicherheit, ob ein Distraktor wirklich falsch ist: unter
  UNSICHER auflisten statt raten.

## Ausgabeformat

Gib die Fragen im selben JSON-Format zurück, nur mit überarbeiteten `opt`-Feldern.
Der Index `k` (richtige Antwort) bleibt gleich, weil du die richtige nicht
verschiebst. Struktur:
```json
{"idx": 123, "kat": "...", "frage": "...", "opt": ["...","...","...","..."], "k": 2}
```

Maximal 15 Fragen pro Antwort, dann stoppen und auf „weiter" warten.

Am Ende jeder Antwort:
- `BEARBEITET:` wie viele
- `UNSICHER:` welche Fragen fachlich geprüft werden müssen
- `NÄCHSTES:` ab welchem idx weiter

## Import (Patrick)

Die überarbeiteten Fragen ersetzen in `data/quiz-fragen.js` die Originale
anhand des `idx`. Vor Aktivierung: **Kontrolle durch Jessica** — sie prüft, dass
die neuen Distraktoren fachlich falsch UND plausibel sind (CHECKS 1.9b).

Datei mit den 832 kritischen Fragen: `kritische_fragen.json`, sortiert nach
Schweregrad (schlimmste zuerst). Arbeitet die Liste von oben nach unten ab.
