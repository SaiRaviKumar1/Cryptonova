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

---

## 🚀 Deploy for Free (Choose One)

### Option 1: Railway (EASIEST — Recommended)
1. Create account at https://railway.app
2. Click **New Project → Deploy from GitHub**
3. Push this folder to a GitHub repo first:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create cryptonova --public --push
   ```
4. In Railway → New Project → select your repo
5. Railway auto-detects Python, reads `Procfile`
6. In Settings → Domains → click **Generate Domain**
7. ✅ Your app is live at `https://yourapp.up.railway.app`

**Free tier**: 500 hours/month (enough for always-on)

---

### Option 2: Render
1. Create account at https://render.com
2. New → Web Service → Connect GitHub repo
3. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Environment**: Python 3
4. Click **Create Web Service**
5. ✅ Live at `https://yourapp.onrender.com`

**Free tier**: Spins down after 15 min inactivity (cold start ~30s)

---

### Option 3: Fly.io
1. Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. ```bash
   fly auth login
   fly launch   # follow prompts
   fly deploy
   ```
3. ✅ Live at `https://yourapp.fly.dev`

**Free tier**: 3 shared VMs free

---

### Option 4: Heroku
1. Install Heroku CLI
2. ```bash
   heroku create cryptonova-app
   git push heroku main
   heroku open
   ```

---

## Custom Domain (Optional)
After deploying on Railway/Render:
1. Buy a domain on Namecheap (~$10/year) or use Freenom for free
2. In Railway/Render → Settings → Custom Domain → add your domain
3. Point DNS CNAME to the provided hostname
4. ✅ SSL is automatic

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
