// =====================================
// DASHBOARD MODULE
// Version 10.0.0
// =====================================

const Dashboard = {

    init(){

        this.buildDashboard();
        this.buildTopLists();
        this.buildMarketHealth();

    },

    buildDashboard(){

        document.getElementById("totalStocks").innerText =
        allStocks.length;

        const sectors =
        [...new Set(
            allStocks.map(x=>x.sector)
        )];

        document.getElementById("totalSectors").innerText =
        sectors.length;

        document.getElementById("btstCount").innerText =
        allStocks.filter(x=>x.btst_candidate).length;

        document.getElementById("swingCount").innerText =
        allStocks.filter(x=>x.swing_candidate).length;

        document.getElementById("hilegaCount").innerText =
        allStocks.filter(x=>x.hilega_milega).length;

    },

    buildTopLists(){

        const topScore =
        [...allStocks]
        .sort((a,b)=>b.score-a.score)
        .slice(0,10);

        document.getElementById("topMomentum").innerHTML =
        topScore.map(x=>

        `<div>${x.symbol} (${x.score})</div>`

        ).join("");

        document.getElementById("topBTST").innerHTML =

        allStocks
        .filter(x=>x.btst_candidate)
        .slice(0,10)
        .map(x=>`<div>${x.symbol}</div>`)
        .join("");

        document.getElementById("topSwing").innerHTML =

        allStocks
        .filter(x=>x.swing_candidate)
        .slice(0,10)
        .map(x=>`<div>${x.symbol}</div>`)
        .join("");

        document.getElementById("topHilega").innerHTML =

        allStocks
        .filter(x=>x.hilega_milega)
        .slice(0,10)
        .map(x=>`<div>${x.symbol}</div>`)
        .join("");

    },

    buildMarketHealth(){

        if(allStocks.length===0)
        return;

        const bullish =

        allStocks.filter(

        x=>x.score>=80

        ).length;

        const health =

        Math.round(

        bullish/

        allStocks.length

        *100

        );

        document.getElementById(
        "marketHealth"
        ).innerText =

        health+"%";

        let status =
        "🔴 Weak";

        if(health>=60)
        status="🟢 Bullish";

        else if(health>=40)
        status="🟡 Sideways";

        document.getElementById(
        "marketStatus"
        ).innerText =
        status;

    }

};