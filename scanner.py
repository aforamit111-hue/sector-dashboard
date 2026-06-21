import yfinance as yf

stock = yf.Ticker("RELIANCE.NS")

print(stock.history(period="5d"))
