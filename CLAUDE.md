# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**PLAN – Pflege Learn App NRW** (`plan-nrw.de`) is a German-language study app for German nursing trainees ("Pflegeausbildung"): quizzes, clinical cases, AI chat tutor, flashcards, and exam prep across the 7 NRW training tracks. It ships as:

- An **installable PWA** (`manifest.json` + `sw.js`), and
- A **Trusted Web Activity Android app** (`.well-known/assetlinks.json`, package `com.pflegelearn.nrw`).

There is **no build step, no framework, and no `package.json` at the repo root.** The entire client app is one hand-written, ~17k-line `index.html` containing all HTML, inline CSS, inline JS, and the learning content as inline JS data literals. The backend is a handful of Vercel serverless functions in `api/`.

## Architecture

### Single-file client (`index.html`)
- All UI is one document. "Pages" are `<div id="screen-*" class="page">` elements toggled by `showScreen(name)` (around line 2459): it removes `.active` from all `.page`/`.chat-page` and adds it to `#screen-<name>`. Screens include `home`, `quiz`, `quizSelect`, `faelle`, `fall`, `chat`, `merksaetze`, `krankheitsbilder`, `medikamente`, `anatomie`, `lernplan`, `preise`, `registrierung`, `admin`, etc. A manual `screenHistory` array drives the back button.
- **Learning content is inline data**, not fetched: `const FAELLE = …` (clinical cases, ~line 8161), `const fragen = …` / `const themen = …` (quiz questions, ~line 11303+), `const karten = …` / `const kartenHTML = …` (flashcards). To add/edit questions, cases, or cards, edit these literals directly.
- State lives in `localStorage` under `pl_*` keys (see below) and is mirrored to Supabase when the user is logged in.
- `gtag` (Google Analytics) and consent gating (`pl_consent`) are at the top of the file.

### Access / monetization model (important, and subtle)
Entitlement is computed **client-side** from `localStorage`, layered over a server-side source of truth in Supabase. There is no single `hasAccess()` gate — access is enforced by checking these keys at the relevant moments:
- `pl_token` — `'GRATIS'` for free tier, or a paid token; `pl_user` is the display name.
- **Trial:** `pl_trial_until` (ISO date), `pl_trial_used`, `pl_trial_expired`, `pl_trial_name/email`. A 7-day trial.
- **Paid:** `pl_paid_until`, `pl_paid_name`, `pl_paid_plan`, plus `pl_sub_active` / `pl_sub_email` for active-subscription auto-unlock synced from Supabase `subscriptions`.
When changing gating, trace these keys end-to-end (registration ~line 7200, startup re-validation ~line 7460) rather than assuming one function controls it. Expired trials fall back to `pl_token='GRATIS'`.

### Backend (Vercel serverless, `api/`)
Each file is a default-export `handler(req, res)`. Secrets come from Vercel env vars; none are committed.
- `api/chat.js` — primary AI chat tutor. Proxies to **Groq** (`llama-3.3-70b-versatile`, OpenAI-compatible). Client calls it via `KI_ENDPOINT = '/api/chat'` (index.html ~line 2994). Needs `GROQ_API_KEY`.
- `api/lead.js` — `POST /api/lead`: stores an email in Supabase `leads`, then emails the "12 Eselsbrücken" PDF via **Resend**. Needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `RESEND_API_KEY`. The PDF is fetched from `assets/eselsbruecken.pdf` on GitHub `raw`.
- `api/stripe-webhook.js` — `POST /api/stripe-webhook`: Stripe → Supabase auto-unlock. **Verifies by re-fetching from the Stripe API with the secret key, not HMAC/raw-body signature.** Upserts into `subscriptions` with the service role (bypassing RLS); resolves the Supabase user via existing `stripe_customer_id` or the `uid_by_email` RPC. Handles `checkout.session.completed`, `customer.subscription.updated/deleted`, `charge.refunded`, `charge.dispute.created`. Needs `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`.
- **Note:** the repo-root `chat.js` is a separate **Gemini** (`gemini-1.5-flash`) variant of the chat handler and is not the active `/api/chat` route. Edit `api/chat.js` for the live endpoint.

