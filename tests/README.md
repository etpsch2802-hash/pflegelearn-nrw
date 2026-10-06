# E2E-Tests (Playwright)

Erste automatisierte End-to-End-Tests für PLAN NRW. Bewusst **ohne** festes Test-Framework/`package.json` gehalten (passend zur „kein Build"-Architektur) – ein einfaches Node-Skript, das Playwright direkt nutzt.

## Was `trial-e2e.js` prüft (Sprint 1.5 „Intelligenter Trial")
1. **UI-Texte**: „21 Tage" erscheint, keine Trial-„7 Tage" mehr – und medizinischer Content mit „7 Tage" (z. B. „7 Tagen Granulationsgewebe") bleibt **unangetastet**.
2. **Engagement-Upsell** erscheint bei erster Examens-Simulation (Trigger B), mit CTA, setzt `pl_engage_upsell_shown`, und zeigt sich **nur einmal**.
3. **Kein** Upsell unter der Schwelle (10 Fragen, kein Examen).
4. **Kein** Upsell für Bezahlte (`pl_paid_until` in der Zukunft).
5. **Kein** Upsell für aktive Abonnenten (`pl_sub_active`).

## Lokal ausführen
```bash
# 1. Playwright einmalig installieren (nur Chromium)
npm i -D playwright && npx playwright install chromium

# 2. App lokal servieren (eigenes Terminal)
python3 -m http.server 8099 --bind 127.0.0.1

# 3. Tests laufen lassen
node tests/trial-e2e.js
# optional anderer Port/Host:
BASE_URL=http://localhost:8099 node tests/trial-e2e.js
```
Exit-Code `0` = alle grün, `1` = Test fehlgeschlagen, `2` = Laufzeitfehler.

## Hinweise
- Die App lädt externe Ressourcen (Supabase-CDN, Fonts, GA). Ohne Netz erzeugen sie Konsolenfehler – die **Trial-/Upsell-Logik ist davon unabhängig** (alles client-seitig in `localStorage`).
- Der Test setzt den Zustand direkt über `localStorage` und ruft `window.plCheckEngagementUpsell()` auf – so werden die Trigger deterministisch geprüft, ohne den kompletten Login-Flow durchklicken zu müssen.
- Stand: 2026-07-01, verifiziert mit 10/10 bestandenen Checks.


## `app-e2e.js` – Kernabläufe (seit 06.10.2026)
41 Prüfungen in 5 Blöcken, **Backend komplett gemockt** (Supabase-RPCs, KI, Analytics): keine Produktivdaten, keine Secrets, deterministisch.
1. **Start & Login**: keine JS-Fehler, Token-Prüfung nur per RPC, falscher/gesperrter Code abgelehnt, normaler Nutzer ist kein Admin, Beta-Funktionen unsichtbar.
2. **Admin & Quiz**: Admin-Flag, Community sichtbar, Quiz startet, Erklärung, Fehler-Orakel, Sprach-Hilfe-Knöpfe, Antwort gezählt.
3. **Lerntisch**: Szene, Mitlernende, alle 4 Lern-Knöpfe + Rückweg zum Tisch, Mini-Timer, Knöpfe mit zugänglichem Namen.
4. **Themen-Paket**: Thema „Lunge“ → Themen-Quiz mit Fragen.
5. **Konto löschen** (Admin = Testmodus, nie echte Löschung) & **Datenschutz-Dialog**.

Lokal: `npm i --no-save playwright @supabase/supabase-js@2`, Server wie oben, dann `node tests/app-e2e.js`.
Service Worker werden im Test blockiert (sonst lädt die Seite beim ersten Start neu).
