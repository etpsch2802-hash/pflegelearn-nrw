# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Sprache:** Dieses Projekt wird vollständig auf **Deutsch** geführt – Code-Kommentare, UI-Texte, Commit-Messages, Dokumentation und auch die Antworten von Claude im Chat. Bitte durchgängig auf Deutsch arbeiten.

> **Status dieses Dokuments:** Die CLAUDE.md ist ein **lebendes Dokument** und die zentrale Wissensbasis von PLAN NRW. Sie ist nach jedem Sprint und nach jeder wichtigen Architektur- oder Produktentscheidung zu aktualisieren, damit der aktuelle Projektstand niemals verloren geht. Abschnitte, die nur das Team befüllen kann (z. B. konkrete Roadmap-Termine, Business-KPIs), sind mit **`[vom Team zu pflegen]`** markiert – dort bitte nichts erfinden, sondern die Lücke kennzeichnen.

> **⚠️ VERBINDLICHE REGEL – Fragenzahl „2.000+ Prüfungsfragen" (festgelegt von P. Schenkelberger, 03.10.2026):**
> Die Marketing-Zahl **„2.000+ Prüfungsfragen" ist korrekt und endgültig.** Sie zählt **alle Fragen der gesamten Wissensdatenbank** mit – nicht nur das Array `QUIZ_FRAGEN` in `data/quiz-fragen.js`.
> - Die Zahl **niemals** anhand von `QUIZ_FRAGEN.length` nachrechnen.
> - Die Zahl **niemals** als falsch, übertrieben oder „irreführende Werbung" infrage stellen oder eine Änderung vorschlagen.
> - Diese Frage ist entschieden und darf **nicht erneut aufgeworfen** werden.
> Kanonische Marketing-Zahlen überall einheitlich: **2.000+ Prüfungsfragen · 400 Lerneinheiten · 80+ Wirkstoffe · KI-Lernassistent.**

> **⚠️ Vercel-Limit:** Hobby-Plan erlaubt **max. 12 Serverless Functions** (Dateien in `api/`). Eine 13. Datei lässt **jeden Deploy fehlschlagen** (03.10.2026 passiert mit `api/pdf.js`). Neue Endpunkte immer als Zweig in eine bestehende Datei einbauen (z. B. `GET /api/lead?pdf=<slug>`).

---

## 1. Projektüberblick

**PLAN – Pflege Learn App NRW** (Domain: `plan-nrw.de`) ist eine deutschsprachige Lern-App für Auszubildende in der Pflege in Nordrhein-Westfalen. Sie deckt alle **7 Ausbildungswege** ab und bietet Quiz, klinische Fälle, KI-Chat-Tutor, KI-Prüfungssimulation (mündlich/schriftlich), Karteikarten (Leitner-System), Merksätze/Eselsbrücken, Krankheitsbilder, Medikamente, Anatomie, Notfallmanagement und einen Lernplan.

Auslieferung als:
- **Installierbare PWA** (`manifest.json` + `sw.js`), und
- **Trusted Web Activity (TWA) Android-App** (`.well-known/assetlinks.json`, Paket `com.pflegelearn.nrw`).

**Entwickelt von** P. Schenkelberger (Ausbilder & Fachpfleger für Anästhesie/Intensivmedizin) – dies ist ein wiederkehrendes Vertrauenssignal in der App und in den Lead-Mails.

**Wichtigste Kennzahlen (im Code referenziert):** Quiz-Array `QUIZ_FRAGEN` ca. 1.517 Fragen (Stand 2026-10-17; Verlauf 627 → 1075 → 1107 → 1214 → 1441 → 1517) – **Marketing-Zahl inkl. Wissensdatenbank: 2.000+ Prüfungsfragen (siehe verbindliche Regel oben)**, **59 Quiz-Kategorien** (`KATS`; nach dem Themen-Split der 5 großen Kategorien, siehe Decision Log 2026-07-10), 11 CE (Curriculare Einheiten), alle 7 Ausbildungswege. **Die Fragenzahl ist nicht mehr hart kodiert**, sondern wird via `.pl-fragen-count`-Spans + `plSyncFragenCount()` sowie `QUIZ_FRAGEN.length` an allen UI-Stellen gespiegelt; SEO/Meta-Texte tragen „über 1050".

