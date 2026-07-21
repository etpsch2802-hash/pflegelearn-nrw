# CHECKS.md – Festes Audit-Protokoll PLAN NRW

**Zweck:** Diese Prüfung läuft unabhängig davon, was gerade die Aufgabe ist.
**Wann:** Vor jedem Sprint-Abschluss, mindestens alle 4 Wochen.
**Wer:** Patrick (Technik/Produkt) · Jessica Schenkelberger (Fachlichkeit, Krankenschwester ITS, seit 23 Jahren)
**Regel:** Jede Achse wird vollständig durchlaufen. Kein Überspringen, weil „gerade nicht das Thema".

Letzter vollständiger Durchlauf: **21.07.2026** · letzte Umsetzung: 21.07.2026
Letzte fachliche Kontrolle: **Jessica Schenkelberger, 21.07.2026**

---

## Achse 1 — Fachliche Aktualität

Verantwortlich: Jessica Schenkelberger

| # | Prüfpunkt | Intervall | Status 21.07.2026 |
|---|---|---|---|
| 1.1 | ERC/GRC-Reanimationsleitlinien: aktuelle Fassung im Code? | jährlich + bei Neuerscheinung | ⚠️ Umgestellt auf ERC/GRC 2025 am 21.07.2026 (0 Fundstellen „ERC 2021" verbleibend). **Gegenprüfung Jessica offen** für 2 Punkte, siehe Anhang A |
| 1.2 | DNQP-Expertenstandards: inhaltlich korrekt? | jährlich | ✅ Jessica, 21.07.2026 · Ausgabenbezeichnung noch nicht im Code hinterlegt (→ 1.8) |
| 1.3 | Medikamentenmodul: Angaben fachlich geprüft? | halbjährlich | ✅ Jessica, 21.07.2026 · Quellenangabe fehlt noch im Code (→ 1.8) |
| 1.4 | Notfall- und ITS-Inhalte fachlich freigegeben? | halbjährlich | ✅ Jessica, 21.07.2026 |
| 1.5 | S3-Leitlinien-Verweise inhaltlich korrekt? | jährlich | ✅ Jessica, 21.07.2026 · Versionsangabe fehlt noch im Code (→ 1.8) |
| 1.6 | Manchester Triage: aktuelle Fassung? | jährlich | ✅ Jessica, 21.07.2026 |
| 1.7 | PflBG / PflAPrV: Rechtsstand geprüft? | jährlich | ✅ Jessica, 21.07.2026 |
| 1.8 | Jeder Inhalt trägt `quelle`, `stand`, `geprueft_von`, `geprueft_am`? | laufend | ❌ Felder existieren im Datenmodell nicht. Inhalte sind vollständig geprüft (Jessica, 21.07.2026), die Freigabe ist aber nur hier dokumentiert, nicht im Produkt nachweisbar |
| 1.9 | Nutzer-Fehlermeldungen gesichtet und abgearbeitet? | monatlich | ✅ 21.07.2026 – Melde-Button an jeder Quizfrage, Tabelle `fragen_feedback`, Admin-Liste mit Status, Push aufs Gerät alle 15 Minuten |
| 1.9b | Alle Quizfragen fachlich kontrolliert? | halbjährlich | ✅ Jessica Schenkelberger, 21.07.2026 – vollständig, inkl. der 858 MCQ aus `lerninhalte` |
| 1.10 | Fragenverteilung je Kategorie ≥ 40 bei beworbenen Ausbildungswegen? | quartalsweise | ❌ ATA/OTA/ITS teilweise nur 6–12 Fragen |

**Abbruchkriterium:** Steht ein Notfall- oder Medikamenteninhalt ohne Freigabe im Produkt, wird kein neues Feature gepusht.

---

## Achse 2 — Barrierefreiheit

Maßstab: BITV 2.0 / EN 301 549 (Voraussetzung für Vergabe an öffentliche Bildungsträger)

| # | Prüfpunkt | Sollwert | Status 21.07.2026 |
|---|---|---|---|
| 2.1 | `:focus-visible`-Regeln im CSS | > 0 | ✅ 6 (21.07.2026) |
| 2.2 | `role`-Attribute an interaktiven Bereichen | > 0 | ⚠️ 2 (Navigation). Overlays ohne `role="dialog"` offen |
| 2.3 | `aria-label` an Icon-Buttons ohne Text | vollständig | ⚠️ 38 gesamt (21.07.2026). Statisches HTML erledigt; ~60 dynamisch erzeugte Buttons in JS-Templates offen |
| 2.4 | Alle `<img>` mit `alt` | 100 % | ✅ 8 von 8 (21.07.2026) |
| 2.5 | Vollständige Bedienbarkeit per Tastatur | ja | ⚠️ Fokus sichtbar; 378 `onclick` auf nicht-fokussierbaren Elementen weiterhin offen |
| 2.6 | Kontrast Text/Hintergrund ≥ 4.5:1 | 100 % | ⬜ ungeprüft |
| 2.7 | Nutzbar bei Browser-Zoom 200 % | ja | ⬜ ungeprüft |
| 2.8 | `prefers-reduced-motion` respektiert | ja | ✅ globaler Reduce-Block (21.07.2026) |
| 2.9 | Formularfelder mit zugeordnetem `<label>` | 100 % | ⚠️ 20 Felder per `aria-label` aus dem Placeholder versorgt; dynamische Felder offen |
| 2.10 | `lang` korrekt bei i18n-Wechsel | ja | ✅ 21.07.2026 |

**Prüfbefehle**
```bash
grep -c ":focus" index.html      # Soll: > 0
grep -c "role=" index.html       # Soll: > 0
grep -c "aria-label" index.html  # Soll: steigend
```

---

## Achse 3 — Retention & Conversion

| # | Prüfpunkt | Sollwert | Status 21.07.2026 |
|---|---|---|---|
| 3.1 | `push_subs` enthält Einträge | > 0 | ✅ 2 Einträge (21.07.2026). Frühere Diagnose „leer wegen fehlender Grants" war falsch: RLS, Grants und PK waren korrekt. Ursache war der zu enge Client-Funnel — behoben |
| 3.2 | Reminder-Workflow versendet tatsächlich | ja | ⚠️ `service_role` hat jetzt INSERT/UPDATE; Versand mit echten Empfängern noch nicht verifiziert |
| 3.3 | E-Mail beim Trial verpflichtend | ja | ✅ 21.07.2026 – Pflichtfeld + Format-Validierung |
| 3.4 | Trial serverseitig gebunden (nicht nur `localStorage`) | ja | ❌ in Inkognito umgehbar |
| 3.5 | Fortschritt geräteübergreifend gesichert | ja | ⚠️ Konto weiterhin optional, aber Prompt jetzt bis zu 3× im 7-Tage-Abstand statt einmalig |
| 3.6 | Laufzeiten ab 3 Monaten als verlängerndes Abo | ja | ❌ Einmalzahlung. **Blockiert:** Stripe-Buttons stehen auf der No-Touch-Liste, Umstellung nur mit ausdrücklicher Freigabe |
| 3.7 | Täglicher Wiederkehr-Anlass (Frage des Tages o. ä.) | ja | ✅ 21.07.2026 – Frage des Tages, deterministisch aus dem Datum, zählt auf Serie und Tagesziel, teilbar |
| 3.8 | Sozialer Mechanismus (Klasse / Rangliste / Empfehlung) | ja | ❌ fehlt. Klassen-Tabellen seit 21.07.2026 erstmals technisch nutzbar, aber `klassen_mitglieder` hat 0 Zeilen – Beitrittspfad noch nie erfolgreich durchlaufen |
| 3.9 | Anschlussangebot nach dem Examen | ja | ✅ 21.07.2026 – Ergebnisabfrage, Zweitanlauf über den Schwächen-Radar, Nachschlagewerk für Berufseinsteiger. GA-Event `examen_ergebnis` liefert nebenbei die Bestehensquote |
| 3.10 | GA4-Funnel: `sign_up` → `begin_checkout` → `purchase` | ja | ✅ |
| 3.11 | Marketing-Zahlen im HTML = Ist-Bestand | ja | ✅ 21.07.2026 – „2.000+" ist belegt: 1.214 `QUIZ_FRAGEN` + 858 MCQ aus `lerninhalte` = **2.072** |
| 3.12 | Testimonials mit dokumentierter Einwilligung | ja | ⚠️ mündlich zugesagt, nicht dokumentiert |
| 3.13 | **Jede Preiskachel führt auf den Checkout mit dem angezeigten Betrag** | ja | ✅ 21.07.2026 verifiziert. Vorher **spiegelverkehrt** – „1 Monat 9,99 €" führte auf den 79,99-€-Checkout |
| 3.14 | Rückleitungs-Parameter `p=` je Zahlungslink passend zur Laufzeit | ja | ✅ 21.07.2026 alle vier geprüft |
| 3.15 | **`<meta description>` und JSON-LD im `<head>` stimmen mit `plZahl()` überein** | ja | ⚠️ Muss **von Hand** gepflegt werden – Suchmaschinen führen kein JavaScript aus, `pl-z-*`-Spans greifen dort nicht. Stand 21.07.2026: 2000 Fragen, 159 Krankheitsbilder, 429 Lerneinheiten |

---

## Achse 4 — Architektur & Betrieb

| # | Prüfpunkt | Sollwert | Status 21.07.2026 |
|---|---|---|---|
| 4.1 | Größe `index.html` | sinkend | ❌ 2.488.465 Bytes |
| 4.2 | Inline-JavaScript | sinkend | ❌ 2.251.841 Bytes |
| 4.3 | Base64-Bilder im HTML | 0 | ❌ 185.196 Bytes |
| 4.4 | Inline-`style`-Attribute | sinkend | ❌ 2.368 |
| 4.5 | Inline-`onclick` | sinkend | ❌ 378 |
| 4.6 | Inhaltsdaten außerhalb des HTML | ja | ⚠️ nur Wissensdatenbank ausgelagert |
| 4.7 | `node --check` auf allen Inline-Scripts grün | ja | ✅ |
| 4.8 | Zugangscodes nicht im Quelltext | ja | ⚠️ `TOKEN_DB` hartkodiert |
| 4.9 | Zweite Person kann am Code arbeiten | ja | ❌ Bus-Faktor 1 |
| 4.10 | Secrets nicht im Repo | ja | ⬜ prüfen |

**Regel aus dem 21.07.2026:** Bei jeder neuen Tabelle GRANT für **drei** Rollen prüfen — `anon`, `authenticated` **und `service_role`**. Letztere fehlte bei `fragen_feedback` und hat den Push-Workflow zum Absturz gebracht. Supabase vergibt sie nur bei Tabellen, die über das Dashboard entstehen, nicht bei reinem SQL.

**Prüfbefehle**
```bash
wc -c index.html
grep -c 'style="' index.html
grep -c 'onclick=' index.html
```

---

## Ablauf eines Durchlaufs

1. Frischen Stand aus dem Repo ziehen (Contents-API für SHA, Git-Blobs-API für Inhalt)
2. Achsen 2 und 4 automatisiert prüfen (Befehle oben)
3. Achse 3 gegen Supabase und GA4 prüfen
4. Achse 1 durch Jessica; Ergebnis mit Name und Datum eintragen
5. Statusspalte aktualisieren, Datum oben setzen, pushen
6. Alles mit ❌ in Achse 1 blockiert den nächsten Feature-Push

**Legende:** ✅ erfüllt · ⚠️ teilweise · ❌ nicht erfüllt · ⬜ ungeprüft

---

## Anhang A — ERC/GRC 2025: erledigt am 21.07.2026

Umgestellt in `index.html` (Commit `3cd332e`). Verbleibende Treffer für „ERC 2021": **0**.

**Inhaltliche Änderungen (nicht nur Umbenennung):**

| Was | Alt | Neu |
|---|---|---|
| Temperaturmanagement | „Zieltemperaturmanagement (TTM)" | „Temperaturkontrolle nach ROSC" — gezieltes TTM wird in ERC 2025 **nicht mehr empfohlen**, Ziel ist Fiebervermeidung |
| ROSC-Exposition | „Temperatur 36–37,5 °C (kein Abkühlen mehr)" | Temperaturkontrolle, Fieber vermeiden |
| Defibrillation | — | **Neu:** Vektorwechsel bei anhaltendem Kammerflimmern nach 3 Schocks erwägen |
| Defibrillation | — | **Neu:** Double-Sequence-Defibrillation nicht routinemäßig |
| Überlebenskette | 5 Glieder | 4 Glieder; Telefonreanimation durch die Leitstelle früher eingebunden |

**Noch durch Jessica gegen das GRC-Dokument zu prüfen:**

1. **Zusammensetzung der viergliedrigen Überlebenskette** — die Umstellung von 5 auf 4 Glieder ist belegt, die genaue Formulierung der vier Glieder habe ich aus der Standardstruktur abgeleitet, nicht aus dem Originaldokument.
2. **Kinderreanimation** — ERC 2025 stellt klar, dass Kinder im Zweifelsfall wie Erwachsene reanimiert werden sollen. Der Kinder-Abschnitt (15:2, 5 initiale Beatmungen) ist unverändert und sollte auf diese Ergänzung geprüft werden.

Quelle für den Abgleich: German Resuscitation Council, ERC-Leitlinien 2025, deutsche Übersetzung (veröffentlicht 22.10.2025).

Nach Jessicas Bestätigung: 1.1 auf ✅ setzen.

---

## Änderungshistorie

| Datum | Durchlauf | Bemerkung |
|---|---|---|
| 21.07.2026 | Erstaufnahme | Vollständiges Premium-Audit; vier Achsen definiert, Ausgangsstand dokumentiert |
| 21.07.2026 | Achse 1 | Fachliche Kontrolle durch Jessica Schenkelberger: 1.2–1.7 freigegeben. 1.1 inhaltlich bestätigt, Leitlinienfassung offen (Anhang A). 1.8–1.10 sind Code-Zustände, durch Kontrolle nicht auflösbar. |
| 21.07.2026 | Achse 2 | Globale `:focus-visible`-Styles und `prefers-reduced-motion`-Block ergänzt (2.1, 2.8 erfüllt). Commit `13a561f`. |
| 21.07.2026 | Achse 3 | Trial-E-Mail als Pflichtfeld (3.3). Push- und Konto-Prompt mit Wiedervorlage statt einmalig (3.1, 3.5). Marketing-Zahlen korrigiert (3.11). Commits `13a561f`, `9ea62ae`, `3cd332e`. |
| 21.07.2026 | Supabase | Migration `fix_klassen_policies_and_push_service_role`: `klassen`, `klassen_mitglieder`, `aufgaben` hatten RLS aktiv bei **0 Policies** → Lehrer-/Klassenbereich war vollständig gesperrt. Policies und Grants ergänzt, `push_subs` von 13 auf 4 Policies konsolidiert. |
| 21.07.2026 | Achse 1 | ERC/GRC-2025-Umstellung umgesetzt, Commit `3cd332e`. Zwei Punkte zur Gegenprüfung offen (Anhang A). |
| 21.07.2026 | Achse 3 | Frage des Tages gebaut (3.7 erfüllt), alt-Texte vervollständigt (2.4). Commit `2727703`. |
| 21.07.2026 | **Zahlung** | **Kritischer Fund:** `PL_PLANS` war spiegelverkehrt – „1 Monat 9,99 €" führte seit 19.06. auf den 79,99-€-Checkout, „12 Monate" auf ein 9,99-€-Monatsabo. Korrigiert, Commit `3a4a89d`. Neue Prüfpunkte 3.13/3.14 aufgenommen. |
| 21.07.2026 | Achse 1 | Jessica: alle Quizfragen inkl. der 858 MCQ aus `lerninhalte` kontrolliert (1.9b). |
| 21.07.2026 | Achse 3 | Rückgängig: „2.000+ Fragen" ist belegt (2.072). Fallback wieder auf 2.000, Commit `c95b0b2`. |
| 21.07.2026 | Achse 1 | `quelle`/`stand`/`geprueft_von`/`geprueft_am` in `lerninhalte`; alle 429 Einträge mit Primärquelle und Freigabe. Literaturverzeichnis in der App. Commits `1d39b00`, `1b36cd1`, `f19bbf1`. |
| 21.07.2026 | UI | „Klasse" → „Kurs" in 48 sichtbaren Texten inkl. Genusanpassung. Commit `ddbca48`. |
| 21.07.2026 | Achse 3 | Gruppencode-Feld auf der Preisseite, `prefilled_promo_code` an den Checkout. Commit `51716e0`. |
| 21.07.2026 | Didaktik | Adaptives Üben: Fragenauswahl nach Kategorie-Schwäche gewichtet. Commit `a9f3ae7`. |
| 21.07.2026 | Achse 1 | Fehlermeldekanal komplett: Button, Tabelle, Admin-Liste, Push-Workflow. **Fehler dabei:** `service_role`-Grant vergessen → Workflow-Absturz, behoben. |
| 21.07.2026 | Achse 2 | `lang` bei Sprachwechsel, `role` auf Navigation, 38 `aria-label`. Erster Regex-Versuch hat JS-Strings zerlegt und wurde verworfen — `node --check` hat es gefangen. Commit `30a570e`. |
| 21.07.2026 | Kurs | Beitrittspfad geprüft: **kein Fehler gefunden.** Frühere Diagnose „RLS sperrt den Lehrerbereich" war falsch — `/api/klasse` nutzt `service_role` und umgeht RLS. 0 Mitglieder heißt: noch nie getestet. Fehlermeldungen im Client sauber getrennt, Commit `9963182`. |
| 21.07.2026 | Achse 3.9 | Anschluss nach dem Examen gebaut. Commit `0bc67bf`. |
| 21.07.2026 | Wartbarkeit | `plZahl()` / `plSyncZahlen()`: elf Kennzahlen werden aus den Datenstrukturen gezählt statt hartkodiert. Commit `a1432ca`. Neuer Prüfpunkt 3.15 für `<head>`, der nicht dynamisch werden kann. |
