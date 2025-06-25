// /api/openai.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { pair, timeframe } = req.body;

  if (!pair || !timeframe) {
    return res.status(400).json({ error: 'Paire et timeframe requis' });
  }

  try {
    // 👉 Exemple simple d'appel vers OpenAI (modèle GPT)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant de trading binaire.",
          },
          {
            role: "user",
            content: `Analyse la paire ${pair} sur un laps de temps ${timeframe} et dis-moi si le signal est UP ou DOWN uniquement.`,
          },
        ],
        max_tokens: 10,
      }),
    });

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content?.toUpperCase();

    // Nettoyage du texte de l'IA (extraction du signal UP/DOWN)
    const signal = message.includes("UP")
      ? "UP"
      : message.includes("DOWN")
      ? "DOWN"
      : "NEUTRE";

    return res.status(200).json({ signal });
  } catch (err) {
    console.error("Erreur OpenAI:", err);
    return res.status(500).json({ error: "Erreur de génération de signal" });
  }
}
