// /api/presence.js — Live-Nutzer-Uebersicht fuer den Admin.
// Auth: Admin-Secret (ADMIN_API_SECRET) via Header x-admin-secret ODER Body { secret }.
export default async function handler(req, res) {
  try {
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_ROLE;
    const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
    if (!SB_URL || !SB_KEY || !ADMIN_SECRET) return res.status(500).json({ ok: false, error: 'config' });
    const H = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };

    // Secret robust: zuerst Header, dann Query, dann Body (String/Objekt)
    let secret = (req.headers['x-admin-secret'] || (req.query && req.query.secret) || '') + '';
    if (!secret) {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
      secret = (body && body.secret) ? String(body.secret) : '';
    }
    secret = secret.trim();
    if (secret !== String(ADMIN_SECRET).trim()) {
      return res.status(401).json({ ok: false, error: 'unauthorized', got: secret.length, exp: String(ADMIN_SECRET).trim().length });
    }

    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    try { await fetch(`${SB_URL}/rest/v1/presence?last_seen=lt.${encodeURIComponent(dayAgo)}`, { method: 'DELETE', headers: H }); } catch (e) {}

    const twoMinAgo = new Date(Date.now() - 120000).toISOString();
    const pv = await fetch(`${SB_URL}/rest/v1/presence?last_seen=gt.${encodeURIComponent(twoMinAgo)}&select=name,email,screen,last_seen&order=last_seen.desc`, { headers: H });
    const rows = await pv.json();
    const now = Date.now();
    const users = (Array.isArray(rows) ? rows : []).map(r => ({
      name: r.name || 'Gast', email: r.email || '', screen: r.screen || '',
      secondsAgo: Math.max(0, Math.round((now - new Date(r.last_seen).getTime()) / 1000))
    }));
    return res.status(200).json({ ok: true, count: users.length, users, ts: now });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String((e && e.message) || e) });
  }
}
