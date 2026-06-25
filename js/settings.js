// =====================================
// SETTINGS MODULE
// TradePilot Pro X
// Version 10.1
// =====================================

const DEFAULT_SETTINGS = {

    capital: 50000,

    leverage: 3,

    basketSize: 7,

    targetPercent: 3,

    stopLossPercent: 2,

    maxHoldingDays: 10,

    minScore: 80,

    minVolumeRatio: 1.0,

    maxSectorStocks: 2

};

let settings =
JSON.parse(
localStorage.getItem("settings")
) || DEFAULT_SETTINGS;

function saveSettings(){

    localStorage.setItem(
        "settings",
        JSON.stringify(settings)
    );

}

function resetSettings(){

    settings = {...DEFAULT_SETTINGS};

    saveSettings();

    renderSettings();

}

function renderSettings(){

    const c = document.getElementById("setCapital");
    if(!c) return;

    document.getElementById("setCapital").value = settings.capital;
    document.getElementById("setLeverage").value = settings.leverage;
    document.getElementById("setBasket").value = settings.basketSize;
    document.getElementById("setTarget").value = settings.targetPercent;
    document.getElementById("setSL").value = settings.stopLossPercent;
    document.getElementById("setHolding").value = settings.maxHoldingDays;

}

function updateSettings(){

    settings.capital =
    Number(document.getElementById("setCapital").value);

    settings.leverage =
    Number(document.getElementById("setLeverage").value);

    settings.basketSize =
    Number(document.getElementById("setBasket").value);

    settings.targetPercent =
    Number(document.getElementById("setTarget").value);

    settings.stopLossPercent =
    Number(document.getElementById("setSL").value);

    settings.maxHoldingDays =
    Number(document.getElementById("setHolding").value);

    saveSettings();

    alert("Settings Saved Successfully");

}