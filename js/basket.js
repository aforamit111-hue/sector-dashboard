// =====================================
// AI BASKET BUILDER V1
// =====================================
// =====================================
// CONVICTION SCORE ENGINE
// =====================================

function getConvictionScore(stock){

    let score = 0;

    // Scanner Score (0–60)
    score += (stock.score || 0) * 0.6;

    // Volume Ratio (0–15)
    score += Math.min((stock.volume_ratio || 0) * 10, 15);

    // BTST
    if(stock.btst_candidate)
        score += 10;

    // Swing
    if(stock.swing_candidate)
        score += 8;

    // Hilega
    if(stock.hilega_milega)
        score += 7;

    return Math.round(score);

}

// =====================================
// AI STOCK SELECTION ENGINE
// =====================================

function selectBasketStocks(){

    let sectorCount = {};

    const filtered =

    [...allStocks]

    .filter(stock=>{

        return(

            stock.score >= settings.minScore &&

            (stock.volume_ratio || 0) >= settings.minVolumeRatio

        );

    })

    .sort((a,b)=>b.score-a.score);

    const basket=[];

    filtered.forEach(stock=>{

        const sector = stock.sector;

        if(!sectorCount[sector])

            sectorCount[sector]=0;

        if(sectorCount[sector] >= settings.maxSectorStocks)

            return;

        basket.push(stock);

        sectorCount[sector]++;

        if(basket.length >= settings.basketSize)

            return;

    });

    return basket;

}

function generateBasket(){

    const body = document.getElementById("basketBody");

    if(!body) return;

    // Read settings
    const capital = settings.capital;
    const leverage = settings.leverage;
    const basketSize = settings.basketSize;

    const buyingPower = capital * leverage;

    // Filter good stocks
    const candidates = selectBasketStocks();
    if(candidates.length===0){

        body.innerHTML=

`.      <tr>

        <td colspan="10">

        No Basket Found

        </td>

        </tr>`;

        return;

    }

        .filter(stock =>

            stock.score >= settings.minScore &&
            (stock.volume_ratio || 0) >= settings.minVolumeRatio

        )

        .sort((a,b)=>b.score-a.score)

        .slice(0,basketSize);

    if(candidates.length===0){

        body.innerHTML=`
        <tr>
        <td colspan="9">
        No stocks found.
        </td>
        </tr>
        `;

        return;

    }


    let html="";

    const basket =
calculateAllocation(candidates);

basket.forEach((item,index)=>{

    const stock =
    item.stock;

    const allocation =
    item.allocation;

    const qty =
    Math.floor(
        allocation /
        stock.price
    );

    const investment =
    qty * stock.price;(stock,index)=>{

        const qty = Math.floor(
            allocation /
            stock.price
        );

        const investment =
        qty * stock.price;

        html += `

        <tr>

        <td>${index+1}</td>

        <td>${stock.symbol}</td>

        <td>${stock.sector}</td>

        <td>${stock.score}</td>

        <td>${item.conviction}</td>

        <td>
        ₹$     
      {Math.round(allocation).toLocaleString()}

       </td>

        <td>${qty}</td>

        <td>₹${investment.toFixed(0)}</td>

        </tr>

        `;

    });

    body.innerHTML = html;

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