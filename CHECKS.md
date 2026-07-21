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
| 1.8 | Jeder Inhalt trägt `quelle`, `stand`, `geprueft_von`, `geprueft_am`? | laufend | ❌ Felder existieren im Datenmodell nicht — Freigaben oben sind derzeit nur hier dokumentiert, nicht im Produkt |
| 1.9 | Nutzer-Fehlermeldungen gesichtet und abgearbeitet? | monatlich | ❌ Meldeweg nicht gebaut |
| 1.10 | Fragenverteilung je Kategorie ≥ 40 bei beworbenen Ausbildungswegen? | quartalsweise | ❌ ATA/OTA/ITS teilweise nur 6–12 Fragen |

**Abbruchkriterium:** Steht ein Notfall- oder Medikamenteninhalt ohne Freigabe im Produkt, wird kein neues Feature gepusht.

---

## Achse 2 — Barrierefreiheit

Maßstab: BITV 2.0 / EN 301 549 (Voraussetzung für Vergabe an öffentliche Bildungsträger)

| # | Prüfpunkt | Sollwert | Status 21.07.2026 |
|---|---|---|---|
| 2.1 | `:focus-visible`-Regeln im CSS | > 0 | ✅ 6 (21.07.2026) |
| 2.2 | `role`-Attribute an interaktiven Bereichen | > 0 | ❌ **0** |
| 2.3 | `aria-label` an Icon-Buttons ohne Text | vollständig | ❌ 5 von ~380 |
| 2.4 | Alle `<img>` mit `alt` | 100 % | ⚠️ 7 von 8 |
| 2.5 | Vollständige Bedienbarkeit per Tastatur | ja | ⚠️ Fokus sichtbar; 378 `onclick` auf nicht-fokussierbaren Elementen weiterhin offen |
| 2.6 | Kontrast Text/Hintergrund ≥ 4.5:1 | 100 % | ⬜ ungeprüft |
| 2.7 | Nutzbar bei Browser-Zoom 200 % | ja | ⬜ ungeprüft |
| 2.8 | `prefers-reduced-motion` respektiert | ja | ✅ globaler Reduce-Block (21.07.2026) |
| 2.9 | Formularfelder mit zugeordnetem `<label>` | 100 % | ⬜ ungeprüft |
| 2.10 | `lang` korrekt bei i18n-Wechsel | ja | ⬜ ungeprüft |

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
| 3.6 | Laufzeiten ab 3 Monaten als verlängerndes Abo | ja | ❌ Einmalzahlung |
| 3.7 | Täglicher Wiederkehr-Anlass (Frage des Tages o. ä.) | ja | ❌ fehlt |
| 3.8 | Sozialer Mechanismus (Klasse / Rangliste / Empfehlung) | ja | ❌ fehlt vollständig |
| 3.9 | Anschlussangebot nach dem Examen | ja | ❌ fehlt |
| 3.10 | GA4-Funnel: `sign_up` → `begin_checkout` → `purchase` | ja | ✅ |
| 3.11 | Marketing-Zahlen im HTML = Ist-Bestand | ja | ✅ 21.07.2026 – Fallback auf 1.214 (= `QUIZ_FRAGEN.length`), Supabase hebt danach auf Gesamtwert |
| 3.12 | Testimonials mit dokumentierter Einwilligung | ja | ⚠️ mündlich zugesagt, nicht dokumentiert |

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
