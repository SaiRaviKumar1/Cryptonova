from flask import Flask, render_template, jsonify
import urllib.request
import json

app = Flask(__name__)

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "CryptoTracker/1.0"})
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode())

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/coins")
def get_coins():
    url = (
        f"{COINGECKO_BASE}/coins/markets"
        "?vs_currency=usd"
        "&order=market_cap_desc"
        "&per_page=50"
        "&page=1"
        "&sparkline=true"
        "&price_change_percentage=1h,24h,7d"
    )
    data = fetch_json(url)
    return jsonify(data)

@app.route("/api/coin/<coin_id>")
def get_coin_detail(coin_id):
    url = (
        f"{COINGECKO_BASE}/coins/{coin_id}"
        "?localization=false"
        "&tickers=false"
        "&market_data=true"
        "&community_data=false"
        "&developer_data=false"
        "&sparkline=true"
    )
    data = fetch_json(url)
    return jsonify(data)

@app.route("/api/chart/<coin_id>/<days>")
def get_chart(coin_id, days):
    url = (
        f"{COINGECKO_BASE}/coins/{coin_id}/market_chart"
        f"?vs_currency=usd&days={days}"
    )
    data = fetch_json(url)
    return jsonify(data)

@app.route("/api/global")
def get_global():
    url = f"{COINGECKO_BASE}/global"
    data = fetch_json(url)
    return jsonify(data)

@app.route("/api/trending")
def get_trending():
    url = f"{COINGECKO_BASE}/search/trending"
    data = fetch_json(url)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
