// PflegeLearn NRW – KI-Chat Backend (Vercel Serverless Function)
// Modell: Groq (gpt-oss-120b) | Route: /api/chat

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY fehlt in Vercel Environment Variables!' });
  }

  let messages, systemPrompt;
  try {
    ({ messages, systemPrompt } = req.body);
    if (!messages || !Array.isArray(messages)) throw new Error('messages fehlt');
  } catch (err) {
    return res.status(400).json({ error: 'Ungültiger Request-Body: ' + err.message });
  }

  // Tageslimit (26.10.2026, Go P. Schenkelberger): schützt das Groq-Gratis-Kontingent.
  const lim = await kiLimit(req);
  if (!lim.ok) {
    return res.status(429).json({ limit: lim.grund, error: lim.grund === 'gesamt'
      ? 'Der KI-Assistent hat heute sehr viele Anfragen bekommen und macht bis morgen Pause. Quiz, Fälle und alle Inhalte funktionieren weiter.'
      : 'Du hast heute schon sehr viel mit dem KI-Assistenten gelernt. Morgen geht es weiter. Quiz, Fälle und alle Inhalte funktionieren weiter.' });
  }

  // Groq nutzt OpenAI-kompatibles Format
  const groqMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content || ''),
    })),
  ];

  const requestBody = {
    model: 'openai/gpt-oss-120b',
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 1024,
  };

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (groqRes.status === 429) {
      console.error('[chat.js] Groq-Kontingent erreicht (429)');
      return res.status(429).json({ limit: 'groq', error: 'Gerade fragen sehr viele gleichzeitig. Bitte in einer Minute noch einmal senden.' });
    }
    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('[chat.js] Groq Fehler:', groqRes.status, errText);
      return res.status(502).json({ error: `Groq API ${groqRes.status}: ${errText.slice(0, 200)}` });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content || null;

    if (!reply) {
      return res.status(200).json({ reply: '⚠️ Keine Antwort vom KI-Modell. Bitte erneut versuchen.' });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[chat.js] Fehler:', err);
    return res.status(500).json({ error: 'Serverfehler: ' + err.message });
  }
}

/* ---------- KI-Tageslimit (26.10.2026) ----------
   Je Gerät (Hash aus IP + Browser, täglich wechselnd, nicht umkehrbar) höchstens KI_PRO_GERAET Anfragen am Tag,
   insgesamt KI_GESAMT (unter dem Groq-Gratis-Limit von 1.000 Anfragen/Tag). Zählung per RPC ki_limit
   (docs/sql/2026-10-26_haertung_teil1.sql, nur service_role). Fällt die Zählung aus, wird nicht blockiert. */
const KI_PRO_GERAET = 60, KI_GESAMT = 900;
async function kiLimit(req) {
  const U = (process.env.SUPABASE_URL || '').replace(/\/+$/, ''), K = process.env.SUPABASE_SERVICE_ROLE;
  if (!U || !K) return { ok: true };
  try {
    const crypto = await import('node:crypto');
    const h = req.headers || {};
    const ip = String(h['x-forwarded-for'] || h['x-real-ip'] || '').split(',')[0].trim() || 'unbekannt';
    const tag = new Date().toISOString().slice(0, 10);
    const kennung = crypto.createHmac('sha256', K).update('ki|' + tag + '|' + ip + '|' + String(h['user-agent'] || '')).digest('hex').slice(0, 32);
    const r = await fetch(U + '/rest/v1/rpc/ki_limit', {
      method: 'POST',
      headers: { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_kennung: kennung, p_max_geraet: KI_PRO_GERAET, p_max_gesamt: KI_GESAMT }),
    });
    if (!r.ok) return { ok: true };
    const v = await r.json();
    return v === 'ok' ? { ok: true } : { ok: false, grund: v };
  } catch (e) { console.error('[chat.js] limit', e); return { ok: true }; }
}
