from fastapi import FastAPI
import requests

app = FastAPI()

@app.get("/")
def home():
    return {"message": "ZerionX1 Running 🚀"}

@app.get("/price")
def price():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    data = requests.get(url).json()
    return {"BTCUSD": data["bitcoin"]["usd"]}
