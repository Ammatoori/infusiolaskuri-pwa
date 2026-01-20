// Справочник препаратов
const drugs = {
  adrenalin: { concUgPerMl: 10, maxUgKgMin: 1.0 },
  nor40: { concUgPerMl: 40, maxUgKgMin: 1.0 },
  nor80: { concUgPerMl: 80, maxUgKgMin: 1.0 },
  dobutamine: { concMgPerMl: 5, maxUgKgMin: 40 },
  milrinone: { concMgPerMl: 1, maxUgKgMin: 0.75 },
  ketamine: { concMgPerMl: 25, maxMgKgH: 2 },
  propofol: { concMgPerMl: 20, maxMgKgH: 10 },
  remifentanyl: { concUgPerMl: 50, maxUgKgMin: 0.3 }
};

const drugSelect = document.getElementById("drug");
const doseMgField = document.getElementById("doseMg");     // mg/kg/h
const doseUgField = document.getElementById("doseUg");     // µg/kg/min
const concDisplay = document.getElementById("concDisplay"); // C2
const doseWarning = document.getElementById("doseWarning");
const doseInfo = document.getElementById("doseInfo");

// Справочник концентраций и рекомендаций
const drugData = {
  adrenalin:      { conc: "10 µg/ml",  unit: "µg/kg/min", info: "Aloitus 0,01–0,05 µg/kg/min..." },
  nor40:          { conc: "40 µg/ml",  unit: "µg/kg/min", info: "Aloitus 0,01–0,05 µg/kg/min..." },
  nor80:          { conc: "80 µg/ml",  unit: "µg/kg/min", info: "Aloitus 0,01–0,05 µg/kg/min..." },
  dobutamine:     { conc: "5 mg/ml",   unit: "mg/kg/h",   info: "Tavallinen annos 2–20 mg/kg/h" },
  milrinone:      { conc: "1 mg/ml",   unit: "mg/kg/h",   info: "Aloitus 0,25–0,75 mg/kg/h" },
  ketamine:       { conc: "25 mg/ml",  unit: "mg/kg/h",   info: "Ylläpito 0,5–2 mg/kg/h" },
  propofol:       { conc: "20 mg/ml",  unit: "mg/kg/h",   info: "Ylläpito 1–4 mg/kg/h" },
  remifentanyl:   { conc: "50 µg/ml",  unit: "µg/kg/min", info: "Aloitus 0,05–0,2 µg/kg/min" }
};

// Автоматическое переключение дозы
drugSelect.addEventListener("change", () => {
  const key = drugSelect.value;
  if (!key) return;

  const d = drugData[key];

  // Показать концентрацию в C2
  concDisplay.textContent = d.conc;

  // Автоматически выбрать нужную единицу
  if (d.unit === "mg/kg/h") {
    doseMgField.parentElement.style.display = "table-cell";
    doseUgField.parentElement.style.display = "none";
    doseUgField.value = "";
  } else {
    doseMgField.parentElement.style.display = "none";
    doseUgField.parentElement.style.display = "table-cell";
    doseMgField.value = "";
  }

  // Показать рекомендации в B15
  doseInfo.textContent = d.info;

  // Очистить предупреждение
  doseWarning.textContent = "";
});


// Удобный доступ к элементам
const el = id => document.getElementById(id);

// Поля ввода
const drugSel = el("drug");
const weightEl = el("weight");
const doseMgEl = el("doseMgKgH");
const doseUgEl = el("doseUgKgMin");

// Ячейки для подсветки ошибок
const weightCell = el("weightCell");
const doseMgCell = el("doseMgCell");
const doseUgCell = el("doseUgCell");

// Вывод
const mgH = el("mgH");
const mlH = el("mlH");
const mgKgH = el("mgKgH");
const ugKgH = el("ugKgH");
const ugKgMin = el("ugKgMin");

// Предупреждение
const doseWarningRow = el("doseWarningRow");

// Заполняем список препаратов
(function fillDrugs() {
  drugSel.innerHTML = `<option value="">Valitse...</option>`;
  for (const key in drugs) {
    const d = drugs[key];
    const name =
      d.concMgPerMl
        ? `${key} (${d.concMgPerMl} mg/ml)`
        : `${key} (${d.concUgPerMl} µg/ml)`;
  }
})();