### Supabase
Client SDK (`@supabase/supabase-js@2`) is loaded from CDN and initialized inline in `index.html` (~line 84) as `window.SB` with the public/anon key (the project URL `tpgverrpznsujvzbntmj.supabase.co` and publishable key are committed — these are public by design). Tables/usage:
- `progress` (per-user/`modul`) — cloud sync of `pl_progress_v2`. The sync IIFE (~line 16021, exposed as `window.PLCloud`) does max-merge of local+remote, pushes every 15s and on `pagehide`/`visibilitychange`. Auth is **passwordless magic-link** (`signInWithOtp`).
- `subscriptions` — written by the Stripe webhook (service role), read by the client for auto-unlock.
- `leads` — written by `api/lead.js`.
- `push_subs` — Web Push subscriptions (endpoint + `sub` JSON).

### Service worker & PWA (`sw.js`)
Cache name `pflegelearn-v6`. **Network-first** for everything (HTML uses `cache: 'no-store'`); cache is only an offline fallback, and only same-origin OK responses are cached (never Stripe/3rd-party). Also implements **Web Push**: `push` → `showNotification`, `notificationclick` → focus/open the app. When you change cached assets or SW behavior, **bump the `CACHE` constant** so clients update.

### Web Push reminders (GitHub Actions, not Vercel)
- `.github/workflows/reminder-push.yml` runs `scripts/send-reminders.mjs` daily at 17:00 UTC (and on manual dispatch). It `npm install web-push@3` ad hoc (no committed `package.json`).
- The script reads `push_subs` from Supabase and sends a VAPID push to each; subscriptions returning 404/410 are deleted. Secrets: `SUPABASE_SERVICE_KEY`, `VAPID_PRIVATE` (GitHub repo secrets). The **VAPID public key is committed** in both the workflow and `index.html` (`PL_VAPID_PUBLIC`, ~line 15549) — client push opt-in is inert until that key is present.

## Deployment & commands

- **Hosting:** Vercel. `vercel.json` defines routes: `/api/*` → serverless functions, static asset extensions served directly, everything else → `index.html` (SPA fallback). Deploys happen on push to `main` via the Vercel↔GitHub integration — there is no deploy command in this repo.
- **No build, test, or lint tooling exists.** Do not invent `npm run build/test/lint`; there is nothing to run. "Building" = editing `index.html`/`api/*` and pushing.
- **Local preview:** serve the repo root as static files and hit `index.html`, e.g. `python3 -m http.server 8080`. The `/api/*` functions and SPA rewrites only run under Vercel (`vercel dev`), not a plain static server.

## Conventions & gotchas

- **Language:** All user-facing strings, code comments, and commit messages are in **German**. Match that. Commits follow Conventional Commits with German bodies (e.g. `feat(push): …`, `fix(...)`).
- **Plain ES5/ES2015 browser JS**, heavy use of IIFEs and `var`, defensive `try/catch` around every `localStorage`/JSON/network call, no modules/bundler on the client. New client code should be additive and self-contained in the same style; several scripts explicitly note "berührt NICHT …" (does not touch X) to stay isolated.
- **`localStorage` `pl_*` keys are the de-facto schema.** Read existing keys before adding new ones; don't rename them (would silently log users out / reset progress).
- **Stale/duplicate top-level files are real and confusing.** `files 3/`, `files.1/`, and `files.2.zip` are older snapshots/backups of the site (older `index.html`, manifest, icons). The **live** files are the repo-root ones (`index.html`, `manifest.json`, `sw.js`, `api/`). Don't edit the backup copies expecting them to ship. Likewise `manifest (1).json` is a stray duplicate of `manifest.json`.
- **Secrets:** all live in Vercel/GitHub env. Public-by-design values that *are* committed: Supabase URL + publishable/anon key, VAPID public key, Stripe publishable button, GA id. Service-role keys, `GROQ_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `VAPID_PRIVATE`, `SUPABASE_SERVICE_KEY` are not.
- **Admin** features are gated by `isAdmin()` (~line 14381) and `showScreen('admin')` redirects non-admins home.
- Because `index.html` is one giant file, **use line-anchored search** (the locations above) rather than reading the whole file; edits should be precise string replacements.
