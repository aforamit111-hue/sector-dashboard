import json
import yfinance as yf

# Load stocks
with open("stocks.json", "r", encoding="utf-8") as f:
    stocks = json.load(f)

print("Updating prices...")

for stock in stocks:

    symbol = stock["symbol"]

    try:

        ticker = yf.Ticker(symbol)

        hist = ticker.history(period="5d")

        if len(hist) > 0:

            price = round(
                float(hist["Close"].iloc[-1]),
                2
            )

            stock["price"] = price

            print(
                symbol,
                "->",
                price
            )

    except Exception as e:

        print(
            symbol,
            "ERROR:",
            str(e)
        )

# Save updated file
with open("stocks.json", "w", encoding="utf-8") as f:
    json.dump(
        stocks,
        f,
        indent=2
    )

print("stocks.json updated")
