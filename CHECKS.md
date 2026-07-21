# CHECKS.md – Festes Audit-Protokoll PLAN NRW

**Zweck:** Diese Prüfung läuft unabhängig davon, was gerade die Aufgabe ist.
**Wann:** Vor jedem Sprint-Abschluss, mindestens alle 4 Wochen.
**Wer:** Patrick (Technik/Produkt) · Jessica (Fachlichkeit, ITS/Notfall)
**Regel:** Jede Achse wird vollständig durchlaufen. Kein Überspringen, weil „gerade nicht das Thema".

Letzter vollständiger Durchlauf: **21.07.2026**

---

## Achse 1 — Fachliche Aktualität

Verantwortlich: Jessica Schenkelberger (Krankenschwester ITS, seit 23 Jahren)

| # | Prüfpunkt | Intervall | Status 21.07.2026 |
|---|---|---|---|
| 1.1 | ERC/GRC-Reanimationsleitlinien: aktuelle Fassung im Code? | jährlich + bei Neuerscheinung | ❌ Code steht auf ERC 2021, gültig ist ERC/GRC 2025 (22.10.2025) |
| 1.2 | DNQP-Expertenstandards: Aktualisierungsstand je Standard vermerkt? | jährlich | ❌ Standards inhaltlich korrekt, aber ohne Ausgabenbezeichnung |
| 1.3 | Medikamentenmodul: Angaben gegen aktuelle Fachinformation geprüft? | halbjährlich | ❌ ungeprüft, keine Quelle hinterlegt |
| 1.4 | Notfall-/ITS-Inhalte: von Jessica freigegeben? | halbjährlich | ⬜ offen |
| 1.5 | S3-Leitlinien-Verweise: Version und Gültigkeit geprüft? | jährlich | ❌ ohne Versionsangabe |
| 1.6 | Manchester Triage: aktuelle Fassung? | jährlich | ⬜ offen |
| 1.7 | PflBG / PflAPrV: Rechtsstand geprüft? | jährlich | ⬜ offen |
| 1.8 | Jeder Inhalt trägt `quelle`, `stand`, `geprueft_von`, `geprueft_am`? | laufend | ❌ Felder existieren nicht |
| 1.9 | Nutzer-Fehlermeldungen aus Supabase gesichtet und abgearbeitet? | monatlich | ❌ Meldeweg existiert noch nicht |
| 1.10 | Fragenverteilung je Kategorie ≥ 40 bei beworbenen Ausbildungswegen? | quartalsweise | ❌ ATA/OTA/ITS teilweise nur 6–12 Fragen |

**Abbruchkriterium:** Steht ein Notfall- oder Medikamenteninhalt ohne Freigabe im Produkt, wird kein neues Feature gepusht.

---

## Achse 2 — Barrierefreiheit

Maßstab: BITV 2.0 / EN 301 549 (Voraussetzung für Vergabe an öffentliche Bildungsträger)

| # | Prüfpunkt | Sollwert | Status 21.07.2026 |
|---|---|---|---|
| 2.1 | `:focus-visible`-Regeln im CSS | > 0 | ❌ **0** |
| 2.2 | `role`-Attribute an interaktiven Bereichen | > 0 | ❌ **0** |
| 2.3 | `aria-label` an Icon-Buttons ohne Text | vollständig | ❌ 5 von ~380 |
| 2.4 | Alle `<img>` mit `alt` | 100 % | ⚠️ 7 von 8 |
| 2.5 | Vollständige Bedienbarkeit per Tastatur | ja | ❌ nicht gegeben |
| 2.6 | Kontrast Text/Hintergrund ≥ 4.5:1 | 100 % | ⬜ ungeprüft |
| 2.7 | Schriftgröße per Browser-Zoom auf 200 % nutzbar | ja | ⬜ ungeprüft |
| 2.8 | `prefers-reduced-motion` respektiert | ja | ⚠️ 2 Regeln vorhanden, unvollständig |
| 2.9 | Formularfelder mit zugeordnetem `<label>` | 100 % | ⬜ ungeprüft |
| 2.10 | Sprachauszeichnung `lang` korrekt bei i18n-Wechsel | ja | ⬜ ungeprüft |

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
| 3.1 | `push_subs` enthält Einträge | > 0 | ❌ **leer** – Retention-Motor ohne Zündung |
| 3.2 | Reminder-Workflow versendet tatsächlich | ja | ❌ keine Empfänger |
| 3.3 | E-Mail beim Trial verpflichtend | ja | ❌ optional |
| 3.4 | Trial serverseitig gebunden (nicht nur `localStorage`) | ja | ❌ in Inkognito umgehbar |
| 3.5 | Fortschritt geräteübergreifend gesichert | ja | ❌ Konto optional |
| 3.6 | Laufzeiten ab 3 Monaten als verlängerndes Abo | ja | ❌ Einmalzahlung |
| 3.7 | Täglicher Wiederkehr-Anlass vorhanden (Frage des Tages o. ä.) | ja | ❌ fehlt |
| 3.8 | Sozialer Mechanismus (Klasse/Rangliste/Empfehlung) | ja | ❌ fehlt vollständig |
| 3.9 | Anschlussangebot nach dem Examen | ja | ❌ fehlt |
| 3.10 | GA4-Funnel vollständig: `sign_up` → `begin_checkout` → `purchase` | ja | ✅ gesetzt |
| 3.11 | Marketing-Zahlen im HTML entsprechen dem Ist-Bestand | ja | ❌ „2.000+"/„1075" hartkodiert im First Paint |
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
| 4.6 | Inhaltsdaten außerhalb des HTML (Supabase/JSON) | ja | ⚠️ nur Wissensdatenbank ausgelagert |
| 4.7 | `node --check` auf allen Inline-Scripts grün | ja | ✅ |
| 4.8 | Zugangscodes nicht im Quelltext | ja | ⚠️ `TOKEN_DB` weiterhin hartkodiert |
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
4. Achse 1 durch Jessica; Ergebnis in `geprueft_von` / `geprueft_am` eintragen
5. Statusspalte in dieser Datei aktualisieren, Datum oben setzen, pushen
6. Alles mit ❌ in Achse 1 blockiert den nächsten Feature-Push

**Legende:** ✅ erfüllt · ⚠️ teilweise · ❌ nicht erfüllt · ⬜ ungeprüft

---

## Änderungshistorie

| Datum | Durchlauf | Bemerkung |
|---|---|---|
| 21.07.2026 | Erstaufnahme | Vollständiges Premium-Audit; vier Achsen definiert, Ausgangsstand dokumentiert |
