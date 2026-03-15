/* ── CryptoNova App ── */
"use strict";

// ── STATE ──
let allCoins = [];
let filtered = [];
let sortKey = "market_cap_rank";
let sortDir = 1;
let searchQ = "";
let viewMode = "grid"; // grid | table
let sparkCharts = {};
let modalChart = null;
let currentCoinId = null;
let refreshTimer = null;
const REFRESH_MS = 60_000;

// ── FORMAT HELPERS ──
const fmt = new Intl.NumberFormat("en-US");
const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const fmtCompact = (n) => {
  if (n == null) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2) + "M";
  return fmtUSD.format(n);
};
const fmtPrice = (n) => {
  if (n == null) return "—";
  if (n >= 1) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toFixed(8);
};
const fmtPct = (n) => {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(2) + "%";
};
const pctClass = (n) => n == null ? "" : n >= 0 ? "up" : "dn";

// ── API ──
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  loadGlobal();
  loadTrending();
  loadCoins();
  setupControls();
  setupModal();
  refreshTimer = setInterval(() => { loadCoins(); loadGlobal(); }, REFRESH_MS);
});

// ── GLOBAL STATS ──
async function loadGlobal() {
  try {
    const d = await fetchJSON("/api/global");
    const g = d.data;
    document.getElementById("gMarketCap").textContent  = fmtCompact(g.total_market_cap?.usd);
    document.getElementById("gVolume").textContent     = fmtCompact(g.total_volume?.usd);
    document.getElementById("gBtcDom").textContent     = g.market_cap_percentage?.btc?.toFixed(1) + "%";
    document.getElementById("gCoins").textContent      = fmt.format(g.active_cryptocurrencies);
  } catch(e) { console.warn("Global stats error:", e); }
}

// ── TRENDING ──
async function loadTrending() {
  try {
    const d = await fetchJSON("/api/trending");
    const wrap = document.getElementById("trendingCoins");
    wrap.innerHTML = "";
    d.coins.slice(0, 7).forEach(({ item }) => {
      const el = document.createElement("div");
      el.className = "trending-pill";
      el.innerHTML = `<img src="${item.small}" alt="${item.name}" /><span>${item.symbol}</span><span style="color:var(--text3);font-size:10px">#${item.market_cap_rank}</span>`;
      el.addEventListener("click", () => openModal(item.id));
      wrap.appendChild(el);
    });
  } catch(e) { console.warn("Trending error:", e); }
}

// ── COINS ──
async function loadCoins() {
  try {
    const data = await fetchJSON("/api/coins");
    allCoins = data;
    updateTimestamp();
    buildTicker(data);
    applyFilters();
    document.getElementById("loadingSpinner").style.display = "none";
  } catch(e) {
    console.error("Coin fetch error:", e);
    document.getElementById("loadingSpinner").innerHTML = `<div class="spinner-ring" style="border-top-color:var(--red)"></div><p style="color:var(--red)">API ERROR — RETRYING…</p>`;
    setTimeout(loadCoins, 10_000);
  }
}

function updateTimestamp() {
  const now = new Date();
  document.getElementById("lastUpdate").textContent =
    now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── TICKER TAPE ──
function buildTicker(coins) {
  const inner = document.getElementById("tickerInner");
  const items = [...coins.slice(0, 20), ...coins.slice(0, 20)]; // doubled for seamless loop
  inner.innerHTML = items.map(c => {
    const chg = c.price_change_percentage_24h;
    const cls = chg >= 0 ? "up" : "dn";
    const arrow = chg >= 0 ? "▲" : "▼";
    return `<div class="ticker-item" onclick="openModal('${c.id}')">
      <span class="ticker-sym">${c.symbol.toUpperCase()}</span>
      <span class="ticker-price">${fmtPrice(c.current_price)}</span>
      <span class="ticker-chg ${cls}">${arrow}${Math.abs(chg || 0).toFixed(2)}%</span>
    </div>`;
  }).join("");
}

// ── FILTER / SORT ──
function applyFilters() {
  const q = searchQ.toLowerCase();
  filtered = allCoins.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.symbol.toLowerCase().includes(q)
  );
  filtered.sort((a, b) => {
    let va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
    if (sortKey === "market_cap_rank") return (va - vb); // always asc
    return (vb - va) * sortDir;
  });
  renderCoins();
}

