const drugs = {
  adrenalin: {
    name: "Adrenalin 10 µg/ml",
    concUgPerMl: 10,
    maxUgKgMin: 1.0
  },
  nor40: {
    name: "Noradrenalin 40 µg/ml",
    concUgPerMl: 40,
    maxUgKgMin: 1.0
  },
  nor80: {
    name: "Noradrenalin 80 µg/ml",
    concUgPerMl: 80,
    maxUgKgMin: 1.0
  },
  dobutamine: {
    name: "Dobutamine 5 mg/ml",
    concMgPerMl: 5,
    maxUgKgMin: 40
  },
  milrinone: {
    name: "Milrinone 1 mg/ml",
    concMgPerMl: 1,
    maxUgKgMin: 0.75
  },
  ketamine: {
    name: "Ketamine 25 mg/ml",
    concMgPerMl: 25,
    maxMgKgH: 2
  },
  propofol: {
    name: "Propofol 20 mg/ml",
    concMgPerMl: 20,
    maxMgKgH: 10
  },
  remifentanyl: {
    name: "Remifentanyl 50 µg/ml",
    concUgPerMl: 50,
    maxUgKgMin: 0.3
  }
};

const el = id => document.getElementById(id);

const drugSel = el("drug");
const weightEl = el("weight");
const strengthEl = el("strength");
const doseMgKgHEl = el("doseMgKgH");
const doseUgKgMinEl = el("doseUgKgMin");
const warnEl = el("doseWarning");

const mgH = el("mgH");
const mlH = el("mlH");
const mgKgH = el("mgKgH");
const ugKgH = el("ugKgH");
const ugKgMin = el("ugKgMin");

function updateStrength() {
  const d = drugs[drugSel.value];
  if (!d) {
    strengthEl.value = "";
    return;
  }
  if (d.concMgPerMl) {
    strengthEl.value = `${d.concMgPerMl} mg/ml`;
  } else if (d.concUgPerMl) {
    strengthEl.value = `${d.concUgPerMl} µg/ml`;
  } else {
    strengthEl.value = "";
  }
}

function recalc() {
  const d = drugs[drugSel.value];
  const w = parseFloat(weightEl.value || "0");
  const doseMgKgH = parseFloat(doseMgKgHEl.value || "0");
  const doseUgKgMin = parseFloat(doseUgKgMinEl.value || "0");

  let mgPerH = 0;
  let mlPerH = 0;
  let mgPerKgH = 0;
  let ugPerKgH = 0;
  let ugPerKgMin = 0;

  // приоритет: если введён µg/kg/min — считаем от него
  if (d && w > 0 && doseUgKgMin > 0) {
    ugPerKgMin = doseUgKgMin;
    ugPerKgH = ugPerKgMin * 60;
    mgPerKgH = ugPerKgH / 1000;
    mgPerH = mgPerKgH * w;

    if (d.concMgPerMl) {
      mlPerH = mgPerH / d.concMgPerMl;
    } else if (d.concUgPerMl) {
      mlPerH = (ugPerKgH * w) / d.concUgPerMl;
    }
  } else if (d && w > 0 && doseMgKgH > 0) {
    mgPerKgH = doseMgKgH;
    mgPerH = mgPerKgH * w;
    ugPerKgH = mgPerKgH * 1000;
    ugPerKgMin = ugPerKgH / 60;

    if (d.concMgPerMl) {
      mlPerH = mgPerH / d.concMgPerMl;
    } else if (d.concUgPerMl) {
      mlPerH = (ugPerKgH * w) / d.concUgPerMl;
    }
  }

  mgH.textContent = mgPerH.toFixed(3);
  mlH.textContent = mlPerH.toFixed(3);
  mgKgH.textContent = mgPerKgH.toFixed(3);
  ugKgH.textContent = ugPerKgH.toFixed(3);
  ugKgMin.textContent = ugPerKgMin.toFixed(3);

  // предупреждение о высокой дозе
  warnEl.textContent = "";
  if (d) {
    if (d.maxUgKgMin && ugPerKgMin > d.maxUgKgMin) {
      warnEl.textContent = "Huom! Korkea annos!";
    }
    if (d.maxMgKgH && mgPerKgH > d.maxMgKgH) {
      warnEl.textContent = "Huom! Korkea annos!";
    }
  }
}

drugSel.addEventListener("change", () => {
  updateStrength();
  recalc();
});
[weightEl, doseMgKgHEl, doseUgKgMinEl].forEach(e =>
  e.addEventListener("input", recalc)
);

// PWA: регистрация service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}