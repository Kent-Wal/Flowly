// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./pages.css";
import ConnectPlaid from "../components/ConnectPlaid";
import { getAuthToken } from "../utils/auth";

export default function Dashboard() {
  const token = getAuthToken();
  const isLoggedIn = Boolean(token);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [spendingIsPositive, setSpendingIsPositive] = useState(true);

  if (!isLoggedIn) { return <Navigate to="/signin" />; }

  // fetch summary (extracted so other events can trigger it)
  const fetchSummary = async () => {
    if (!isLoggedIn) return;
    try {
      const currentToken = getAuthToken();
        // fetch user (accounts with balances)
        const meRes = await fetch('/auth/me', { headers: { Authorization: `Bearer ${currentToken}` } });
        let accounts = [];
        if (meRes.ok) {
          const data = await meRes.json();
          accounts = data.user?.accounts || [];
          setAccounts(accounts);
        }

        const total = accounts.reduce((s, a) => s + (parseFloat(a.balance || 0) || 0), 0);
        setTotalBalance(total);

        // fetch transactions and compute current-month spending
        const txRes = await fetch('/api/transactions', { headers: { Authorization: `Bearer ${currentToken}` } });
        if (!txRes.ok) throw new Error('Failed to fetch transactions');
        const txData = await txRes.json();
        const txs = txData.transactions || [];

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // detect sign convention: whether spending appears as positive or negative amounts
        let posCount = 0; let negCount = 0;
        for (const t of txs) {
          const amt = parseFloat(t.amount || 0);
          if (amt > 0) posCount++; else if (amt < 0) negCount++;
        }
        const spendingPositive = posCount >= negCount;
        setSpendingIsPositive(spendingPositive);

        const spend = txs.reduce((s, t) => {
          const amt = parseFloat(t.amount || 0);
          const d = t.date ? new Date(t.date) : null;
          if (d && d >= start && d < end) {
            if (spendingPositive ? amt > 0 : amt < 0) return s + Math.abs(amt);
          }
          return s;
        }, 0);
        setMonthlySpend(spend);

        // keep a short recent list for the Dashboard
        setRecent(txs.slice(0, 5));

        // build a simple category breakdown for the current month (use appCategory if available)
        try {
          const breakdown = {};
          for (const t of txs) {
            const amt = parseFloat(t.amount || 0);
            // use detected sign convention for spending
            if (!(spendingPositive ? amt > 0 : amt < 0)) continue;
            const d = t.date ? new Date(t.date) : null;
            if (!d || d < start || d >= end) continue; // only include current-month transactions
            const cat = t.appCategory || t.category || 'Uncategorized';
            breakdown[cat] = (breakdown[cat] || 0) + Math.abs(amt);
          }
          setCategoryBreakdown(breakdown);
        } catch (e) {
          console.error('Failed to build category breakdown', e);
        }
      } catch (e) {
        // fail silently for dashboard; keep defaults
        console.error('Dashboard summary fetch error', e);
      }
    };

  useEffect(() => {
    // initial fetch
    fetchSummary();

    // re-fetch when Plaid connection completes
    function onPlaidConnected(e) {
      fetchSummary();
    }
    window.addEventListener('plaidConnected', onPlaidConnected);
    return () => window.removeEventListener('plaidConnected', onPlaidConnected);
  }, [isLoggedIn, token]);

  const formatMoney = (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Small inline pie chart (SVG) — no external deps
  const palette = ['#21a0a0','#3aa76d','#4e73df','#f6c85f','#f28b82','#c39bd3','#ffb74d','#90a4ae'];
  function colorFor(i) { return palette[i % palette.length]; }

  function PieChart({ data, size = 160 }) {
    const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    const cx = size / 2; const cy = size / 2; const r = size / 2 - 2;

    function polarToCartesian(cx, cy, r, angleDeg) {
      const angleRad = (angleDeg - 90) * Math.PI / 180.0;
      return { x: cx + (r * Math.cos(angleRad)), y: cy + (r * Math.sin(angleRad)) };
    }

    function describeArc(cx, cy, r, startAngle, endAngle) {
      const start = polarToCartesian(cx, cy, r, endAngle);
      const end = polarToCartesian(cx, cy, r, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    }

    

    let angle = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Spending breakdown">
        {entries.length === 0 ? (
          <g>
            <circle cx={cx} cy={cy} r={r} fill="#f3f3f3" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 12, fill: '#666' }}>No data</text>
          </g>
        ) : entries.map(([k, v], i) => {
          const value = v;
          const sliceAngle = (value / total) * 360;
          const start = angle;
          const end = angle + sliceAngle;
          const pathD = describeArc(cx, cy, r, start, end);
          angle = end;
          return <path key={k} d={pathD} fill={colorFor(i)} stroke="#fff" strokeWidth="1" />;
        })}
      </svg>
    );
  }

  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Dashboard</h1>
        <div>
          <ConnectPlaid />
        </div>
      </header>

      <section className="grid-4">
        <div className="card stat">
          <h3 className="muted">Total Balance</h3>
          <div className="stat-value">{formatMoney(totalBalance)}</div>
          <div className="sparkline positive" />
        </div>
        <div className="card stat">
          <h3 className="muted">Monthly Spend</h3>
          <div className="stat-value">{formatMoney(monthlySpend)}</div>
          <div className="sparkline negative" />
        </div>
        <div className="card accounts-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="muted">Accounts</h3>
          <div className="accounts-list">
            <ul className="list">
              {accounts.length === 0 ? (
                <li className="muted">No linked accounts</li>
              ) : (
                accounts.map((a) => (
                  <li key={a.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div>{a.item?.institutionName || a.officialName || a.name}</div>
                        <div className="muted" style={{ fontSize: '0.85em' }}>{a.mask ? `••• ${a.mask}` : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{formatMoney(a.balance)}</div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Spending summary</h2>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ flex: '0 0 48%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PieChart data={categoryBreakdown} size={200} />
            </div>
            <div style={{ flex: '1 1 48%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 320 }}>
                {Object.entries(categoryBreakdown || {}).filter(([,v])=>v>0).length === 0 ? (
                  <div className="muted" style={{ textAlign: 'center' }}>No spending data</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Object.entries(categoryBreakdown).sort((a,b)=>b[1]-a[1]).map(([k,v], i) => (
                      <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ width: 14, height: 14, display: 'inline-block', background: colorFor(i), borderRadius: 3 }} />
                        <span style={{ flex: 1 }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{formatMoney(v)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Recent transactions</h2>
            <Link to="/transactions" className="link">View all →</Link>
          </div>
          <ul className="list">
            {recent.length === 0 ? (
              <li className="muted">No recent transactions</li>
            ) : (
              recent.map((t) => (
                <li key={t.id}>
                  <span>{t.merchantName || t.merchant || '—'}</span>
                  <span className="muted">{t.date ? new Date(t.date).toLocaleDateString() : ''}</span>
                  <span className={(spendingIsPositive ? t.amount > 0 : t.amount < 0) ? "amount negative" : "amount positive"}>
                    {(spendingIsPositive ? t.amount > 0 : t.amount < 0) ? '-' : '+'} ${Math.abs(Number(t.amount || 0)).toFixed(2)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
