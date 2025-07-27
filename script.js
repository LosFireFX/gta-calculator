// ---------------------------
// 📦 Données des butins secondaires
// ---------------------------
const secondaryTargets = {
  gold: { label: "Or", value: 330000, weight: 0.667 },
  art: { label: "Tableaux", value: 170000, weight: 0.5 },
  cocaine: { label: "Cocaïne", value: 200000, weight: 0.5 },
  cannabis: { label: "Cannabis", value: 133000, weight: 0.375 },
  argent: { label: "Argent", value: 81000, weight: 0.25 }
};

// 🎯 Valeurs principales
const primaryTargets = {
  panthere: { normal: 1900000, hard: 2090000 },
  diamond: { normal: 1300000, hard: 1430000 },
  bond_porteur: { normal: 770000, hard: 847000 },
  rubis: { normal: 700000, hard: 770000 },
  tequila: { normal: 630000, hard: 693000 },
  madrazo: { normal: 1100000, hard: 1210000 }
};

// ---------------------------
// 🔧 Utilitaires
// ---------------------------
function getAvailableStacks() {
  let stocks = {};
  for (let key in secondaryTargets) {
    const input = document.getElementById(key);
    if (!input) continue;
    stocks[key] = parseFloat(input.value) || 0;
  }
  return stocks;
}

function fillOneBag(stocks) {
  let capacity = 1; // 100% du sac
  let gain = 0;
  let details = [];

  // Trier par ratio valeur/poids
  const sorted = Object.entries(secondaryTargets)
    .map(([k, v]) => ({ key: k, ...v, ratio: v.value / v.weight }))
    .sort((a, b) => b.ratio - a.ratio);

  for (let item of sorted) {
    if (capacity <= 0) break;
    let available = stocks[item.key];
    if (available <= 0) continue;

    let maxCanTake = capacity / item.weight;
    let take = Math.min(available, maxCanTake);

    if (take > 0) {
      const poidsUtilisé = take * item.weight;
      const pourcent = (poidsUtilisé / 1) * 100;
      details.push(`${item.label} (${take.toFixed(2)}, ${pourcent.toFixed(0)}%)`);
      gain += take * item.value;
      capacity -= take * item.weight;
      stocks[item.key] -= take;
    }
  }

  return { gain, details };
}

function getPrimaryValue() {
  const select = document.querySelector('select[name="principal"]');
  const hard = document.getElementById("difficileMod")?.checked;
  const data = primaryTargets[select.value];
  return hard ? data.hard : data.normal;
}

// ---------------------------
// 🚀 Calcul principal
// ---------------------------
document.getElementById("calculBtn").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ""; // reset affichage

  // 💎 Valeur principale
  const primaryValue = getPrimaryValue();

  // 📦 Stocks secondaires
  let stocks = getAvailableStacks();

  // 👥 Joueurs actifs
  let joueurs = [];
  for (let i = 1; i <= 4; i++) {
    const active = document.getElementById(`player${i}_active`).checked;
    if (active) joueurs.push({ id: i });
  }
  if (joueurs.length === 0) joueurs.push({ id: 1 }); // solo par défaut

  // 💰 Remplir les sacs
  let totalSecondaires = 0;
  joueurs.forEach((j) => {
    const { gain, details } = fillOneBag(stocks);
    j.gainSecondaires = gain;
    j.details = details;
    totalSecondaires += gain;
  });

  // 💰 Total (principal + secondaires)
  let total = primaryValue + totalSecondaires;

  // 🧾 Retirer la part PNJ (Madrazo/Lester)
  const fraisPNJ = total * 0.10;
  total -= fraisPNJ;

  // 📌 Vérifier si la checkbox "retirer frais de préparation" est cochée
  const prepCheckbox = document.getElementById("prepFrais"); // ajoute-la dans ton HTML
  if (prepCheckbox && prepCheckbox.checked) {
    // exemple : frais fixes de 25 000
    total -= 25000;
  }

  // 🔥 Affichage
  let html = `<h2>💰 Résultats</h2>
  <p><strong>Total butin après PNJ/frais :</strong> ${total.toLocaleString()} $<br>
  (dont principal : ${primaryValue.toLocaleString()} $)</p>`;

  joueurs.forEach((j) => {
    const pctInput = document.getElementById(`player${j.id}_pct`);
    const pct = parseFloat(pctInput?.value) || 100 / joueurs.length;
    const gainPart = (total * pct) / 100;

    html += `<p>🎒 Joueur ${j.id} : <strong>${gainPart.toLocaleString()} $</strong> (${pct}%)
    <br><em>Sac : ${j.details.length ? j.details.join(", ") : "Rien"}</em></p>`;
  });

  resultDiv.innerHTML = html;
});
