import json
import numpy as np
import pandas as pd
import yfinance as yf

# =====================================
# RSI
# =====================================

def calculate_rsi(close, period=14):

    delta = .diff()

    gain = delta.where(delta > 0, 0)

    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(period).mean()

    avg_loss = loss.rolling(period).mean()

    rs = avg_gain / avg_loss

    rsi = 100 - (100 / (1 + rs))

    return rsi


# =====================================
# WMA
# =====================================

def weighted_moving_average(series, period):

    weights = np.arange(1, period + 1)

    return series.rolling(period).apply(
        lambda x: np.dot(x, weights) / weights.sum(),
        raw=True
    )


# =====================================
# ATR
# =====================================

def calculate_atr(df, period=14):

    high = df["High"]

    low = df["Low"]

     = df["Close"]

    tr1 = high - low

    tr2 = abs(high - close.shift())

    tr3 = abs(low - close.shift())

    tr = pd.concat(
        [tr1, tr2, tr3],
        axis=1
    ).max(axis=1)

    atr = tr.rolling(period).mean()

    return atr


# =====================================
# PERFORMANCE %
# =====================================

def calculate_return(close, days):

    if len(close) < days:

        return 0

    old_price = float(close.iloc[-days])

    new_price = float(close.iloc[-1])

    if old_price <= 0:

        return 0

    return round(
        ((new_price - old_price) / old_price) * 100,
        2
    )


# =====================================
# RS SCORE
# =====================================

def calculate_rs_score(

        stock_3m,
        stock_6m,
        stock_12m,

        nifty_3m,
        nifty_6m,
        nifty_12m

):

    rs_3m = stock_3m - nifty_3m

    rs_6m = stock_6m - nifty_6m

    rs_12m = stock_12m - nifty_12m

    weighted_rs = (

        rs_3m * 0.40 +

        rs_6m * 0.30 +

        rs_12m * 0.30

    )

    return weighted_rs


# =====================================
# BENCHMARK
# =====================================

print("Downloading NIFTY50...")

nifty = yf.download(

    "^NSEI",

    period="1y",

    progress=False,

    auto_adjust=True

)

nifty_close = nifty["Close"]

nifty_3m = calculate_return(
    nifty_close,
    63
)

nifty_6m = calculate_return(
    nifty_close,
    126
)

nifty_12m = calculate_return(
    nifty_close,
    252
)

print(

    "NIFTY RS Benchmark",

    nifty_3m,

    nifty_6m,

    nifty_12m

)

# =====================================
# LOAD STOCKS
# =====================================

with open(
    "stocks.json",
    "r",
    encoding="utf-8"
) as f:

    stocks = json.load(f)

print(

    f"Processing {len(stocks)} stocks..."

)

sector_scores = {}

market_above_50 = 0

market_above_200 = 0

processed_count = 0

# =====================================
# PROCESS STOCKS
# =====================================

