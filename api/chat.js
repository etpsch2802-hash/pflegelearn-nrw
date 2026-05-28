// PflegeLearn NRW – KI-Chat Backend (Vercel Serverless Function)
// Modell: Groq (llama-3.3-70b) | Route: /api/chat

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

  // Groq nutzt OpenAI-kompatibles Format
  const groqMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content || ''),
    })),
  ];

  const requestBody = {
    model: 'llama-3.3-70b-versatile',
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
