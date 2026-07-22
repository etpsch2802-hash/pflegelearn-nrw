# Arbeitsanweisung: Buchinhalte → Lerneinheiten für PLAN NRW

Diese Anweisung wird einem anderen Sprachmodell (GPT o. Ä.) vorgelegt.
Sie erzeugt Datensätze im exakten Format der Supabase-Tabelle `lerninhalte`.

---

## SCHRITT 0 — vorher selbst erledigen (Patrick)

Im Supabase SQL-Editor ausführen und **beide Ergebnisse mit an GPT geben**:

```sql
-- A) vorhandene Kategorien: GPT darf nur diese verwenden
select kategorie, count(*) from public.lerninhalte where aktiv
group by 1 order by 2 desc;

-- B) ein vollständiges Beispiel als Formatvorlage
select kategorie, titel, slug, daten, quelle, stand
from public.lerninhalte where aktiv and daten ? 'merksatz' limit 1;
```

---

## PROMPT AN GPT (ab hier kopieren)

Du hilfst beim Aufbau einer Lern-App für die generalistische Pflegeausbildung
in Deutschland (PflBG 2020). Ich gebe dir Buchkapitel. Du wandelst sie in
strukturierte Lerneinheiten um.

### Ausgabeformat

Ein JSON-Array. Pro Lerneinheit ein Objekt, exakt diese Struktur:

```json
{
  "kategorie": "<nur aus der mitgelieferten Kategorieliste>",
  "titel": "<prägnant, max. 60 Zeichen, keine Doppelpunkte>",
  "slug": "<kleinbuchstaben-mit-bindestrichen-ohne-umlaute>",
  "quelle": "<Buchtitel, Auflage, Jahr>",
  "stand": "2026-07",
  "daten": {
    "definition": "<2–4 Sätze. Was ist das? Der wichtigste Absatz.>",
    "pruefungswissen": "<5–10 Sätze. Konkrete Zahlen, Grenzwerte, Reihenfolgen, Fehlerquellen. Das, was in der Prüfung gefragt wird.>",
    "merksatz": "<1 Satz, einprägsam, gern mit Bild oder Reim>",
    "klinische_relevanz": "<2–3 Sätze: warum es im Alltag zählt>",
    "pflegeschwerpunkt": "<2–4 Sätze: was die Pflegekraft konkret tut>",
    "komplikationen": "<optional, 1–3 Sätze>",
    "durchfuehrung": "<optional, nur bei Maßnahmen: Ablauf in Schritten>",
    "mcq": [
      {
        "frage": "<eine Prüfungsfrage>",
        "optionen": ["<A>", "<B>", "<C>", "<D>"],
        "richtig": 0,
        "erklaerung": "<2–3 Sätze: warum richtig, und der häufigste Denkfehler>"
      }
    ]
  }
}
```

### Regeln für den Fließtext

1. **Vollständig neu formulieren.** Nicht abschreiben, nicht umstellen —
   in eigenen Worten schreiben. Der Buchtext ist Quelle, nicht Vorlage.
2. Sprache: Du-Form vermeiden, sachlich, aber verständlich für Azubis
   im ersten Ausbildungsjahr. Fachbegriffe verwenden und beim ersten Mal
   erklären.
3. Keine Emojis, keine Ausrufezeichen, keine Marketing-Sprache.
4. Zahlen immer konkret: nicht „erhöhter Wert", sondern „ab 38,5 °C".
5. Wenn eine Leitlinie relevant ist, mit Jahr nennen (z. B. ERC/GRC 2025,
   DNQP-Expertenstandard, KRINKO-Empfehlung).

### Regeln für die Prüfungsfragen (MCQ)

Genau **2 Fragen** pro Lerneinheit. Diese Regeln sind wichtiger als alles andere:

6. **Alle vier Optionen müssen fachlich plausibel sein.** Falsche Antworten
   wie „Normale Herzfrequenz", „Mehr Flüssigkeit", „Lieblingsessen" sind
   unbrauchbar — sie sind sofort als falsch erkennbar und messen nichts.
   Jeder Distraktor muss ein echter Denkfehler sein, den jemand tatsächlich
   machen könnte.
7. **`richtig` variieren.** Über alle Fragen hinweg soll die richtige Antwort
   gleichmäßig auf 0, 1, 2 und 3 verteilt sein. Nicht immer 0.
8. Alle vier Optionen ähnlich lang. Die längste Option darf nicht
   systematisch die richtige sein.
9. Keine Fragen mit „Was ist NICHT richtig?" — Negativfragen führen im
   Quizformat zu Verwechslungen.
10. Die Erklärung nennt nicht nur die richtige Antwort, sondern auch, warum
    die naheliegendste falsche Antwort falsch ist.

### Was du NICHT tust

- Keine Inhalte erfinden, die nicht im Buchkapitel stehen.
- Bei Unsicherheit über eine Zahl oder Leitlinie: Feld weglassen und am Ende
  der Antwort unter „UNSICHER" auflisten. Lieber eine Lücke als eine falsche
  Angabe — die App wird zur Examensvorbereitung genutzt.
- Keine Diagnosen, keine Dosierungsempfehlungen für konkrete Patienten.
- Keine Themen doppelt: Bevor du eine Lerneinheit anlegst, prüfe gegen die
  mitgelieferte Titelliste, ob es sie schon gibt.

### Umfang pro Durchgang

Maximal 10 Lerneinheiten pro Antwort. Danach stoppen und auf „weiter" warten.
So bleibt die Qualität kontrollierbar.

### Am Ende jeder Antwort

Drei Zeilen:
- `ANZAHL:` wie viele Einheiten
- `UNSICHER:` welche Angaben geprüft werden müssen
- `NÄCHSTES:` welches Kapitel als Nächstes ansteht

---

## SCHRITT 2 — Import (Patrick)

Das JSON von GPT speichern, dann in Supabase:

```sql
-- Platzhalter <JSON> durch das komplette Array ersetzen
insert into public.lerninhalte (kategorie, titel, slug, daten, quelle, stand, aktiv)
select x.kategorie, x.titel, x.slug, x.daten, x.quelle,
       (x.stand || '-01')::date, false        -- aktiv = false: erst nach Prüfung sichtbar
from jsonb_to_recordset('<JSON>'::jsonb)
     as x(kategorie text, titel text, slug text, daten jsonb, quelle text, stand text)
where not exists (
  select 1 from public.lerninhalte l where l.slug = x.slug
);
```

**`aktiv = false` ist Absicht.** Die Einheiten sind importiert, aber in der App
unsichtbar. Erst nach Jessicas Prüfung freischalten:

```sql
update public.lerninhalte
set aktiv = true, geprueft_von = 'Jessica Schenkelberger', geprueft_am = current_date
where slug in ('<slug-1>', '<slug-2>');
```

Kontrolle danach:

```sql
select aktiv, count(*) from public.lerninhalte group by 1;
```
