// PflegeLearn NRW – KI-Chat Backend (Vercel Serverless Function)
// Modell: Gemini 2.0 Flash | Route: /api/chat

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY fehlt in Vercel Environment Variables!' });
  }

  let messages, systemPrompt;
  try {
    ({ messages, systemPrompt } = req.body);
    if (!messages || !Array.isArray(messages)) throw new Error('messages fehlt oder kein Array');
  } catch (err) {
    return res.status(400).json({ error: 'Ungültiger Request-Body: ' + err.message });
  }

  // role-mapping: assistant → model
  const geminiContents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(msg.content || '') }],
  }));

  const requestBody = {
    ...(systemPrompt && { system_instruction: { parts: [{ text: systemPrompt }] } }),
    contents: geminiContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  // Versuche nacheinander: 2.0 Flash → 1.5 Flash → 1.5 Pro
  const MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
  ];

  let lastError = '';
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        lastError = `${model}: HTTP ${geminiRes.status}`;
        console.warn(`[chat.js] ${lastError}`, errText.slice(0, 200));
        continue; // nächstes Modell versuchen
      }

      const data = await geminiRes.json();
      const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || null;

      if (!reply) {
        const reason = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason || 'unbekannt';
        lastError = `${model}: Leere Antwort (${reason})`;
        continue;
      }

      console.log(`[chat.js] Erfolg mit Modell: ${model}`);
      return res.status(200).json({ reply, model });

    } catch (err) {
      lastError = `${model}: ${err.message}`;
      console.error(`[chat.js] Fetch-Fehler bei ${model}:`, err.message);
      continue;
    }
  }

  // Alle Modelle fehlgeschlagen
  return res.status(502).json({ error: 'Alle Gemini-Modelle fehlgeschlagen: ' + lastError });
}
