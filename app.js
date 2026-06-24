// =====================================
// NIFTY DASHBOARD PRO V7
// APP.JS
// =====================================

let allStocks = [];

let watchlist =
JSON.parse(
localStorage.getItem("watchlist")
|| "[]"
);

// =====================================
// LOAD DATA
// =====================================

fetch("stocks.json")
.then(res => res.json())
.then(data => {

    allStocks = data;

    buildDashboard();

    buildSectorFilter();

    renderTable(data);

    renderSectorAnalysis();

    renderWatchlist();

    renderPortfolio();

    renderRecommendations();

    buildOptionsDesk();

    buildMarketHealth();

    loadMarketData();

})
.catch(err => {

    console.error(err);

});

// =====================================
// DASHBOARD
// =====================================

function buildDashboard(){

    document.getElementById(
        "totalStocks"
    ).innerText =
    allStocks.length;

    const sectors =
    [...new Set(
        allStocks.map(
            x => x.sector
        )
    )];

    document.getElementById(
        "totalSectors"
    ).innerText =
    sectors.length;

    document.getElementById(
        "btstCount"
    ).innerText =
    allStocks.filter(
        x => x.btst_candidate
    ).length;

    document.getElementById(
        "swingCount"
    ).innerText =
    allStocks.filter(
        x => x.swing_candidate
    ).length;

    document.getElementById(
        "hilegaCount"
    ).innerText =
    allStocks.filter(
        x => x.hilega_milega
    ).length;

    buildTopLists();

}
// =====================================
// TOP LISTS
// =====================================

function buildTopLists(){

    const topScore =
    [...allStocks]
    .sort(
        (a,b)=>
        b.score-a.score
    )
    .slice(0,10);

    document.getElementById(
        "topMomentum"
    ).innerHTML =
    topScore.map(x=>

        `<div>
        ${x.symbol}
        (${x.score})
        </div>`

    ).join("");

    const btst =
    allStocks
    .filter(
        x=>x.btst_candidate
    )
    .slice(0,10);

    document.getElementById(
        "topBTST"
    ).innerHTML =
    btst.map(x=>

        `<div>
        ${x.symbol}
        </div>`

    ).join("");

    const swing =
    allStocks
    .filter(
        x=>x.swing_candidate
    )
    .slice(0,10);

    document.getElementById(
        "topSwing"
    ).innerHTML =
    swing.map(x=>

        `<div>
        ${x.symbol}
        </div>`

    ).join("");

    const hilega =
    allStocks
    .filter(
        x=>x.hilega_milega
    )
    .slice(0,10);

    document.getElementById(
        "topHilega"
    ).innerHTML =
    hilega.map(x=>

        `<div>
        ${x.symbol}
        </div>`

    ).join("");

}

// =====================================
// SECTOR FILTER
// =====================================

function buildSectorFilter(){

    const sectors =
    [...new Set(
        allStocks.map(
            x=>x.sector
        )
    )];

    const dd =
    document.getElementById(
        "sectorFilter"
    );

    sectors
    .sort()
    .forEach(sec=>{

        dd.innerHTML +=

        `<option value="${sec}">
        ${sec}
        </option>`;

    });

}

// =====================================
// TABLE
// =====================================

