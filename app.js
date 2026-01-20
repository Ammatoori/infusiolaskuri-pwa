// -----------------------------
// 1. Получение элементов
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
// 2. Справочник препаратов
// -----------------------------
const drugs = {
  adrenalin:    { concUgPerMl: 10, unit: "ug", info: "Aloitus 0,01–0,05 µg/kg/min. Ylläpito 0,1–0,5 µg/kg/min. Iskemia-riski >1,0 µg/kg/min", maxUgKgMin: 1.0 },
  nor40:        { concUgPerMl: 40, unit: "ug", info: "Aloitus 0,01–0,05 µg/kg/min. Ylläpito 0,1–0,5 µg/kg/min. Iskemia-riski >1,0 µg/kg/min", maxUgKgMin: 1.0 },
  nor80:        { concUgPerMl: 80, unit: "ug", info: "Aloitus 0,01–0,05 µg/kg/min. Ylläpito 0,1–0,5 µg/kg/min. Iskemia-riski >1,0 µg/kg/min", maxUgKgMin: 1.0 },
  dobutamine:   { concMgPerMl: 5,  unit: "mg", info: "Tavallinen annos 2–20 mg/kg/h", maxMgKgH: 20 },
  milrinone:    { concMgPerMl: 1,  unit: "mg", info: "Aloitus 0,25–0,75 mg/kg/h", maxMgKgH: 0.75 },
  ketamine:     { concMgPerMl: 25, unit: "mg", info: "Ylläpito 0,5–2 mg/kg/h", maxMgKgH: 2 },
  propofol:     { concMgPerMl: 20, unit: "mg", info: "Ylläpito 1–4 mg/kg/h", maxMgKgH: 4 },
  remifentanyl: { concUgPerMl: 50, unit: "ug", info: "Aloitus 0,05–0,2 µg/kg/min", maxUgKgMin: 0.2 }
};


// -----------------------------
// 3. Выбор препарата
// -----------------------------
drugSelect.addEventListener("change", () => {
  const d = drugs[drugSelect.value];

  doseInput.value = "";
  rateEl.value = "";
  doseWarningEl.textContent = "";
  concDisplay.textContent = "";
  doseInfoEl.textContent = "";

  if (!d) return;

  concDisplay.textContent = d.concMgPerMl
    ? `${d.concMgPerMl} mg/ml`
    : `${d.concUgPerMl} µg/ml`;

  doseInfoEl.textContent = d.info;

  // автоматическое переключение единицы
  doseUnitCell.textContent = d.unit === "mg" ? "mg/kg/h" : "µg/kg/min";
});


// -----------------------------
// 4. Блокировка полей
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
// 5. Основная функция расчёта
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
  if (drug.maxMgKgH && mgPerKgH > drug.maxMgKgH) high = true;
  if (drug.maxUgKgMin && ugPerKgMin > drug.maxUgKgMin) high = true;
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
      mgPerH = mlPerH * d.concMgPerMl;
      mgPerKgH = mgPerH / w;
      ugPerKgH = mgPerKgH * 1000;
      ugPerKgMin = ugPerKgH / 60;
    } else {
      const ugPerH = mlPerH * d.concUgPerMl;
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
    mlPerH = mgPerH / d.concMgPerMl;
  }

  // 3) доза µg/kg/min
  if (!rate && dose && d.unit === "ug") {
    ugPerKgMin = dose;
    ugPerKgH = ugPerKgMin * 60;
    mgPerKgH = ugPerKgH / 1000;
    mgPerH = mgPerKgH * w;
    mlPerH = (ugPerKgH * w) / d.concUgPerMl;
  }

  mgHEl.textContent = mgPerH.toFixed(3);
  mlHEl.textContent = mlPerH.toFixed(3);
  mgKgHEl.textContent = mgPerKgH.toFixed(3);
  ugKgHEl.textContent = ugPerKgH.toFixed(3);
  ugKgMinEl.textContent = ugPerKgMin.toFixed(3);

  applyWarning(d, mgPerKgH, ugPerKgMin);
}
