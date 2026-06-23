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
