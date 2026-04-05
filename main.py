from fastapi import FastAPI
import requests
import threading
import time

app = FastAPI()

# 🔁 Background Trading Loop
def trading_loop():
    while True:
        try:
            url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
            data = requests.get(url).json()

            if "bitcoin" in data:
                price = data["bitcoin"]["usd"]
                print(f"BTC Price: {price}")
            else:
                print("API error or limit reached:", data)

        except Exception as e:
            print("Error:", e)

        time.sleep(10) 

# 🚀 Start loop on server start
@app.on_event("startup")
def start_loop():
    thread = threading.Thread(target=trading_loop)
    thread.start()

@app.get("/")
def home():
    return {"message": "ZerionX1 Running 🚀"}

@app.get("/price")
def price():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    data = requests.get(url).json()
    return {"BTCUSD": data["bitcoin"]["usd"]}
