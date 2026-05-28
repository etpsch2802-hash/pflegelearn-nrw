// PflegeLearn NRW – KI-Chat Backend (Vercel Serverless Function)
// Modell: Gemini 1.5 Flash | Route: /api/chat

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[chat.js] GEMINI_API_KEY fehlt in Vercel Environment Variables!');
    return res.status(500).json({ error: 'API-Key nicht konfiguriert. Bitte in Vercel → Settings → Environment Variables → GEMINI_API_KEY eintragen.' });
  }

  let messages, systemPrompt;
  try {
    ({ messages, systemPrompt } = req.body);
    if (!messages || !Array.isArray(messages)) throw new Error('messages fehlt oder kein Array');
  } catch (err) {
    return res.status(400).json({ error: 'Ungültiger Request-Body: ' + err.message });
  }

  // Frontend: [{role:'user'|'assistant', content:'...'}]
  // Gemini:   [{role:'user'|'model',      parts:[{text:'...'}]}]
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
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[chat.js] Gemini Fehler:', geminiRes.status, errText);
      return res.status(502).json({ error: `Gemini API ${geminiRes.status}`, detail: errText.slice(0, 300) });
    }

    const data = await geminiRes.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || null;

    if (!reply) {
      const safetyBlock = data?.promptFeedback?.blockReason;
      const finishReason = data?.candidates?.[0]?.finishReason;
      console.warn('[chat.js] Leere Antwort. finish:', finishReason, 'block:', safetyBlock);
      return res.status(200).json({
        reply: '⚠️ Keine Antwort vom KI-Modell. ' +
               (safetyBlock ? `Sicherheitsfilter: ${safetyBlock}.` : 'Bitte Frage umformulieren.'),
      });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('[chat.js] Fehler:', err);
    return res.status(500).json({ error: 'Serverfehler: ' + err.message });
  }
}