function renderTable(data){

    let html = "";

    data.forEach(stock=>{

        let scoreClass =
        "score-red";

        if(stock.score>=80)
            scoreClass =
            "score-green";

        else if(
            stock.score>=60
        )
            scoreClass =
            "score-yellow";

        html += `

        <tr>

        <td>

        <button
        onclick="toggleWatchlist(
        '${stock.symbol}'
        )">

        ${
        watchlist.includes(
        stock.symbol
        )
        ? '⭐'
        : '☆'
        }

        </button>

        </td>

        <td>${stock.symbol}</td>

        <td>${stock.sector}</td>

        <td>${stock.price ?? '-'}</td>

        <td>${stock.rsi ?? '-'}</td>

        <td>${stock.rsi_ema3 ?? '-'}</td>

        <td>${stock.rsi_wma21 ?? '-'}</td>

        <td>${stock.volume_ratio ?? '-'}</td>

        <td>${stock.atr ?? '-'}</td>

        <td>${stock.atr_percent ?? '-'}</td>

        <td>${stock.high_52w ?? '-'}</td>

        <td>${stock.distance_52w ?? '-'}</td>

        <td class="${scoreClass}">
        ${stock.score}
        </td>

        <td>
        ${
        stock.btst_candidate
        ?
        '🚀'
        :
        ''
        }
        </td>

        <td>
        ${
        stock.swing_candidate
        ?
        '📈'
        :
        ''
        }
        </td>

        <td>
        ${
        stock.hilega_milega
        ?
        '🔥'
        :
        ''
        }
        </td>

        </tr>

        `;

    });

    document.getElementById(
        "tableBody"
    ).innerHTML = html;

}

// =====================================
// FILTERS
// =====================================

document
.getElementById(
"sectorFilter"
)
.addEventListener(
"change",
applyFilters
);

document
.getElementById(
"signalFilter"
)
.addEventListener(
"change",
applyFilters
);

document
.getElementById(
"searchBox"
)
.addEventListener(
"keyup",
applyFilters
);

function applyFilters(){

    const sector =
    document
    .getElementById(
    "sectorFilter"
    ).value;

    const signal =
    document
    .getElementById(
    "signalFilter"
    ).value;

    const search =
    document
    .getElementById(
    "searchBox"
    )
    .value
    .toUpperCase();

    let filtered =
    allStocks.filter(stock=>{

        let sectorOk =
        sector==="All"
        ||
        stock.sector===sector;

        let signalOk =
        true;

        if(signal==="BTST")
            signalOk=
            stock.btst_candidate;

        if(signal==="Swing")
            signalOk=
            stock.swing_candidate;

        if(signal==="Hilega")
            signalOk=
            stock.hilega_milega;

        let searchOk =
        stock.symbol
        .toUpperCase()
        .includes(search);

        return (
        sectorOk
        &&
        signalOk
        &&
        searchOk
        );

    });

    renderTable(filtered);

}

// =====================================
// WATCHLIST
// =====================================

function toggleWatchlist(symbol){

    if(
    watchlist.includes(
    symbol
    )
    ){

        watchlist =
        watchlist.filter(
        x=>x!==symbol
        );

    }else{

        watchlist.push(
        symbol
        );

    }

    localStorage.setItem(
        "watchlist",
        JSON.stringify(
        watchlist
        )
    );

    renderTable(
    allStocks
    );

    renderWatchlist();

}

function renderWatchlist(){

    const stocks =
    allStocks.filter(

        x=>
        watchlist.includes(
        x.symbol
        )

    );

    document
    .getElementById(
    "watchlistContainer"
    )
    .innerHTML =

    stocks.length===0

    ?

    "No stocks added"

    :

    stocks.map(x=>

        `<div>

        ⭐

        ${x.symbol}

        </div>`

    ).join("");

}

// =====================================
// SECTOR ANALYSIS
// =====================================

function renderSectorAnalysis(){

    let map = {};

    allStocks.forEach(s=>{

        if(!map[s.sector]){

            map[s.sector]=[];

        }

        map[s.sector]
        .push(s);

    });

    let html='';

    Object.keys(map)
    .forEach(sec=>{

        const arr =
        map[sec];

        const avgScore =

        (
        arr.reduce(
        (a,b)=>
        a+b.score,
        0
        )
        /
        arr.length
        )
        .toFixed(2);

        const btst =
        arr.filter(
        x=>x.btst_candidate
        ).length;

        const swing =
        arr.filter(
        x=>x.swing_candidate
        ).length;

        html += `

        <tr>

        <td>${sec}</td>

        <td>${arr.length}</td>

        <td>${avgScore}</td>

        <td>${btst}</td>

        <td>${swing}</td>

        </tr>

        `;

    });

    document
    .getElementById(
    "sectorTable"
    )
    .innerHTML = html;

}

