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

  if (!isLoggedIn) { return <Navigate to="/signin" />; }

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchSummary() {
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

        const spend = txs.reduce((s, t) => {
          const amt = parseFloat(t.amount || 0);
          const d = t.date ? new Date(t.date) : null;
          if (d && d >= start && d < end && amt < 0) {
            return s + Math.abs(amt);
          }
          return s;
        }, 0);
        setMonthlySpend(spend);

        // keep a short recent list for the Dashboard
        setRecent(txs.slice(0, 5));
      } catch (e) {
        // fail silently for dashboard; keep defaults
        console.error('Dashboard summary fetch error', e);
      }
    }

    fetchSummary();
  }, [isLoggedIn, token]);

  const formatMoney = (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <div className="legend">
              <span className="dot cyan" /> Essentials
              <span className="dot green" /> Discretionary
              <span className="dot blue" /> Savings
            </div>
          </div>
          <div className="chart pie" />
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
                  <span className={t.amount < 0 ? "amount negative" : "amount positive"}>
                    {t.amount < 0 ? '-' : '+'} ${Math.abs(Number(t.amount || 0)).toFixed(2)}
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
