# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Sprache:** Dieses Projekt wird vollständig auf **Deutsch** geführt – Code-Kommentare, UI-Texte, Commit-Messages, Dokumentation und auch die Antworten von Claude im Chat. Bitte durchgängig auf Deutsch arbeiten.

> **Status dieses Dokuments:** Die CLAUDE.md ist ein **lebendes Dokument** und die zentrale Wissensbasis von PLAN NRW. Sie ist nach jedem Sprint und nach jeder wichtigen Architektur- oder Produktentscheidung zu aktualisieren, damit der aktuelle Projektstand niemals verloren geht. Abschnitte, die nur das Team befüllen kann (z. B. konkrete Roadmap-Termine, Business-KPIs), sind mit **`[vom Team zu pflegen]`** markiert – dort bitte nichts erfinden, sondern die Lücke kennzeichnen.

---

## 1. Projektüberblick

**PLAN – Pflege Learn App NRW** (Domain: `plan-nrw.de`) ist eine deutschsprachige Lern-App für Auszubildende in der Pflege in Nordrhein-Westfalen. Sie deckt alle **7 Ausbildungswege** ab und bietet Quiz, klinische Fälle, KI-Chat-Tutor, KI-Prüfungssimulation (mündlich/schriftlich), Karteikarten (Leitner-System), Merksätze/Eselsbrücken, Krankheitsbilder, Medikamente, Anatomie, Notfallmanagement und einen Lernplan.

Auslieferung als:
- **Installierbare PWA** (`manifest.json` + `sw.js`), und
- **Trusted Web Activity (TWA) Android-App** (`.well-known/assetlinks.json`, Paket `com.pflegelearn.nrw`).

**Entwickelt von** P. Schenkelberger (Ausbilder & Fachpfleger für Anästhesie/Intensivmedizin) – dies ist ein wiederkehrendes Vertrauenssignal in der App und in den Lead-Mails.

**Wichtigste Kennzahlen (im Code referenziert):** 627 Prüfungsfragen, 11 CE (Curriculare Einheiten), alle 7 Ausbildungswege.

