import json
import numpy as np
import pandas as pd
import yfinance as yf

print("===== SCANNER V3.1 STARTED =====")

def calculate_rsi(close, period=14):
delta = close.diff()

```
gain = delta.where(delta > 0, 0)
loss = -delta.where(delta < 0, 0)

avg_gain = gain.rolling(period).mean()
avg_loss = loss.rolling(period).mean()

rs = avg_gain / avg_loss

return 100 - (100 / (1 + rs))
```

def weighted_moving_average(series, period):
weights = np.arange(1, period + 1)

```
return series.rolling(period).apply(
    lambda x: np.dot(x, weights) / weights.sum(),
    raw=True
)
```

with open("stocks.json", "r", encoding="utf-8") as f:
stocks = json.load(f)

print(f"Total Stocks Loaded: {len(stocks)}")

updated_count = 0

for stock in stocks:

```
symbol = stock["symbol"]

try:

    print(f"Downloading: {symbol}")

    df = yf.download(
        symbol,
        period="1y",
        auto_adjust=True,
        progress=False
    )

    if len(df) < 220:
        print(f"{symbol} skipped - insufficient data")
        continue

    close = df["Close"]
    volume = df["Volume"]

    price = round(float(close.iloc[-1]), 2)

    dma50 = round(float(close.rolling(50).mean().iloc[-1]), 2)

    dma200 = round(float(close.rolling(200).mean().iloc[-1]), 2)

    rsi_series = calculate_rsi(close)

    rsi = round(float(rsi_series.iloc[-1]), 2)

    rsi_ema3 = round(
        float(
            rsi_series.ewm(span=3).mean().iloc[-1]
        ),
        2
    )

    rsi_wma21 = round(
        float(
            weighted_moving_average(
                rsi_series,
                21
            ).iloc[-1]
        ),
        2
    )

    current_volume = int(volume.iloc[-1])

    avg_volume = int(volume.tail(20).mean())

    volume_ratio = round(
        current_volume / avg_volume,
        2
    ) if avg_volume > 0 else 0

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

    btst_candidate = (
        score >= 80 and
        volume_ratio > 1.5
    )

    swing_candidate = (
        score >= 80 and
        price > dma200
    )

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

    updated_count += 1

    print(
        f"{symbol} UPDATED | "
        f"RSI={rsi} | "
        f"Score={score}"
    )

except Exception as e:

    print(
        f"{symbol} FAILED -> {repr(e)}"
    )
```

with open("stocks.json", "w", encoding="utf-8") as f:
json.dump(
stocks,
f,
indent=2
)

print(f"Updated Stocks: {updated_count}")
print("===== SCANNER V3.1 COMPLETED =====")