// Обновление строки "Vahvuus"
function updateStrength() {
  const d = drugs[drugSel.value];
  if (!d) {
    el("strength").value = "";
    return;
  }
  if (d.concMgPerMl) el("strength").value = `${d.concMgPerMl} mg/ml`;
  if (d.concUgPerMl) el("strength").value = `${d.concUgPerMl} µg/ml`;
}

// Проверка корректности числа
function validateNumber(value, cell) {
  if (value === "" || value === null) {
    cell.classList.add("error-cell");
    return false;
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    cell.classList.add("error-cell");
    return false;
  }
  cell.classList.remove("error-cell");
  return true;
}

// Условное форматирование превышения дозы
function applyDoseWarning(isHigh) {
  if (isHigh) doseWarningRow.classList.add("high-dose");
  else doseWarningRow.classList.remove("high-dose");
}

// Главная функция пересчёта
function recalc() {
  const d = drugs[drugSel.value];
  const w = weightEl.value;
  const doseMg = doseMgEl.value;
  const doseUg = doseUgEl.value;

  // Проверка корректности ввода
  const okDrug = !!d;
  const okWeight = validateNumber(w, weightCell);
  const okDoseMg = doseMg === "" ? true : validateNumber(doseMg, doseMgCell);
  const okDoseUg = doseUg === "" ? true : validateNumber(doseUg, doseUgCell);

  // Если нет препарата или веса — не считаем
  if (!okDrug || !okWeight) {
    mgH.textContent = mlH.textContent = mgKgH.textContent =
      ugKgH.textContent = ugKgMin.textContent = "";
    applyDoseWarning(false);
    return;
  }

  // Если обе дозы пустые — не считаем
  if (doseMg === "" && doseUg === "") {
    mgH.textContent = mlH.textContent = mgKgH.textContent =
      ugKgH.textContent = ugKgMin.textContent = "";
    applyDoseWarning(false);
    return;
  }

  // Если есть ошибки — не считаем
  if (!okDoseMg || !okDoseUg) {
    mgH.textContent = mlH.textContent = mgKgH.textContent =
      ugKgH.textContent = ugKgMin.textContent = "";
    applyDoseWarning(false);
    return;
  }

  let mgPerH = 0;
  let mlPerH = 0;
  let mgPerKgH = 0;
  let ugPerKgH = 0;
  let ugPerKgMin = 0;

  const weight = Number(w);

  // Приоритет: µg/kg/min
  if (doseUg !== "") {
    ugPerKgMin = Number(doseUg);
    ugPerKgH = ugPerKgMin * 60;
    mgPerKgH = ugPerKgH / 1000;
    mgPerH = mgPerKgH * weight;

    if (d.concMgPerMl) mlPerH = mgPerH / d.concMgPerMl;
    if (d.concUgPerMl) mlPerH = (ugPerKgH * weight) / d.concUgPerMl;
  }

  // Если введён mg/kg/h
  if (doseMg !== "" && doseUg === "") {
    mgPerKgH = Number(doseMg);
    mgPerH = mgPerKgH * weight;
    ugPerKgH = mgPerKgH * 1000;
    ugPerKgMin = ugPerKgH / 60;

    if (d.concMgPerMl) mlPerH = mgPerH / d.concMgPerMl;
    if (d.concUgPerMl) mlPerH = (ugPerKgH * weight) / d.concUgPerMl;
  }

  // Вывод
  mgH.textContent = mgPerH.toFixed(3);
  mlH.textContent = mlPerH.toFixed(3);
  mgKgH.textContent = mgPerKgH.toFixed(3);
  ugKgH.textContent = ugPerKgH.toFixed(3);
  ugKgMin.textContent = ugPerKgMin.toFixed(3);

  // Проверка превышения дозы
  let high = false;
  if (d.maxUgKgMin && ugPerKgMin > d.maxUgKgMin) high = true;
  if (d.maxMgKgH && mgPerKgH > d.maxMgKgH) high = true;

  applyDoseWarning(high);
}

// События
drugSel.addEventListener("change", () => {
  updateStrength();
  recalc();
});
weightEl.addEventListener("input", recalc);
doseMgEl.addEventListener("input", recalc);
doseUgEl.addEventListener("input", recalc);

// PWA service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

