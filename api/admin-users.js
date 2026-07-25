// PLAN NRW – Admin: Liste der registrierten Nutzer (E-Mail, Registrierdatum, Newsletter).
// Route: /api/admin-users
//   POST { secret }  -> { count, users:[{email, created_at, newsletter, last_sign_in}] }
//
// Sicherheit:
// - Liest auth.users NUR mit dem Service-Role-Key, der serverseitig in der Env liegt.
//   Der Key verlaesst den Server nie. Der Client bekommt ausschliesslich die Liste.
// - Zugriff nur mit korrektem Admin-Secret (Env ADMIN_API_SECRET). Ohne Secret: 401.
//   Das verhindert, dass jemand die Route einfach aufruft und alle E-Mails abzieht.
//
// Env-Variablen (bestehende Namen des Projekts wiederverwendet):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE  (schon gesetzt, von tester.js/lead.js genutzt)
//   ADMIN_API_SECRET                     (NEU – muss in Vercel gesetzt werden)
//
// Beruehrt NICHT: chat.js, stripe-webhook.js, lead.js, tester.js.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  // GET -> Diagnose: welche Env-Variablen sind vorhanden? (nur Ja/Nein, nie die Werte)
  if (req.method === 'GET') {
    res.status(200).json({
      diag: true,
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
      has_ADMIN_API_SECRET: !!process.env.ADMIN_API_SECRET,
      url_prefix: (process.env.SUPABASE_URL || '').slice(0, 12)
    });
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
  if (!SB_URL || !SB_SERVICE || !ADMIN_SECRET) {
    const fehlt = [];
    if (!SB_URL) fehlt.push('SUPABASE_URL');
    if (!SB_SERVICE) fehlt.push('SUPABASE_SERVICE_ROLE');
    if (!ADMIN_SECRET) fehlt.push('ADMIN_API_SECRET');
    res.status(500).json({ error: 'config', fehlt: fehlt });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const secret = body && body.secret ? String(body.secret) : '';

  // Konstanter Zeitvergleich waere ideal; bei einem einzelnen Secret genuegt der direkte Vergleich.
  if (secret !== ADMIN_SECRET) { res.status(401).json({ error: 'unauthorized' }); return; }

  try {
    // Admin-Endpoint der GoTrue-API: /auth/v1/admin/users (nur mit Service-Role erreichbar).
    // Paginierung: bis zu 5 Seiten a 200 -> max. 1000 Nutzer. Fuer mehr spaeter erweitern.
    const perPage = 200;
    let page = 1;
    const all = [];
    for (; page <= 5; page++) {
      const r = await fetch(SB_URL + '/auth/v1/admin/users?page=' + page + '&per_page=' + perPage, {
        headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE }
      });
      if (!r.ok) {
        const t = await r.text();
        res.status(502).json({ error: 'supabase', status: r.status, detail: t.slice(0, 200) });
        return;
      }
      const data = await r.json();
      const users = Array.isArray(data) ? data : (data.users || []);
      if (!users.length) break;
      for (const u of users) {
        const meta = u.user_metadata || {};
        all.push({
          email: u.email || '',
          created_at: u.created_at || '',
          last_sign_in: u.last_sign_in_at || '',
          confirmed: !!(u.email_confirmed_at || u.confirmed_at),
          // Newsletter-Einwilligung wird beim Login in user_metadata.newsletter abgelegt.
          newsletter: meta.newsletter === true
        });
      }
      if (users.length < perPage) break;
    }

    // Neueste zuerst
    all.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    res.status(200).json({
      count: all.length,
      newsletter_count: all.filter(u => u.newsletter).length,
      users: all
    });
  } catch (e) {
    console.error('[admin-users]', e);
    res.status(500).json({ error: 'server' });
  }
}
