# Datenbank-Backup & Wiederherstellung (PLAN NRW)

Stand 26.10.2026. Workflow: `.github/workflows/db-backup.yml` (täglich 02:43 UTC, manuell über „Run workflow“).

## Einrichtung (einmalig, P. Schenkelberger)
1. Supabase → Projekt → **Connect** → „Session pooler“ → URI kopieren, `[YOUR-PASSWORD]` durch das DB-Passwort ersetzen
   (vergessen? Project Settings → Database → Reset database password).
2. GitHub → Repo → Settings → Secrets and variables → Actions → **New repository secret**:
   - `SUPABASE_DB_URL` = die URI aus Schritt 1
   - `BACKUP_PASSWORT` = langes, eigenes Passwort – **zusätzlich offline notieren** (ohne es ist kein Backup lesbar)
3. Actions → `db-backup` → „Run workflow“ → grün = fertig.

## Backup holen
Actions → `db-backup` → letzter Lauf → Artefakt `plan-db-JJJJ-MM-TT` herunterladen (90 Tage aufbewahrt).

## Wiederherstellen (Notfall)
```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in plan-db-JJJJ-MM-TT.dump.enc -out plan.dump   # fragt BACKUP_PASSWORT
pg_restore -l plan.dump | head                                                                       # Inhalt prüfen
# In ein NEUES Supabase-Projekt (nie blind ins Live-Projekt):
pg_restore --no-owner --no-privileges --schema=public -d "<SESSION-POOLER-URI-NEUES-PROJEKT>" plan.dump
```
`auth`/`storage` nur bei Totalverlust zurückspielen (Supabase legt diese Schemas selbst an; Konflikte möglich). Danach in
Vercel `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE` und in `index.html` URL + anon-Key auf das neue Projekt umstellen.
