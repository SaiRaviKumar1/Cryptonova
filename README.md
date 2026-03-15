# CryptoNova — Live Crypto Tracker

A full-stack crypto market tracker powered by the CoinGecko public API.
Built with Python/Flask + vanilla HTML/CSS/JS.

## Features
- Live prices for top 50 coins (auto-refreshes every 60s)
- Scrolling ticker tape
- Grid and Table view
- Sparkline 7-day charts on cards
- Detailed modal with interactive price charts (1D / 7D / 30D / 90D / 1Y)
- Trending coins section
- Global market stats (market cap, volume, BTC dominance)
- Search + sort by rank, price, 24h change, market cap, volume

## Run Locally

```bash
pip install flask gunicorn
python app.py
# Open http://localhost:5000
```


## Notes
- Uses CoinGecko **public API** (no API key needed)
- Rate limit: 30 calls/minute (well within limits for 1 user)
- For high traffic, get a free CoinGecko API key at https://www.coingecko.com/en/api
=======
CryptoNova 🚀
Live Cryptocurrency Market Tracker
A full-stack web app that tracks real-time prices, market caps, and trends for the top 50 cryptocurrencies — built with Python, Flask, and vanilla JavaScript.
Report Bug

Features

📈 Live prices for top 50 coins — auto-refreshes every 60 seconds
🎛️ Grid & Table views with search and sort (rank, price, 24h%, market cap, volume)
🔥 Trending coins section powered by CoinGecko
📊 Interactive price charts — 1D, 7D, 30D, 90D, 1Y history
✨ Sparkline mini-charts on every coin card
🌍 Global market stats — total market cap, volume, BTC dominance
📱 Fully responsive — works on desktop and mobile


Tech stack:
Backend                  Python, Flask
Frontend                 HTML, CSS, JavaScript
Charts                   Chart.js
Data                     CoinGecko Public API
>>>>>>> ae3e84fb3ca0562112029782c673542fff0ea0ab