// ── RENDER ──
function renderCoins() {
  // destroy old sparkline charts
  Object.values(sparkCharts).forEach(c => c.destroy());
  sparkCharts = {};

  if (viewMode === "grid") {
    document.getElementById("coinsGrid").style.display = "";
    document.getElementById("coinsTableWrap").style.display = "none";
    renderGrid();
  } else {
    document.getElementById("coinsGrid").style.display = "none";
    document.getElementById("coinsTableWrap").style.display = "";
    renderTable();
  }
}

function renderGrid() {
  const grid = document.getElementById("coinsGrid");
  grid.innerHTML = filtered.map((c, i) => {
    const chg = c.price_change_percentage_24h;
    const cls = pctClass(chg);
    return `
    <div class="coin-card" onclick="openModal('${c.id}')" style="animation-delay:${Math.min(i*0.03,0.4)}s">
      <div class="coin-card-header">
        <span class="coin-rank">#${c.market_cap_rank}</span>
        <img class="coin-logo" src="${c.image}" alt="${c.name}" loading="lazy" />
        <div class="coin-name-wrap">
          <div class="coin-name">${c.name}</div>
          <div class="coin-sym">${c.symbol.toUpperCase()}</div>
        </div>
        <span class="coin-change-badge ${cls}">${fmtPct(chg)}</span>
      </div>
      <div class="coin-price">${fmtPrice(c.current_price)}</div>
      <div class="coin-metrics">
        <div class="metric"><span class="metric-label">MKT CAP</span><span class="metric-val">${fmtCompact(c.market_cap)}</span></div>
        <div class="metric"><span class="metric-label">24H VOL</span><span class="metric-val">${fmtCompact(c.total_volume)}</span></div>
        <div class="metric"><span class="metric-label">1H %</span><span class="metric-val ${pctClass(c.price_change_percentage_1h_in_currency)}">${fmtPct(c.price_change_percentage_1h_in_currency)}</span></div>
        <div class="metric"><span class="metric-label">7D %</span><span class="metric-val ${pctClass(c.price_change_percentage_7d_in_currency)}">${fmtPct(c.price_change_percentage_7d_in_currency)}</span></div>
      </div>
      <div class="sparkline-wrap"><canvas id="spark-${c.id}"></canvas></div>
    </div>`;
  }).join("");

  // Draw sparklines after DOM insertion
  requestAnimationFrame(() => {
    filtered.forEach(c => {
      const canvas = document.getElementById(`spark-${c.id}`);
      if (!canvas || !c.sparkline_in_7d?.price) return;
      const prices = c.sparkline_in_7d.price;
      const isUp = prices[prices.length - 1] >= prices[0];
      sparkCharts[c.id] = new Chart(canvas, sparkConfig(prices, isUp));
    });
  });
}

