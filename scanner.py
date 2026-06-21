```python
import json

with open("stocks.json", "r") as f:
    stocks = json.load(f)

print("Total Stocks:", len(stocks))

for stock in stocks[:5]:
    print(stock["symbol"])
```
