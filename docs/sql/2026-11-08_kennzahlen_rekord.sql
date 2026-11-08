-- PLAN NRW · Rekord „Lernende an einem Tag“ (08.11.2026)
-- Von P. Schenkelberger im Supabase-SQL-Editor auszuführen.
-- app_nutzung wird nach 60 Tagen gelöscht – der Rekord bleibt hier dauerhaft und kann nur steigen.
-- Nur service_role (api/presence.js), keine Einzeldaten nach außen.

create table if not exists public.kennzahlen (
  schluessel   text primary key,
  wert         integer not null,
  datum        date,
  aktualisiert timestamptz not null default now()
);
alter table public.kennzahlen enable row level security;
revoke all on public.kennzahlen from anon, authenticated;
grant select, insert, update on public.kennzahlen to service_role;

create or replace function public.nutzung_rekord()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  k record;
begin
  select tag, count(distinct kennung)::int as n into m
    from app_nutzung group by tag order by n desc, tag asc limit 1;
  select wert, datum into k from kennzahlen where schluessel = 'rekord_tag';
  if m.n is not null and (k.wert is null or m.n > k.wert) then
    insert into kennzahlen (schluessel, wert, datum, aktualisiert)
      values ('rekord_tag', m.n, m.tag, now())
      on conflict (schluessel) do update set wert = excluded.wert, datum = excluded.datum, aktualisiert = now();
    return json_build_object('rekord', m.n, 'datum', m.tag);
  end if;
  return json_build_object('rekord', coalesce(k.wert, 0), 'datum', k.datum);
end
$$;
revoke all on function public.nutzung_rekord() from public, anon, authenticated;
grant execute on function public.nutzung_rekord() to service_role;

-- Prüfen:
-- select public.nutzung_rekord();
