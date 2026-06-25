// ============================================
// TRADEPILOT AI ENGINE V1
// ============================================

const AIEngine = {

    marketHealth: 0,

    forecast: "SIDEWAYS",

    newsBias: "NEUTRAL",

    risk: "LOW",

    confidence: 0,

    action: "WAIT",

    calculate() {

        const health = this.marketHealth;

        let score = health;

        if (this.forecast === "BULLISH")
            score += 15;

        if (this.forecast === "BEARISH")
            score -= 15;

        if (this.newsBias === "POSITIVE")
            score += 10;

        if (this.newsBias === "NEGATIVE")
            score -= 10;

        if (this.risk === "HIGH")
            score -= 15;

        score = Math.max(0, Math.min(score, 100));

        this.confidence = score;

        if (score >= 75)
            this.action = "🟢 BUY";

        else if (score >= 55)
            this.action = "🟡 HOLD";

        else
            this.action = "🔴 NO TRADE";

        this.updateDashboard();

    },

    updateDashboard() {

        document.getElementById("aiStatus").innerText =
            this.action;

        document.getElementById("aiConfidence").innerText =
            this.confidence + "%";

        document.getElementById("aiAction").innerText =
            this.action;

    }

};