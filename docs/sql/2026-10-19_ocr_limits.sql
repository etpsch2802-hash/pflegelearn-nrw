-- PLAN NRW – Server-Limit für die Foto-Abschrift (POST /api/wissen?ocr=1), 19.10.2026
-- Im Supabase-SQL-Editor ausführen. Nur service_role (Serverfunktion) darf lesen/schreiben,
-- es werden keine personenbezogenen Daten gespeichert: nur ein nicht umkehrbarer Hash der IP-Adresse
-- und der Zeitpunkt. Einträge älter als 2 Tage löscht die Funktion selbst.
create table if not exists public.ocr_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists ocr_limits_ip_zeit on public.ocr_limits (ip_hash, created_at);
create index if not exists ocr_limits_zeit on public.ocr_limits (created_at);
alter table public.ocr_limits enable row level security;
revoke all on public.ocr_limits from anon, authenticated;
grant select, insert, delete on public.ocr_limits to service_role;
-- Prüfen: select count(*) from public.ocr_limits;
