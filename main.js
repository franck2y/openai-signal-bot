const signalBox = document.getElementById("signal-box");
const btnAnalyser = document.getElementById("analyser-btn");
const pairSelector = document.getElementById("pair-selector");

btnAnalyser.addEventListener("click", async () => {
  const pair = pairSelector.value;

  signalBox.innerText = "Analyse en cours...";

  try {
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pair })
    });

    const data = await response.json();

    if (response.ok && data.signal && data.validity) {
      signalBox.innerText = `Signal IA: ${data.signal}\nValidité estimée: ${data.validity}`;
    } else {
      signalBox.innerText = "Réponse incomplète ou invalide de l'IA.";
    }
  } catch (err) {
    signalBox.innerText = "Erreur lors de l’analyse du signal.";
    console.error(err);
  }
});
