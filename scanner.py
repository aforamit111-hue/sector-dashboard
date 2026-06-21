import json

# Read stocks.json
with open("stocks.json", "r", encoding="utf-8") as f:
    stocks = json.load(f)

print("=" * 50)
print("NIFTY DASHBOARD SCANNER")
print("=" * 50)

print(f"Total Stocks: {len(stocks)}")
print()

print("First 10 Stocks:")
print("-" * 50)

for stock in stocks[:10]:
    print(stock["symbol"])

print("-" * 50)
print("Scanner completed successfully.")