### Business-Kontext
- **Geschäftsmodell:** Freemium mit 7-Tage-Trial und kostenpflichtigen Laufzeit-Tarifen (siehe Abschnitt „Stripe / Monetarisierung").
- **Erstes Produkt von PLAN Digital.** Architekturentscheidungen sollen so getroffen werden, dass Bausteine (Auth/Sync, Paywall, Push, KI-Proxy, Lead-Funnel) **später für weitere Produkte wiederverwendbar** sind (z. B. Notfall-App, weitere Pflege-Apps, künftige KI-Lösungen).
- **Konkrete Business-KPIs / Conversion-Zielwerte:** `[vom Team zu pflegen]`

---

## 2. Architektur – das große Bild

**Kein Build-Schritt, kein Framework, kein Root-`package.json`.** Die gesamte Client-App ist **eine handgeschriebene `index.html` mit ~17.000 Zeilen**, die HTML, Inline-CSS, Inline-JS und den **Lerninhalt als Inline-JS-Datenliterale** enthält. Das Backend besteht aus wenigen Vercel-Serverless-Funktionen in `api/`. „Bauen" bedeutet hier: `index.html`/`api/*` editieren und pushen – Vercel deployt automatisch.

### Single-File-Client (`index.html`)
- Die gesamte UI ist ein Dokument. „Seiten" sind `<div id="screen-*" class="page">`-Elemente, die per **`showScreen(name)`** (~Zeile 2459) umgeschaltet werden: entfernt `.active` von allen `.page`/`.chat-page` und setzt es auf `#screen-<name>`. Ein manuelles `screenHistory`-Array steuert den Zurück-Button; `_scrollPos` merkt sich die Scroll-Position pro Screen.
- **Vorhandene Screens:** `home`, `quiz`, `quizSelect`, `faelle`, `fall`, `chat`, `merksaetze`, `krankheitsbilder` (+ `kb-detail`), `medikamente`, `anatomie` (+ `an-detail`), `medizintechnik` (+ `mt-detail`), `notfallmanagement`, `lernplan`, `ce`, `abcde-sim`, `ausbildungswege`, `wissenpraxis`, `uebenpruefen`, `preise`, `registrierung`, `result`, `support`, `admin`.
- **Lerninhalt ist Inline-Daten**, nichts wird nachgeladen: `const FAELLE = …` (klinische Fälle, ~Z. 8161), `const fragen = …` / `const themen = …` / `KATS = …` (Quizfragen + Kategorien, ~Z. 2197 / 11303 / 11334), `const karten = …` / `const kartenHTML = …` (Karteikarten, ~Z. 12808 / 14288 / 14696). Inhalte werden **direkt in diesen Literalen** editiert.
- Top of file: `gtag` (Google Analytics `G-YJLC762MTC`), Consent-Gating (`pl_consent`), JSON-LD/SEO, Supabase-Init, Font-Loading.

### Datenfluss & Zustand
1. **Lokal:** Zustand lebt in `localStorage` unter `pl_*`-Keys – das ist das **De-facto-Schema** der App.
2. **Cloud-Sync:** Bei Login (passwortloser Magic-Link) spiegelt eine IIFE (`window.PLCloud`, ~Z. 16021) `pl_progress_v2` per **Max-Merge** (lokal+remote, jeweils Maximum pro Feld) in die Supabase-Tabelle `progress`. Push alle 15 s sowie bei `pagehide`/`visibilitychange`.
3. **Entitlement:** Wird **client-seitig** aus `localStorage` berechnet, mit Supabase `subscriptions` als serverseitiger Wahrheit (Auto-Freischaltung bei aktivem Abo).

---

## 3. Dateistruktur (Live vs. Altlasten)

**Live ausgelieferte Dateien (Repo-Root):**
- `index.html` – die komplette Client-App.
- `sw.js` – Service Worker (Cache + Web Push).
- `manifest.json` – PWA-Manifest.
- `api/chat.js`, `api/lead.js`, `api/stripe-webhook.js` – Vercel-Serverless-Funktionen.
- `scripts/send-reminders.mjs` – Push-Reminder-Sender (läuft via GitHub Actions, nicht Vercel).
- `vercel.json` – Routing/Rewrites.
- `.well-known/assetlinks.json` – Android-TWA-Verknüpfung.
- `assets/eselsbruecken.pdf` – Lead-Magnet-PDF (per Resend versendet).
- Statische HTML-Landingpages: `landingpage.html`, `datenschutz.html`, `impressum.html`, `flyer-pflegelearn.html`, `testernachrichten.html`, `links.html`, `k.html`, `robots.txt`, `sitemap.xml`, Icons.

**⚠️ Altlasten / Duplikate – NICHT live, nicht hier editieren in der Erwartung, dass es ausgeliefert wird:**
- `files 3/`, `files.1/`, `files.2.zip` – ältere Snapshots/Backups der Seite (alte `index.html`, Manifest, Icons).
- `manifest (1).json` – verwaiste Kopie von `manifest.json`.
- `chat.js` (Repo-Root) – **separate Gemini-Variante** (`gemini-1.5-flash`) des Chat-Handlers, **nicht** die aktive Route. Die Live-Route ist `api/chat.js` (Groq).

> **Technische Schuld:** Diese Altlasten sollten perspektivisch entfernt werden (siehe „Empfehlungen für die Zukunft"). Solange sie existieren, vor jeder Datei-Änderung prüfen, ob man die Live- oder eine Backup-Kopie bearbeitet.

---

## 4. Backend – Vercel Serverless (`api/`)

Jede Datei ist ein Default-Export `handler(req, res)`. Secrets kommen aus Vercel-Env-Variablen; keine davon ist eingecheckt. Alle Handler setzen CORS-Header und behandeln `OPTIONS`/Methoden defensiv.

| Route | Zweck | Externe Dienste | Benötigte Env-Variablen |
|---|---|---|---|
| `POST /api/chat` | KI-Chat-Tutor (Live-Endpoint, Client-Konstante `KI_ENDPOINT='/api/chat'`, ~Z. 2994) | **Groq** `llama-3.3-70b-versatile` (OpenAI-kompatibel) | `GROQ_API_KEY` |
| `POST /api/lead` | Lead-Erfassung + automatischer PDF-Versand der „12 Eselsbrücken" | **Supabase** (`leads`) + **Resend** (Mail von `kontakt@plan-nrw.de`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `RESEND_API_KEY` |
| `POST /api/stripe-webhook` | Stripe → Supabase Auto-Freischaltung | **Stripe API** + **Supabase** (`subscriptions`) | `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` |

**Wichtige Backend-Eigenheiten:**
- `api/lead.js`: Speichert zuerst den Lead (idempotent, `409` wird toleriert), versendet dann das PDF; der Mailversand ist **nicht fatal** (Lead bleibt gespeichert, auch wenn Resend fehlschlägt). Das PDF wird per GitHub-`raw`-URL aus `assets/eselsbruecken.pdf` geladen.
- `api/stripe-webhook.js`: **Verifiziert per Re-Fetch über die Stripe-API mit dem Secret Key – nicht per HMAC/Raw-Body-Signatur.** Schreibt mit Service-Role in `subscriptions` (umgeht RLS). User-Auflösung: 1) über bestehende `stripe_customer_id` in der DB, 2) Fallback über RPC `uid_by_email`. Behandelt `checkout.session.completed`, `customer.subscription.updated/deleted`, `charge.refunded`, `charge.dispute.created`. **Bewusste Designentscheidung:** Subscription-/Cancel-Events werden **ohne Re-Fetch** verarbeitet (Daten stammen direkt aus dem signierten Event), weil ein Re-Fetch bei Adaptive Pricing / Kündigung 404 → 500 → Stripe-Retry-Storm auslöste (siehe Decision Log).

