const drugSelect = document.getElementById("drug");
const concDisplay = document.getElementById("concDisplay");

const weightEl = document.getElementById("weight");
const rateEl = document.getElementById("rate");

const doseMgCell = document.getElementById("doseMgCell");
const doseUgCell = document.getElementById("doseUgCell");
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
  adrenalin: {
    name: "Adrenalin 10 µg/ml",
    concUgPerMl: 10,
    unit: "ug",
    info: "Aloitus 0,01–0,05 µg/kg/min. Ylläpito 0,1–0,5 µg/kg/min. Iskemia-riski >1,0 µg/kg/min",
    maxUgKgMin: 1.0
  },
  nor40: {
    name: "Noradrenalin 40 µg/ml",
    concUgPerMl: 40,
    unit: "ug",
    info: "Aloitus 0,01–0,05 µg/kg/min. Ylläpito 0,1–0,5 µg/kg/min. Iskemia-riski >1,0 µg/kg/min",
    maxUgKgMin: 1.0
  },
  nor80: {
    name: "Noradrenalin 80 µg/ml",
    concUgPerMl: 80,
    unit: "ug",
    info: "Aloitus 0,01–0,05 µg/kg/min. Ylläpito 0,1–0,5 µg/kg/min. Iskemia-riski >1,0 µg/kg/min",
    maxUgKgMin: 1.0
  },
  dobutamine: {
    name: "Dobutamine 5 mg/ml",
    concMgPerMl: 5,
    unit: "mg",
    info: "Tavallinen annos 2–20 mg/kg/h",
    maxMgKgH: 20
  },
  milrinone: {
    name: "Milrinone 1 mg/ml",
    concMgPerMl: 1,
    unit: "mg",
    info: "Aloitus 0,25–0,75 mg/kg/h",
    maxMgKgH: 0.75
  },
  ketamine: {
    name: "Ketamine 25 mg/ml",
    concMgPerMl: 25,
    unit: "mg",
    info: "Ylläpito 0,5–2 mg/kg/h",
    maxMgKgH: 2
  },
  propofol: {
    name: "Propofol 20 mg/ml",
    concMgPerMl: 20,
    unit: "mg",
    info: "Ylläpito 1–4 mg/kg/h",
    maxMgKgH: 4
  },
  remifentanyl: {
    name: "Remifentanyl 50 µg/ml",
    concUgPerMl: 50,
    unit: "ug",
    info: "Aloitus 0,05–0,2 µg/kg/min",
    maxUgKgMin: 0.2
  }
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
  if (high) {
    doseWarningEl.textContent = "Korkea annos!";
  } else {
    doseWarningEl.textContent = "";
  }
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
    doseMgCell.style.display = "table-cell";
    doseUgCell.style.display = "table-cell";
    return;
  }

  // концентрация
  if (d.concMgPerMl) concDisplay.textContent = `${d.concMgPerMl} mg/ml`;
  if (d.concUgPerMl) concDisplay.textContent = `${d.concUgPerMl} µg/ml`;

  // рекомендации
  doseInfoEl.textContent = d.info;

  // автоматический выбор единицы дозы
  if (d.unit === "mg") {
    doseMgCell.style.display = "table-cell";
    doseUgCell.style.display = "none";
  } else {
    doseMgCell.style.display = "none";
    doseUgCell.style.display = "table-cell";
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

  const w = parseFloat(weightEl.value.replace(",", "."));
  if (!w || w <= 0) return;

  const rate = rateEl.value ? parseFloat(rateEl.value.replace(",", ".")) : null;
  const doseMg = doseMgEl.value ? parseFloat(doseMgEl.value.replace(",", ".")) : null;
  const doseUg = doseUgEl.value ? parseFloat(doseUgEl.value.replace(",", ".")) : null;

  if (!rate && !doseMg && !doseUg) return;

  let mgPerH = 0;
  let mlPerH = 0;
  let mgPerKgH = 0;
  let ugPerKgH = 0;
  let ugPerKgMin = 0;

  // 1) если задана скорость (ml/h)
  if (rate) {
    mlPerH = rate;

    if (d.concMgPerMl) {
      mgPerH = mlPerH * d.concMgPerMl;
      mgPerKgH = mgPerH / w;
      ugPerKgH = mgPerKgH * 1000;
      ugPerKgMin = ugPerKgH / 60;
    } else if (d.concUgPerMl) {
      const ugPerH = mlPerH * d.concUgPerMl;
      ugPerKgH = ugPerH / w;
      ugPerKgMin = ugPerKgH / 60;
      mgPerKgH = ugPerKgH / 1000;
      mgPerH = mgPerKgH * w;
    }
  }

  // 2) если задана доза mg/kg/h
  if (!rate && doseMg && d.unit === "mg") {
    mgPerKgH = doseMg;
    mgPerH = mgPerKgH * w;
    ugPerKgH = mgPerKgH * 1000;
    ugPerKgMin = ugPerKgH / 60;

    if (d.concMgPerMl) {
      mlPerH = mgPerH / d.concMgPerMl;
    } else if (d.concUgPerMl) {
      const ugPerH = mgPerH * 1000;
      mlPerH = ugPerH / d.concUgPerMl;
    }
  }

  // 3) если задана доза µg/kg/min
  if (!rate && doseUg && d.unit === "ug") {
    ugPerKgMin = doseUg;
    ugPerKgH = ugPerKgMin * 60;
    mgPerKgH = ugPerKgH / 1000;
    mgPerH = mgPerKgH * w;

    if (d.concUgPerMl) {
      const ugPerH = ugPerKgH * w;
      mlPerH = ugPerH / d.concUgPerMl;
    } else if (d.concMgPerMl) {
      mlPerH = mgPerH / d.concMgPerMl;
    }
  }

  mgHEl.textContent = mgPerH ? mgPerH.toFixed(3) : "";
  mlHEl.textContent = mlPerH ? mlPerH.toFixed(3) : "";
  mgKgHEl.textContent = mgPerKgH ? mgPerKgH.toFixed(3) : "";
  ugKgHEl.textContent = ugPerKgH ? ugPerKgH.toFixed(3) : "";
  ugKgMinEl.textContent = ugPerKgMin ? ugPerKgMin.toFixed(3) : "";

  applyWarning(d, mgPerKgH, ugPerKgMin);
}
