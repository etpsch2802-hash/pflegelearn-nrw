// PLAN NRW – Tester-Registrierung fuer die geschlossene Play-Store-Testphase.
// Route: /api/tester
//   GET                 -> { count, limit, full, remaining }
//   POST { email }       -> registriert einen Tester in public.leads (source='tester').
// Cap = 15 Tester (Google verlangt mind. 12 fuer 14 Tage; wir nehmen 15 als Puffer).
// Nutzt die bestehende leads-Tabelle (kein neues Schema noetig): Tester = leads mit source='tester'.
// Beruehrt NICHT: lead.js, chat.js, stripe-webhook.js.

const LIMIT = 15;

async function countTester(SB_URL, SB_SERVICE) {
  const r = await fetch(SB_URL + '/rest/v1/leads?source=eq.tester&select=email', {
    headers: {
      'apikey': SB_SERVICE,
      'Authorization': 'Bearer ' + SB_SERVICE,
      'Prefer': 'count=exact',
      'Range-Unit': 'items',
      'Range': '0-0'
    }
  });
  // Content-Range z. B. "0-0/7" oder "*/0" -> Zahl hinter dem Slash ist die Gesamtzahl.
  const cr = r.headers.get('content-range') || '';
  const m = cr.match(/\/(\d+)\s*$/);
  if (m) return parseInt(m[1], 10);
  // Fallback: volle Liste zaehlen
  try {
    const r2 = await fetch(SB_URL + '/rest/v1/leads?source=eq.tester&select=email', {
      headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE }
    });
    const a = await r2.json();
    return Array.isArray(a) ? a.length : 0;
  } catch (e) { return 0; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SB_URL || !SB_SERVICE) { res.status(500).json({ error: 'config' }); return; }

  // GET -> aktueller Stand (fuer Button-Sperre im Client)
  if (req.method === 'GET') {
    try {
      const count = await countTester(SB_URL, SB_SERVICE);
      res.status(200).json({ count, limit: LIMIT, full: count >= LIMIT, remaining: Math.max(0, LIMIT - count) });
    } catch (e) {
      console.error('[tester] count', e);
      res.status(500).json({ error: 'count' });
    }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};
  const email = (body.email ? String(body.email) : '').trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email) || email.length > 200) { res.status(400).json({ error: 'email' }); return; }

  try {
    // Cap pruefen (bei belegten Plaetzen keine Registrierung)
    const count = await countTester(SB_URL, SB_SERVICE);
    if (count >= LIMIT) { res.status(200).json({ full: true, count, limit: LIMIT }); return; }

    // Tester speichern
    const ins = await fetch(SB_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: {
        'apikey': SB_SERVICE,
        'Authorization': 'Bearer ' + SB_SERVICE,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email, source: 'tester' })
    });
    if (ins.status === 409) {
      // E-Mail existiert bereits (z. B. als Gratis-Lead) -> auf 'tester' hochstufen
      await fetch(SB_URL + '/rest/v1/leads?email=eq.' + encodeURIComponent(email), {
        method: 'PATCH',
        headers: {
          'apikey': SB_SERVICE,
          'Authorization': 'Bearer ' + SB_SERVICE,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ source: 'tester' })
      });
    } else if (!ins.ok) {
      const t = await ins.text();
      console.error('[tester] store', ins.status, t);
      res.status(500).json({ error: 'store', status: ins.status, detail: (t || '').slice(0, 200) });
      return;
    }

    const newCount = await countTester(SB_URL, SB_SERVICE);
    res.status(200).json({ ok: true, count: newCount, limit: LIMIT, remaining: Math.max(0, LIMIT - newCount) });
  } catch (e) {
    console.error('[tester] server', e);
    res.status(500).json({ error: 'server' });
  }
}
