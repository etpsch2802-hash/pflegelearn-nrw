// PLAN NRW – Bestaetigung des Zugangs (Double-Opt-In), Schritt 2.
// Route: POST /api/confirm  { code }
//   Aktiviert den zum Code gehoerenden Trial-Token (aktiv=true) und gibt
//   { token, name } zurueck, damit die App den Nutzer direkt einloggen kann.
//   Idempotent: erneuter Klick liefert denselben Token.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE (bereits gesetzt).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SB_URL || !SB_SERVICE) { res.status(500).json({ error: 'config' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const code = (body && body.code ? String(body.code) : '').trim();
  if (!code || code.length < 10 || code.length > 64) { res.status(400).json({ error: 'code' }); return; }

  const H = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE };

  try {
    const q = await fetch(SB_URL + '/rest/v1/tokens?confirm_code=eq.' + encodeURIComponent(code) + '&select=token,name&limit=1', { headers: H });
    if (!q.ok) { res.status(502).json({ error: 'db' }); return; }
    const rows = await q.json();
    if (!Array.isArray(rows) || !rows.length) { res.status(404).json({ error: 'notfound' }); return; }
    const row = rows[0];

    const up = await fetch(SB_URL + '/rest/v1/tokens?confirm_code=eq.' + encodeURIComponent(code), {
      method: 'PATCH',
      headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ aktiv: true })
    });
    if (!up.ok) { const t = await up.text(); console.error('[confirm] update', up.status, t); res.status(502).json({ error: 'update' }); return; }

    res.status(200).json({ ok: true, token: row.token, name: row.name });
  } catch (e) {
    console.error('[confirm] server', e);
    res.status(500).json({ error: 'server' });
  }
}
