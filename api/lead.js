// PLAN NRW – Lead-Erfassung (Gratis-Eselsbruecken) -> Supabase
// Route: /api/lead
// Speichert serverseitig mit SUPABASE_SERVICE_ROLE in public.leads (umgeht RLS).
// Beruehrt NICHT: chat.js, vercel.json, Stripe-Button, stripe-webhook.js.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SB_URL || !SB_SERVICE) { res.status(500).json({ error: 'config', hasUrl: !!SB_URL, hasKey: !!SB_SERVICE }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const email = (body.email ? String(body.email) : '').trim().toLowerCase();
  const source = (body.source ? String(body.source) : 'gratis').slice(0, 60);

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email) || email.length > 200) { res.status(400).json({ error: 'email' }); return; }

  try {
    const r = await fetch(SB_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE,
        'Authorization': 'Bearer ' + SB_SERVICE,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email, source })
    });
    if (r.ok || r.status === 409) {
      res.status(200).json({ ok: true });
      return;
    }
    const t = await r.text();
    console.error('[lead] supabase', r.status, t);
    res.status(500).json({ error: 'store', status: r.status, detail: (t || '').slice(0, 400) });
  } catch (e) {
    console.error('[lead]', e);
    res.status(500).json({ error: 'server', detail: String(e && e.message || e).slice(0, 300) });
  }
}
