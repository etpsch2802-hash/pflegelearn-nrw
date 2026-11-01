-- Gründer-Liste (01.11.2026, P. Schenkelberger): Zeitstempel, wer bei einer späteren Premium-Version zuerst informiert werden möchte.
-- Im Supabase-SQL-Editor ausführen. Tabelle leads ist nur für service_role beschreibbar (api/lead.js).
alter table public.leads add column if not exists gruender_at timestamptz;

-- Auswertung (nur lesen):
-- select email, gruender_at from public.leads where gruender_at is not null order by gruender_at;
