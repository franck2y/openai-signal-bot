// main.js

const signalBox = document.getElementById("signal-box"); const btnAnalyser = document.getElementById("analyser-btn"); const pairSelector = document.getElementById("pair-selector");

btnAnalyser.addEventListener("click", async () => { const pair = pairSelector.value;

signalBox.innerHTML = "<span class='text-gray-400'>Analyse en cours...</span>";

try { const response = await fetch("/api/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pair }) });

const data = await response.json();

if (response.ok && data.signal && data.validity) {
  let color = "text-white";
  if (data.signal === "UP") color = "text-green-400";
  else if (data.signal === "DOWN") color = "text-red-400";
  else if (data.signal === "NO TRADE") color = "text-yellow-400";

  signalBox.innerHTML = `<div class='\${color}'>📈 Signal IA: <strong>\${data.signal}</strong><br>⏱️ Validité estimée: \${data.validity}</div>`;
} else {
  signalBox.innerHTML = "<span class='text-red-400'>Réponse incomplète ou invalide de l'IA.</span>";
}

await afficherGraphique(pair);

} catch (err) { signalBox.innerHTML = "<span class='text-red-500'>Erreur lors de l’analyse du signal.</span>"; console.error(err); } });

async function afficherGraphique(pair) { const [from, to] = pair.split('/'); const res = await fetch(https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${from}&to_symbol=${to}&interval=1min&outputsize=compact&apikey=6XLTMJEEILYL1VE3); const data = await res.json(); const series = data["Time Series FX (1min)"]; if (!series) return;

const candles = Object.entries(series).slice(0, 50).reverse().map(([time, ohlc]) => ({ x: new Date(time), y: [ parseFloat(ohlc["1. open"]), parseFloat(ohlc["2. high"]), parseFloat(ohlc["3. low"]), parseFloat(ohlc["4. close"]) ] }));

const options = { chart: { type: 'candlestick', height: 350 }, title: { text: Graphique ${pair} (1 min), align: 'left' }, xaxis: { type: 'datetime' }, yaxis: { tooltip: { enabled: true } }, series: [{ data: candles }] };

document.querySelector("#chart").innerHTML = ""; const chart = new ApexCharts(document.querySelector("#chart"), options); chart.render(); }

