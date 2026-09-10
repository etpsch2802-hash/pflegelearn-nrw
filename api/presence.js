// /api/presence.js — Live-Nutzer-Uebersicht fuer den Admin.
// Auth wie /api/admin-users: POST { secret } gegen ADMIN_API_SECRET.
export default async function handler(req, res) {
  try {
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_ROLE;
    const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
    if (!SB_URL || !SB_KEY || !ADMIN_SECRET) return res.status(500).json({ ok: false, error: 'config' });
    const H = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };

    let secret = '';
    try { const b = (typeof req.body === 'string') ? JSON.parse(req.body || '{}') : (req.body || {}); secret = (b && b.secret) ? String(b.secret) : ''; } catch (e) {}
    if (!secret) secret = ((req.headers['x-admin-secret'] || '') + '');
    if (secret !== ADMIN_SECRET) return res.status(401).json({ ok: false, error: 'unauthorized' });

    // Aufraeumen: Eintraege aelter als 1 Tag loeschen
    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    try { await fetch(`${SB_URL}/rest/v1/presence?last_seen=lt.${encodeURIComponent(dayAgo)}`, { method: 'DELETE', headers: H }); } catch (e) {}

    // Aktive Nutzer: letzte 2 Minuten
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