function renderTable() {
  const tbody = document.getElementById("coinsTableBody");
  tbody.innerHTML = filtered.map((c, i) => {
    const chg1h = c.price_change_percentage_1h_in_currency;
    const chg24 = c.price_change_percentage_24h;
    const chg7d = c.price_change_percentage_7d_in_currency;
    return `<tr onclick="openModal('${c.id}')" style="animation-delay:${Math.min(i*0.02,0.3)}s">
      <td style="color:var(--text3)">${c.market_cap_rank}</td>
      <td><div class="table-coin-wrap">
        <img class="table-coin-logo" src="${c.image}" alt="${c.name}" loading="lazy" />
        <div><div class="table-coin-name">${c.name}</div><div class="table-coin-sym">${c.symbol.toUpperCase()}</div></div>
      </div></td>
      <td style="font-weight:600">${fmtPrice(c.current_price)}</td>
      <td class="${pctClass(chg1h)}">${fmtPct(chg1h)}</td>
      <td class="${pctClass(chg24)}">${fmtPct(chg24)}</td>
      <td class="${pctClass(chg7d)}">${fmtPct(chg7d)}</td>
      <td>${fmtCompact(c.market_cap)}</td>
      <td>${fmtCompact(c.total_volume)}</td>
      <td style="color:var(--text2)">${fmtCompact(c.circulating_supply?.toFixed(0))?.replace("$","")}</td>
      <td><div class="table-sparkline"><canvas id="tspark-${c.id}"></canvas></div></td>
    </tr>`;
  }).join("");

  requestAnimationFrame(() => {
    filtered.forEach(c => {
      const canvas = document.getElementById(`tspark-${c.id}`);
      if (!canvas || !c.sparkline_in_7d?.price) return;
      const prices = c.sparkline_in_7d.price;
      const isUp = prices[prices.length - 1] >= prices[0];
      sparkCharts[`t-${c.id}`] = new Chart(canvas, sparkConfig(prices, isUp));
    });
  });
}

// ── SPARKLINE CONFIG ──
function sparkConfig(prices, isUp) {
  const color = isUp ? "#00ff88" : "#ff3860";
  return {
    type: "line",
    data: {
      labels: prices.map((_, i) => i),
      datasets: [{ data: prices, borderColor: color, borderWidth: 1.5,
        pointRadius: 0, fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0,0,0,ctx.chart.height);
          g.addColorStop(0, isUp ? "rgba(0,255,136,0.18)" : "rgba(255,56,96,0.18)");
          g.addColorStop(1, "transparent");
          return g;
        }
      }]
    },
    options: {
      responsive: false, animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      elements: { line: { tension: 0.3 } }
    }
  };
}

// ── CONTROLS SETUP ──
function setupControls() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQ = e.target.value.trim();
    applyFilters();
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      if (sortKey === key && key !== "market_cap_rank") sortDir *= -1;
      else { sortKey = key; sortDir = 1; }
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  document.getElementById("gridViewBtn").addEventListener("click", () => {
    viewMode = "grid";
    document.getElementById("gridViewBtn").classList.add("active");
    document.getElementById("tableViewBtn").classList.remove("active");
    renderCoins();
  });
  document.getElementById("tableViewBtn").addEventListener("click", () => {
    viewMode = "table";
    document.getElementById("tableViewBtn").classList.add("active");
    document.getElementById("gridViewBtn").classList.remove("active");
    renderCoins();
  });
}

// ── MODAL ──
function setupModal() {
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  if (modalChart) { modalChart.destroy(); modalChart = null; }
  currentCoinId = null;
}

