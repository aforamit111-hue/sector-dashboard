import yfinance as yf

stock = yf.Ticker("RELIANCE.NS")

print("Name:", stock.info.get("longName"))
print("Current Price:", stock.info.get("currentPrice"))
