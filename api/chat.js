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
    let body = req.body || {};
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const messages = body.messages || [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API-Schlüssel fehlt im System' });
    }

    // Wir holen uns die letzte Nachricht ("copd") und bereinigen sie für Google
    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage ? (lastMessage.content || lastMessage.text || "") : "";

    if (!userPrompt) {
      return res.status(400).json({ error: 'Keine Nachricht empfangen' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const systemInstruction = body.systemPrompt || "Du bist ein hilfreicher Lernassistent.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemInstruction
      }
    });

    const aiText = await response.text();
    
    // HIER IST DIE WICHTIGE ÜBERGABE, DIE GEFEHLT HAT:
    return res.status(200).json({ reply: aiText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
