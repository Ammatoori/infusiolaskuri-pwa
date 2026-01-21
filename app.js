// ===============================
//  ИНИЦИАЛИЗАЦИЯ ПРЕПАРАТОВ
// ===============================
const drugSelect = document.getElementById("drug");
const laakelista = document.getElementById("laakelista").rows;

// Добавляем пустой вариант
const emptyOption = document.createElement("option");
emptyOption.value = "";
emptyOption.textContent = "";
drugSelect.appendChild(emptyOption);

// Добавляем препараты
for (let i = 0; i < laakelista.length; i++) {
    const name = laakelista[i].cells[0].textContent;
    const option = document.createElement("option");
    option.value = i;
    option.textContent = name;
    drugSelect.appendChild(option);
}

// ===============================
//  ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
// ===============================
const concDisplay = document.getElementById("concDisplay");
const doseUnitCell = document.getElementById("doseUnitCell");

const weightInput = document.getElementById("weight");
const rateInput = document.getElementById("rate");
const doseInput = document.getElementById("doseInput");

const mgH = document.getElementById("mgH");
const mgKgH = document.getElementById("mgKgH");
const ugKgH = document.getElementById("ugKgH");
const ugKgMin = document.getElementById("ugKgMin");
const mlH = document.getElementById("mlH");

const doseWarning = document.getElementById("doseWarning");
const doseInfo = document.getElementById("doseInfo");

const clearAllBtn = document.getElementById("clearAllBtn");

// ===============================
//  ПЕРЕМЕННЫЕ
// ===============================
let concentration = 0;
let concUnit = "";
let minDose = 0;
let maxDose = 0;
let doseUnit = "";

// ===============================
//  ЗАГРУЗКА ПРЕПАРАТА
// ===============================
function loadDrug() {
    const row = laakelista[drugSelect.value];

    concentration = parseFloat(row.cells[1].textContent);
    concUnit = row.cells[2].textContent;

    minDose = parseFloat(row.cells[3].textContent);
    maxDose = parseFloat(row.cells[4].textContent);

    concDisplay.textContent = `${concentration} ${concUnit}`;

    if (concUnit.includes("mg")) {
        doseUnit = "mg/kg/h";
    } else {
        doseUnit = "µg/kg/min";
    }
    doseUnitCell.textContent = doseUnit;

    doseInfo.textContent = `${minDose}–${maxDose} ${doseUnit}`;

    calculateAll();
}

// ===============================
//  ПОДСВЕТКА АКТИВНОГО ПОЛЯ
// ===============================
function highlight(input) {
    [rateInput, doseInput].forEach(el => el.classList.remove("active-field"));
    input.classList.add("active-field");
}

// ===============================
//  РАСЧЁТЫ
// ===============================
function calculateAll() {
    const weight = parseFloat(weightInput.value);
    const rate = parseFloat(rateInput.value);
    const dose = parseFloat(doseInput.value);

    doseWarning.textContent = "";

    // Если препарат не выбран — ничего не считаем
    if (drugSelect.value === "") {
        mgH.textContent = "";
        mgKgH.textContent = "";
        ugKgH.textContent = "";
        ugKgMin.textContent = "";
        mlH.textContent = "";
        return;
    }

    // ---------------------------
    //  RATE → DOSE
    // ---------------------------
    if (!isNaN(rate) && rate > 0) {
        const mgPerH = rate * concentration / 1000;
        const ugPerH = mgPerH * 1000;

        mgH.textContent = mgPerH.toFixed(2);
        mgKgH.textContent = weight ? (mgPerH / weight).toFixed(2) : "";
        ugKgH.textContent = weight ? (ugPerH / weight).toFixed(2) : "";
        ugKgMin.textContent = weight ? (ugPerH / weight / 60).toFixed(2) : "";

        mlH.textContent = rate.toFixed(1);

        if (document.activeElement === rateInput) {
            doseInput.value = "";
        }
    }

    // ---------------------------
    //  DOSE → RATE
    // ---------------------------
    if (!isNaN(dose) && dose > 0 && weight > 0) {

        if (doseUnit === "mg/kg/h") {
            const mgPerH = dose * weight;
            const mlPerH = mgPerH / concentration;

            mlH.textContent = mlPerH.toFixed(1);
            rateInput.value = mlPerH.toFixed(1);

            mgH.textContent = mgPerH.toFixed(2);
            mgKgH.textContent = dose.toFixed(2);
            ugKgH.textContent = (dose * 1000).toFixed(2);
            ugKgMin.textContent = (dose * 1000 / 60).toFixed(2);

        } else {
            const ugPerMin = dose * weight;
            const ugPerH = ugPerMin * 60;
            const mlPerH = ugPerH / concentration;

            mlH.textContent = mlPerH.toFixed(1);
            rateInput.value = mlPerH.toFixed(1);

            mgH.textContent = (ugPerH / 1000).toFixed(3);
            mgKgH.textContent = (ugPerH / 1000 / weight).toFixed(3);
            ugKgH.textContent = (ugPerH / weight).toFixed(3);
            ugKgMin.textContent = dose.toFixed(3);
        }
    }

    // ---------------------------
    //  ПРОВЕРКА ДОЗЫ
    // ---------------------------
    if (!isNaN(dose) && dose > 0) {
        if (dose < minDose) {
            doseWarning.textContent = "Liian matala annos";
        } else if (dose > maxDose) {
            doseWarning.textContent = "Korkea annos";
        }
    }
}

// ===============================
//  ОЧИСТКА
// ===============================
clearAllBtn.onclick = () => {
    weightInput.value = "";
    rateInput.value = "";
    doseInput.value = "";

    mgH.textContent = "";
    mgKgH.textContent = "";
    ugKgH.textContent = "";
    ugKgMin.textContent = "";
    mlH.textContent = "";

    doseWarning.textContent = "";

    // Сбрасываем препарат в пустой вариант
    drugSelect.selectedIndex = 0;

    concDisplay.textContent = "";
    doseUnitCell.textContent = "";
    doseInfo.textContent = "";
};

// ===============================
//  ОБРАБОТЧИКИ
// ===============================
drugSelect.onchange = () => {
    if (drugSelect.value === "") {
        concDisplay.textContent = "";
        doseUnitCell.textContent = "";
        doseInfo.textContent = "";
        calculateAll();
        return;
    }
    loadDrug();
};

weightInput.oninput = calculateAll;

rateInput.oninput = () => {
    highlight(rateInput);
    calculateAll();
};

doseInput.oninput = () => {
    highlight(doseInput);
    calculateAll();
};

// ===============================
//  СТАРТ — препарат НЕ загружаем
// ===============================
drugSelect.selectedIndex = 0;
