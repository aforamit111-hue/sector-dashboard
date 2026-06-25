// =====================================
// TRADEPILOT PRO X
// AI BASKET BUILDER V3
// CORE ENGINE
// =====================================

// =============================
// CONVICTION SCORE
// =============================

function getConvictionScore(stock){

    let score = stock.score || 0;

    score += Math.min(
        (stock.volume_ratio || 0) * 5,
        10
    );

    if(stock.btst_candidate)
        score += 10;

    if(stock.swing_candidate)
        score += 8;

    if(stock.hilega_milega)
        score += 7;

    return Math.round(score);

}

// =============================
// STOCK SELECTION
// =============================

function selectBasketStocks(){

    const sectorCount = {};

    const basket = [];

    const filtered =

    [...allStocks]

    .filter(stock=>{

        return(

            stock.score >= settings.minScore &&

            (stock.volume_ratio || 0) >= settings.minVolumeRatio

        );

    })

    .sort(

        (a,b)=>

        getConvictionScore(b)

        -

        getConvictionScore(a)

    );

    filtered.forEach(stock=>{

        if(

            basket.length >=

            settings.basketSize

        )

        return;

        const sector = stock.sector;

        if(!sectorCount[sector])

            sectorCount[sector]=0;

        if(

            sectorCount[sector] >=

            settings.maxSectorStocks

        )

        return;

        basket.push(stock);

        sectorCount[sector]++;

    });

    return basket;

}

// =============================
// SMART ALLOCATION
// =============================

function calculateAllocation(stocks){

    const buyingPower =

        settings.capital *

        settings.leverage;

    const total =

        stocks.reduce(

            (sum,s)=>

            sum +

            getConvictionScore(s),

            0

        );

    return stocks.map(stock=>{

        const conviction =

            getConvictionScore(stock);

        const allocation =

            buyingPower *

            conviction /

            total;

        return{

            stock,

            conviction,

            allocation

        };

    });

}

// =============================
// TRADE PLAN
// =============================

function buildTradePlan(

    stock,

    allocation

){

    const entry =

    Number(stock.price || 0);

    const atr =

    Number(stock.atr || 0);

    const qty =

    Math.floor(

        allocation /

        entry

    );

    const investment =

    qty *

    entry;

    const stopLoss =

    entry - atr;

    const target =

    entry + (atr * 2);

    return{

        qty,

        investment,

        entry,

        stopLoss,

        target,

        rr:"1 : 2",

        holding:"3-7 Days"

    };

}

// =====================================
// GENERATE AI BASKET
// =====================================

function generateBasket(){

    const body = document.getElementById("basketBody");

    if(!body) return;

    const candidates = selectBasketStocks();

    if(candidates.length===0){

        body.innerHTML=`
        <tr>
            <td colspan="11">
                No Basket Found
            </td>
        </tr>
        `;

        return;

    }

    const basket = calculateAllocation(candidates);

    let html="";

    basket.forEach((item,index)=>{

        const stock = item.stock;

        const trade = buildTradePlan(
            stock,
            item.allocation
        );

        html += `

        <tr>

            <td>${index+1}</td>

            <td>${stock.symbol}</td>

            <td>${stock.sector}</td>

            <td>${stock.score}</td>

            <td>${item.conviction}</td>

            <td>₹${Math.round(item.allocation).toLocaleString()}</td>

            <td>${trade.qty}</td>

            <td>₹${trade.entry.toFixed(2)}</td>

            <td>₹${trade.stopLoss.toFixed(2)}</td>

            <td>₹${trade.target.toFixed(2)}</td>

            <td>${trade.rr}</td>

        </tr>

        `;

    });

    body.innerHTML = html;

    updateBasketSummary(basket);

    refreshBasketCards();

}
// =====================================
// AI CONVICTION SCORE
// =====================================

function getConviction(stock){

let score = 0;

score += stock.score || 0;

if((stock.volume_ratio||0)>=1.5)
score += 5;

if(stock.btst_candidate)
score += 5;

if(stock.swing_candidate)
score += 5;

if(stock.hilega_milega)
score += 5;

return score;

}
function refreshBasketCards(){

document.getElementById(
"basketCapital"
).innerText =

"₹"+settings.capital.toLocaleString();

document.getElementById(
"basketBuyingPower"
).innerText =

"₹"+(
settings.capital *
settings.leverage
).toLocaleString();

}

// =====================================
// SMART ALLOCATION ENGINE
// =====================================

function calculateAllocation(stocks){

    const buyingPower =
    settings.capital *
    settings.leverage;

    const totalConviction =
    stocks.reduce(
        (sum, stock)=>sum + getConvictionScore(stock),
        0
    );

    return stocks.map(stock=>{

        const conviction =
        getConvictionScore(stock);

        const allocation =
        buyingPower *
        (conviction / totalConviction);

        return{

            stock,

            conviction,

            allocation

        };

    });

}

// =====================================
// TRADE PLAN ENGINE
// =====================================

function buildTradePlan(stock, allocation){

    const entry = Number(stock.price || 0);

    const atr = Number(stock.atr || 0);

    const qty = Math.floor(allocation / entry);

    const investment = qty * entry;

    const stopLoss = (entry - atr).toFixed(2);

    const target = (entry + atr * 2).toFixed(2);

    const maxLoss = ((entry - stopLoss) * qty).toFixed(2);

    const expectedProfit = ((target - entry) * qty).toFixed(2);

    return{

        qty,

        investment,

        entry,

        stopLoss,

        target,

        maxLoss,

        expectedProfit,

        rr:"1 : 2",

        holding:"3-7 Days"

    };

}
// =====================================
// BASKET QUALITY
// =====================================

function basketQuality(stocks){

    if(stocks.length===0)

        return 0;

    let total =

    stocks.reduce(

        (a,b)=>a+b.score,

        0

    );

    return (

        total /

        stocks.length

    ).toFixed(2);

}
// =====================================
// UPDATE BASKET SUMMARY
// =====================================

function updateBasketSummary(basket){

    let investment = 0;
    let profit = 0;
    let loss = 0;
    let quality = 0;

    basket.forEach(item=>{

        const trade =
        buildTradePlan(
            item.stock,
            item.allocation
        );

        investment += trade.investment;

        profit +=
        (trade.target - trade.entry) *
        trade.qty;

        loss +=
        (trade.entry - trade.stopLoss) *
        trade.qty;

        quality += item.conviction;

    });

    quality =
    Math.round(
        quality /
        basket.length
    );

    document.getElementById(
        "basketInvestment"
    ).innerText =
    "₹"+investment.toLocaleString();

    document.getElementById(
        "basketProfit"
    ).innerText =
    "₹"+Math.round(profit).toLocaleString();

    document.getElementById(
        "basketLoss"
    ).innerText =
    "₹"+Math.round(loss).toLocaleString();

    document.getElementById(
        "basketQuality"
    ).innerText =
    quality+"%";

    let decision="WAIT";

    if(quality>=90)
        decision="🟢 STRONG BUY";

    else if(quality>=80)
        decision="🟢 BUY";

    else if(quality>=70)
        decision="🟡 HOLD";

    else
        decision="🔴 NO TRADE";

    document.getElementById(
        "basketDecision"
    ).innerText =
    decision;

    document.getElementById(
        "basketConfidence"
    ).innerText =
    quality+"%";

}