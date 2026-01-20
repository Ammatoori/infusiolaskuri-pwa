// -----------------------------
// 1. Чтение таблицы laakelista
// -----------------------------
function loadLaakelista() {
  const rows = document.querySelectorAll("#laakelista tr");
  const data = {};

  rows.forEach(r => {
    const c = r.querySelectorAll("td");
    const name = c[0].textContent.trim();
    const conc = parseFloat(c[1].textContent.trim());
    const unit = c[2].textContent.trim(); // mg/ml или µg/ml
    const info = c[3].textContent.trim();

    data[name] = {
      conc: conc,
      unit: unit.includes("mg") ? "mg" : "ug",
      info: info
    };
  });

  return data;
}

const drugs = loadLaakelista();


// -----------------------------
// 2. Элементы
// -----------------------------
const drugSelect = document.getElementById("drug");
const concDisplay = document.getElementById("concDisplay");

const weightEl = document.getElementById("weight");
const rateEl = document.getElementById("rate");
const doseInput = document.getElementById("doseInput");
const doseUnitCell = document.getElementById("doseUnitCell");

const mgHEl = document.getElementById("mgH");
const mlHEl = document.getElementById("mlH");
const mgKgHEl = document.getElementById("mgKgH");
const ugKgHEl = document.getElementById("ugKgH");
const ugKgMinEl = document.getElementById("ugKgMin");

const doseWarningEl = document.getElementById("doseWarning");
const doseInfoEl = document.getElementById("doseInfo");


// -----------------------------
// 3. Заполнение списка препаратов
// -----------------------------
Object.keys(drugs).forEach(name => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  drugSelect.appendChild(opt);
});


// -----------------------------
// 4. Выбор препарата
// -----------------------------
drugSelect.addEventListener("change", () => {
  const d = drugs[drugSelect.value];

  // очистка полей (кроме веса)
  doseInput.value = "";
  rateEl.value = "";
  doseInput.disabled = false;
  rateEl.disabled = false;

  // очистка результатов
  clearOutputs();

  doseWarningEl.textContent = "";
  concDisplay.textContent = "";
  doseInfoEl.textContent = "";

  if (!d) return;

  // обновление концентрации и рекомендаций
  concDisplay.textContent = `${d.conc} ${d.unit === "mg" ? "mg/ml" : "µg/ml"}`;
  doseInfoEl.textContent = d.info;

  // правильная единица дозы
  doseUnitCell.textContent = d.unit === "mg" ? "mg/kg/h" : "µg/kg/min";
});

// -----------------------------
// 5. Блокировка полей
// -----------------------------
rateEl.addEventListener("input", () => {
  doseInput.disabled = rateEl.value !== "";
  recalc();
});

doseInput.addEventListener("input", () => {
  rateEl.disabled = doseInput.value !== "";
  recalc();
});

weightEl.addEventListener("input", recalc);


// -----------------------------
// 6. Расчёт
// -----------------------------
function clearOutputs() {
  mgHEl.textContent = "";
  mlHEl.textContent = "";
  mgKgHEl.textContent = "";
  ugKgHEl.textContent = "";
  ugKgMinEl.textContent = "";
  doseWarningEl.textContent = "";
}

function applyWarning(drug, mgPerKgH, ugPerKgMin) {
  let high = false;
  if (drug.unit === "mg" && mgPerKgH > 20) high = true;
  if (drug.unit === "ug" && ugPerKgMin > 1.0) high = true;
  doseWarningEl.textContent = high ? "Korkea annos!" : "";
}

function recalc() {
  clearOutputs();

  const d = drugs[drugSelect.value];
  if (!d) return;

  const w = parseFloat(weightEl.value);
  if (!w || w <= 0) return;

  const rate = rateEl.value ? parseFloat(rateEl.value) : null;
  const dose = doseInput.value ? parseFloat(doseInput.value) : null;

  if (!rate && !dose) return;

  let mgPerH = 0, mlPerH = 0, mgPerKgH = 0, ugPerKgH = 0, ugPerKgMin = 0;

  // 1) скорость
  if (rate) {
    mlPerH = rate;

    if (d.unit === "mg") {
      mgPerH = mlPerH * d.conc;
      mgPerKgH = mgPerH / w;
      ugPerKgH = mgPerKgH * 1000;
      ugPerKgMin = ugPerKgH / 60;
    } else {
      const ugPerH = mlPerH * d.conc;
      ugPerKgH = ugPerH / w;
      ugPerKgMin = ugPerKgH / 60;
      mgPerKgH = ugPerKgH / 1000;
      mgPerH = mgPerKgH * w;
    }
  }

  // 2) доза mg/kg/h
  if (!rate && dose && d.unit === "mg") {
    mgPerKgH = dose;
    mgPerH = mgPerKgH * w;
    ugPerKgH = mgPerKgH * 1000;
    ugPerKgMin = ugPerKgH / 60;
    mlPerH = mgPerH / d.conc;
  }

  // 3) доза µg/kg/min
  if (!rate && dose && d.unit === "ug") {
    ugPerKgMin = dose;
    ugPerKgH = ugPerKgMin * 60;
    mgPerKgH = ugPerKgH / 1000;
    mgPerH = mgPerKgH * w;
    mlPerH = (ugPerKgH * w) / d.conc;
  }

  mgHEl.textContent = mgPerH.toFixed(3);
  mlHEl.textContent = mlPerH.toFixed(3);
  mgKgHEl.textContent = mgPerKgH.toFixed(3);
  ugKgHEl.textContent = ugPerKgH.toFixed(3);
  ugKgMinEl.textContent = ugPerKgMin.toFixed(3);

  applyWarning(d, mgPerKgH, ugPerKgMin);
}

