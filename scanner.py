import json
import yfinance as yf

with open("stocks.json","r",encoding="utf-8") as f:
    stocks=json.load(f)

for stock in stocks:

    symbol=stock["symbol"]

    try:

        df=yf.download(
            symbol,
            period="6mo",
            auto_adjust=True,
            progress=False
        )

        if len(df)<50:
            continue

        price=float(df["Close"].iloc[-1])

        stock["price"]=round(price,2)

        stock["test"]="SUCCESS"

        stock["score"]=100

        print(symbol,"UPDATED")

    except Exception as e:

        print(symbol,e)

with open("stocks.json","w",encoding="utf-8") as f:
    json.dump(stocks,f,indent=2)

print("SCANNER V4 COMPLETE")
