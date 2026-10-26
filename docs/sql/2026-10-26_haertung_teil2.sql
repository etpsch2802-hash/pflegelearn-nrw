-- PLAN NRW – Datenbank-Härtung Teil 2 (26.10.2026)
-- ERST AUSFÜHREN, wenn Teil 1 gelaufen UND das App-Update (Commit „fix(sicherheit)…“) live ist.
-- Entfernt die offenen Tabellenrechte; App und Workflows nutzen danach nur noch RPCs bzw. service_role.

-- Videos: Lesen bleibt öffentlich (Links in der App), Schreiben nur noch über admin_videos()
drop policy if exists videos_write on public.videos;

-- Fragen-Meldungen: Einreichen bleibt offen, Lesen/Ändern nur über admin_feedback()
drop policy if exists ff_select on public.fragen_feedback;
drop policy if exists ff_update on public.fragen_feedback;

-- Push-Abos: kein direkter Tabellenzugriff mehr (push_save / push_delete / push_admin)
drop policy if exists anon_push_select on public.push_subs;
drop policy if exists push_subs_select on public.push_subs;
drop policy if exists push_subs_update on public.push_subs;
drop policy if exists push_subs_delete on public.push_subs;
drop policy if exists anon_push_insert on public.push_subs;
drop policy if exists push_subs_insert on public.push_subs;
drop policy if exists authenticated_push on public.push_subs;

-- Prüfen (erwartet nur noch videos_read, ff_insert):
-- select tablename, policyname, cmd from pg_policies where tablename in ('videos','fragen_feedback','push_subs');
