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

    // Wir holen uns die Frage aus der App (z.B. "copd")
    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage ? (lastMessage.content || lastMessage.text || "") : "";

    if (!userPrompt) {
      return res.status(400).json({ error: 'Keine Nachricht empfangen' });
    }

    const systemInstruction = body.systemPrompt || "Du bist ein hilfreicher Lernassistent.";

    // Wir rufen Gemini direkt über die Web-Schnittstelle auf – OHNE import-Bibliothek!
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: `Google API Fehler: ${errorText}` });
    }

    const data = await apiResponse.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Keine Antwort erhalten.";

    // Rückgabe an deine App
    return res.status(200).json({ reply: aiText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