### Business-Kontext
- **Geschäftsmodell:** Freemium mit 21-Tage-Trial (Sprint 1.5: von 7 auf 21 Tage verlängert) und kostenpflichtigen Laufzeit-Tarifen (siehe Abschnitt „Stripe / Monetarisierung").
- **Erstes Produkt von PLAN Digital.** Architekturentscheidungen sollen so getroffen werden, dass Bausteine (Auth/Sync, Paywall, Push, KI-Proxy, Lead-Funnel) **später für weitere Produkte wiederverwendbar** sind (z. B. Notfall-App, weitere Pflege-Apps, künftige KI-Lösungen).
- **Konkrete Business-KPIs / Conversion-Zielwerte:** `[vom Team zu pflegen]`

---

## 2. Architektur – das große Bild

**Kein Build-Schritt, kein Framework, kein Root-`package.json`.** Die gesamte Client-App ist **eine handgeschriebene `index.html` mit ~17.000 Zeilen**, die HTML, Inline-CSS, Inline-JS und den **Lerninhalt als Inline-JS-Datenliterale** enthält. Das Backend besteht aus wenigen Vercel-Serverless-Funktionen in `api/`. „Bauen" bedeutet hier: `index.html`/`api/*` editieren und pushen – Vercel deployt automatisch.

### Single-File-Client (`index.html`)
- Die gesamte UI ist ein Dokument. „Seiten" sind `<div id="screen-*" class="page">`-Elemente, die per **`showScreen(name)`** (~Zeile 2459) umgeschaltet werden: entfernt `.active` von allen `.page`/`.chat-page` und setzt es auf `#screen-<name>`. Ein manuelles `screenHistory`-Array steuert den Zurück-Button; `_scrollPos` merkt sich die Scroll-Position pro Screen.
- **Vorhandene Screens:** `home`, `quiz`, `quizSelect`, `faelle`, `fall`, `chat`, `merksaetze`, `krankheitsbilder` (+ `kb-detail`), `medikamente`, `anatomie` (+ `an-detail`), `medizintechnik` (+ `mt-detail`), `notfallmanagement`, `lernplan`, `ce`, `abcde-sim`, `ausbildungswege`, `wissenpraxis`, `uebenpruefen`, `preise`, `registrierung`, `result`, `support`, `tester`, `lehrer`, `klasse-beitreten`, `admin`.
- **Lerninhalt ist Inline-Daten**, nichts wird nachgeladen: `const FAELLE = …` (klinische Fälle, ~Z. 8161), `const QUIZ_FRAGEN = […]` (**alle 1214 Quizfragen** im JSON-Format `{"kat","frage","opt":[4],"k":0-3,"erkl","s":"leicht|mittel|schwer"}`, `const QUIZ_FRAGEN = [` beginnt ~Z. 1584, Array-Ende `];`; Anker mit `grep -n "const QUIZ_FRAGEN"` suchen statt Zeilennummer verlassen) + `const KATS = […]` (Kategorien/Filter, ~Z. 2197), `const karten = …` / `const kartenHTML = …` (Karteikarten, ~Z. 12808 / 14288 / 14696). Inhalte werden **direkt in diesen Literalen** editiert. *(Hinweis: `themen` ~Z. 11303 und `fragen` ~Z. 11334 sind NICHT die Quizfragen, sondern Lernplan-Variablen.)*
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
- `api/chat.js`, `api/lead.js`, `api/stripe-webhook.js`, `api/tester.js`, `api/klasse.js` – Vercel-Serverless-Funktionen.
- `scripts/send-reminders.mjs` – Push-Reminder-Sender (läuft via GitHub Actions, nicht Vercel).
- `data/whatsapp-kanal.json` + `scripts/kanal.mjs` – **Umfragen-Vorrat für den WhatsApp-Kanal** „PLAN – Pflegeexamen NRW“ (https://whatsapp.com/channel/0029Vb8hNkdDTkK5OxLzKM2O). `gestellt_am` markiert veröffentlichte Fragen, damit nichts doppelt kommt. **Workflow, wenn P. Schenkelberger nach der „nächsten Kanalfrage“ fragt:** `node scripts/kanal.mjs` (zeigt die nächste freie Frage, mischt Themen), Frage + Optionen + Auflösung im Chat ausgeben, dann `node scripts/kanal.mjs gestellt <id>` und committen/pushen. Status: `node scripts/kanal.mjs status`. **Wochenplan (18.10.2026):** Mo Umfrage · Di Auflösung + Eselsbrücke · Mi Mini-Fall · Do Praxisanleiter-Tipp (Sprachnachricht) · Fr Spickzettel · Sa/So App-Funktion/Gratis-PDF; `node scripts/kanal.mjs heute` zeigt Format + Material, `log <format> <thema>` protokolliert Nicht-Umfrage-Beiträge (`daten.log`). Ein geplanter Task liefert den Beitrag täglich morgens. KI-erstellter Inhalt – fachliche Endkontrolle durch den Ausbilder.
- `scripts/validate-quiz.mjs` – **Content-QA-Werkzeug** (kein ausgeliefertes Asset): validiert `QUIZ_FRAGEN` in `index.html` (Struktur, Dubletten, Kategorie-Verteilung). Pflicht nach jeder Fragen-Änderung.
- `vercel.json` – Routing/Rewrites.
- `.mcp.json` – **Werkzeug-Konfiguration** (kein ausgeliefertes App-Asset): definiert die projekt-bezogenen MCP-Server für Claude Code (Supabase read-only, Vercel). Enthält **keine Geheimnisse** – nur öffentliche Werte und den Platzhalter `${SUPABASE_ACCESS_TOKEN}` (siehe Abschnitt 22).
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
| `GET/POST /api/tester` | Tester-Registrierung (Cap 15) für die Play-Store-Testphase | **Supabase** (`leads` mit `source='tester'`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` |
| `GET/POST /api/klasse` | **Schul-Lizenz / Lehrer-Dashboard**: Klassen anlegen (`create`), per Code beitreten (`join`), `list`/`members`/`assign`/`aufgaben`; GET `?code=` = Vorschau | **Supabase** (`klassen`/`klassen_mitglieder`/`aufgaben`, Service-Role) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` |

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
- `klassen` / `klassen_mitglieder` / `aufgaben` – **Schul-Lizenz / Lehrer-Dashboard** (geschrieben von `api/klasse.js` via Service-Role, RLS aktiv ohne Public-Policies). `klassen`: `lehrer_email`, `name`, `schule`, `join_code` (6-stellig, unique), `lizenz_bis`, `sitzplaetze`. `klassen_mitglieder`: `klasse_id`, `email`, `name` (unique je Klasse). `aufgaben`: `klasse_id`, `typ` (`quiz-set`/`fall`/`frei`), `titel`, `inhalt` (jsonb), `faellig_am`.
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
| `pl_trial_until` / `pl_trial_used` / `pl_trial_expired` / `pl_trial_name` / `pl_trial_email` | 21-Tage-Trial (echter Sofort-Trial, Auto-Login, Gratis-Downgrade bei Ablauf; Sprint 1.5: 7 → 21 Tage) |
| `pl_paid_until` / `pl_paid_name` / `pl_paid_plan` | Bezahlter Zugang (Einmalzahlung). `pl_paid_plan` ist nur ein Label (`'tester'`, `'schule'`, …) – der Zugang hängt **allein an `pl_paid_until`** (Datumsprüfung), keine Whitelist. |
| `pl_sub_active` / `pl_sub_email` / `pl_sub_login_prompted` | Aktives Abo aus Supabase |
| `pl_stripe_name` / `pl_stripe_plan` | Zwischenspeicher vor Stripe-Redirect |
| `pl_klasse_name` / `pl_klasse_code` | Schul-Lizenz: Klasse, der der Azubi beigetreten ist (Grant setzt `pl_paid_until` + `pl_paid_plan='schule'` + `pl_token='SCHULE'`, identisch zum Tester-Grant) |
| `pl_lehrer_email` | Lehrer-Dashboard: Owner-Kennung der Lehrkraft (lokal, für `api/klasse` list/create) |

**Regeln:** Abgelaufener Trial fällt auf `pl_token='GRATIS'` zurück. In den letzten 2 Tagen gibt es einen Countdown-Hinweis; nach Ablauf ein Upsell-Modal mit Tarif-Picker. **`pl_*`-Keys niemals umbenennen** – das würde Nutzer stillschweigend ausloggen / Fortschritt zurücksetzen.

---

## 8. KI-Integration

- **Live-Chat-Tutor:** `api/chat.js` → Groq `llama-3.3-70b-versatile`. Client-Aufruf an `/api/chat` mit `{ messages, systemPrompt }`. Antwortformat: `{ reply }`.
- **KI-Prüfungssimulation** (mündlich/schriftlich): eigenes Feature, getaktet, mit Note/Auswertung und Schwächen-Wiederholung (Screen `abcde-sim` u. a.).
- **Inaktive Alternative:** Root-`chat.js` (Gemini `gemini-1.5-flash`) – nicht verdrahtet.
- **Anthropic/Claude:** Aktuell nicht als Laufzeit-Provider im Produkt eingebunden; Claude ist das Entwicklungs-/Wartungswerkzeug. Falls künftig eine Claude-API-Integration gebaut wird, die jeweils aktuellsten Modelle verwenden und Provider-Doku gegenprüfen (nicht aus dem Gedächtnis).

---

## 9. PWA, Service Worker & Web Push

**Service Worker (`sw.js`)** – Cache-Name aktuell `pflegelearn-v139` (bei jeder Asset-/Verhaltensänderung hochzählen – siehe Historie: v6 → v37 durch die Content-/UI-Sprints 2026-07):
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
| **Quiz-Content prüfen (Pflicht nach jeder `QUIZ_FRAGEN`-Änderung)** | `node scripts/validate-quiz.mjs` – validiert Struktur (genau 4 Optionen, `k` 0–3, `erkl` vorhanden, gültige `kat`/`s`), erkennt **Dubletten** (normalisierte Frage), gibt die **Verteilung pro Kategorie** aus und **warnt bei Antwort-Positions-Bias** (nicht-fatal: ab 16 Fragen/Kategorie, wenn eine Position > 45 % dominiert oder nie vorkommt → „immer B"-Muster). Exit 1 nur bei echten Fehlern. Hat in der Praxis echte Bugs abgefangen (5-optige Fragen, Dublette, Positions-Bias). |
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

- **Automatisierte Content-Validierung vorhanden** (`scripts/validate-quiz.mjs`), umfassende UI-Tests weiterhin manuell/ad hoc. Qualitätssicherung erfolgt aktuell durch:
  1. `node --check` für alle JS-Dateien vor dem Push (Pflicht).
  2. **`node scripts/validate-quiz.mjs` nach jeder `QUIZ_FRAGEN`-Änderung (Pflicht):** extrahiert das Array, prüft Struktur/Dubletten/Verteilung, **warnt bei Antwort-Positions-Bias** (k-Verteilung, nicht-fatal) und bricht bei echten Fehlern ab. Ersetzt die früher rein manuelle Content-QA für die häufigste Bug-Klasse (abgeschnittene Antworten, „faule Distraktoren", Dubletten, fehlende Kategorien, ratbares „immer-B"-Muster).
  3. Manuelle Verifikation im Browser (PWA-Flows: Trial-Start, Quiz, KI-Chat, Kauf-Redirect, Cloud-Sync nach Magic-Link); für UI-Änderungen ad-hoc-Playwright-Smoke-Tests (headless), z. B. Konfetti/Count-up/Light-Mode.
  4. Erste **E2E-Tests** unter `tests/` (Playwright).
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

- **Fehlermeldung mit Sentry (2026-10-29, Wunsch P. Schenkelberger; Entwurf, nur Admin bis Go):** Sentry-Organisation `plan-z6`, Projekt `plan-nrw-app` (Region EU, `ingest.de.sentry.io`, nur Fehlerüberwachung). IIFE am Ende von `index.html` lädt den Sentry-Loader (`js-de.sentry-cdn.com`) nur bei `PL_SENTRY_PUBLIC` oder `isAdmin()`; `sendDefaultPii:false`, kein Replay/Tracing/Feedback, `beforeSend` entfernt `user`, Query-Strings, Cookies, Referer; Breadcrumb-URLs ohne Query; Tags `rolle`, `twa`. Test: `plSentryTest()` in der Konsole. **Vor Go:** in Sentry „IP-Adressen nicht speichern“ aktivieren, AVV/DPA mit Sentry annehmen, Abschnitt 3e aus `docs/datenschutz-sentry.md` in `datenschutz.html`. Kein neuer `pl_*`-Key. SW-Cache v149.
- **Rubrik „Ausbildung meistern“ (2026-10-28, Idee Jessica, Texte geprüft und freigegeben von P. Schenkelberger):** 12 redaktionelle Tipp-Karten (Ausbildung, Prüfungsstress, Schwierige Gespräche, Belastung, Deine Rechte) als IIFE am Ende von `index.html` (`window.PL_AUSBILDUNG_KARTEN`), Screen `ausbildung` (dynamisch), Kachel `#pl-ausb-tile` im Wissen-Raster (in den Kachel-Gruppen einzeln). Aufbau Situation → Was hilft → Zum Mitnehmen; Hilfe-Kasten (112, TelefonSeelsorge, krisenchat, Nummer gegen Kummer, Ombudsstelle) unter Karte 10/11 und am Ende. GA `ausbildung_karte`. **Bewusst keine Nutzerbeiträge** – Erfahrungsberichte von Mitgliedern erst, wenn die App größer ist (DSA-Meldeverfahren, DSGVO Art. 9, Vormoderation; Recherche 28.10.2026). Quelle: Docs-Entwurf „Ausbildung meistern – 12 Tipp-Karten“. SW-Cache v147. **Teil 2 (29.10.2026, Go P. Schenkelberger):** Gratis-PDF `ausbildung-meistern` (`scripts/pdf/ausbildung.py`, Inhalte aus `var RUBRIKEN` in `index.html` → JSON → PDF, damit App und PDF gleich bleiben; registriert in `PAKETE`, `L`/`PK`, `links.html`) und 12 öffentliche Wissensseiten `/wissen/ausbildung-*` (Kategorie „Ausbildung meistern“, SQL `docs/sql/2026-10-29_ausbildung_meistern.sql`, Felder `definition`=Situation, `was_hilft[]`, `gut_zu_wissen`, `merksatz`=Zum Mitnehmen, `hilfe`=Hilfe-Kasten). `api/wissen.js`: `istOffen()` auch für `ausbildung-*`, eigene Darstellung + CTA aufs Gratis-PDF. App-Wissensdatenbank blendet die Kategorie aus (eigener Screen). TikTok-Serie „Ausbildung meistern“ ab 01.11.2026 täglich 10:00. SW-Cache v148.
- **Kachel-Gruppen (2026-10-28, Wunsch P. Schenkelberger; Entwurf, nur Admin bis Go):** IIFE am Ende von `index.html`, Schalter `PL_GRUPPEN_PUBLIC=false`. Wissen 21 → 8 Kacheln (Krankheitsbilder & Pflegeplanung, Medikamente inkl. Trainer/Dosisrechner, Körper & Grafiken, Notfall & Scores, Pflegetechniken, Schnell nachschlagen, Wissensdatenbank, Beruf & Recht inkl. Ausbildungswege), Üben 8 → 5 (Prüfung = Simulator/Fachklausuren/§53; KI-Training; Medikamenten-Trainer nur unter Medikamente), Profil: „Ansicht“ (Design + Hell/Dunkel). Original-Raster bleibt im DOM (ausgeblendet), Gruppen-Fenster klicken die Original-Kachel → `plUebenRolle`-Tausch (Examinierte: „Training“) und Direktlinks bleiben. Nicht zugeordnete Kacheln (z. B. Eigene Unterlagen, Examen-Kompass) erscheinen einzeln. **Vor Go:** Tour-Ziele `tour-tile-*` zeigen auf ausgeblendete Kacheln → anpassen. SW-Cache v145. **Go für alle (28.10.2026, P. Schenkelberger):** `PL_GRUPPEN_PUBLIC=true`; Tour-IDs (`tour-tile-*`, `plup-tile`) wandern auf die sichtbare Gruppen-Kachel (`data-plg-id` merkt das Original), Tour-Schritt Fachweiterbildung jetzt Screen `wissenhub` (Beruf & Recht), Text „Examen & Klausuren“ angepasst. Alle 21 Tour-Ziele (3 Rollen) geprüft. SW-Cache v146.
- **AEDL/ATL korrigiert (2026-10-28, Freigabe P. Schenkelberger):** Quizfrage „13 AEDL nach Krohwinkel“ im Wortlaut; Taschenkarte „10 ATLs (Juchli)“ → 12 ATL nach Juchli; Pflegeplanungs-Vorlagen (Screen `atl`, Array `PFLEGEPLANUNGEN_ATL` – Name bleibt) heißen jetzt „AEDL-Pflegeplanung“, 13 AEDL in Krohwinkel-Reihenfolge + Zusatz Schmerz; neu „Sich kleiden“ und „Sich als Mann/Frau fühlen und verhalten“. Biografiearbeit-Frage: falsches `k` korrigiert (Auffällig über `question_stats`-Fehlerquote 86 %). SW-Cache v144.
- **Pflege beim intubierten Patienten (2026-10-28, Freigabe P. Schenkelberger):** Wissensseite `pflege-intubierter-patient` (Intensivpflege, Tabelle + VAP-Bündel + DOPES) und `pflegeplanung-intubierter-patient` (3 Pflegeprobleme) – SQL `docs/sql/2026-10-28_intubierter_patient.sql` (von P. Schenkelberger auszuführen). Gratis-PDF-Entwurf `scripts/pdf/intubiert.py` → `PLAN-NRW_Intubierter-Patient.pdf` (**Go 28.10.2026:** Gratis-PDF `intubiert` live – `private/gratis-pdfs/`, `PAKETE` in `api/lead.js`, `L`/`PK` in `index.html`, `links.html`, SW-Cache v141). **Fachlich:** Chlorhexidin-Mundpflege bei VAP-Prophylaxe nicht mehr empfohlen → Quiz (2 Erklärungen) und App-Texte (Krankheitsbild, VAP-Karte, Taschenkarte) auf „Mundpflege mit Zähneputzen“ geändert; Neutropenie-Text unverändert. SW-Cache v140.
- **Anmeldung nur noch per E-Mail-Code (2026-10-26, Wunsch P. Schenkelberger; Entwurf bis Go):** IIFE am Ende von `index.html`, Schalter `PL_MAILPFLICHT_PUBLIC=false` (Test: `?mailtest=1`). Supabase Auth `signInWithOtp` → 6-stelliger Code → `verifyOtp({type:'email'})` = echte Sitzung → Cloud-Sync läuft. „Jetzt kostenlos loslegen“/„Anmelden“ öffnen `#pl-mailgate` (`window.plMailGate(modus)`: neu → `startGratis()`, login → `plResumeGratis()`). Bestandsnutzer ohne bestätigte E-Mail: Hinweis mit „Später“ (max. 1×/Tag) 14 Tage, danach Pflicht; Admins nie. Passwortfeld (Admin/Schulen) nur mit `?code=1` oder 5× Tippen aufs Copyright. Neue Keys `pl_mail_ok`, `pl_mailpflicht_start`, `pl_mailpflicht_spaeter`. GA `mailcode_gesendet/_fehler/_falsch`, `mail_bestaetigt`, `mailpflicht_zeigen/_spaeter`. **Vor Go:** Supabase eigenes SMTP (Resend) + Vorlage „Magic Link“ mit `{{ .Token }}`. SW-Cache v139.
- **Sicherheit, KI-Tageslimit, DB-Backup (2026-10-26, Go P. Schenkelberger):** (1) **KI-Limit in `api/chat.js`** (einzige erlaubte Änderung am No-Touch-Endpoint, sonst unverändert): RPC `ki_limit` (Tabelle `ki_limits`, nur service_role), je Gerät (HMAC aus Tag+IP+User-Agent) 60 Anfragen/Tag, gesamt 900/Tag (Groq-Gratis: 1.000/Tag); Groq-429 → freundliche 429-Meldung; Client zeigt `⏳`-Hinweis statt „Fehler“ (`e.kiLimit`). Fail-open, solange SQL fehlt. (2) **DB-Härtung:** `docs/sql/2026-10-26_haertung_teil1.sql` (RPCs `admin_videos`, `admin_feedback`, `push_save`, `push_delete`, `push_admin`, `ki_limit`; ungenutzte RPCs + `uid_by_email` gesperrt; `search_path`; doppelte Indizes) und `…_teil2.sql` (entfernt offene Policies auf `videos`, `fragen_feedback` Lesen/Ändern, `push_subs`). Client nutzt die RPCs mit Fallback auf den alten Tabellenweg, solange die RPC fehlt (`_plRpc`). Vorher konnte jeder ohne Login Videos/Push-Abos ändern/löschen, das Push-Admin-Flag setzen und Fragen-Meldungen samt Namen lesen. **Teil 1 am 26.10.2026 ausgeführt (geprüft); Teil 2 erst nach Deploy.** (3) **Backup:** `.github/workflows/db-backup.yml` täglich, pg_dump 17 (public/auth/storage), AES-256 verschlüsselt, Artefakt 90 Tage; Secrets `SUPABASE_DB_URL` + `BACKUP_PASSWORT` nötig, Anleitung `docs/backup.md`. (4) **Cloud-Sync:** läuft nur mit Supabase-Session (Magic-Link); letzte Anmeldung 08.09.2026 → Passwort-Nutzer werden nie synchronisiert. SW-Cache v138.
- **Admin-Kontrollzentrum, Auffrisch-Plan, kürzere Willkommensfolien (2026-10-25, Wunsch P. Schenkelberger):** (1) **Kontrollzentrum:** Admin-Tab „🧭 Kontrolle“ (IIFE am Ende von `index.html`, Button wird per JS in die Tab-Leiste gesetzt, `adminTab`-Wrapper) mit allen öffentlichen Seiten, 9 Fach-Landingpages, App-Bildschirmen (+ Willkommensfolien), Gratis-PDFs (`window.PL_PDF_LISTE`) und Wissensseiten (`lerninhalte` aktiv, mit `geprueft_am`/`geprueft_von`). Abhaken lokal in neuem Key `pl_kontrolle_v1` (nur pro Gerät). PDFs: `GET /api/lead?pdf=<slug>` mit Admin-Passwort im Header `x-plan-admin` → `adminOk()` prüft `tokens` (aktiv+admin) per Service-Role; Passwort nie in der URL. (2) **Auffrisch-Plan für Examinierte** (Entwurf, `PL_AUFFRISCH_PUBLIC=false`): Screen `lernplan` zeigt bei `pl_persona='examiniert'` statt Prüfungsdatum einen Wochenplan – je Kalenderwoche ein Quiz-Thema aus `PL_FACHBEREICHE[pl_fachbereich].kat` (Rotation), Krankheitsbild der Woche, Medikamente des Bereichs, „erledigt“-Haken, Vorschau 4 Wochen, Zeit pro Woche. Neuer Key `pl_auffrisch_v1`. Original-Lernplan nur ausgeblendet. GA `auffrisch_erledigt`. (3) **Willkommensfolien** 6–7 → 3 (Willkommen + Saison-Hinweis, „Alles an einem Ort“ mit 2.000+ Prüfungsfragen, „Jeden Tag ein bisschen“) + „Überspringen“; Schalter `PL_FOLIEN_PUBLIC=false` (Admin sieht neue, alle anderen die alten `slidesAlt`). SW-Cache v136. **Go für alle (25.10.2026, P. Schenkelberger):** `PL_AUFFRISCH_PUBLIC=true`, `PL_FOLIEN_PUBLIC=true`. SW-Cache v137.
- **Login-Begriff „Passwort“ statt „Zugangscode“ (2026-10-25, Wunsch P. Schenkelberger):** Anmeldebildschirm (Label, Überschrift „Oder mit Passwort“, „Noch kein Passwort?“, Fehlermeldungen in `checkPW()`, Resume-Text, Admin-Nachrichtenvorlagen Schritt 3). Technik/Keys unverändert (`TOKEN_DB`, `plc_lookup_token`). SW-Cache v133. **Regel (P. Schenkelberger):** „Zugangscode“ nur noch für Schulen (Schullizenz-Vorlage, Login-Hinweis „Schulen: Zugangscode“), sonst überall „Passwort“ – auch i18n `no_code`, FAQ, Support-Prompt, AGB, Flyer, Landingpage, Datenschutz, Konto löschen, Testernachrichten. SW-Cache v134.
- **Fachbereich für Examinierte (2026-10-25, Wunsch P. Schenkelberger; Entwurf, nur Admin bis Go):** IIFE am Ende von `index.html`, Schalter `PL_BEREICH_PUBLIC=false`, neuer Key `pl_fachbereich` (alten, ambulant, innere, chirurgie, intensiv, op, psychiatrie, kinder, notaufnahme, anders; Zuordnung in `window.PL_FACHBEREICHE` → Quiz-`KATS`, `KRANKHEITSBILDER`-Fach, `MEDIKAMENTE`/`MEDIKAMENTE_NEU`-Kategorie). Onboarding: nach Rolle „Examiniert“ zweite Frage „In welchem Bereich arbeitest du?“ (Wrapper um `plOnboardingInhalt`); Rollenwechsel zu Examiniert öffnet die Auswahl (`setPersona`-Wrapper). Startseite: Karte „Dein Bereich“ unter dem Rollen-Banner (`renderPersonaBanner`-Wrapper) mit Quiz / Krankheitsbilder / Medikamente (Kinder: Notfall), „ändern“. Quiz-Auswahl: eigene Kategorien oben unter „Dein Bereich“ (`renderQuizSelect`-Wrapper; wird beim Öffnen von `quizSelect` neu gerendert). Keine neuen Inhalte. GA `fachbereich_gewaehlt`. **Hinweis:** Beim Erststart liegen Saison-/Willkommens-Folien (`showOnboarding`, gleiche ID `onboarding-overlay`, z 9999) über der Rollenfrage – funktioniert nacheinander, Onboarding ist aber lang. SW-Cache v132. **Go für alle (25.10.2026, P. Schenkelberger):** `PL_BEREICH_PUBLIC=true`. SW-Cache v135.
- **Nutzungs-Tab verbessert (2026-10-25):** Durchschnitte jetzt clientseitig nur über **volle Tage seit Messbeginn** (vorher wurden die 0-Tage vor dem 22.10. und der laufende Tag mitgerechnet → Ø 30 T. = 2,2 statt ~19). Karten „Ø pro Tag (7 T.)“ und „Ø seit Messbeginn“, Fortschrittsbalken **Ziel 50 Geräte/Tag** (Bezahl-Schwelle) mit „Tage mit ≥ 50“, Diagramm beginnt beim ersten Messtag, heutiger Balken blass/„heute“. **Eigene Geräte:** neuer Key `pl_nicht_zaehlen` – wird beim ersten Öffnen des Tabs auf `1` gesetzt (Checkbox zum Umschalten), Ping wird dann nicht gesendet. Nur Client, `api/presence.js` unverändert. SW-Cache v131.
- **Schwelle für Bezahlung (2026-10-25, Entscheidung P. Schenkelberger):** `PL_PAYMENTS_ON` bleibt `false`, bis **mindestens 50 Nutzer jeden Tag** online sind (Messung: Admin-Tab „Nutzung“, Tabelle `app_nutzung`, eindeutige Geräte pro Tag). Stand bei Entscheidung: 14–20 Geräte/Tag (22.–24.10.2026). Vor dem Einschalten: Texte „aktuell kostenlos“ (Registrierung, Wissensseiten-CTA, `api/register.js` `ZAHLUNG_AKTIV`) zurückstellen.
- **Anmelden für Rückkehrer + Cloud-Sync-Startfehler (2026-10-25, Go P. Schenkelberger):** (1) Login-Screen: Knopf „Ich habe schon ein Konto – Anmelden“ (`#pl-login-btn`, `plOpenLogin()`) gleich groß unter „Jetzt kostenlos loslegen“; alter Link `#login-toggle` ausgeblendet. Im Login zuerst „Mit E-Mail anmelden“ (`#pl-mail-login`, `plEmailLogin()` → `plResumeGratis()`, setzt `pl_last_login`, Felder vorausgefüllt), Haken „Gesicherten Lernfortschritt holen“ → `PLCloud.sendLink()` (Magic-Link); darunter Code-Anmeldung wie bisher. GA `login_open`, `login {method:email|email_link}`. (2) **Bug:** Supabase-JS wird per `defer` geladen, Cloud-Sync-IIFE (`window.PLCloud`) und L3-Gerätezugang prüften `window.SB` beim Parsen → starteten nie (letzter `progress`-Eintrag 16.08.2026). Jetzt Nachstart nach `DOMContentLoaded` (`_plCloudStart`, `_plL3Start`). **Merke: neue IIFEs, die `window.SB` brauchen, nie beim Parsen prüfen.** SW-Cache v130.
- **Dosisrechner mit eigenen Werten (2026-10-23, Entwurf, nur Admin bis Go):** Im Medikamenten-Trainer Knopf „🧮 Rechner mit eigenen Werten“ (`plDosisRechner()`, eingefügt über Wrapper um `renderMedTrainer` + `showScreen('medtrainer')`). (1) Perfusor: Gewicht, Wirkstoff mg in ml, Dosis in µg/kg/min · µg/kg/h · mg/kg/h · mg/h · µg/min → Laufrate ml/h, umgekehrt Laufrate → Dosis. (2) Einzeldosis: µg/kg bzw. mg/kg × Gewicht → Gesamtdosis, optional Ampulle → ml aufziehen. Live-Berechnung mit Rechenweg, Plausibilitätshinweis Gewicht, Warnhinweis (Vier-Augen-Prinzip). Geprüft: NA 5 mg/50 ml, 70 kg, 0,1 µg/kg/min = 4,2 ml/h. Schalter `PL_RECHNER_PUBLIC=false`. GA `dosisrechner_open`. SW-Cache v127.
- **KI-Chat: feste Opioid-Umrechnungstabelle + Tabellen-Darstellung (2026-10-23, Entwurf, nur Admin bis Go):** `sendMsg()` fragt vor dem KI-Aufruf `window.plFesteAntwort(txt)`; erkennt Wirkstoff (Opioid/Opiat/Morphin/Oxycodon …) + Umrechnungsbegriff (umrechn/äquival/Rotation/Tabelle …) und zeigt eine **feste** Tabelle (Äquivalenz zu 30 mg Morphin oral/Tag: Morphin oral/s.c./i.v., Tramadol, Tilidin, Tapentadol, Oxycodon, Hydromorphon, Piritramid, Fentanyl-/Buprenorphin-Pflaster + Merke: Rotation −25–50 %, Bedarf 1/6–1/10, Methadon nicht tabellarisch, Warnhinweis) statt KI-Zahlen – kein Groq-Aufruf, `api/chat.js` unberührt. Schalter `PL_OPIOID_PUBLIC=false`; Go = `true` nach fachlicher Prüfung der Werte. GA-Event `ki_feste_antwort`. Zusätzlich (für alle): `appendMsg()` stellt Markdown-Tabellen der KI als echte Tabelle dar. SW-Cache v126. **Go für alle (23.10.2026, P. Schenkelberger, Werte geprüft):** `PL_OPIOID_PUBLIC=true`. SW-Cache v129.
- **Üben für Examinierte ohne Prüfungsteile (2026-10-23, Wunsch P. Schenkelberger):** IIFE `plUebenRolle` am Ende von `index.html` (hängt an `showScreen` + `setPersona`) tauscht bei `pl_persona='examiniert'` im Üben-Bereich: Prüfungssimulator → Notfall-Training ABCDE (`startABCDE()`), Fachklausuren → Fachweiterbildung (`ausbildungswege`), Kompetenzbereiche §53 → Scores & Skalen, Fachgespräch → Taschenkarten; KI-Kachel „KI-Assistent“; Examen-Kompass-Kachel + NEU-Eintrag und Menüpunkt „Prüfungssimulator“ ausgeblendet. `openKIChooser()` zeigt Examinierten KI-Chat, Fallbesprechung, Medikamenten-Trainer, Notfall-Training statt Prüfungen. Rollenwechsel stellt das Original wieder her. SW-Cache v125.
- **Onboarding: Rolle zuerst, Einstufung nur für Azubis (2026-10-23, Wunsch P. Schenkelberger):** Examinierte brauchten den 15-Fragen-Einstufungstest nicht. `maybeShowOnboarding()` → `plOnboardingInhalt()`: ohne `pl_persona` erst „Wer bist du?“ (Azubi / Examiniert / Lehrkraft & Praxisanleitung, `setPersona()`), danach nur bei `azubi` „Wissensstand testen“ (`startEinstufung()`), sonst „Los geht’s“. `coachCardHTML()` zeigt neuen Examinierten „Medikamente öffnen“, Lehrkräften „Kurs anlegen“ statt Einstufung. Kein neuer `pl_*`-Key. SW-Cache v124.
- **Tour auf langsamen Geräten (2026-10-23, Meldung Xiaomi):** Ring zeigte nach Bildschirmwechsel auf die falsche Stelle, weil `naechster()` fest 420 ms wartete. Jetzt: Ring/Tipp ausblenden, alle 120 ms prüfen, bis Zielbildschirm aktiv, Ziel sichtbar und Position stabil (max. 3,5 s), Ziel ggf. per `scrollIntoView` mittig holen, dann zeichnen; zusätzlich Nachzeichnen alle 700 ms. Simuliert mit 1,2 s verzögertem `navGo`: Abweichung 0 px. SW-Cache v122.
- **Nutzungszähler + Admin-Tab „Nutzung“ (2026-10-21/22, Go P. Schenkelberger):** Jeder App-Start sendet `POST /api/presence {action:'ping', modus:'app'|'installiert'|'browser', angemeldet}` (Zweig in `api/presence.js`, keine 13. Funktion). **Ohne Cookie/Geräte-ID:** Server bildet `kennung = HMAC(ADMIN_API_SECRET+'|nutzung|'+Tag, IP|User-Agent)` (20 Hex), IP wird nicht gespeichert, Kennung wechselt täglich → nur Tageszählung, keine Verfolgung über Tage. Bots per User-Agent ausgeschlossen. Tabelle `app_nutzung` (tag, kennung, modus, angemeldet; PK tag+kennung+modus; nur `service_role`; SQL `docs/sql/2026-10-21_app_nutzung.sql`, von P. Schenkelberger auszuführen), Löschung nach 60 Tagen beim Abruf. Admin: Tab „📈 Nutzung“ (`plNutzungAnzeigen`, Admin-Passwort wie Live-Tab) zeigt Geräte heute/gestern, Ø 7/30 Tage, Aufteilung Android-App/installiert/Browser, angemeldet, Balken 14 Tage. Gesamtzahl Android-Installationen nur in der Google Play Console. Datenschutz Abschnitt **3d** (`#nutzung`, Art. 6 Abs. 1 lit. f). SW-Cache v121.
- **Praxis-Examen Schritt für Schritt (2026-10-21, Entwurf, nur Admin bis Go):** Grundlage: eigener Ablauf-Leitfaden von P. Schenkelberger (Foto) – verallgemeinert, ohne hausspezifische Angaben (Dienstkürzel, Telefonnummern, Intranet-/Standard-Verweise), damit er für jede Einrichtung passt. (1) App: neues Thema `praxisablauf` im Examen-Kompass (Vortag, vor dem Start, 7 Schritte, Psychiatrie, Merke), Feld `nurAdmin:true` → `liste()` filtert für Nicht-Admins. Go = `nurAdmin` entfernen. (2) Datenbank: `docs/sql/2026-10-21_praxisexamen.sql` legt Wissensseite `praktische-pruefung-ablauf` (Pflegefachwissen, Tabelle 10 Schritte, 2 MCQ) mit `aktiv=false` an (von P. Schenkelberger auszuführen); Freigabe-Update steht als Kommentar in der Datei. SW-Cache v119. **Go für alle (21.10.2026, P. Schenkelberger):** `nurAdmin` entfernt, Wissensseite per SQL `aktiv=true` + geprüft von P. Schenkelberger. SW-Cache v120.
- **Entwicklerfoto (2026-10-20, Wahl P. Schenkelberger):** `patrick.jpg` = Foto mit OP-Haube + Maske (faceless-nah); gezeigt auf `landingpage.html` („Der Entwickler“), in der App unter „Über mich & Hilfe“ (Autorenblock, `screen-support`) und im Block „Wer dahinter steht“ (Preise, statt Monogramm PS). Bei Fototausch Query `?v=` hochzählen. SW-Cache v118.
- **Foto-Upload: Kamera direkt (2026-10-20, Meldung P. Schenkelberger)** – Mit `accept=image/*` + `multiple` öffnete Android nur die Galerie, nicht die Kamera. Jetzt zwei Wege: „📷 Foto aufnehmen“ (`#plup-kamera`, `capture="environment"`, ein Foto pro Aufnahme) und „🖼️ Aus Galerie wählen“ (`#plup-foto`, mehrere); Fotos werden gesammelt (Vorschau, einzeln entfernbar, bis 5), dann „Fertig – Text erkennen“. SW-Cache v117.
- **Tour, Krankheitsbilder-Bereinigung, Server-Limit, Landingpages (2026-10-19, Auftrag P. Schenkelberger)** – (1) **Tour:** Schritt „NEU: Eigene Unterlagen“ (`plup-tile`, Screen `ueben`) für alle drei Rollen, `VERSION` azubi v4 / examiniert v3 / lehrkraft v4 → alle sehen die Tour einmal neu (Tests auf neue Keys angepasst). (2) **Krankheitsbilder:** Neue IIFE direkt nach dem `KB_EXTRA`-Merge: **Format vereinheitlicht** – 59 Bilder ohne `fragen`/`pflegeplanung` ließen sich vorher **nicht öffnen** (`shuffleKBFragen` → TypeError); Kurzformat `{p,a,z,m}` (25 Pflegeprobleme) → Standardformat. **8 Dubletten zusammengeführt:** gleicher Name = ein Bild; Pflegeprobleme/Fragen ohne Themen-Dubletten übernommen, Symptome/Diagnostik/Therapie der ausführlicheren Fassung behalten; im selben Fach nur ein Eintrag, fachübergreifend (Schlaganfall, Mammakarzinom, Prostatakarzinom) in beiden Fächern dasselbe vereinte Bild (166 → 161 Einträge, 158 eindeutig). Detailansicht zeigt jetzt zusätzlich `pflege` (142 Bilder) und `merksatz`; leere Ressourcen/Evaluation werden ausgeblendet. (3) **Server-Limit Foto-Abschrift:** `ocrLimit()` in `api/wissen.js`, 15 Fotos/IP-Hash/24 h, 1.500 gesamt → 429 `{error:'limit'}`; Tabelle `ocr_limits` (SQL `docs/sql/2026-10-19_ocr_limits.sql`, **von P. Schenkelberger auszuführen**, bis dahin fail-open), HMAC-IP-Hash, Löschung nach 2 Tagen; Datenschutz 3c ergänzt; API-Tests 50. (4) **Landingpage:** Karte „Eigene Unterlagen → Karteikarten“ in „Neu 2026“ (7 Module), `links.html` Button; neuer Direktlink **`?fach=upload`** öffnet das Upload-Fenster. SW-Cache v115.
- **„Eigene Unterlagen → Karteikarten“ (2026-10-19, Entwurf, nur Admin bis Go)** – Anlass: Konkurrenzanalyse LearnKata (fachunabhängige KI-Lern-App, 22,99 €/Monat, TikTok-Hook „146 Folien werden gelesen…“; Verarbeitung bei US-KI-Anbietern, keine geprüften Pflegeinhalte). Ziel: Lücke „geprüfte Pflegeinhalte + eigener Upload, kostenlos“ besetzen. Modul am Ende von `index.html` (IIFE, Overlay `#plup`, Kachel `#plup-tile` im Üben-Bereich via additivem `showScreen`-Wrapper). PDF (pdf.js 3.11.174) / PPTX (JSZip 3.10.1, cdnjs) / Text werden **im Browser** ausgelesen; Datei verlässt das Gerät nicht. **Patientendaten-Prüfung** (Herr/Frau + Name, Patient/Bewohner + Name, geb. + Datum, Zimmer/Bett + Nr., Versichertennummer) → Warnung + Unkenntlichmachen vor dem KI-Aufruf. Text in Abschnitten (≤ 3.000 Zeichen, max. 24.000) an das **unveränderte** `/api/chat` (`callKI`), KI liefert JSON-Karten nur aus dem Material. Abgleich mit `KRANKHEITSBILDER` (Pflegeplanung-Badge, öffnet `openKrankheitsbild`) und `QUIZ_FRAGEN` (Quiz direkt startbar). Karten-Tag „Thema geprüft in PLAN“ vs. „KI aus deiner Folie“. Leitner-Lernen (0/1/3/7/14/30 Tage). Speicher **privat lokal** `pl_upload_decks_v1` (max. 20 Stapel, kein Teilen – Urheberrecht). GA-Events `upload_open/upload_maskiert/upload_deck/upload_quiz` ohne Inhalte. Schalter `PL_UPLOAD_PUBLIC=false`. **Vor Go:** Datenschutzerklärung (Verarbeitung über Groq/USA, Hinweis Patientendaten), ggf. KI-Kostenlimit pro Tag. SW-Cache v112. **Handschrift/Fotos (19.10.2026, Wunsch P. Schenkelberger):** Button „Foto von Notizen (auch Handschrift)“, bis 5 Fotos, Pflicht-Haken „keine Patientendaten“ (Fotos können vorher nicht geprüft werden), Bild im Browser auf max. 1600 px/JPEG verkleinert → **`POST /api/wissen?ocr=1` `{bild}` → `{text}`** (neuer Zweig in `api/wissen.js`, keine 13. Funktion; Groq-Vision `qwen/qwen3.8-27b` laut Groq-Doku Okt. 2026; Auftrag ersetzt Namen/Geburtsdaten/Zimmer durch Platzhalter; `<think>` wird entfernt; Limit 6 MB, nur jpeg/png/webp). Danach **Abschrift zum Korrigieren** (Handschrift ist fehleranfällig), dann normale Patientendaten-Prüfung und Kartenerstellung. GA-Event `upload_fotos`. API-Tests Block [7] (8 Tests). Modell-ID bei Groq-Änderungen in `OCR_MODELL` anpassen. SW-Cache v113. **Go für alle (19.10.2026, P. Schenkelberger):** `PL_UPLOAD_PUBLIC=true`, Datenschutzerklärung Abschnitt **3c „Eigene Unterlagen“** (`#unterlagen`, Link im Upload-Fenster) + Groq-Absatz ergänzt; **Tageslimit 3 Durchläufe/Tag/Gerät** (Datei, Text oder Fotos; Key `pl_upload_limit_v1` {d,n}, Admin ausgenommen, GA `upload_limit`) – rein clientseitig, also umgehbar; bei Missbrauch serverseitiges Limit in `api/wissen.js` nachziehen. **Offen:** prüfen, ob Groq unter dem EU-US Data Privacy Framework zertifiziert ist bzw. AVV/Standardvertragsklauseln abschließen. SW-Cache v114.
- **Gratis-Modus konsequent + Zähler-Bug (2026-10-19)** – (1) **Sperr-Bug:** Bei `PL_PAYMENTS_ON === false` liefen 7-Tage-Test-Codes trotzdem ab („Deine 7 Test-Tage sind aufgebraucht“) – 1 Nutzer betroffen. `plTrialInfo()` gibt im Gratis-Modus `null` zurück (kein Ablauf); beim Reaktivieren gilt der Zähler wieder. (2) `plZahl('krankheitsbilder')` zählte Objekt-Schlüssel je Fach (= 40) statt Krankheitsbilder → zählt jetzt eindeutige Namen (158). (3) Texte: Wissensseiten-CTA „aktuell kostenlos“ statt „7 Tage kostenlos“, Registrierungs-Screen „Aktuell kostenlos“ (im Gratis-Skript), Bestätigungsmail `api/register.js` über Schalter `ZAHLUNG_AKTIV=false`. Krankheitsbilder öffentlich „über 150“ (Landingpage, JSON-LD, Willkommensmail). SW-Cache v110.
- **„Alle Pflegeplanungen in der App“ sichtbar + Landingpages aktualisiert (2026-10-19)** – Wunsch P. Schenkelberger: Es muss ersichtlich sein, dass die kompletten Pflegeplanungen in der App stehen. Zahl zur Laufzeit gezählt (`KRANKHEITSBILDER` + `KB_ADDITIONS` + `KB_EXTRA`): **158 eindeutige Krankheitsbilder (166 Einträge, 8 doppelte Namen), davon 123 mit Pflegeplanung, 10 Fachgebiete** → öffentlich „über 150“ bzw. „über 120“ (bei Ausbau in `api/wissen.js` `ppAppBox()`/Hinweis, `landingpage.html`, `links.html`, `scripts/landingpages.mjs` anpassen). `api/wissen.js`: Hinweiszeile unter der Definition + Box `ppAppBox()` nach der Beispiel-Pflegeplanung und auf der Kategorieseite Pflegeplanung. Neuer Einstieg `?fach=pflegeplanung` → Screen `krankheitsbilder` (ZIEL-Map im Landingpage-Einstieg). `landingpage.html`: Sektion „Kostenlos nachlesen“ (#wissen: Pflegeplanungen, Normwert-Tabellen, Wissensdatenbank, Langzeitpflege), Pflegefachassistenz-Pill auf „18 Monate · bundeseinheitlich ab 2027“. `links.html`: Abschnitt „Kostenlos nachlesen“. Fach-Seiten mit Pflegeplanung-Links zeigen den App-Hinweis. SW-Cache v109.
- **Runde 2 + Pflegeplanung-Seiten (2026-10-19, „Go für alles“ P. Schenkelberger)** – (1) Dekubitus, GCS, Beatmungsmodi, Pleuraerguss, Delir neu geschrieben (Tabellen, Einteilung, Prüfungswissen, Pflegebezug), im `OFFEN`-Set, eigene SEO-Titel. (2) **10 Pflegeplanung-Seiten** `/wissen/pflegeplanung-<thema>` (Herzinsuffizienz, COPD, Diabetes Typ 2, Schlaganfall, Pneumonie, Demenz, Hüft-TEP, Schenkelhalsfraktur, Parkinson, Asthma Kind) als neue `lerninhalte`-Zeilen (Kategorie „Pflegeplanung“, Feld `pflegeplanung` = [{problem, ressourcen[], ziel, massnahmen[], evaluation}], `symptome`, `mcq` aus den Krankheitsbild-Fragen), Inhalte aus `KRANKHEITSBILDER` (r/t → „infolge“, m/d/s → „erkennbar an“). `istOffen()` macht alle `pflegeplanung-*`-Slugs vollständig öffentlich, `pflegeplanungHTML()` (Web) bzw. Block in der App-Wissensdatenbank rendert sie. Fach-Landingpages verlinken passende Pflegeplanungen. SQL: `docs/sql/2026-10-19_wissen_runde2_pflegeplanung.sql`. SW-Cache v108. **Runde 3 (19.10.2026, Go):** je ein zweites Pflegeproblem für COPD, Pneumonie, Demenz, Parkinson, Hüft-TEP, Schenkelhalsfraktur, Asthma Kind – SQL `docs/sql/2026-10-19_pflegeplanung_runde3.sql` (hängt nur an, wenn noch genau 1 Problem vorhanden ist).
- **4 Wissensseiten neu geschrieben mit Normwert-Tabellen (2026-10-19, Freigabe P. Schenkelberger per „Go“)** – Entzündungswerte, Nierenwerte, Lungenfunktion, Gasaustausch: Entwürfe im Docs-Artefakt „Wissensseiten Entwürfe – Laborwerte & Lunge“, SQL `docs/sql/2026-10-19_wissen_laborwerte.sql` (von P. Schenkelberger im Supabase-SQL-Editor auszuführen) schreibt in `lerninhalte.daten` (neue Felder `tabelle` = `{kopf:[], zeilen:[[]]}` und `einteilung`; alte Kurzfelder aufbau/funktion/physiologie/klinische_relevanz/wirkkette entfernt; `pflegeschwerpunkt` = Pflegebezug; `geprueft_von` P. Schenkelberger). Web (`api/wissen.js`): `tabelleHTML()` unter „Normwerte im Überblick“, Seiten im `OFFEN`-Set, eigene SEO-Titel. App (Wissensdatenbank in `index.html`): Tabelle wird nach der Definition gezeigt. SW-Cache v107.
- **15 Wissensseiten vollständig öffentlich (2026-10-19, Go P. Schenkelberger)** – `OFFEN`-Set in `api/wissen.js`: Lagerungsarten, Blasenkatheter, Magnesium, TEE, Lumbalpunktion, NIV, Infusionsberechnung, Stomaversorgung, s.c.-Injektion, ACE-Hemmer, PEG, weitere Antibiotika, PVK, Verbandwechsel, orale Antidiabetika (meistgesehen laut GSC + umfangreiche Felder). Dort werden alle `FELD_LABEL`-Felder (Aufbau … Komplikationen, Klinische Relevanz) ungekürzt als `<h2>`-Abschnitte gezeigt, Prüfungswissen ungekürzt; App-Hinweis „Wissen gelesen? Jetzt prüfen“, CTA „Teste dich zu …“. **In der App bleiben:** alle Prüfungsfragen (öffentlich nur 2–3 FAQ), Fälle, KI, Karteikarten, Lernplan, Probeklausur. **Erkenntnis:** Laborwert-/Grundlagenseiten (Entzündungswerte, Nierenwerte, Lungenfunktion …) haben kaum versteckten Inhalt (Felder ~30–40 Zeichen) → müssen neu geschrieben werden (Schritt 2, Entwürfe + fachliche Freigabe). Erfolgskontrolle 9.11. per GSC-Export.
- **SEO-Quick-Wins aus GSC-Auswertung (2026-10-18, Go P. Schenkelberger)** – Befund: Wissensseiten (`api/wissen.js`, 429 Lerneinheiten aus `lerninhalte`) sind bewusst Anrisse (~150–250 Wörter) → dünner Inhalt; Klicks fast nur Startseite. Umgesetzt: (1) `SEO`-Map in `api/wissen.js` mit suchintentions-genauen Titeln/Beschreibungen für 11 Seiten in Reichweite von Seite 1 (ZVD, GCS, Pflegeevaluation, Zystitisprophylaxe bei DK, Aufwachraum/Aldrete, Flüssigkeitsbilanz, Magnesium, Infusionsberechnung, Resistance, Frank-Starling, V/Q) – **nur Aussagen, die die Seite enthält**; (2) `seoDesc()`: alle übrigen Beschreibungen = Definition + tatsächlich vorhandene Bausteine (Prüfungswissen/Merksatz/Prüfungsfragen), ≤155 Zeichen; (3) Startseite: Titel „PLAN NRW (ehem. PflegeLearn) – Lern-App fürs Pflegeexamen“, Beschreibung gekürzt (Markensuche „pflegelearn“ Pos. 3,6 ohne Klicks); (4) Fach-Landingpages verlinken je 5–9 Wissensseiten (`fachgebiete.json` Feld `wissen`, Block „Kostenlos nachlesen“). SW-Cache v106. **Offen (Go nötig):** Top-30-Wissensseiten vollständig öffentlich (Fachwissen frei, Prüfungsfragen/Fälle/KI in der App), Pflegeplanung-Seiten, Laborwerte-Hub mit Normwert-Tabellen.
- **Google Analytics auf allen Landingpages (2026-10-18)** – `fach/*.html` (über `scripts/landingpages.mjs --live`), `landingpage.html`, `links.html` laden jetzt dasselbe gtag `G-YJLC762MTC` mit Consent Mode v2 wie die App (Snippets `scripts/snippets/ga-head.html` / `ga-body.html`), gemeinsamer Key `pl_consent` (Einwilligung gilt domainweit für App + Seiten), eigenes Banner + Link „Cookie-Einstellungen" (`plOpenConsent`), Vercel Web Analytics und Event `cta_click` {seite, ziel} bei Klick Richtung App/Play Store. Search Console ist per Meta-Tag + `googlea3572966378135fb.html` für die ganze Domain bestätigt; `sitemap-fach.xml` hängt im Sitemap-Index. Kein SW-Cache-Bump nötig (Seiten liegen außerhalb der App).
- **Test-Link mit Zugangscode (2026-10-17)** – `plan-nrw.de/?zugang=<CODE>&fach=langzeitpflege` meldet über den normalen `checkPW()`-Weg an (Code-Prüfung per RPC `plc_lookup_token`, Fallback `TOKEN_DB`), entfernt den Parameter aus der URL, merkt ihn nur kurz in `sessionStorage` (`plan_zugang`) und zeigt einmal den Hinweis „Testzugang – Was testen? / Feedback geben“. `?fach=langzeitpflege` springt in der Quiz-Auswahl zur Kategorie. Code `TEST-LZP-2026-A1` am selben Tag wieder deaktiviert (Entscheidung P. Schenkelberger: App ist kostenlos, Link soll weiterleitbar sein → für Empfehlungen immer den normalen Link `plan-nrw.de/fach/<slug>.html` bzw. `?fach=<id>` nutzen, keinen Code). `?zugang=` bleibt nur für echte Sonderzugänge. **Einmal-Hinweis „Neu: Langzeitpflege & ambulant“** (`window.plLzpHinweis`) erscheint jetzt auch beim normalen Link `?fach=langzeitpflege` bzw. über die Landingpage – einmal pro Gerät, neuer Key `pl_lzp_hint_shown`. SW-Cache v105. SW-Cache v103.
- **Etsy als zusätzlicher Vertriebsweg (2026-10-17, Entwurf, Entscheidung P. Schenkelberger)** – Anlass: Konkurrentin „Vivihappyness“ (Etsy, 627 Verkäufe, PDF-Lernkarten 6–60 €). Drei Fragenhefte aus `data/quiz-fragen.js` im PLAN-Design (`scripts/pdf/etsy.py` → `private/etsy/`, per `.vercelignore` nicht ausgeliefert): Langzeitpflege & ambulant (77 Fragen, 4,99 €), Intensiv & Anästhesie (290, 9,99 €), Examen 300 (9,99 €). Artikeltexte, Tags, Bilder (4:3) in `private/etsy/ARTIKELTEXTE.md`/`bilder/`. Etsy-Regeln: KI-Nutzung in der Beschreibung offenlegen, kein Kauf-Aufruf außerhalb von Etsy (Gebührenumgehung). **Vor Start:** fachliche Endkontrolle, Steuer-Kurzcheck, Shop mit Impressum/Widerruf. **Teil 2 (18.10.2026):** `scripts/pdf/etsy2.py` – Probeklausur (68 Aufgaben aus `data/klausur-*.js`, ASCII-Umlaute automatisch korrigiert), 92 Fallbeispiele (`FAELLE`, Hauptpfad der Entscheidungsbäume, Optionen gemischt), Krankheitsbilder & Pflegeplanung (107), Medikamente kompakt (43), Taschenkarten (40, bisher KDP), ATA & OTA Fragenkatalog (ersetzt KDP „OP & Intensiv“), Komplettpaket 375 S. (6 Produkte + 4 Gratis-PDFs als ausgewiesener Bonus, 29,99 €). Entscheidung P. Schenkelberger: KDP-Bücher verkaufen sich schlecht → Inhalte auf Etsy. Gratis-PDFs bleiben gratis (nicht einzeln auf Etsy). Offen: KDP-Select-Exklusivität prüfen.
- **Kursraum statt Lerntisch für Lehrkräfte (2026-10-17, Entscheidung P. Schenkelberger)** – Lehrkräfte brauchen den Lerntisch nicht: In `mountHome()` (Community-IIFE) zeigt `#plc-lt-entry` bei `pl_persona='lehrkraft'` die Kachel **„Kursraum“** (→ `showLehrer()`), sonst weiter den Lerntisch (`data-art` kurs/lt, wechselt live mit der Rolle). Lerntisch-Hinweis in der NEU-Liste für Lehrkräfte ausgeblendet, Profil-Kachel „Kurs & Lehrer“ → „Kursraum“, Tour-Schritt Lehrkraft angepasst. Begriff bewusst „Kursraum“ (nicht „Klassenzimmer“), damit Praxisanleitung/Fachweiterbildung sich angesprochen fühlen. SW-Cache v102.
- **Go-Freigabe Fachgebiete (2026-10-17 vormittags, Go P. Schenkelberger)** – Alle Punkte des Nachtlaufs freigegeben:
  - `PL_EXPORT_PUBLIC=true` (Nachweis-Export für alle Lehrkräfte), `PL_PFA_WL_PUBLIC=true` (Warteliste für alle) + Datenschutzerklärung Abschnitt **3b „Warteliste Pflegefachassistenz"** (`#warteliste`, Einwilligung, **Löschung nach Benachrichtigung, spätestens Ende 2027** → beim Start des Pakets einlösen).
  - **Langzeitpflege live:** 77 Fragen in `data/quiz-fragen.js`, neue Kategorie `langzeitpflege` („Langzeitpflege & ambulant") in `KATS`, `VALID_KATS` und allen `quiz_kats`, die `altenpflege` enthalten. 3 Dubletten zu Bestandsfragen nicht übernommen; Admin-Loader und `data/entwurf/` entfernt. Gesamt `QUIZ_FRAGEN` 1517.
  - Dublette „Validation nach Naomi Feil" (#970) gelöscht.
  - `AUSBILDUNGEN` `pflegehelfer` auf Bundesrecht 2027 umgestellt (18 Monate, ≥ 1.050 h + 1.280 h, PflFAssG/PflFAssAPrV, Übergang NRW-Recht bis 31.12.2026).
  - **Landingpages live:** `fach/<slug>.html` (9 Seiten, indexierbar, Canonical mit `.html`), eigene `sitemap-fach.xml` im Sitemap-Index. Neu erzeugen: `node scripts/landingpages.mjs --live` (schreibt Seiten + Sitemap).
  - **Einstieg `?fach=<id>`:** merkt Ziel in `sessionStorage` (`plan_fach_ziel`, kein `pl_*`-Key), GA-Event `landing_fach`, öffnet nach Login den Bereich (Praxisanleitung → `lehrer`, Langzeitpflege → `quizSelect`, Fachweiterbildungen/Assistenz/Anerkennung → `ausbildungswege`). SW-Cache v101.
- **Fachgebiete-Strategie „eine App, viele Module" (2026-10-17, Nachtlauf ohne Bezahlmodus, alles admin-only/Vorschau)** – Grundlage: Recherche 17.10. (Google Play „Repetitive Content", Apple 4.3, je neue App 12-Tester-Closed-Test → **keine eigenen Store-Apps pro Fachgebiet**).
  1. `data/fachgebiete.json`: zentrale Konfiguration (9 Fachgebiete: id, Ausbildungsweg, Farbe, `status` live/entwurf, Landingpage-Texte).
  2. `scripts/landingpages.mjs`: erzeugt SEO-Landingpages nach `private/landing/` (noindex, nicht ausgeliefert); nach Go `--live` → `fach/<slug>.html`. **Offen:** CTA nutzt `?fach=<id>`, die App wertet den Parameter noch nicht aus.
  3. **Nachweis-Export** (CSV/PDF) im Lernstand-Fenster, Schalter `PL_EXPORT_PUBLIC=false`. Ausdrücklich **kein** Fortbildungszertifikat.
  4. **Praxisanleitung-Hinweis** korrigiert: In NRW sind asynchrone digitale Lernformen für die 24-h-Pflichtfortbildung (§ 4 Abs. 3 PflAPrV) nicht anrechenbar.
  5. **Entwurf Langzeitpflege & ambulant:** `data/entwurf/langzeitpflege.js` (80 Fragen, kat `lzp_entwurf`, Feld `entwurf:true`) wird nur bei `isAdmin()` nachgeladen; `robots.txt` sperrt `/data/entwurf/`. Längen-Bias geprüft (richtige Antwort nur bei 13/80 die längste). Prüfliste: `docs/review/langzeitpflege-entwurf.md`. Quelle der Fragen: Skript im Scratchpad, daher künftig direkt in der JS-Datei pflegen. **Freigabe = Fragen nach `data/quiz-fragen.js` übernehmen, `kat` auf echte Kategorie, `KATS` + `VALID_KATS` ergänzen.**
  6. **Warteliste Pflegefachassistenz 2027:** Bundes-PflFAssAPrV verkündet (BGBl. 2026 I Nr. 166), Ausbildung startet 1.1.2027: 18 Monate Vollzeit, ≥ 1.050 h Unterricht + ≥ 1.280 h Praxis, Einsätze Akut/stationäre Langzeit/ambulant. Karte im Screen Ausbildungswege (`PL_PFA_WL_PUBLIC=false`), `POST /api/lead {zweck:'warteliste'}` setzt nur `leads.warteliste_pfa_at` (neue Spalte), **keine Mail**. Vor Freigabe Datenschutzerklärung ergänzen. **Offen (Go nötig):** `AUSBILDUNGEN`-Eintrag `pflegehelfer` beschreibt noch die alte NRW-Ausbildung (1 Jahr, PflfachassAPrV NRW) – gilt nur noch für Beginn bis 31.12.2026.
  7. `scripts/validate-quiz.mjs` liest jetzt `data/quiz-fragen.js` (war seit dem File-Split kaputt), `gynaekologie` in `VALID_KATS`. **Offen:** echte Dublette #970 ↔ #113 („Validation nach Naomi Feil") – Löschung braucht Go.
- **B2B-Fundament & Lern-Infrastruktur (2026-10-16, Go P. Schenkelberger)** – Sechs Bausteine:
  1. **Mandantentrennung:** `klassen`/`klassen_mitglieder`/`aufgaben` hatten offene anon-Policies (alles lesbar/änderbar inkl. Azubi-E-Mails). SQL `docs/sql/2026-10-16_klassen_rls.sql` am 16.10.2026 von P. Schenkelberger ausgeführt; geprüft: 0 Policies, RLS an, Rolle `anon` sieht 0 Zeilen, `klasse_stats` nur noch `service_role`. Client nutzt die Tabellen nicht direkt → kein Funktionsverlust.
  2. **Gratis-PDFs nur mit bestätigter E-Mail:** In-App-Sheet fragt E-Mail ab → `POST /api/lead {zweck:'app'}` schickt Freischalt-Link `plan-nrw.de/?pdfkey=<b64url(email).hmac>` → `pl_pdf_key`. Magic-Link-Session zählt ebenfalls als bestätigt (`&at=`). Schalter: Client `PL_PDF_GATE_PUBLIC`, Server `PDF_GATE` in `api/lead.js` – **seit 16.10.2026 beide `true` (live für alle).** **Ablage seit 16.10.2026:** PDFs liegen in `private/gratis-pdfs/` (per `.vercelignore` NICHT ausgeliefert), `.github/workflows/pdf-sync.yml` lädt sie bei jedem Push in den **privaten** Supabase-Bucket `gratis-pdfs`; `api/lead.js` (`ladePdf`) holt sie dort mit Service-Role (Fallback altes Repo). **Missbrauchsschutz (17.10.2026):** `api/lead.js` `limitPruefen()` – je 24 h max. 3 Mails pro Adresse, 5 verschiedene Adressen pro IP-Hash, 300 Mails gesamt → sonst `429 {error:'limit'}`; Tabelle `lead_limits` (nur `service_role`, Löschung nach 2 Tagen); fällt die Zählung aus, wird nicht blockiert. **Neues Gratis-PDF:** Datei nach `private/gratis-pdfs/` + `PAKETE` (api/lead.js) + `L`/`PK` (index.html) + `links.html` + SW-Cache. Das alte Repo `plan-nrw-gratis-pdfs` kann privat/gelöscht werden.
  3. **Offline:** Wissensdatenbank (`lerninhalte`) + Medikamente werden in IndexedDB `plan-offline` gespiegelt (eigene DB, weil der SW fremde Caches löscht), täglich im Hintergrund vorgeladen.
  4. **Fehleranalyse pro Azubi:** lokal `pl_fehler_v1` (Kategorien, falsche Fragen ≤150, erkannte Krankheitsbilder/Medikamente per Namensabgleich mit `KRANKHEITSBILDER`/`MEDIKAMENTE`/`MEDIKAMENTE_NEU`). Cloud nur für angemeldete Kursmitglieder (`progress.modul='fehler_v1'`), Lehrkraft-Ansicht im Lernstand (`api/klasse` action `fehler`, RPC `klasse_fehler` nur `service_role`). Schalter `PL_FEHLER_PUBLIC` (Ansicht + Sync) – **seit 16.10.2026 `true`**; Datenschutzerklärung Abschnitt 3a „Kurse und Lehrkräfte“ (`#kurse`) ergänzt, Hinweis im Beitritts-Screen.
  5. **Tests:** `tests/quiz-e2e.js` (9) + `tests/api-test.mjs` (23) blockierend in CI.
  6. **Push-Countdown:** `push_subs.examen_datum`, `send-reminders.mjs` staffelt Texte (≤90/30/7/1 Tage, Examenstag abends). Schalter: Workflow-Env `PUSH_EXAM_PUBLIC='1'` – **seit 16.10.2026 gesetzt (alle Geräte).**
- **Tester-Programm ohne Gratis-Zeitraum und ohne Cap (2026-10-01)** – Entscheidung P. Schenkelberger: Reichweite vor Limit. 6-Monats-Grant (`pl_paid_until`) für neue Tester entfernt, 15er-Cap in `api/tester.js` entfernt. Bestehende Tester behalten ihren Zugang. Neu: Route `/test` und `/tester` → Tester-Screen mit 3 Schritten (Google-Gruppe → Opt-in `play.google.com/apps/testing/com.pflegelearn.nrw` → Store), Home-Banner nur Android/nicht in TWA (`pl_is_twa`, `pl_test_banner_closed`). Kein 💙 in Marketing/UI (politische Konnotation).
- **Feinere Quiz-Kategorien: 5 Sammel-Kategorien in 39 Themen aufgeteilt (2026-07-10, PRs #72–#76)** – Die fünf größten `KATS`-Kategorien waren fürs gezielte Üben zu grob und ließen die Kategorienliste knapp wirken. Sie wurden in fachlich klar abgegrenzte Sub-Kategorien aufgeteilt: `anatomie` (315) → 10 (`ana_*`), `intensiv` (103) → 8 (`its_*`), `ata` (76) → 7 (`ata_*`), `ota` (64) → 7 (`ota_*`), `anaesthesie` (56) → 7 (`an_*`). **Gesamt-Kategorien 25 → 59.** **Rein additiv, keine Inhaltsänderung** – nur `"kat"` pro Frage neu vergeben, `KATS`-Eintrag durch die Sub-Einträge ersetzt (je eigenes Icon/Farbe), `quiz_kats`-Whitelist der betroffenen Ausbildungswege und `VALID_KATS` im Validator angepasst. **Wichtige Unterscheidung:** Die **Ausbildungswege** (`AUSBILDUNGEN`, z. B. `id:"intensiv"`/`"ata"`/`"ota"`/`"anaesthesie"`) haben teils dieselbe ID wie die alte Quiz-Kategorie, wurden aber **NICHT** angefasst – nur die Quiz-`KATS` und `q.kat`. **Methode (wiederverwendbar für weitere Splits):** Klassifikation per Skript **strikt anhand des Frage-Stamms** (`frage`), Erklärung (`erkl`) nur als Fallback – **nie** anhand der Antwortoptionen, da Distraktoren aus Nachbarsystemen (z. B. „Zwerchfell", „Darmbein") sonst falsch zuordnen (dieser Bug trat im ersten Anatomie-Lauf auf und wurde so behoben). Jeder Split: Mapping-Dump reviewen → `validate-quiz.mjs` → Playwright-Smoke (0 Rest-Fragen der alten Kat, alle Sub-KATS vorhanden, Ausbildungsweg erhalten, quizSelect rendert Labels) → SW-Cache hochzählen → PR → squash-merge. SW-Cache v68 → v73. **Bewusst NICHT gesplittet:** die 15 verbleibenden Fachkategorien mit je 40 Fragen (`psychiatrie`, `paediatrie`, `innere`, `chirurgie` …) – sie sind bereits einzelne, fokussierte Themen (keine Umbrella-Kategorien wie `anatomie`/`intensiv`); ein Split wäre künstlich. *Hinweis: Sub-Kategorie-Zuordnung ist KI-generiert; bei Randfällen (system-übergreifende Fragen) ist die finale fachliche Sichtung Sache des Ausbilders.*
- **Schul-Lizenz + Lehrer-Dashboard (Pilot) & Nischen-Content (2026-07-07, PRs #54–#56)** – Fundament für den B2B-Schulvertrieb (Phase 2 der Marktführer-Strategie, siehe Konkurrenzanalyse). Neue Serverless-Route `api/klasse.js` (nach `api/tester.js`-Muster, Service-Role) + 3 Supabase-Tabellen (`klassen`/`klassen_mitglieder`/`aufgaben`, RLS ohne Public-Policies). Front-End: Screens `#screen-lehrer` (Klasse anlegen, 6-stelliger Beitritts-Code, Aufgabe verteilen: Quiz-Set/Fall/Freitext, Mitgliederliste) und `#screen-klasse-beitreten` (Azubi tritt per Code bei → „Meine Aufgaben"). **Bewusste Designentscheidung:** Schüler-Freischaltung nutzt exakt den Tester-Grant-Pfad (`pl_paid_until`) → keine neue Paywall-Logik; `pl_paid_plan='schule'` ist nur ein Label. **Pilot-Modus** (Lizenz 1 Jahr, kostenlos); Empfehlung fürs Bezahlmodell später: „Pauschale pro Klasse" (Stripe folgt), Recht (DSGVO/AVV, Minderjährige) vor echtem Verkauf klären. Parallel **Nischen-Content-Offensive**: `intensiv` 40→56 und `anaesthesie` 40→56 (u. a. leichte Einstiegsfragen – beide hatten 0–1 leichte Fragen –, Atemweg/Pharma/Beatmung/Sepsis/Hämodynamik). Gesamt 1075→1107. *Hinweis: KI-erstellter Lehrbuch-Content, finale fachliche Endkontrolle durch den Ausbilder steht aus.*
- **k-Verteilungs-Warnung im Validator + 4 Kategorien ausbalanciert (2026-07-04, PR #42)** – `validate-quiz.mjs` warnt jetzt **nicht-fatal** bei Antwort-Positions-Bias (ab 16 Fragen/Kategorie: eine Position > 45 % oder nie genutzt). Beim ersten Lauf deckte die Warnung auf, dass **mobilitaet (57 %), rehabilitation/palliation (53 %), praevention (50 %)** noch B-lastig waren – Ursache: ihre vorbestehenden Basis-Fragen (altes spaced-JSON-Format) lagen fast alle auf B und zogen die Verteilung trotz balancierter Neuzugänge schief. Alle vier auf ~25 % je Position umsortiert (gegen HEAD verifiziert: 160 Fragen inhaltlich unverändert, nur Position; spaced-Fragen dabei aufs kompakte Format normalisiert). **Damit prüft das QA-Gate Positions-Bias jetzt automatisch** – die frühere „manuelle Sorgfalt"-Lücke ist geschlossen.
- **anatomie-QA: Antwortpositionen ausbalanciert (2026-07-04, PR #40)** – Qualitätsdurchsicht der größten Kategorie (315 Fragen) via Analyse-Skript ergab einen **Antwort-Positions-Bias**: die richtige Antwort stand bei **93 % auf Position B** (k=1) → Kategorie war ratbar. Fix: deterministische Umsortierung auf **25 % je Position** (79/79/79/78); gegen HEAD verifiziert, dass bei allen 315 Fragen richtige Antwort/Optionsmenge/Erklärung unverändert blieben (nur Position wechselt). Zusätzlich eine echte Redundanz entfernt (zwei „Insulin senkt Blutzucker"-Fragen → eine durch neue Iris/Pupillen-Frage ersetzt). **Lehre für neue Fragen-Batches: richtige Antwort von Anfang an über k=0–3 streuen** – seit PR #42 warnt der Validator automatisch, falls das vergessen wird. Erklärungen waren durchweg ausreichend (0 zu kurze).
- **UI-Politur „Lebendigkeit & Tag-Modus" (2026-07-04, PRs #37/#38)** – Drei additive, `prefers-reduced-motion`-sichere Verbesserungen: (1) **Tag-Modus-Kontrast** repariert – Ursache war, dass `body.light-mode` die CSS-Variablen `--text2`/`--text3` NICHT überschrieb und daher Dark-Werte (blasses Grau) auf hellem Grund standen; jetzt setzt `body.light-mode` kräftige Variablen (`--text2:#334155`, `--text3:#475569`, `--accent:#0284c7`) → alle Sekundärtexte lesbar. **Merke: neue Light-Mode-Farben immer über die Variablen lösen, nicht Selektor für Selektor.** (2) **Animierte Menü-Icons** (`.bottom-card-icon` wippen versetzt via `plIcoFloat`, Buch-Emojis klappen via `plBookOpen` auf – automatisch getaggt durch `plTagBookIcons()`, Bottom-Nav poppt beim Aktivieren). (3) **Quiz-Abschluss-Animation** statt statischem Bild: `plQuizCelebrate()` (Emoji-Pop, Prozent-Count-up) + `plConfetti()` (DOM-Partikel, ab 50 %/75 %), aufgerufen in `showResult()`. Alles isoliert, kein neuer `pl_*`-Key.
- **Content-Offensive 627 → 1075 Fragen + QA-Validator (2026-07-04, PRs #25–#36)** – Alle 19 Fachkategorien (außer `anatomie`, 315) systematisch auf **je 40 Fragen** ausbalanciert; medizinisch/rechtlich geprüft, richtige Antworten bewusst über `k=0/1/2/3` verteilt (kein „immer C"-Muster). **Neu: `scripts/validate-quiz.mjs`** als Content-QA-Gate (Struktur, Dubletten, Verteilung) – Pflicht nach jeder `QUIZ_FRAGEN`-Änderung; hat reale Fehler abgefangen. **Fragenzahl jetzt dynamisch** (`plSyncFragenCount()` + `.pl-fragen-count` + inline `QUIZ_FRAGEN.length`) statt hart kodiert; SEO auf „über 1050". Batch-Muster: pro Kategorie/PR validieren → SW-Cache hochzählen → squash-mergen.
- **Trial 2.0 / Conversion-Offensive (2026-07, ohne Preisänderung)** – Bewusste Entscheidung P. Schenkelberger: **Preis bleibt 9,99 €** (1 M); statt Rabatt den **wahrgenommenen Wert** heben. Umgesetzt: Preis-Seite mit Ergebnis-Hero, Vergleichstabelle vor den Preisen, **14-Tage-Zufriedenheitsgarantie** (Risikoumkehr; AGB-Entwurf + FAQ; **rechtlich prüfen lassen**), Mini-FAQ, „⭐ Empfehlung: 3 Monate", Gründer-Block „Wer dahinter steht" (Monogramm statt Foto), Examensdatum-Prompt, Willkommen-im-Vollzugang, `begin_checkout`-GA4-Event mit `source`. **Rechtlicher Leitplanken (UWG): NIEMALS erfundene Testimonials/Bewertungen/Nutzerzahlen** – nur Substanz-Vertrauenssignale, bis echte Kundenstimmen vorliegen. Neue `pl_*`-Keys: `pl_stripe_src`, `pl_examdate_prompted`, `pl_welcome_full_shown`.
- **Adaptive „Lerncoach"-Startseite (#7/#8)** – Home vom Modul-Menü zum persönlichen Coach umgekehrt: EIN adaptiver nächster Schritt (5 datengetriebene Zustände: Erstnutzer, Endspurt, Tagesziel-fast, größte Lücke, Weitermachen) statt vier gleichwertiger Kacheln (Hick's Law). Begrüßung mit Examens-Countdown, Module in ruhiger Auswahl, `home-stats` verschlankt. Doppelter Examen-Endspurt-Toast entfernt (Coach übernimmt). Kein neuer `pl_*`-Key.
- **Sprint 1.5 „Intelligenter Trial" (#9)** – Trial-Vollzugang **7 → 21 Tage** (Azubi-Lernrhythmus: Schichtdienst/Blockunterricht, Aha-Moment sicherer erreichen). Neuer **engagement-getriggerter Upsell** am Wert-Peak (Prüfungsreife ≥ 50 % & ≥ 30 Fragen **oder** erste Examens-Sim; einmalig via `pl_engage_upsell_shown`; isolierte IIFE, die `showScreen` additiv wrappt). Free-Tier KI-Chat **5 → 8**. **Bewusst NICHT** umgesetzt: „Trial endet früher bei Intensivnutzung" (bestraft die engagiertesten Nutzer). Erkenntnis: Die **Reverse-Trial-Struktur existierte bereits** (Downgrade nach Trial auf `gratis`-Bereich mit 20 Fragen/Tag, 8 KI, 2 Fälle/Fach; Medizintechnik/Medikamente gesperrt). Erste **E2E-Tests** unter `tests/` (Playwright, 10/10 grün).
- **MCP-Anbindung für Claude Code (projekt-bezogen via `.mcp.json`)** – Supabase (read-only, auf Projekt-Ref beschränkt) + Vercel (gehosteter OAuth-Server). **Bewusst minimalistisch** gehalten: Filesystem-/Browser-MCP verworfen, weil Claude Code Datei-Tools (`Read`/`Grep`/`Glob`/`Edit`) und `WebSearch`/`WebFetch` bereits eingebaut hat – zusätzliche MCPs würden nur Kontext-Overhead erzeugen. Standard dokumentiert in Abschnitt 22.
- **Push-Versand via GitHub Actions + Node `web-push` statt Deno** – Fallback-Lösung, läuft als Cron-Workflow (`5fa4799`, `485e523`). Selbstheiler `plResyncPush` re-synct Abos bei App-Start (`50da843`).
- **Web-Push hinter VAPID-Key gegated** – Opt-in-Client bleibt inert, bis `PL_VAPID_PUBLIC` gesetzt ist (Sprint 2 D, `3fdb3d6`/`4686656`/`11589a3`).
- **Gamification für Bindung** – Tagesziel-Ring, Streak-Verlustaversion, Meilenstein-Feiern (Sprint 2 A–C, `98032ef`).
- **Konto/Sync optional gehalten** – Magic-Link-Konto-Prompt „Fortschritt sichern", geräteübergreifender Zugang über `access`-Tabelle; App funktioniert auch ohne Login (`4ef8c17`).
- **Lead-Funnel** – E-Mail-Erfassung (Gratis-Eselsbrücken) → Supabase `leads` → automatischer PDF-Versand via Resend; Mailversand nicht-fatal (`74dc8ea`, `04a03f5`, `f316aa7`).
- **Stripe-Webhook ohne Re-Fetch bei Subscription-Events** – behebt 404→500→Stripe-Retry-Storm bei Kündigung/Adaptive Pricing; User-Auflösung primär über `stripe_customer_id` in der DB, E-Mail als Fallback (`208de05`, `5a8d916`).
- **Echter Sofort-Trial (7 Tage Vollzugang)** statt 24h-Token, mit Auto-Login und Gratis-Downgrade bei Ablauf (`48cd3ed`).
- **Tarifstruktur auf 4 Laufzeiten** (1/3/6/12 Monate) statt Einzelpreis; 1 Monat = Abo, ab 3 Monate Einmalzahlung; „BELIEBT"-Badge auf 3 Monate (niedrigere Kaufhürde, Azubi-Zielgruppe) (`0dc8df6`, `8f84669`, `db941e2`, `95f00bd`).
- **Conversion-Features:** Prüfungsreife-Score + Schwächenanalyse (`e84aff7`), Examen-Simulation mit Note/Auswertung (`5f76c15`), Leitner Spaced-Repetition für falsch beantwortete Fragen (`a4f1a67`), zweistufiger Rating-Prompt (`fd08c1b`), Social Proof + Testimonial-Pipeline (`f785b07`).
- **Content-Qualitätsoffensive** – mehrere Etappen: abgeschnittene richtige Antworten repariert, „faule Distraktoren" überarbeitet, Dubletten entfernt, fehlende Kategorien in `KATS` ergänzt (`50826fb`…`e502ead`, `b9b6952`, `15b7871`). Fragenzahl damals konsolidiert auf **627** – 2026-07 dann per Kategorie-Ausbau auf **1075** erweitert (siehe oberster Decision-Log-Eintrag).

---

## 18. Roadmap & offene Aufgaben

> Hinweis: Die App nutzt eine Sprint-/Issue-Nomenklatur (`Sprint 2 A–D`, Issues `#2`–`#7`) in Commit-Messages. Eine zentrale Backlog-/Issue-Liste ist im Repo nicht hinterlegt.

- **Aktive/Issue-Tracking-Quelle:** `[vom Team zu pflegen]` – falls GitHub Issues genutzt werden, hier verlinken.
- **Nächste Sprints / geplante Features:** `[vom Team zu pflegen]`
- **Bekannte offene Aufgaben aus dem Code (von Claude identifiziert):**
  - **🔴 Priorität: PDF-Versand des Lead-Funnels reparieren.** `RESEND_API_KEY` ist in Vercel **nicht gesetzt** (verifiziert am 2026-06-30: nur `SUPABASE_SERVICE_ROLE`, `SUPABASE_URL`, `GROQ_API_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` vorhanden). Folge: `api/lead.js` speichert den Lead, überspringt aber den Versand → **alle `leads` haben `pdf_sent = false`** (per Supabase-MCP bestätigt). Conversion-relevant (Gratis-PDF kommt nie an). To-do: Resend-Account + Domain-Verifizierung `plan-nrw.de` (DNS bei IONOS) + `RESEND_API_KEY` in Vercel; danach Nachversand für Bestands-Leads.
  - **Lerninhalt aus `index.html` auslagern** (Quizfragen/Fälle/Karten → JSON) – größter Hebel für Wartbarkeit, Token-Effizienz und Bug-Reduktion (Details Abschnitt 22). **Daten zuerst, Code-Split später** (kein Build/Bundler vorhanden).
  - **MCP-Ausbau:** Playwright-MCP ergänzen (Funnel-/Quiz-/Stripe-E2E-Tests), Vercel-MCP-OAuth lokal abschließen (Inkognito-Fenster, da Browser-Erweiterungen die Team-Auswahl blockierten).
  - **„Technologie-Scout"-Routine** (Idee P. Schenkelberger): wöchentlicher Kurzbericht (neue Pflege-Apps, KI-Modelle, Play-Store-/Apple-Richtlinien) als geplanter Claude-Code-Trigger + `WebSearch` – **kein eigener MCP nötig**.
  - Altlasten-Bereinigung (`files 3/`, `files.1/`, `files.2.zip`, `manifest (1).json`, ungenutzte Root-`chat.js`).
  - Platzhalter-Stripe-Links `buy.stripe.com/XXXXX_*` (~Z. 11985 ff.) prüfen/entfernen – die Live-Links stehen in `STRIPE_PLANS`.
  - ~~Konsistente Fragenzahl an allen Meta-/SEO-Stellen sicherstellen~~ **erledigt (2026-07):** Zahl ist jetzt dynamisch (`plSyncFragenCount()`), SEO trägt „über 1050". Bei weiterem Ausbau nur die SEO-„über NNN"-Rundung und `sw.js`-Cache anpassen.
  - ~~**`anatomie` (315 Fragen) inhaltlich sichten**~~ **erledigt (2026-07-04, PR #40):** Antwort-Positions-Bias (93 % auf B) auf 25 % je Position ausbalanciert, eine echte Redundanz entfernt; Erklärungen ok. Bei künftigem Ausbau die k-Streuung im Blick behalten.

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

**Aktuell offene Bugs**
- **Lead-PDF-Versand inaktiv (2026-06-30):** `RESEND_API_KEY` fehlt in der Vercel-Env → `api/lead.js` versendet das „12 Eselsbrücken"-PDF nie, alle `leads.pdf_sent = false`. Conversion-Verlust im Gratis-Funnel. Behebung siehe Roadmap (Abschnitt 18). *Hinweis:* Der Code ist korrekt – es ist ein **Konfigurations-**, kein Code-Fehler.

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

## 22. MCP- & Effizienz-Standard für PLAN Digital

Leitlinie für den Einsatz von **MCP-Servern** (Model Context Protocol) und für **token-effizientes Arbeiten** mit Claude Code. Gilt für PLAN NRW und als Vorlage für alle Folgeprodukte von PLAN Digital. Entstanden aus der Einrichtungs-/Strategiesitzung am 2026-06-30.

### Grundprinzip
**So wenige MCPs wie möglich, so viele wie nötig.** Jeder aktive MCP-Server lädt seine Werkzeug-Beschreibungen in den Kontext und erzeugt damit Grundlast. Ein MCP spart **nicht automatisch** Token – er lohnt sich nur, wenn er Claude wiederholtes, teures Lesen/Recherchieren erspart. **Vier MCPs mit je klarem Job schlagen acht, die sich überlappen.**

### Verbindlicher MCP-Kanon
| MCP | Status | Zweck | Bewertung |
|---|---|---|---|
| **GitHub** | ✅ aktiv | Repo, Commits, PRs, Branches, Code-Suche | Pflicht |
| **Supabase** | ✅ aktiv (read-only) | DB-Tabellen lesen/abfragen, Debugging echter Daten | Pflicht |
| **Vercel** | ⏳ konfiguriert, OAuth offen | Deployments, Logs, Build-Fehler, Env-Übersicht | Sinnvoll, sekundär |
| **Playwright** | 🔜 geplant | E2E: Trial-/Quiz-/Stripe-/Paywall-Funnel echt durchklicken, Bugs finden | Empfohlen (größter Praxisnutzen für die PWA) |

### Bewusst NICHT installiert (für dieses Projekt)
- **Filesystem-MCP** – **redundant in Claude Code.** Die eingebauten Tools `Read`/`Grep`/`Glob`/`Edit` lesen bereits gezielt einzelne Funktionen/Bereiche statt der ganzen `index.html`. (Nur in Claude Desktop relevant.)
- **Browser-MCP** – `WebSearch`/`WebFetch` sind in Claude Code eingebaut; Wettbewerbs-/SEO-Recherche braucht keinen Extra-Server.
- **Context7** – glänzt bei Framework-Projekten; PLAN NRW hat **keine Dependencies / keinen Build**, daher geringer Nutzen.
- **Figma** – erst sinnvoll, sobald ein echter Figma-Designprozess existiert.
- **Slack/Discord/Notion/Drive** – erst bei Team-/Prozess-Bedarf.

### „Technologie-Scout" – als Routine, nicht als MCP
Wöchentlicher Kurzbericht (neue Pflege-Apps, KI-Modelle, Play-Store-/Apple-Richtlinien) über einen **geplanten Claude-Code-Trigger** + `WebSearch`. Kein eigener MCP nötig.

### Token-Effizienz – Hebel nach Wirkung
1. **`CLAUDE.md` pflegen (größter Hebel, kein MCP):** Claude liest sie und hat sofort Architektur, Workflows und Entscheidungen – ohne sie pro Sitzung neu zu rekonstruieren.
2. **Lerninhalt aus `index.html` in JSON auslagern:** Statt 1,9 MB Monolith nur die relevante Datendatei lesen/ändern. Beseitigt zugleich die häufigste Bug-Klasse. **Reihenfolge: Daten zuerst.**
3. **Gezielt lesen statt ganzer Datei:** Zeilen-Anker (unten) + `Grep`/`Read`-Offsets nutzen – die große Datei NICHT komplett einlesen.
4. **Code-Modularisierung (`quiz.js`, `auth.js`, `stripe.js` …) – später & vorsichtig:** Echter Mehrwert v. a. für Wartbarkeit, aber Refactoring **ohne Tests** ist riskant (Entitlement-/Sync-Logik). Erst mit Minimal-Tests und einem leichten Build-Schritt angehen; die „kein Build"-Entscheidung ist bewusst getroffen.

### Sicherheitsregeln für MCP-Betrieb
- **Supabase bewusst `--read-only`** und auf die Projekt-Ref beschränkt (`.mcp.json`). Schreibzugriff nur nach expliziter Entscheidung.
- **Secrets nie ins Repo / nie in den Chat / nie in Screenshots.** `SUPABASE_ACCESS_TOKEN` lokal als Umgebungsvariable; der `SUPABASE_SERVICE_ROLE`-Key (umgeht RLS) und `RESEND_API_KEY` sind besonders schützenswert. Exponierte Tokens sofort widerrufen und neu erzeugen.
- **Claude Code on the web hat aktuell keinen sicheren Secret-Speicher** – MCPs, die geheime Tokens brauchen (Supabase), daher **lokal** betreiben (Claude Code Desktop/CLI). Read-only-Tokens, die personenbezogene Daten lesen können, sind DSGVO-relevant.

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
| `QUIZ_FRAGEN` (alle 1214 Quizfragen; `const QUIZ_FRAGEN = [`) | ~1584 |
| Registrierung / Trial-Start | ~7200 |
| Startup-Revalidierung (Trial/Paid) | ~7460 |
| `kartenHTML` / `karten` | 12808 / 14288 / 14696 |
| `isAdmin()` | 14381 |
| `PL_VAPID_PUBLIC` / Push-Opt-in | 15549 |
| `STRIPE_PLANS` / `kaufPlan()` | 15222 / 15228 |
| Cloud-Sync-IIFE (`window.PLCloud`) | 16021 |
