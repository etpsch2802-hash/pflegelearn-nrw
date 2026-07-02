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