---

## 5. Supabase

Client-SDK (`@supabase/supabase-js@2`) wird per CDN geladen und inline in `index.html` (~Z. 84) als `window.SB` mit **Projekt-URL `tpgverrpznsujvzbntmj.supabase.co`** und **publishable/anon Key** initialisiert. **Diese beiden Werte sind bewusst öffentlich und committet.** Auth: **passwortloser Magic-Link** (`signInWithOtp`, Redirect zurück auf die App-Origin).

**Tabellen / Nutzung:**
- `progress` – pro `user_id`/`modul` (`progress_v2`), Cloud-Sync von `pl_progress_v2` (Max-Merge), Upsert mit `onConflict: 'user_id,modul'`.
- `subscriptions` – geschrieben vom Stripe-Webhook (Service-Role), gelesen vom Client zur Auto-Freischaltung. Felder u. a. `user_id`, `stripe_customer_id`, `stripe_sub_id`, `status`, `plan`, `current_period_end`.
- `leads` – geschrieben von `api/lead.js` (`email`, `source`, `pdf_sent`).
- `push_subs` – Web-Push-Subscriptions (`endpoint` + `sub`-JSON).
- `access` – geräteübergreifender Zugang (Konto-Prompt „Fortschritt sichern", Commit `4ef8c17`).
- RPC `uid_by_email(p_email)` – löst Supabase-User per E-Mail auf (Webhook-Fallback).

**RLS-Hinweis:** Schreibzugriffe der Serverless-Funktionen nutzen die **Service-Role** und umgehen damit RLS bewusst. Client-seitige Zugriffe laufen unter dem anon/publishable Key + Auth-Session.

---

## 6. Stripe / Monetarisierung

**Tarif-Logik (`STRIPE_PLANS`, ~Z. 15222):** Vier Laufzeiten als **Stripe Payment Links** (öffentlich, committet). `kaufPlan(plan)` (~Z. 15228) speichert `pl_stripe_name`/`pl_stripe_plan` und leitet auf den passenden Link weiter.

| Plan | Preis | pro Monat | Hervorhebung | Abrechnungsart |
|---|---|---|---|---|
| `1m` | 9,99 € | 9,99 € | – | **Abo** (monatlich kündbar) |
| `3m` | 24,99 € | 8,33 € (−17 %) | **BELIEBT** | Einmalzahlung |
| `6m` | 44,99 € | 7,50 € (−25 %) | – | Einmalzahlung |
| `12m` | 79,99 € | 6,67 € (−33 %) | **BESTER PREIS** | Einmalzahlung |

**Freischaltung läuft auf zwei Wegen:**
1. **Server-seitig (Abos):** Stripe-Webhook → `subscriptions` → Client liest Abo-Status und schaltet via `pl_sub_active`/`pl_sub_email` frei (mit Magic-Link-Selbstheilung bei monatlicher Verlängerung).
2. **Client-seitig (Einmalzahlungen/Trial):** Über `pl_paid_until` / `pl_trial_until` etc. (siehe Paywall-Abschnitt).

---

## 7. Paywall / Zugriffsmodell (wichtig & subtil)

Es gibt **keine einzelne `hasAccess()`-Funktion.** Das Entitlement wird an den relevanten Stellen aus mehreren `localStorage`-Keys berechnet, überlagert von der Supabase-Wahrheit. Bei Änderungen am Gating diese Keys **end-to-end** verfolgen (Registrierung ~Z. 7200, Startup-Revalidierung ~Z. 7460), statt eine zentrale Funktion anzunehmen.

| Key | Bedeutung |
|---|---|
| `pl_token` | `'GRATIS'` (Free) oder bezahlter Token |
| `pl_user` / `pl_user_name` | Anzeigename |
| `pl_trial_until` / `pl_trial_used` / `pl_trial_expired` / `pl_trial_name` / `pl_trial_email` | 7-Tage-Trial (echter Sofort-Trial, Auto-Login, Gratis-Downgrade bei Ablauf) |
| `pl_paid_until` / `pl_paid_name` / `pl_paid_plan` | Bezahlter Zugang (Einmalzahlung) |
| `pl_sub_active` / `pl_sub_email` / `pl_sub_login_prompted` | Aktives Abo aus Supabase |
| `pl_stripe_name` / `pl_stripe_plan` | Zwischenspeicher vor Stripe-Redirect |

**Regeln:** Abgelaufener Trial fällt auf `pl_token='GRATIS'` zurück. In den letzten 2 Tagen gibt es einen Countdown-Hinweis; nach Ablauf ein Upsell-Modal mit Tarif-Picker. **`pl_*`-Keys niemals umbenennen** – das würde Nutzer stillschweigend ausloggen / Fortschritt zurücksetzen.

---

## 8. KI-Integration

- **Live-Chat-Tutor:** `api/chat.js` → Groq `llama-3.3-70b-versatile`. Client-Aufruf an `/api/chat` mit `{ messages, systemPrompt }`. Antwortformat: `{ reply }`.
- **KI-Prüfungssimulation** (mündlich/schriftlich): eigenes Feature, getaktet, mit Note/Auswertung und Schwächen-Wiederholung (Screen `abcde-sim` u. a.).
- **Inaktive Alternative:** Root-`chat.js` (Gemini `gemini-1.5-flash`) – nicht verdrahtet.
- **Anthropic/Claude:** Aktuell nicht als Laufzeit-Provider im Produkt eingebunden; Claude ist das Entwicklungs-/Wartungswerkzeug. Falls künftig eine Claude-API-Integration gebaut wird, die jeweils aktuellsten Modelle verwenden und Provider-Doku gegenprüfen (nicht aus dem Gedächtnis).

---

## 9. PWA, Service Worker & Web Push

**Service Worker (`sw.js`)** – Cache-Name `pflegelearn-v6`:
- **Network-first für alles** (HTML mit `cache: 'no-store'`); Cache nur als Offline-Fallback. Es werden **nur same-origin OK-Antworten** gecacht (niemals Stripe/Drittanbieter).
- **Web Push:** `push` → `showNotification`, `notificationclick` → App fokussieren/öffnen.
- **Regel:** Bei Änderungen an gecachten Assets oder SW-Verhalten **`CACHE`-Konstante hochzählen**, sonst aktualisieren Clients nicht.

**Web-Push-Erinnerungen (via GitHub Actions, nicht Vercel):**
- `.github/workflows/reminder-push.yml` läuft täglich **17:00 UTC** (+ manuell). Installiert ad hoc `web-push@3` (kein committetes `package.json`) und ruft `scripts/send-reminders.mjs`.
- Das Script liest `push_subs` aus Supabase und sendet einen VAPID-Push an jeden Endpoint; Subs mit `404/410` werden gelöscht (Selbstreinigung).
- **VAPID Public Key ist committet** (im Workflow und in `index.html` als `PL_VAPID_PUBLIC`, ~Z. 15549). Client-Push-Opt-in ist **inert, solange dieser Key fehlt**. Secrets `VAPID_PRIVATE` und `SUPABASE_SERVICE_KEY` liegen als GitHub-Repo-Secrets vor.
- Client-seitiger Selbstheiler `plResyncPush` schreibt ein bestehendes Abo beim App-Start erneut nach Supabase.

---

## 10. Deployment

- **Hosting:** Vercel. `vercel.json` routet `/api/*` → Serverless-Funktionen, statische Asset-Endungen direkt, alles andere → `index.html` (SPA-Fallback).
- **Deploy-Trigger:** Push auf `main` über die Vercel↔GitHub-Integration. Es gibt **kein Deploy-Kommando** im Repo.
- **Produktions-Domain:** `plan-nrw.de`.

---

## 11. Befehle & Workflows

> **Es gibt KEIN Build-, Test- oder Lint-Tooling.** Kein `npm run build/test/lint` erfinden – es gibt nichts auszuführen.

| Aufgabe | Vorgehen |
|---|---|
| **Syntax-Check (Pflicht vor jedem Push)** | `node --check api/chat.js && node --check api/lead.js && node --check api/stripe-webhook.js && node --check scripts/send-reminders.mjs` |
| **Lokale Vorschau (statisch)** | `python3 -m http.server 8080`, dann `index.html` öffnen. **Achtung:** `/api/*` und SPA-Rewrites laufen so **nicht** – nur unter `vercel dev`. |
| **Lokal mit Funktionen** | `vercel dev` (benötigt gesetzte Env-Variablen). |
| **Push-Reminder manuell testen** | GitHub Actions → `reminder-push` → „Run workflow" (workflow_dispatch). |
| **„Bauen"** | `index.html` / `api/*` editieren → committen → pushen → Vercel deployt automatisch. |

**Git-Workflow:** Entwicklung auf dem zugewiesenen Feature-Branch, Conventional Commits mit **deutschem** Body (z. B. `feat(push): …`, `fix(quiz): …`, `docs: …`). Erst pushen, wenn ausdrücklich gewünscht.

---

## 12. Coding Standards & Konventionen

- **Sprache:** Alle nutzerseitigen Strings, Code-Kommentare und Commit-Messages auf **Deutsch**.
- **Client-JS:** Schlichtes ES5/ES2015 für Browser, viele **IIFEs** und `var`, defensive `try/catch` um **jeden** `localStorage`/JSON/Netzwerk-Zugriff, keine Module/kein Bundler. Neuer Client-Code soll **additiv und in sich geschlossen** im selben Stil sein. Mehrere Skripte tragen bewusst Kommentare wie „berührt NICHT …", um isoliert zu bleiben – diese Isolation respektieren.
- **`localStorage` `pl_*`-Keys = De-facto-Schema:** Bestehende Keys vor dem Anlegen neuer prüfen, niemals umbenennen.
- **Service Worker:** `CACHE`-Version bei Asset-/Verhaltensänderung erhöhen.
- **Secrets:** ausschließlich in Vercel/GitHub-Env. **Bewusst öffentlich committet** (kein Geheimnis): Supabase-URL + publishable/anon Key, VAPID Public Key, Stripe Payment Links (publishable), GA-ID. **Niemals committen:** Service-Role-Keys, `GROQ_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `VAPID_PRIVATE`, `SUPABASE_SERVICE_KEY`.
- **Admin:** Features sind über `isAdmin()` (~Z. 14381) gegated; `showScreen('admin')` leitet Nicht-Admins auf `home`.
- **Große Datei navigieren:** Wegen der ~17k-Zeilen-`index.html` **zeilenverankert suchen** (Anker oben in diesem Dokument) statt die ganze Datei zu lesen; Edits als präzise String-Replacements.

---

## 13. Testverfahren

- **Automatisierte Tests existieren nicht.** Qualitätssicherung erfolgt aktuell durch:
  1. `node --check` für alle JS-Dateien vor dem Push (Pflicht).
  2. Manuelle Verifikation im Browser (PWA-Flows: Trial-Start, Quiz, KI-Chat, Kauf-Redirect, Cloud-Sync nach Magic-Link).
  3. Content-QA für Quizfragen (abgeschnittene Antworten, „faule Distraktoren", Dubletten, Kategorie-Zuordnung in `KATS`/`quiz_kats`) – ein wiederkehrendes Thema in der Historie.
- **Einschränkung / Risiko:** Ohne Testabdeckung sind Regressionen am Entitlement-/Sync-Verhalten schwer zu erkennen. Siehe „Empfehlungen für die Zukunft".

---

## 14. Entwicklungsphilosophie

Ziel ist **nicht** maximale Feature-Zahl, sondern: höchste Codequalität, wartbarer Code, skalierbare Architektur, schnelle Entwicklungszyklen, hohe Nutzerzufriedenheit, steigende Conversion und langfristiger Unternehmenserfolg.

**Vor jeder größeren Entwicklung prüfen:**
1. Verbessert die Änderung die **Nutzerzufriedenheit**?
2. Erhöht sie **Conversion** oder **Kundenbindung**?
3. Verbessert sie **Wartbarkeit** oder **Performance**?
4. Unterstützt sie die langfristige Vision von **PLAN Digital**?

Bei mehreren möglichen Lösungen immer die **wirtschaftlich sinnvollste, wartbarste und skalierbarste** empfehlen. Claude soll nicht nur Anforderungen umsetzen, sondern **eigenständig Verbesserungsvorschläge** machen, Optimierungspotenziale aufzeigen und Risiken früh erkennen.

---

## 15. Arbeitsregeln

1. **Additiv arbeiten** – bestehende Funktionen nicht ohne Notwendigkeit ersetzen.
2. **Vor Änderungen zuerst analysieren** (Code-Pfade, betroffene `pl_*`-Keys, Isolations-Kommentare beachten).
3. **Vor jedem Push `node --check`** für alle berührten JS-Dateien ausführen.
4. **Nach jeder größeren Änderung** eine kurze Doku im Code (Kommentar) und – bei Architektur-/Produktrelevanz – in dieser CLAUDE.md ergänzen.
5. **CLAUDE.md nach jedem Sprint / jeder wichtigen Architekturänderung aktualisieren** (Decision Log, Roadmap, offene Aufgaben).
6. **`pl_*`-Keys nie umbenennen**, `CACHE`-Version bei SW-Asset-Änderungen erhöhen.

---

## 16. Wissensmanagement

Die CLAUDE.md ist die zentrale, **lebende** Dokumentation. Nach jeder wichtigen Änderung wird sie erweitert/aktualisiert, sodass der aktuelle Wissensstand nie verloren geht. Insbesondere zu pflegen: **Decision Log** (Abschnitt 17), **Roadmap/offene Aufgaben** (18), **bekannte Einschränkungen & Risiken** (19).

---

## 17. Decision Log (aus Git-Historie abgeleitet)

Wichtige Architektur- und Produktentscheidungen (chronologisch, neueste oben). Bei neuen Entscheidungen hier ergänzen.

- **Push-Versand via GitHub Actions + Node `web-push` statt Deno** – Fallback-Lösung, läuft als Cron-Workflow (`5fa4799`, `485e523`). Selbstheiler `plResyncPush` re-synct Abos bei App-Start (`50da843`).
- **Web-Push hinter VAPID-Key gegated** – Opt-in-Client bleibt inert, bis `PL_VAPID_PUBLIC` gesetzt ist (Sprint 2 D, `3fdb3d6`/`4686656`/`11589a3`).
- **Gamification für Bindung** – Tagesziel-Ring, Streak-Verlustaversion, Meilenstein-Feiern (Sprint 2 A–C, `98032ef`).
- **Konto/Sync optional gehalten** – Magic-Link-Konto-Prompt „Fortschritt sichern", geräteübergreifender Zugang über `access`-Tabelle; App funktioniert auch ohne Login (`4ef8c17`).
- **Lead-Funnel** – E-Mail-Erfassung (Gratis-Eselsbrücken) → Supabase `leads` → automatischer PDF-Versand via Resend; Mailversand nicht-fatal (`74dc8ea`, `04a03f5`, `f316aa7`).
- **Stripe-Webhook ohne Re-Fetch bei Subscription-Events** – behebt 404→500→Stripe-Retry-Storm bei Kündigung/Adaptive Pricing; User-Auflösung primär über `stripe_customer_id` in der DB, E-Mail als Fallback (`208de05`, `5a8d916`).
- **Echter Sofort-Trial (7 Tage Vollzugang)** statt 24h-Token, mit Auto-Login und Gratis-Downgrade bei Ablauf (`48cd3ed`).
- **Tarifstruktur auf 4 Laufzeiten** (1/3/6/12 Monate) statt Einzelpreis; 1 Monat = Abo, ab 3 Monate Einmalzahlung; „BELIEBT"-Badge auf 3 Monate (niedrigere Kaufhürde, Azubi-Zielgruppe) (`0dc8df6`, `8f84669`, `db941e2`, `95f00bd`).
- **Conversion-Features:** Prüfungsreife-Score + Schwächenanalyse (`e84aff7`), Examen-Simulation mit Note/Auswertung (`5f76c15`), Leitner Spaced-Repetition für falsch beantwortete Fragen (`a4f1a67`), zweistufiger Rating-Prompt (`fd08c1b`), Social Proof + Testimonial-Pipeline (`f785b07`).
- **Content-Qualitätsoffensive** – mehrere Etappen: abgeschnittene richtige Antworten repariert, „faule Distraktoren" überarbeitet, Dubletten entfernt, fehlende Kategorien in `KATS` ergänzt (`50826fb`…`e502ead`, `b9b6952`, `15b7871`). Fragenzahl konsolidiert auf **627**.

---

## 18. Roadmap & offene Aufgaben

> Hinweis: Die App nutzt eine Sprint-/Issue-Nomenklatur (`Sprint 2 A–D`, Issues `#2`–`#7`) in Commit-Messages. Eine zentrale Backlog-/Issue-Liste ist im Repo nicht hinterlegt.

- **Aktive/Issue-Tracking-Quelle:** `[vom Team zu pflegen]` – falls GitHub Issues genutzt werden, hier verlinken.
- **Nächste Sprints / geplante Features:** `[vom Team zu pflegen]`
- **Bekannte offene Aufgaben aus dem Code (von Claude identifiziert):**
  - Altlasten-Bereinigung (`files 3/`, `files.1/`, `files.2.zip`, `manifest (1).json`, ungenutzte Root-`chat.js`).
  - Platzhalter-Stripe-Links `buy.stripe.com/XXXXX_*` (~Z. 11985 ff.) prüfen/entfernen – die Live-Links stehen in `STRIPE_PLANS`.
  - Konsistente Fragenzahl (627) an allen Meta-/SEO-Stellen sicherstellen (war wiederholt Quelle von Inkonsistenzen).

---

## 19. Bekannte Einschränkungen, Technische Schulden, Risiken & Bugs

**Technische Schulden**
- **Monolithische `index.html`** (~17k Zeilen, HTML+CSS+JS+Daten gemischt) – erschwert Wiederverwendung für weitere PLAN-Digital-Produkte und parallele Entwicklung.
- **Lerninhalt als Inline-Literale** statt strukturierter Datenquelle (JSON/DB) – Content-Pflege ist fehleranfällig (Historie: abgeschnittene Antworten, Dubletten, fehlende Kategorien).
- **Altlasten/Duplikate** im Repo (s. o.).
- **Kein Build-/Test-/Lint-Setup**, keine `package.json` – Qualitätssicherung rein manuell + `node --check`.

**Risiken**
- **Entitlement client-seitig** in `localStorage` → leicht manipulierbar; harte Server-Durchsetzung fehlt (für ein Lern-Produkt bewusst akzeptiert, aber als Risiko dokumentieren).
- **Stripe-Webhook ohne HMAC-Signaturprüfung** (verifiziert per API-Re-Fetch) – funktioniert, weicht aber von der Stripe-Standardempfehlung ab.
- **Service-Role-Key in mehreren Funktionen** – Kompromittierung einer Env würde RLS aushebeln.
- **Push-Reminder installiert `web-push` ad hoc** ohne Lockfile → keine reproduzierbare Version.

**Bekannte Bug-Klassen (historisch wiederkehrend)**
- Quiz-Content: abgeschnittene Antworten, schwache Distraktoren, Kategorie-Lücken in `KATS`/`quiz_kats`.
- Inkonsistente Fragenzahl in Meta/SEO.
- Aktuell offene Bugs: `[vom Team zu pflegen]`

---

## 20. Langfristige Vision – PLAN Digital

PLAN NRW ist das **erste Produkt von PLAN Digital**. Alle Architekturentscheidungen sollen so getroffen werden, dass Bausteine später für **weitere Produkte** (Notfall-App, weitere Pflege-Apps, künftige KI-Lösungen) wiederverwendbar sind. Fokus: **modulare, professionelle, langfristig skalierbare Softwareplattform**.

**Qualitätsanspruch:** Diese Dokumentation ist so zu führen, als würde das Projekt in fünf Jahren an ein professionelles Team aus zehn Entwicklern übergeben – vollständig, verständlich und strukturiert genug, dass ein neues Team Architektur, Entscheidungen, Entwicklungsphilosophie und aktuellen Stand ohne zusätzliche Erklärungen nachvollziehen und das Projekt professionell weiterentwickeln kann.

---

## 21. Empfehlungen für die Zukunft (nach Wirkung priorisiert)

Von Claude bei der Analyse identifizierte Verbesserungsmöglichkeiten an Architektur, Doku und Prozessen. Priorität = erwartete Wirkung auf Qualität/Conversion/Wartbarkeit.

**Hoch**
- **Lerninhalt aus `index.html` herauslösen** in strukturierte Daten (JSON pro Modul, optional Supabase-Tabelle). Beseitigt die häufigste Bug-Klasse, ermöglicht Validierung und Wiederverwendung in Folgeprodukten.
- **Server-seitige Entitlement-Prüfung** härten (z. B. signierte Tokens / serverseitiger Gate-Check), um Manipulation des `localStorage`-Gatings zu reduzieren.
- **Minimale automatisierte Tests** für die kritischsten Pfade (Trial-/Abo-Logik, Cloud-Sync-Merge, Webhook-User-Auflösung) – auch ohne Framework via einfacher Node-Skripte + `node --check` in CI.

**Mittel**
- **Repo aufräumen:** `files 3/`, `files.1/`, `files.2.zip`, `manifest (1).json`, ungenutzte Root-`chat.js` und Platzhalter-Stripe-Links entfernen.
- **`package.json` + Lockfile** für `scripts/` (reproduzierbare `web-push`-Version) und perspektivisch für ein leichtes Build (z. B. Aufteilen von `index.html` in Module mit einfachem Bundling-Schritt).
- **CI-Workflow** mit `node --check` (und später Tests) bei jedem Push, um Syntax-/Regressionen vor Deploy zu fangen.

**Niedrig**
- **CSS/JS aus `index.html` extrahieren** (Caching, Lesbarkeit) – sobald ein Build-Schritt existiert.
- **Stripe-Webhook optional auf HMAC-Signaturprüfung** umstellen (zusätzlich zum API-Re-Fetch), näher am Standard.
- **Modul-Bibliothek für PLAN Digital** definieren (Auth/Sync, Paywall, Push, KI-Proxy als wiederverwendbare Pakete).

---

### Wichtigste Zeilen-Anker in `index.html` (Schnellnavigation)
| Bereich | ~Zeile |
|---|---|
| Supabase-Init (`window.SB`) | 84 |
| `KATS` (Quiz-Kategorien) | 2197 |
| Onboarding-Gate | 2433 |
| `showScreen()` | 2459 |
| `KI_ENDPOINT` | 2994 |
| `FAELLE` (klinische Fälle) | 8161 |
| `themen` / `fragen` (Quiz) | 11303 / 11334 |
| Registrierung / Trial-Start | ~7200 |
| Startup-Revalidierung (Trial/Paid) | ~7460 |
| `kartenHTML` / `karten` | 12808 / 14288 / 14696 |
| `isAdmin()` | 14381 |
| `PL_VAPID_PUBLIC` / Push-Opt-in | 15549 |
| `STRIPE_PLANS` / `kaufPlan()` | 15222 / 15228 |
| Cloud-Sync-IIFE (`window.PLCloud`) | 16021 |
