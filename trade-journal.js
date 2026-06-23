// =====================================
// TRADE JOURNAL PRO V7
// =====================================

let trades = JSON.parse(
localStorage.getItem("tradeJournal")
|| "[]"
);

// =====================================
// INITIAL LOAD
// =====================================

document.addEventListener(
"DOMContentLoaded",
() => {

    renderTrades();

}
);

// =====================================
// ADD TRADE
// =====================================

function addTrade(){

    const trade = {

        date:
        document.getElementById(
        "tradeDate"
        ).value,

        type:
        document.getElementById(
        "tradeType"
        ).value,

        symbol:
        document.getElementById(
        "tradeSymbol"
        ).value
        .toUpperCase(),

        entry:
        parseFloat(
        document.getElementById(
        "entryPrice"
        ).value || 0
        ),

        exit:
        parseFloat(
        document.getElementById(
        "exitPrice"
        ).value || 0
        ),

        quantity:
        parseInt(
        document.getElementById(
        "quantity"
        ).value || 0
        ),

        brokerage:
        parseFloat(
        document.getElementById(
        "brokerage"
        ).value || 0
        ),

        charges:
        parseFloat(
        document.getElementById(
        "charges"
        ).value || 0
        ),

        rr:
        document.getElementById(
        "riskReward"
        ).value,

        notes:
        document.getElementById(
        "notes"
        ).value,

        screenshot:
        document.getElementById(
        "screenshotLink"
        ).value

    };

    trade.investment =
    (
    trade.entry *
    trade.quantity
    ).toFixed(2);

    trade.saleValue =
    (
    trade.exit *
    trade.quantity
    ).toFixed(2);

    trade.grossProfit =
    (
    (
    trade.exit -
    trade.entry
    )
    *
    trade.quantity
    ).toFixed(2);

    trade.netProfit =
    (
    parseFloat(
    trade.grossProfit
    )
    -
    trade.brokerage
    -
    trade.charges
    ).toFixed(2);

    trade.profitPercent =
    (
    (
    trade.netProfit
    /
    trade.investment
    )
    * 100
    ).toFixed(2);

    trades.push(trade);

    saveTrades();

    renderTrades();

    clearForm();

}

// =====================================
// SAVE
// =====================================

function saveTrades(){

    localStorage.setItem(

        "tradeJournal",

        JSON.stringify(
        trades
        )

    );

}

// =====================================
// RENDER
// =====================================

function renderTrades(){

    const body =
    document.getElementById(
    "journalBody"
    );

    if(!body)
        return;

    let html = "";

    trades.forEach(
    (trade,index)=>{

        let profitColor =
        parseFloat(
        trade.netProfit
        ) >= 0

        ?

        "green"

        :

        "red";

        html += `

        <tr>

        <td>${trade.date}</td>

        <td>${trade.type}</td>

        <td>${trade.symbol}</td>

        <td>${trade.entry}</td>

        <td>${trade.exit}</td>

        <td>${trade.quantity}</td>

        <td>

        ₹${trade.grossProfit}

        </td>

        <td
        style="
        color:${profitColor};
        font-weight:bold;
        ">

        ₹${trade.netProfit}

        </td>

        <td>

        ${trade.rr}

        </td>

        <td>

        ${trade.notes}

        </td>

        <td>

        <button
        onclick="deleteTrade(${index})">

        ❌

        </button>

        </td>

        </tr>

        `;

    });

    body.innerHTML = html;

}

// =====================================
// DELETE
// =====================================

function deleteTrade(index){

    if(
    !confirm(
    "Delete Trade?"
    )
    )
    return;

    trades.splice(
    index,
    1
    );

    saveTrades();

    renderTrades();

}

// =====================================
// CLEAR FORM
// =====================================

function clearForm(){

    document.getElementById(
    "tradeSymbol"
    ).value = "";

    document.getElementById(
    "entryPrice"
    ).value = "";

    document.getElementById(
    "exitPrice"
    ).value = "";

    document.getElementById(
    "quantity"
    ).value = "";

    document.getElementById(
    "brokerage"
    ).value = "";

    document.getElementById(
    "charges"
    ).value = "";

    document.getElementById(
    "riskReward"
    ).value = "";

    document.getElementById(
    "notes"
    ).value = "";

    document.getElementById(
    "screenshotLink"
    ).value = "";

}

// =====================================
// EXPORT CSV
// =====================================

function exportJournalCSV(){

    let rows = [

        [

        "Date",
        "Type",
        "Symbol",
        "Entry",
        "Exit",
        "Qty",
        "Investment",
        "Sale Value",
        "Gross Profit",
        "Net Profit",
        "Profit %",
        "RR",
        "Notes"

        ]

    ];

    trades.forEach(t=>{

        rows.push([

            t.date,
            t.type,
            t.symbol,

            t.entry,
            t.exit,
            t.quantity,

            t.investment,
            t.saleValue,

            t.grossProfit,
            t.netProfit,

            t.profitPercent,

            t.rr,

            t.notes

        ]);

    });

    const csv =

    rows
    .map(
    row =>
    row.join(",")
    )
    .join("\n");

    const blob =

    new Blob(

        [csv],

        {
        type:"text/csv"
        }

    );

    const a =

    document.createElement(
    "a"
    );

    a.href =

    URL.createObjectURL(
    blob
    );

    a.download =

    "trade_journal.csv";

    a.click();

}

// =====================================
// STATS
// =====================================

function getTradeStats(){

    const totalTrades =
    trades.length;

    const totalProfit =

    trades.reduce(

        (sum,t)=>

        sum +
        parseFloat(
        t.netProfit
        ),

        0

    );

    const winners =

    trades.filter(

        t=>

        parseFloat(
        t.netProfit
        ) > 0

    ).length;

    const losers =

    trades.filter(

        t=>

        parseFloat(
        t.netProfit
        ) <= 0

    ).length;

    return {

        totalTrades,

        totalProfit:
        totalProfit.toFixed(2),

        winners,

        losers

    };

}
