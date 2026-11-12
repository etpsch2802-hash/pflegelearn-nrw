# DESIGN.md – Designregeln für PLAN NRW

Verbindlich für **jede neue Funktion** in `index.html` (IIFE + Style), für Landingpages, PDFs und Videos.
Grundlage: Markenhandbuch (Projekt-Dokument `claude/markenhandbuch.md`) und die tatsächlich verwendeten Werte in `index.html` (Stand 12.11.2026).
Ziel: Neue Teile sehen aus wie der Rest der App – ruhig, klar, ein nächster Schritt.

---

## 1. Farben – immer über Variablen

Nutzer können ein Farbthema wählen (`pl_theme`) und Hell/Dunkel umschalten. **Darum nie feste Akzentfarben**, sondern die Variablen aus `:root` (~Z. 148):

| Variable | Dunkel (Standard) | Hell (`body.light-mode`) | Wofür |
|---|---|---|---|
| `--bg` / `--bg2` / `--bg3` | `#081527` / `#0d1e33` / `#10273d` | Seite `#eef2f7`, Karten weiß | Hintergrund, Karten, Flächen |
| `--text` | `#ddf0fb` | `#0f172a` | Haupttext |
| `--text2` | `#d8e6f4` | `#334155` | Zweittext |
| `--text3` | `#bcd6ea` | `#475569` | Hinweise, Beschriftungen |
| `--accent` / `--accent2` | `#38bdf8` / `#7dd3f7` | `#0284c7` / `#0369a1` | Akzent, Links, Hauptknopf |
| `--accent-rgb` | `56,189,248` | (je Thema) | `rgba(var(--accent-rgb),.12)` für Tönungen |

**Feste Bedeutungsfarben (themenunabhängig):**
- Richtig / erledigt: `#16a34a` (auf dunkel heller `#34d399` = `--c1`)
- Falsch / nochmal üben: **Orange** `#ea580c` (auf dunkel `#fdba74`) – **kein Rot für falsche Antworten**
- Warnung / Hinweis Dosis: Gelb-Kasten `#fef3c7` mit Rand `#f59e0b` (hell) bzw. `rgba(245,158,11,.12)` (dunkel)
- Rot nur für echte Gefahr/Notfall (`#dc2626`)

**Regeln**
- Ein Akzent pro Bildschirm. Keine Regenbogen-Kacheln, keine Farbverläufe auf Kacheln.
- Hell-Modus über die Variablen lösen, nicht Selektor für Selektor (Lehre aus Juli 2026).
- Kein 💙.

## 2. Schrift

- **DM Sans** für alles (selbst gehostet, `/fonts/fonts.css`). Überschriften 800, Text 500, Hervorhebung 700.
- **DM Serif Display** nur fürs Logo-Wort und große Zitate – nicht für Seitenüberschriften (Ruhe-Stil, 30.10.2026).
- **Mindestgröße 12 px.** Neue Elemente nie kleiner (Altbestand mit 11 px wird nach und nach angehoben).

| Rolle | Größe | Gewicht |
|---|---|---|
| Seitentitel | 22–26 px | 800 |
| Abschnittstitel | 16–18 px | 800 |
| Kartentitel | 14,5–15 px | 700–800 |
| Fließtext | 13,5–14,5 px | 500 |
| Beschriftung / Eyebrow | 12 px, `letter-spacing:1.5px`, GROSS | 800 |
| Zahlen | `font-variant-numeric:tabular-nums` | – |

## 3. Abstände & Formen

- Abstände im **4-px-Raster**: 4 · 8 · 12 · 16 · 20 · 24. Kartenabstand 12 px, Innenabstand Karte 14–18 px.
- Seitenrand mobil 16 px, keine horizontale Scrollleiste.
- Radien: Karte **14 px**, Knopf **12 px**, kleine Elemente 10 px, Pillen/Chips **999 px**.
- Rahmen statt Schatten: `1px solid rgba(var(--accent-rgb),.15)` bzw. `rgba(255,255,255,.1)`; im Hell-Modus `#cbd5e1`. Schatten nur bei Fenstern/Overlays.
- Tippfläche mind. **44 × 44 px**.

