export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { pair } = req.body;
  if (!pair) return res.status(400).json({ error: 'Paire requise' });

  const from = pair.split('/')[0];
  const to = pair.split('/')[1];

  try {
    const avRes = await fetch(`https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${from}&to_symbol=${to}&interval=1min&apikey=${process.env.ALPHA_VANTAGE_KEY}`);
    const avData = await avRes.json();
    const series = avData["Time Series FX (1min)"];
    if (!series) return res.status(500).json({ error: 'Données non trouvées' });

    const candles = Object.entries(series)
      .slice(0, 2)
      .reverse()
      .map(([time, values]) => ({
        time,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
      }));

    const prompt = `Tu es un assistant de trading pour les options binaires.
Voici les deux dernières bougies M1 :
${JSON.stringify(candles)}

Analyse-les et réponds avec :
{"signal": "UP ou DOWN ou NO TRADE", "validity": "durée en minutes"}`;

    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu analyses des bougies de trading." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5
      })
    });

    const aiData = await openAIRes.json();
    const message = aiData?.choices?.[0]?.message?.content;

    const result = JSON.parse(message);
    return res.status(200).json(result);

  } catch (err) {
    console.error("Erreur API:", err);
    return res.status(500).json({ error: 'Erreur serveur ou analyse AI' });
  }
}
