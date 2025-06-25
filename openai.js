// api/openai.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const candles = req.body.candles;

  const systemPrompt = `
Tu es un assistant de trading pour les options binaires.
Analyse les 10 dernières bougies fournies. Chaque bougie a une ouverture (open) et une fermeture (close).
Si les deux dernières bougies montrent une tendance claire (haussière ou baissière), répond simplement par :
"UP" si la tendance est haussière,
"DOWN" si la tendance est baissière,
Sinon, répond "NO TRADE".
Ne donne rien d'autre que le signal.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(candles) }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0
      })
    });

    const result = await response.json();
    const signal = result.choices?.[0]?.message?.content?.trim() || 'NO SIGNAL';
    return res.status(200).json({ signal });
  } catch (error) {
    console.error('Erreur API OpenAI :', error);
    return res.status(500).json({ error: 'Erreur lors de l’appel à OpenAI' });
  }
}