async function openModal(coinId) {
  currentCoinId = coinId;
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");
  overlay.classList.add("open");
  content.innerHTML = `<div class="loading-spinner"><div class="spinner-ring"></div><p>LOADING DATA…</p></div>`;
  if (modalChart) { modalChart.destroy(); modalChart = null; }

  try {
    const coin = await fetchJSON(`/api/coin/${coinId}`);
    const m = coin.market_data;
    const chg24 = m.price_change_percentage_24h;
    const chgClass = pctClass(chg24);

    // Description
    const rawDesc = coin.description?.en || "";
    const desc = rawDesc.replace(/<[^>]+>/g, "").split(". ").slice(0, 4).join(". ") + (rawDesc.length > 0 ? "." : "");

    content.innerHTML = `
      <div class="modal-header">
        <img class="modal-logo" src="${coin.image?.large}" alt="${coin.name}" />
        <div>
          <div class="modal-title">${coin.name}</div>
          <div class="modal-sym">${coin.symbol.toUpperCase()}</div>
        </div>
        <div class="modal-rank">#${coin.market_cap_rank}</div>
      </div>
      <div class="modal-price-row">
        <div class="modal-price">${fmtPrice(m.current_price?.usd)}</div>
        <div class="modal-change ${chgClass}">${fmtPct(chg24)}</div>
      </div>
      <div class="chart-controls">
        ${["1","7","30","90","365"].map(d =>
          `<button class="chart-btn${d==="7"?" active":""}" onclick="loadModalChart('${coinId}',${d},this)">${d}D</button>`
        ).join("")}
      </div>
      <div class="modal-chart-wrap"><canvas id="modalChartCanvas"></canvas></div>
      <div class="modal-stats-grid">
        <div class="modal-stat"><div class="modal-stat-label">MARKET CAP</div><div class="modal-stat-val">${fmtCompact(m.market_cap?.usd)}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">24H VOLUME</div><div class="modal-stat-val">${fmtCompact(m.total_volume?.usd)}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">ALL TIME HIGH</div><div class="modal-stat-val">${fmtPrice(m.ath?.usd)}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">ALL TIME LOW</div><div class="modal-stat-val">${fmtPrice(m.atl?.usd)}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">CIRCULATING</div><div class="modal-stat-val">${fmt.format(Math.round(m.circulating_supply ?? 0))}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">TOTAL SUPPLY</div><div class="modal-stat-val">${m.total_supply ? fmt.format(Math.round(m.total_supply)) : "∞"}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">7D CHANGE</div><div class="modal-stat-val ${pctClass(m.price_change_percentage_7d)}">${fmtPct(m.price_change_percentage_7d)}</div></div>
        <div class="modal-stat"><div class="modal-stat-label">30D CHANGE</div><div class="modal-stat-val ${pctClass(m.price_change_percentage_30d)}">${fmtPct(m.price_change_percentage_30d)}</div></div>
      </div>
      ${desc ? `<div class="modal-desc">${desc}</div>` : ""}
    `;
    loadModalChart(coinId, 7, document.querySelector(".chart-btn.active"));
  } catch(e) {
    console.error("Modal error:", e);
    content.innerHTML = `<p style="color:var(--red);padding:40px;text-align:center;font-family:var(--font-mono)">ERROR LOADING COIN DATA</p>`;
  }
}

async function loadModalChart(coinId, days, btn) {
  document.querySelectorAll(".chart-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (modalChart) { modalChart.destroy(); modalChart = null; }

  try {
    const data = await fetchJSON(`/api/chart/${coinId}/${days}`);
    const prices = data.prices;
    const isUp = prices[prices.length-1][1] >= prices[0][1];
    const color = isUp ? "#00ff88" : "#ff3860";
    const canvas = document.getElementById("modalChartCanvas");
    if (!canvas) return;

    modalChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: prices.map(p => {
          const d = new Date(p[0]);
          return days <= 1 ? d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})
                           : d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
        }),
        datasets: [{
          data: prices.map(p => p[1]),
          borderColor: color, borderWidth: 2, pointRadius: 0, fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0,0,0,ctx.chart.height);
            g.addColorStop(0, isUp ? "rgba(0,255,136,0.2)" : "rgba(255,56,96,0.2)");
            g.addColorStop(1, "transparent");
            return g;
          }
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(10,15,30,0.95)",
            borderColor: "#1a2744", borderWidth: 1,
            titleColor: "#94a3b8", bodyColor: "#fff",
            titleFont: { family: "'Share Tech Mono'" },
            bodyFont: { family: "'Share Tech Mono'", size: 14 },
            callbacks: { label: ctx => " " + fmtPrice(ctx.raw) }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(26,39,68,0.5)" },
            ticks: {
              color: "#4a5568", font: { family: "'Share Tech Mono'", size: 10 },
              maxTicksLimit: days <= 1 ? 8 : 6
            }
          },
          y: {
            position: "right",
            grid: { color: "rgba(26,39,68,0.5)" },
            ticks: {
              color: "#4a5568", font: { family: "'Share Tech Mono'", size: 10 },
              callback: v => fmtPrice(v)
            }
          }
        },
        elements: { line: { tension: 0.2 } }
      }
    });
  } catch(e) { console.warn("Chart load error:", e); }
}

// expose to HTML onclick
window.openModal = openModal;
window.loadModalChart = loadModalChart;
