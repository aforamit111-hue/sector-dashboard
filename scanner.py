import json
import numpy as np
import pandas as pd
import yfinance as yf

print("===== SCANNER V5 STARTED =====")

# -------------------------
# RSI
# -------------------------
def calculate_rsi(close, period=14):

    delta = close.diff()

    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()

    rs = avg_gain / avg_loss

    rsi = 100 - (100 / (1 + rs))

    return rsi


# -------------------------
# WMA
# -------------------------
def weighted_moving_average(series, period):

    weights = np.arange(1, period + 1)

    return series.rolling(period).apply(
        lambda x: np.dot(x, weights) / weights.sum(),
        raw=True
    )


# -------------------------
# Load Stocks
# -------------------------
with open("stocks.json", "r", encoding="utf-8") as f:
    stocks = json.load(f)

print(f"Loaded {len(stocks)} stocks")

updated = 0

# -------------------------
# Process Stocks
# -------------------------
for stock in stocks:

    symbol = stock["symbol"]

    try:

        print(f"Processing {symbol}")

        df = yf.download(
            symbol,
            period="1y",
            auto_adjust=True,
            progress=False
        )

        if len(df) < 220:
            print(f"{symbol} skipped")
            continue

        close = df["Close"].squeeze()
        volume = df["Volume"].squeeze()

        # -------------------------
        # Price
        # -------------------------
        price = round(float(close.iloc[-1]), 2)

        # -------------------------
        # DMA
        # -------------------------
        dma50 = round(
            float(close.rolling(50).mean().iloc[-1]),
            2
        )

        dma200 = round(
            float(close.rolling(200).mean().iloc[-1]),
            2
        )

        # -------------------------
        # RSI
        # -------------------------
        rsi_series = calculate_rsi(close)

        rsi = round(
            float(rsi_series.iloc[-1]),
            2
        )

        # -------------------------
        # EMA(3) on RSI
        # -------------------------
        rsi_ema3 = round(
            float(
                rsi_series.ewm(span=3).mean().iloc[-1]
            ),
            2
        )

        # -------------------------
        # WMA(21) on RSI
        # -------------------------
        rsi_wma21 = round(
            float(
                weighted_moving_average(
                    rsi_series,
                    21
                ).iloc[-1]
            ),
            2
        )

        # -------------------------
        # Volume
        # -------------------------
        current_volume = int(volume.iloc[-1])

        avg_volume = int(
            volume.tail(20).mean()
        )

        volume_ratio = round(
            current_volume / avg_volume,
            2
        ) if avg_volume > 0 else 0

        # -------------------------
        # Score
        # -------------------------
        score = 0

        if price > dma50:
            score += 20

        if price > dma200:
            score += 20

        if rsi > 60:
            score += 20

        if rsi_ema3 > rsi_wma21:
            score += 20

        if volume_ratio > 1.5:
            score += 20

        # -------------------------
        # BTST
        # -------------------------
        btst_candidate = (
            score >= 80 and
            volume_ratio > 1.5
        )

        # -------------------------
        # Swing
        # -------------------------
        swing_candidate = (
            score >= 80 and
            price > dma200
        )

        # -------------------------
        # Hilega Milega Signal
        # -------------------------
        hilega_milega = (
            rsi > 60 and
            rsi_ema3 > rsi_wma21 and
            volume_ratio > 1.2
        )

        # -------------------------
        # Save Data
        # -------------------------
        stock["price"] = price

        stock["dma50"] = dma50
        stock["dma200"] = dma200

        stock["rsi"] = rsi
        stock["rsi_ema3"] = rsi_ema3
        stock["rsi_wma21"] = rsi_wma21

        stock["volume"] = current_volume
        stock["avg_volume"] = avg_volume
        stock["volume_ratio"] = volume_ratio

        stock["score"] = score

        stock["btst_candidate"] = btst_candidate
        stock["swing_candidate"] = swing_candidate

        stock["hilega_milega"] = hilega_milega

        updated += 1

        print(
            f"{symbol} OK | "
            f"RSI={rsi} | "
            f"Score={score}"
        )

    except Exception as e:

        print(
            f"{symbol} ERROR -> {repr(e)}"
        )

# -------------------------
# Save JSON
# -------------------------
with open("stocks.json", "w", encoding="utf-8") as f:

    json.dump(
        stocks,
        f,
        indent=2
    )

print(f"Updated Stocks = {updated}")
print("===== SCANNER V5 COMPLETE =====")
