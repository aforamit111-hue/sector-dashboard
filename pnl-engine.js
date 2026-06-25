// =====================================
// PROFESSIONAL P&L ENGINE V1
// =====================================

// Change these values according to your broker
const CHARGES = {

    brokerageRate: 0.0003,      // 0.03%
    sttRate: 0.001,             // Delivery sell STT
    exchangeRate: 0.0000345,
    sebiRate: 0.000001,
    gstRate: 0.18,
    stampDutyRate: 0.00015,

    dpCharge: 27,

    mtfInterest: 0.00041 // 0.041% per day
};

function calculateNetPnL({

    buyPrice,
    sellPrice,
    quantity,
    holdingDays = 1

}){

    const buyValue = buyPrice * quantity;

    const sellValue = sellPrice * quantity;

    const grossProfit = sellValue - buyValue;

    const brokerage =
        (buyValue + sellValue) *
        CHARGES.brokerageRate;

    const exchange =
        (buyValue + sellValue) *
        CHARGES.exchangeRate;

    const sebi =
        (buyValue + sellValue) *
        CHARGES.sebiRate;

    const stt =
        sellValue *
        CHARGES.sttRate;

    const stamp =
        buyValue *
        CHARGES.stampDutyRate;

    const gst =
        (brokerage + exchange) *
        CHARGES.gstRate;

    const interest =
        buyValue *
        CHARGES.mtfInterest *
        holdingDays;

    const totalCharges =

        brokerage +
        exchange +
        sebi +
        stt +
        stamp +
        gst +
        interest +
        CHARGES.dpCharge;

    const netProfit =
        grossProfit -
        totalCharges;

    return {

        buyValue,

        sellValue,

        grossProfit,

        brokerage,

        exchange,

        sebi,

        stt,

        stamp,

        gst,

        interest,

        dpCharge:
        CHARGES.dpCharge,

        totalCharges,

        netProfit

    };

}