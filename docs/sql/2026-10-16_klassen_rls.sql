-- PLAN NRW · Mandantentrennung Klassen (16.10.2026)
-- OFFEN: im Supabase SQL-Editor ausfuehren (Projekt tpgverrpznsujvzbntmj).
-- Schliesst offene anon-Policies: bisher konnte jeder mit dem oeffentlichen App-Schluessel
-- alle Klassen, Mitglieder (inkl. E-Mails) und Aufgaben lesen, aendern und loeschen.
-- Die App nutzt diese Tabellen nur ueber api/klasse.js / api/admin-users.js (Service Role)
-- und Security-Definer-RPCs (klasse_stats, klasse_fehler, delete_my_account) -> keine Funktion faellt weg.
drop policy if exists klassen_insert on public.klassen;
drop policy if exists klassen_select on public.klassen;
drop policy if exists klassen_update on public.klassen;
drop policy if exists km_delete on public.klassen_mitglieder;
drop policy if exists km_insert on public.klassen_mitglieder;
drop policy if exists km_select on public.klassen_mitglieder;
drop policy if exists aufgaben_delete on public.aufgaben;
drop policy if exists aufgaben_insert on public.aufgaben;
drop policy if exists aufgaben_select on public.aufgaben;
drop policy if exists aufgaben_update on public.aufgaben;
alter table public.klassen enable row level security;
alter table public.klassen_mitglieder enable row level security;
alter table public.aufgaben enable row level security;
grant all on public.klassen, public.klassen_mitglieder, public.aufgaben to service_role;
-- Zusatz: klasse_stats ist bisher fuer jeden aufrufbar (Klassen-ID + Lehrkraft-Mail genuegen).
revoke all on function public.klasse_stats(uuid, text) from public, anon, authenticated;
grant execute on function public.klasse_stats(uuid, text) to service_role;
