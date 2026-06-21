```python
import json
import yfinance as yf

# Read stocks.json
with open("stocks.json", "r", encoding="utf-8") as f:
    stocks = json.load(f)

print("=" * 50)
print("LIVE MARKET DATA TEST")
print("=" * 50)

for stock in stocks[:5]:

    symbol = stock["symbol"]

    try:

        ticker = yf.Ticker(symbol)

        hist = ticker.history(period="5d")

        if len(hist) > 0:

            price = round(hist["Close"].iloc[-1], 2)

            print(
                symbol,
                "Price:",
                price
            )

        else:

            print(
                symbol,
                "No Data"
            )

    except Exception as e:

        print(
            symbol,
            "Error:",
            str(e)
        )
```
