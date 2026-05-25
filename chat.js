// api/chat.js – Vercel Serverless Function (Node.js 18+)
// Kein Import nötig – fetch ist built-in

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages fehlt' });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: 'API Key fehlt' });

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    // Nachrichten formatieren
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }]
    }));

    const requestBody = { contents, generationConfig: { temperature: 0.7, maxOutputTokens: 800 } };
    if (systemPrompt) requestBody.system_instruction = { parts: [{ text: systemPrompt }] };

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini Fehler:', data);
      return res.status(502).json({ error: data?.error?.message || 'Gemini Fehler' });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(502).json({ error: 'Keine Antwort von Gemini' });

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Server Fehler:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
