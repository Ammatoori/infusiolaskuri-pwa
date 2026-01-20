const drugSelect = document.getElementById("drug");
const concDisplay = document.getElementById("concDisplay");

const weightEl = document.getElementById("weight");
const rateEl = document.getElementById("rate");

const doseMgCell = document.getElementById("doseMgCell");
const doseUgCell = document.getElementById("doseUgCell");

const doseMgUnit = document.getElementById("doseMgUnit");
const doseUgUnit = document.getElementById("doseUgUnit");

const doseMgEl = document.getElementById("doseMg");
const doseUgEl = document.getElementById("doseUg");

const mgHEl = document.getElementById("mgH");
const mlHEl = document.getElementById("mlH");
const mgKgHEl = document.getElementById("mgKgH");
const ugKgHEl = document.getElementById("ugKgH");
const ugKgMinEl = document.getElementById("ugKgMin");

const doseWarningEl = document.getElementById("doseWarning");
const doseInfoEl = document.getElementById("doseInfo");

// данные по препаратам
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

// выбор препарата
drugSelect.addEventListener("change", () => {
  const key = drugSelect.value;
  const d = drugs[key];
  clearOutputs();
  doseMgEl.value = "";
  doseUgEl.value = "";
  rateEl.value = "";

  if (!d) {
    concDisplay.textContent = "";
    doseInfoEl.textContent = "";
    return;
  }

  // концентрация
  concDisplay.textContent = d.concMgPerMl ? `${d.concMgPerMl} mg/ml` : `${d.concUgPerMl} µg/ml`;

  // рекомендации
  doseInfoEl.textContent = d.info;

  // автоматический выбор единицы дозы
  if (d.unit === "mg") {
    doseMgCell.style.display = "table-cell";
    doseMgUnit.style.display = "table-cell";

    doseUgCell.style.display = "none";
    doseUgUnit.style.display = "none";
  } else {
    doseMgCell.style.display = "none";
    doseMgUnit.style.display = "none";

    doseUgCell.style.display = "table-cell";
    doseUgUnit.style.display = "table-cell";
  }
});

// блокировка полей: скорость ↔ доза
rateEl.addEventListener("input", () => {
  if (rateEl.value !== "") {
    doseMgEl.disabled = true;
    doseUgEl.disabled = true;
  } else {
    doseMgEl.disabled = false;
    doseUgEl.disabled = false;
  }
  recalc();
});

doseMgEl.addEventListener("input", () => {
  if (doseMgEl.value !== "") {
    rateEl.disabled = true;
    doseUgEl.disabled = true;
  } else {
    rateEl.disabled = false;
    doseUgEl.disabled = false;
  }
  recalc();
});

doseUgEl.addEventListener("input", () => {
  if (doseUgEl.value !== "") {
    rateEl.disabled = true;
    doseMgEl.disabled = true;
  } else {
    rateEl.disabled = false;
    doseMgEl.disabled = false;
  }
  recalc();
});

weightEl.addEventListener("input", recalc);

// основной расчёт
function recalc() {
  clearOutputs();

  const key = drugSelect.value;
  const d = drugs[key];
  if (!d) return;

  const w = parseFloat(weightEl.value);
  if (!w || w <= 0) return;

  const rate = rateEl.value ? parseFloat(rateEl.value) : null;
  const doseMg = doseMgEl.value ? parseFloat(doseMgEl.value) : null;
  const doseUg = doseUgEl.value ? parseFloat(doseUgEl.value) : null;

  if (!rate && !doseMg && !doseUg) return;

  let mgPerH = 0, mlPerH = 0, mgPerKgH = 0, ugPerKgH = 0, ugPerKgMin = 0;

  // 1) скорость
  if (rate) {
    mlPerH = rate;

    if (d.concMgPerMl) {
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

  // 2) mg/kg/h
  if (!rate && doseMg && d.unit === "mg") {
    mgPerKgH = doseMg;
    mgPerH = mgPerKgH * w;
    ugPerKgH = mgPerKgH * 1000;
    ugPerKgMin = ugPerKgH / 60;

    if (d.concMgPerMl) mlPerH = mgPerH / d.concMgPerMl;
    else mlPerH = (mgPerH * 1000) / d.concUgPerMl;
  }

  // 3) µg/kg/min
  if (!rate && doseUg && d.unit === "ug") {
    ugPerKgMin = doseUg;
    ugPerKgH = ugPerKgMin * 60;
    mgPerKgH = ugPerKgH / 1000;
    mgPerH = mgPerKgH * w;

    if (d.concUgPerMl) mlPerH = (ugPerKgH * w) / d.concUgPerMl;
    else mlPerH = mgPerH / d.concMgPerMl;
  }

  mgHEl.textContent = mgPerH.toFixed(3);
  mlHEl.textContent = mlPerH.toFixed(3);
  mgKgHEl.textContent = mgPerKgH.toFixed(3);
  ugKgHEl.textContent = ugPerKgH.toFixed(3);
  ugKgMinEl.textContent = ugPerKgMin.toFixed(3);

  applyWarning(d, mgPerKgH, ugPerKgMin);
}
