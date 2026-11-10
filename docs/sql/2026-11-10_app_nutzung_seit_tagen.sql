-- 10.11.2026 (Go P. Schenkelberger): Rückkehr neuer Geräte messen.
-- Die App meldet beim Start, wie viele Tage seit dem ersten Öffnen auf dem Gerät vergangen sind (0–60, nur neue Geräte).
-- Der Nutzungs-Tab zeigt daraus „Tag 1 zurück“ / „Tag 7 zurück“. Bis die Spalte da ist, speichert api/presence.js ohne sie.
alter table public.app_nutzung add column if not exists seit_tagen smallint;