for stock in stocks:

    symbol = stock["symbol"]

    print(f"Processing {symbol}")

    try:

        df = yf.download(
            symbol,
            period="1y",
            progress=False,
            auto_adjust=True
        )

        if len(df) < 252:

            print(symbol, "skipped")

            continue

        close = df["Close"].squeeze()
        high = df["High"].squeeze()
        low = df["Low"].squeeze()
        volume = df["Volume"].squeeze()

        processed_count += 1

        # ==========================
        # PRICE
        # ==========================

        price = round(
            float(close.iloc[-1]),
            2
        )

        # ==========================
        # DMA
        # ==========================

        dma50 = round(
            float(
                close.rolling(50)
                .mean()
                .iloc[-1]
            ),
            2
        )

        dma200 = round(
            float(
                close.rolling(200)
                .mean()
                .iloc[-1]
            ),
            2
        )

        if price > dma50:

            market_above_50 += 1

        if price > dma200:

            market_above_200 += 1

        # ==========================
        # RSI
        # ==========================

        rsi_series = calculate_rsi(close)

        rsi = round(
            float(rsi_series.iloc[-1]),
            2
        )

        rsi_ema3 = round(
            float(
                rsi_series
                .ewm(span=3)
                .mean()
                .iloc[-1]
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

        # ==========================
        # VOLUME
        # ==========================

        current_volume = int(
            volume.iloc[-1]
        )

        avg_volume = int(
            volume.tail(20)
            .mean()
        )

        volume_ratio = round(
            current_volume / avg_volume,
            2
        ) if avg_volume > 0 else 0

        # ==========================
        # ATR
        # ==========================

        atr = round(
            float(
                calculate_atr(df)
                .iloc[-1]
            ),
            2
        )

        atr_percent = round(
            (atr / price) * 100,
            2
        )

        # ==========================
        # 52 WEEK HIGH
        # ==========================

        high_52w = round(
            float(
                high.max()
            ),
            2
        )

        distance_52w = round(

            (
                (
                    high_52w -
                    price
                )
                /
                high_52w
            ) * 100,

            2

        )

        # ==========================
        # RELATIVE STRENGTH
        # ==========================

        stock_3m = calculate_return(
            close,
            63
        )

        stock_6m = calculate_return(
            close,
            126
        )

        stock_12m = calculate_return(
            close,
            252
        )

        rs_raw = calculate_rs_score(

            stock_3m,
            stock_6m,
            stock_12m,

            nifty_3m,
            nifty_6m,
            nifty_12m

        )

        rs_score = max(

            1,

            min(
                100,
                int(
                    50 +
                    rs_raw
                )
            )

        )

        # ==========================
        # TREND SCORE
        # ==========================

        trend_score = 0

        if price > dma50:

            trend_score += 12.5

        if price > dma200:

            trend_score += 12.5

        # ==========================
        # MOMENTUM SCORE
        # ==========================

        momentum_score = 0

        if rsi > 60:

            momentum_score += 10

        if rsi_ema3 > rsi_wma21:

            momentum_score += 10

        # ==========================
        # VOLUME SCORE
        # ==========================

        volume_score = 0

        if volume_ratio > 1.5:

            volume_score = 15

        elif volume_ratio > 1.2:

            volume_score = 10

        elif volume_ratio > 1:

            volume_score = 5

        # ==========================
        # STORE TEMP VALUES
        # ==========================

        stock["price"] = price

        stock["dma50"] = dma50
        stock["dma200"] = dma200

        stock["rsi"] = rsi

        stock["rsi_ema3"] = rsi_ema3
        stock["rsi_wma21"] = rsi_wma21

        stock["volume"] = current_volume

        stock["avg_volume"] = avg_volume

        stock["volume_ratio"] = volume_ratio

        stock["atr"] = atr
        stock["atr_percent"] = atr_percent

        stock["high_52w"] = high_52w

        stock["distance_52w"] = distance_52w

        stock["rs_score"] = rs_score

        stock["_trend_score"] = trend_score

        stock["_momentum_score"] = momentum_score

        stock["_volume_score"] = volume_score

        stock["_rs_score"] = (

            rs_score * 0.25

        )

        # ==========================
        # SECTOR BUCKET
        # ==========================

        sector = stock["sector"]

        if sector not in sector_scores:

            sector_scores[sector] = []

        sector_scores[sector].append(

            rs_score

        )

        print(

            symbol,

            "| RS:",

            rs_score,

            "| RSI:",

            rsi

        )

    except Exception as e:

        print(

            symbol,

            str(e)

        )

# =====================================
# SECTOR STRENGTH
# =====================================

sector_strength_map = {}

for sector, values in sector_scores.items():

    if len(values) == 0:

        sector_strength_map[sector] = 0

    else:

        sector_strength_map[sector] = round(

            sum(values) / len(values),

            2

        )

# =====================================
# COMPOSITE SCORE
# =====================================

for stock in stocks:

    sector_strength = sector_strength_map.get(

        stock["sector"],

        0

    )

    stock["sector_strength"] = sector_strength

    sector_component = (

        sector_strength * 0.15

    )

    composite_score = round(

        stock.get("_trend_score", 0)

        +

        stock.get("_momentum_score", 0)

        +

        stock.get("_volume_score", 0)

        +

        stock.get("_rs_score", 0)

        +

        sector_component,

        2

    )

    if composite_score > 100:

        composite_score = 100

    stock["composite_score"] = composite_score

    # ==========================
    # BTST V7
    # ==========================

    btst_candidate = (

        composite_score >= 75

        and

        stock["volume_ratio"] >= 1.2

        and

        stock["rsi"] >= 60

    )

    # ==========================
    # SWING V7
    # ==========================

    swing_candidate = (

        composite_score >= 70

        and

        stock["price"] > stock["dma200"]

    )

    # ==========================
    # HILEGA MILEGA V7
    # ==========================

    hilega_milega = (

        stock["volume_ratio"] >= 1.5

        and

        stock["distance_52w"] <= 10

        and

        stock["rs_score"] >= 70

    )

    stock["btst_candidate"] = btst_candidate

    stock["swing_candidate"] = swing_candidate

    stock["hilega_milega"] = hilega_milega

    # cleanup temp fields

    stock.pop("_trend_score", None)

    stock.pop("_momentum_score", None)

    stock.pop("_volume_score", None)

    stock.pop("_rs_score", None)

# =====================================
# MARKET HEALTH
# =====================================

above50_percent = round(

    (market_above_50 / processed_count) * 100,

    2

) if processed_count else 0

above200_percent = round(

    (market_above_200 / processed_count) * 100,

    2

) if processed_count else 0

market_health = round(

    (above50_percent + above200_percent) / 2,

    2

)

if market_health >= 60:

    market_status = "Bullish"

elif market_health >= 40:

    market_status = "Sideways"

else:

    market_status = "Weak"

print("\n===== MARKET HEALTH =====")

print(

    "Above 50 DMA:",

    above50_percent,

    "%"

)

print(

    "Above 200 DMA:",

    above200_percent,

    "%"

)

print(

    "Market Health:",

    market_health,

    "%"

)

print(

    "Market Status:",

    market_status

)

# =====================================
# TOP SECTORS
# =====================================

print("\n===== TOP SECTORS =====")

top_sectors = sorted(

    sector_strength_map.items(),

    key=lambda x: x[1],

    reverse=True

)

for sector, score in top_sectors[:10]:

    print(

        sector,

        ":",

        score

    )

# =====================================
# SAVE JSON
# =====================================

with open(

    "stocks.json",

    "w",

    encoding="utf-8"

) as f:

    json.dump(

        stocks,

        f,

        indent=2

    )

print("\nUpdated Stocks =", len(stocks))

print("===== SCANNER V7 COMPLETE =====")