// =====================================
// DARK MODE
// =====================================

document
.getElementById(
"darkModeBtn"
)
.addEventListener(
"click",
()=>{

document.body
.classList
.toggle("dark");

});

// =====================================
// TABS
// =====================================

function openTab(tabId){

document
.querySelectorAll(
".tab-content"
)
.forEach(tab=>{

tab.classList
.remove(
"active"
);

});

document
.getElementById(
tabId
)
.classList
.add(
"active"
);

document
.querySelectorAll(
".tab-btn"
)
.forEach(btn=>{

btn.classList
.remove(
"active"
);

});

event.target
.classList
.add(
"active"
);

}
// =====================================
// PORTFOLIO
// =====================================

let portfolio = JSON.parse(

localStorage.getItem(
"portfolio"
)

||

"[]"

);

function addPortfolio(){

const symbol =
document
.getElementById(
"portfolioSymbol"
)
.value
.toUpperCase();

const qty =
parseFloat(
document
.getElementById(
"portfolioQty"
)
.value
|| 0
);

const buyPrice =
parseFloat(
document
.getElementById(
"portfolioBuy"
)
.value
|| 0
);

portfolio.push({

symbol,

qty,

buyPrice

});

localStorage.setItem(

"portfolio",

JSON.stringify(
portfolio
)

);

renderPortfolio();

}

function renderPortfolio(){

const body =

document
.getElementById(
"portfolioBody"
);

if(!body)
return;

let html='';

portfolio.forEach(

(item,index)=>{

const stock =

allStocks.find(

x=>

x.symbol===item.symbol

);

const currentPrice =

stock

?

stock.price

:

0;

const investment =

item.qty *
item.buyPrice;

const currentValue =

item.qty *
currentPrice;

const pnl =

currentValue -
investment;

const pnlPercent =

investment > 0

?

(

pnl /
investment

*
100

).toFixed(2)

:

0;

html += `

<tr>

<td>${item.symbol}</td>

<td>${item.qty}</td>

<td>${item.buyPrice}</td>

<td>${currentPrice}</td>

<td>${investment.toFixed(2)}</td>

<td>${currentValue.toFixed(2)}</td>

<td>${pnl.toFixed(2)}</td>

<td>${pnlPercent}%</td>

<td>

<button
onclick="deletePortfolio(${index})">

❌

</button>

</td>

</tr>

`;

});

body.innerHTML = html;

}

function deletePortfolio(index){

portfolio.splice(
index,
1
);

localStorage.setItem(

"portfolio",

JSON.stringify(
portfolio
)

);

renderPortfolio();

}
// =====================================
// MARKET HEALTH
// =====================================

function buildMarketHealth(){

    if(allStocks.length === 0){
        return;
    }

    let health = 0;

    const bullish =
    allStocks.filter(
        x => x.score >= 80
    ).length;

    health = Math.round(
        (bullish / allStocks.length) * 100
    );

    const healthEl =
    document.getElementById(
        "marketHealth"
    );

    const statusEl =
    document.getElementById(
        "marketStatus"
    );

    if(!healthEl || !statusEl){
        return;
    }

    healthEl.innerText =
    health + "%";

    let status =
    "🔴 Weak";

    if(health >= 60){
        status =
        "🟢 Bullish";
    }
    else if(health >= 40){
        status =
        "🟡 Sideways";
    }

    statusEl.innerText =
    status;
}
// =====================================
// RECOMMENDATION TRACKER
// =====================================

let recommendations = JSON.parse(

localStorage.getItem(
"recommendations"
)

||

"[]"

);

