-- PLAN NRW – Datenbank-Härtung Teil 1 (26.10.2026) – rein HINZUFÜGEND, bricht nichts.
-- Im Supabase-SQL-Editor komplett ausführen. Danach App-Update abwarten (Vercel), dann Teil 2.
-- Inhalt: Admin-RPCs für Videos/Feedback/Push, Push-RPCs ohne admin-Flag, KI-Tageslimit,
-- ungenutzte RPCs sperren, search_path, doppelte Indizes.

-- 1) Videos nur noch über Admin-Passwort ändern
create or replace function public.admin_videos(p_admin text, p_aktion text, p_id bigint default null, p_row jsonb default null)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin_token(p_admin) then return json_build_object('ok',false,'err','kein admin'); end if;
  if p_aktion = 'list' then
    return json_build_object('ok',true,'data',coalesce((select json_agg(v order by v.created_at desc) from videos v),'[]'::json));
  elsif p_aktion = 'insert' then
    if coalesce(p_row->>'tiktok_url','') !~ '^https://' then return json_build_object('ok',false,'err','url ungueltig'); end if;
    insert into videos(kb_key,kb_name,fach,titel,tiktok_url,aktiv)
    values (left(p_row->>'kb_key',200), left(p_row->>'kb_name',200), left(p_row->>'fach',60), left(nullif(p_row->>'titel',''),200), left(p_row->>'tiktok_url',500), true);
    return json_build_object('ok',true);
  elsif p_aktion = 'aktiv' then
    update videos set aktiv = coalesce((p_row->>'aktiv')::boolean,false) where id = p_id;
    return json_build_object('ok',found);
  elsif p_aktion = 'delete' then
    delete from videos where id = p_id;
    return json_build_object('ok',found);
  end if;
  return json_build_object('ok',false,'err','aktion unbekannt');
end $$;

-- 2) Fragen-Meldungen (enthalten Nutzernamen) nur für Admin lesbar/änderbar
create or replace function public.admin_feedback(p_admin text, p_aktion text, p_id bigint default null, p_status text default null)
returns json language plpgsql security definer set search_path = public as $$
begin
  if not _is_admin_token(p_admin) then return json_build_object('ok',false,'err','kein admin'); end if;
  if p_aktion = 'list' then
    return json_build_object('ok',true,'data',coalesce((select json_agg(f) from (
      select id,kategorie,frage,grund,kommentar,nutzer,status,created_at from fragen_feedback
      where status = coalesce(p_status,'offen') order by created_at desc limit 100) f),'[]'::json));
  elsif p_aktion = 'count' then
    return json_build_object('ok',true,'count',(select count(*) from fragen_feedback where status='offen'));
  elsif p_aktion = 'status' then
    if p_status not in ('offen','geprueft') then return json_build_object('ok',false,'err','status ungueltig'); end if;
    update fragen_feedback set status = p_status where id = p_id;
    return json_build_object('ok',found);
  end if;
  return json_build_object('ok',false,'err','aktion unbekannt');
end $$;

-- 3) Push: eigenes Abo speichern/löschen nur mit dem (langen, geheimen) Endpoint; admin-Flag nur mit Admin-Passwort
create or replace function public.push_save(p_endpoint text, p_sub jsonb, p_name text default null, p_examen date default null)
returns json language plpgsql security definer set search_path = public as $$
begin
  if p_endpoint is null or p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then return json_build_object('ok',false,'err','endpoint ungueltig'); end if;
  insert into push_subs(endpoint, sub, name, examen_datum, updated_at)
  values (p_endpoint, p_sub, left(p_name,80), p_examen, now())
  on conflict (endpoint) do update set sub = excluded.sub, name = excluded.name, examen_datum = excluded.examen_datum, updated_at = now();
  return json_build_object('ok',true);
end $$;

create or replace function public.push_delete(p_endpoint text)
returns json language sql security definer set search_path = public as $$
  with d as (delete from push_subs where endpoint = p_endpoint returning 1) select json_build_object('ok',(select count(*) from d) > 0);
$$;

create or replace function public.push_admin(p_admin text, p_endpoint text, p_on boolean default null)
returns json language plpgsql security definer set search_path = public as $$
declare v boolean;
begin
  if not _is_admin_token(p_admin) then return json_build_object('ok',false,'err','kein admin'); end if;
  if p_on is not null then update push_subs set admin = p_on where endpoint = p_endpoint; end if;
  select admin into v from push_subs where endpoint = p_endpoint;
  return json_build_object('ok',true,'admin',coalesce(v,false));
end $$;

revoke all on function public.admin_videos(text,text,bigint,jsonb), public.admin_feedback(text,text,bigint,text),
  public.push_save(text,jsonb,text,date), public.push_delete(text), public.push_admin(text,text,boolean) from public;
grant execute on function public.admin_videos(text,text,bigint,jsonb), public.admin_feedback(text,text,bigint,text),
  public.push_save(text,jsonb,text,date), public.push_delete(text), public.push_admin(text,text,boolean) to anon, authenticated, service_role;

-- 4) KI-Tageslimit für /api/chat (Groq-Gratis-Kontingent schützen). Nur service_role.
--    Gespeichert wird nur ein nicht umkehrbarer Hash (IP + Browser, täglich wechselnd) und das Datum.
create table if not exists public.ki_limits (
  id bigint generated always as identity primary key,
  kennung text not null,
  tag date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists ki_limits_tag_kennung on public.ki_limits (tag, kennung);
alter table public.ki_limits enable row level security;
revoke all on public.ki_limits from anon, authenticated;
grant select, insert, delete on public.ki_limits to service_role;

-- Ein Aufruf = zählen + eintragen. Rückgabe: 'ok' | 'geraet' | 'gesamt'
create or replace function public.ki_limit(p_kennung text, p_max_geraet int, p_max_gesamt int)
returns text language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from ki_limits where tag = current_date and kennung = p_kennung) >= p_max_geraet then return 'geraet'; end if;
  if (select count(*) from ki_limits where tag = current_date) >= p_max_gesamt then return 'gesamt'; end if;
  insert into ki_limits(kennung) values (left(p_kennung,64));
  if random() < 0.02 then delete from ki_limits where tag < current_date - 2; end if;
  return 'ok';
end $$;
revoke all on function public.ki_limit(text,int,int) from public, anon, authenticated;
grant execute on function public.ki_limit(text,int,int) to service_role;

-- 5) Ungenutzte bzw. nur serverseitige Funktionen sperren
revoke execute on function public.get_lerntisch(), public.get_lerntisch_seats(text), public.lerntisch_start(text,text),
  public.lerntisch_start2(text,text,text), public.handle_new_user(), public.rls_auto_enable(), public.uid_by_email(text)
  from public, anon, authenticated;
grant execute on function public.uid_by_email(text) to service_role;
revoke execute on function public.delete_my_account(boolean), public.get_app_stats() from public, anon;

-- 6) search_path festlegen, doppelte Indizes entfernen
alter function public._chk_key(text) set search_path = '';
alter function public._rand_code(integer) set search_path = '';
drop index if exists public.idx_tokens_confirm_code;
alter table public.lerninhalte drop constraint if exists lerninhalte_slug_unique;

-- Prüfen: select public.ki_limit('test', 5, 10);  -- erwartet 'ok'
--         delete from public.ki_limits where kennung = 'test';
