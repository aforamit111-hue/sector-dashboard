import json
import numpy as np
import pandas as pd
import yfinance as yf

print("===== SCANNER V6.5 STARTED =====")

def calculate_rsi(close, period=14):
    delta = close.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def weighted_moving_average(series, period):
    weights = np.arange(1, period + 1)
    return series.rolling(period).apply(
        lambda x: np.dot(x, weights) / weights.sum(),
        raw=True
    )

def calculate_atr(df, period=14):
    high = df["High"].squeeze()
    low = df["Low"].squeeze()
    close = df["Close"].squeeze()
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    return tr.rolling(period).mean()

with open("stocks.json","r",encoding="utf-8") as f:
    stocks=json.load(f)

for stock in stocks:
    try:
        symbol=stock["symbol"]
        df=yf.download(symbol,period="1y",auto_adjust=True,progress=False)
        if len(df)<220:
            continue

        close=df["Close"].squeeze()
        high=df["High"].squeeze()
        volume=df["Volume"].squeeze()

        price=round(float(close.iloc[-1]),2)
        dma50=round(float(close.rolling(50).mean().iloc[-1]),2)
        dma200=round(float(close.rolling(200).mean().iloc[-1]),2)

        rsi_series=calculate_rsi(close)
        rsi=round(float(rsi_series.iloc[-1]),2)
        rsi_ema3=round(float(rsi_series.ewm(span=3).mean().iloc[-1]),2)
        rsi_wma21=round(float(weighted_moving_average(rsi_series,21).iloc[-1]),2)

        current_volume=int(volume.iloc[-1])
        avg_volume=int(volume.tail(20).mean())
        volume_ratio=round(current_volume/avg_volume,2) if avg_volume else 0

        atr=round(float(calculate_atr(df).iloc[-1]),2)
        atr_percent=round((atr/price)*100,2) if price else 0
        high_52w=round(float(high.max()),2)
        distance_52w=round(((high_52w-price)/high_52w)*100,2) if high_52w else 0

        score=0
        if price>dma50: score+=20
        if price>dma200: score+=20
        if rsi>60: score+=20
        if rsi_ema3>rsi_wma21: score+=20
        if volume_ratio>1.5: score+=20

        stock.update({
            "price":price,
            "dma50":dma50,
            "dma200":dma200,
            "rsi":rsi,
            "rsi_ema3":rsi_ema3,
            "rsi_wma21":rsi_wma21,
            "volume":current_volume,
            "avg_volume":avg_volume,
            "volume_ratio":volume_ratio,
            "atr":atr,
            "atr_percent":atr_percent,
            "high_52w":high_52w,
            "distance_52w":distance_52w,
            "score":score,
            "btst_candidate": score>=80 and volume_ratio>1.5,
            "swing_candidate": score>=80 and price>dma200,
            "hilega_milega": rsi>60 and rsi_ema3>rsi_wma21 and volume_ratio>1.2
        })
    except Exception as e:
        print(symbol,e)

with open("stocks.json","w",encoding="utf-8") as f:
    json.dump(stocks,f,indent=2)

print("===== SCANNER V6.5 COMPLETE =====")
