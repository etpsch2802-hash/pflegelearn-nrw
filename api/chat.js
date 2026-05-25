import { GoogleGenAI } from 'https://esm.sh/@google/genai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

 try {
    // Falls req.body als String ankommt, parsen wir ihn sicher
    let body = req.body || {};
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const messages = body.messages;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API-Schlüssel fehlt im System' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    c// Wir holen uns den System-Prompt aus dem Frontend-Request, falls vorhanden
    const systemInstruction = body.systemPrompt || "Du bist ein hilfreicher Lernassistent.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemInstruction
      }
    });

    // WICHTIG: Das 'await' vor response.text() fängt die Antwort sauber ab
    const aiText = await response.text();

    // Übergabe im exakten Format, das dein Frontend erwartet
    return res.status(200).json({ reply: aiText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
