-- Nutzungszähler (21.10.2026): Tageskennung pro Gerät, nur service_role (api/presence.js). Eine Zeile pro Befehl ausführen.
create table if not exists public.app_nutzung (tag date not null, kennung text not null, modus text not null, angemeldet boolean not null default false, primary key (tag, kennung, modus));
alter table public.app_nutzung enable row level security;
revoke all on public.app_nutzung from anon, authenticated;
grant all on public.app_nutzung to service_role;