function generateRecommendations(){

const today =

new Date()
.toISOString()
.split("T")[0];

const picks =

allStocks.filter(

x=>

x.btst_candidate ||

x.swing_candidate ||

x.hilega_milega

);

picks.forEach(stock=>{

recommendations.push({

date: today,

symbol: stock.symbol,

entry: stock.price,

signal:

stock.btst_candidate
? "BTST"

:

stock.swing_candidate
? "SWING"

:

"HILEGA"

});

});

localStorage.setItem(

"recommendations",

JSON.stringify(
recommendations
)

);

renderRecommendations();

}

function renderRecommendations(){

const body =

document.getElementById(
"recommendationBody"
);

if(!body) return;

let html='';

recommendations.forEach(rec=>{

const stock =

allStocks.find(

x=>

x.symbol===rec.symbol

);

const current =

stock
? stock.price
: rec.entry;

const pnl =

current -
rec.entry;

const ret =

(

pnl /
rec.entry

*
100

).toFixed(2);

html += `

<tr>

<td>${rec.date}</td>

<td>${rec.symbol}</td>

<td>${rec.signal}</td>

<td>${rec.entry}</td>

<td>${current}</td>

<td>${pnl.toFixed(2)}</td>

<td>${ret}%</td>

</tr>

`;

});

body.innerHTML = html;

}
// =====================================
// GLOBAL MARKETS
// =====================================

function loadMarketData(){

document.getElementById(
"niftyTicker"
).innerHTML =

"🇮🇳 NIFTY<br>25430<br>+0.45%";

document.getElementById(
"giftTicker"
).innerHTML =

"🌏 GIFT<br>25510<br>+0.32%";

document.getElementById(
"spTicker"
).innerHTML =

"🇺🇸 S&P500<br>6125<br>+0.21%";

document.getElementById(
"nasdaqTicker"
).innerHTML =

"🇺🇸 NASDAQ<br>20150<br>+0.48%";

document.getElementById(
"dowTicker"
).innerHTML =

"🇺🇸 DOW<br>44820<br>-0.15%";

document.getElementById(
"crudeTicker"
).innerHTML =

"🛢️ CRUDE<br>68.45<br>+0.82%";

}
// =====================================
// OPTIONS TRADE DESK
// =====================================

function buildOptionsDesk(){

const body =
document.getElementById(
"optionsDeskBody"
);

if(!body) return;

const candidates =

[...allStocks]

.filter(

x=>

x.score >= 80 ||

x.btst_candidate ||

x.swing_candidate

)

.sort(

(a,b)=>

b.score-a.score

)

.slice(0,10);

let html='';

candidates.forEach(stock=>{

const entry =
Number(
stock.price || 0
);

const atr =
Number(
stock.atr || 0
);

const sl =
(entry - atr)
.toFixed(2);

const target =
(
entry +
(atr * 2)
)
.toFixed(2);

html += `

<tr>

<td>${stock.symbol}</td>

<td>${getOptionSignal(stock)}</td>

<td>${entry}</td>

<td>${sl}</td>

<td>${target}</td>

<td>1:2</td>

<td>
${getQuality(stock.score)}
</td>

<td>

<button
onclick="approveTrade(
'${stock.symbol}',
${entry},
${sl},
${target}
)">

🚀

</button>

</td>

</tr>

`;

});

body.innerHTML =
html;

}
function approveTrade(
symbol,
entry,
sl,
target
){

alert(

`Trade Approved

${symbol}

Entry: ${entry}

SL: ${sl}

Target: ${target}`

);

}
// =====================================
// OPTION SIGNAL ENGINE
// =====================================

function getOptionSignal(stock){

const score =
Number(stock.score || 0);

const rsi =
Number(stock.rsi || 50);

if(
score >= 80 &&
rsi >= 60
){
return "🟢 BUY CE";
}

if(
score < 50 &&
rsi <= 40
){
return "🔴 BUY PE";
}

return "🟡 AVOID";

}
function getQuality(score){

if(score >= 90)
return "★★★★★";

if(score >= 80)
return "★★★★☆";

if(score >= 70)
return "★★★☆☆";

return "★★☆☆☆";

}
