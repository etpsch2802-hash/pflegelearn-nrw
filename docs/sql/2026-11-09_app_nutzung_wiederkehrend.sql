-- 09.11.2026: Rückkehrer pro Tag im Admin-Tab „Nutzung“ (Messung für die Bezahl-Schwelle 14 Tage ≥ 50).
-- Von P. Schenkelberger im Supabase-SQL-Editor auszuführen. Bis dahin speichert api/presence.js ohne die Spalte.
alter table public.app_nutzung add column if not exists wiederkehrend boolean not null default false;