## 4. Bausteine

- **Hauptknopf:** volle Breite, 12 px Radius, Hintergrund `var(--accent)`, Text dunkel (`#04222e`) bzw. weiß im Hell-Modus, 15 px / 800. **Genau einer pro Bildschirm.** Text sagt, was passiert („Quiz starten“, nicht „Weiter“).
- **Zweitknopf:** transparent, Rand in Akzent-Tönung, gleiche Höhe.
- **Karte:** `var(--bg2)`, Radius 14, Rand fein, ein Titel + max. 2 Zeilen Text.
- **Filter:** wischbare Pillen-Leiste (`.plf-chip`-Muster) mit Farbpunkt, ohne Emoji, `aria-pressed`.
- **Seitenkopf:** links ausgerichtet, kleines Symbol in getönter Kachel (44 px, Radius 13), Titel einfarbig (`.hero` im Ruhe-Stil).
- **Fortschritt:** dünner Balken + „x von y“, keine Prozent-Kreise mehrfach pro Seite.
- **Fenster/Overlay:** max. eins gleichzeitig (`plRuhe()`), schließbar, Hauptknopf unten.
- **Hinweise Dosis/Rechner:** immer „Es gilt ausschließlich die ärztliche Anordnung.“

## 5. Inhalt & Ton im Interface

- Du-Form, kurze Sätze, Fachwörter erklären.
- „Passwort“ (Schulen: „Zugangscode“), „Kursraum“, „kostenlos“ solange `PL_PAYMENTS_ON=false`.
- Zahlen nur kanonisch: 2.000+ Prüfungsfragen · 400 Lerneinheiten · 80+ Wirkstoffe · KI-Lernassistent.
- Emojis sparsam: höchstens eins pro Karte/Knopf, nie als Kachel-Raster.

## 6. Bewegung

- Kurz: 150–350 ms, `ease-out`. Ein Element pro Moment animieren.
- Immer `@media (prefers-reduced-motion: reduce)` beachten (Animationen aus).
- Feiern nur bei echten Meilensteinen (Tagesziel, Quiz-Ende), nicht bei jedem Tipp.

## 7. Barrierefreiheit

- Kontrast Text mind. 4,5 : 1 (in beiden Modi prüfen).
- Knöpfe sind `<button>`, Symbole ohne Text bekommen `aria-label`.
- Farbe nie als einzige Information (richtig/falsch zusätzlich mit ✓ / Text).

## 8. Videos & Social (Kurzfassung)

- 1080 × 1920, heller Hintergrund mit Farbflecken, PLAN-Logo oben links, EKG-Linie türkis `#14b8a6`/`#2dd4bf`, Herzschlag-Ton.
- Text groß, max. 2 Zeilen, nicht unter den TikTok-Knöpfen (Vorlagen 540 × 960: rechts 62 px und unten ca. 150 px frei).
- **Schritt-Videos mit Fortschrittsbalken** oben („01 / 03 · …“, seit 12.11.2026, Vorlage `scripts/video/noradrenalin-vo.html`).
- Faceless, kein Patienten-Armband, keine Einrichtungsnamen.

## 9. Checkliste vor dem Commit

- [ ] Nur Variablen für Akzent/Text/Hintergrund, Hell-Modus geprüft
- [ ] Keine Schrift < 12 px, Tippflächen ≥ 44 px
- [ ] Ein Hauptknopf, Knopftext sagt, was passiert
- [ ] Falsch = Orange, nicht Rot
- [ ] `prefers-reduced-motion` beachtet
- [ ] Screenshot mobil (390 px) in Dunkel + Hell angesehen (Playwright)
