// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import "./pages.css";
import { getAuthToken } from "../utils/auth";
import { Navigate } from "react-router-dom";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

export default function Reports() {
  const isLoggedIn = Boolean(getAuthToken());

  const [range, setRange] = useState('Last Month');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spendingPositive, setSpendingPositive] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const res = await fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load transactions');
        const data = await res.json();
        const txs = data.transactions || [];
        setTransactions(txs);

        // detect sign convention
        let pos = 0, neg = 0;
        for (const t of txs) {
          const a = Number(t.amount || 0);
          if (a > 0) pos++; else if (a < 0) neg++;
        }
        setSpendingPositive(pos >= neg);
      } catch (e) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLoggedIn, range]);

  if (!isLoggedIn) { return <Navigate to="/signin" />; }

  // helpers for ranges
  function rangeStartEnd(r) {
    const now = new Date();
    let start;
    if (r === 'Last Month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (r === 'Last 3 months') {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (r === 'Last 6 months') {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else { // Year to date
      start = new Date(now.getFullYear(), 0, 1);
    }
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  // build time buckets (monthly) between start and end
  function buildMonthlyBuckets(start, end) {
    const buckets = [];
    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d < end) {
      buckets.push({ key: d.toISOString().slice(0,7), date: new Date(d), totalIncome: 0, totalExpense: 0 });
      d.setMonth(d.getMonth() + 1);
    }
    return buckets;
  }

  // compute reports
  const { start, end } = rangeStartEnd(range);
  const buckets = buildMonthlyBuckets(start, end);

  const categoryTotals = {};
  for (const t of transactions) {
    const d = t.date ? new Date(t.date) : null;
    if (!d || d < start || d >= end) continue;
    const amt = Number(t.amount || 0);
    const isExpense = spendingPositive ? amt > 0 : amt < 0;
    const abs = Math.abs(amt);
    // category breakdown (expenses only)
    if (isExpense) {
      const cat = t.appCategory || t.category || 'Uncategorized';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + abs;
    }
    // monthly buckets
    const key = d.toISOString().slice(0,7);
    const b = buckets.find(x => x.key === key);
    if (b) {
      if (isExpense) b.totalExpense += abs; else b.totalIncome += abs;
    }
  }

  // prepare chart data
  const trendLabels = buckets.map(b => b.key);
  const expenseSeries = buckets.map(b => b.totalExpense);
  const incomeSeries = buckets.map(b => b.totalIncome);
  const topCategories = Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).slice(0,8);

  // Chart.js based chart components
  function LineChart({ labels, expenseSeries, incomeSeries }) {
    const data = {
      labels,
      datasets: [
      {
          label: 'Income',
          data: incomeSeries,
          borderColor: '#3aa76d',
          backgroundColor: 'rgba(58,167,109,0.12)',
          tension: 0.25,
        },
        {
          label: 'Expense',
          data: expenseSeries,
          borderColor: '#f28b82',
          backgroundColor: 'rgba(242,139,130,0.15)',
          tension: 0.25,
        }
      ]
    };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };
    return <div style={{ height: 200 }}><Line data={data} options={options} /></div>;
  }

  function SpendingTrendChart({ labels, expenseSeries }) {
    const data = {
      labels,
      datasets: [
        {
          label: 'Spending',
          data: expenseSeries,
          borderColor: '#f97366',
          backgroundColor: 'rgba(249,115,102,0.14)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    return <div style={{ height: 220 }}><Line data={data} options={options} /></div>;
  }

  function BarChart({ categories }) {
    const labels = categories.map(c => c[0]);
    const data = { labels, datasets: [{ label: 'Spending', data: categories.map(c=>c[1]), backgroundColor: ['#4e73df','#21a0a0','#f6c85f','#f28b82','#c39bd3','#ffb74d'] }] };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    return <div style={{ height: 200 }}><Bar data={data} options={options} /></div>;
  }

  function AreaChart({ labels, income, expense }) {
    const data = {
      labels,
      datasets: [
        { label: 'Income', data: income, backgroundColor: 'rgba(58,167,109,0.18)', borderColor: '#3aa76d', fill: true, tension: 0.4, cubicInterpolationMode: 'monotone' },
        { label: 'Expense', data: expense, backgroundColor: 'rgba(242,139,130,0.18)', borderColor: '#f28b82', fill: true, tension: 0.4, cubicInterpolationMode: 'monotone' }
      ]
    };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };
    return <div style={{ height: 220 }}><Line data={data} options={options} /></div>;
  }

  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Reports</h1>
        <div className="filters">
          <select className="select" value={range} onChange={(e)=>setRange(e.target.value)}>
            <option>Last Month</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Year to date</option>
          </select>
          <button className="btn-outline" onClick={()=>{/* TODO: export PDF */}}>Export PDF</button>
          <button className="btn-primary" onClick={()=>{/* TODO: export CSV */}}>Export CSV</button>
        </div>
      </header>

      <section className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Spending trends</h2></div>
          <div style={{ padding: 12 }}>
            {loading ? <div className="muted">Loading…</div> : <SpendingTrendChart labels={trendLabels} expenseSeries={expenseSeries} />}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Category breakdown</h2></div>
          <div style={{ padding: 12 }}>
            {loading ? <div className="muted">Loading…</div> : <BarChart categories={topCategories} />}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Income vs. Expense</h2>
        </div>
        <div style={{ padding: 12 }}>
          {loading ? <div className="muted">Loading…</div> : <AreaChart labels={trendLabels} income={incomeSeries} expense={expenseSeries} />}
        </div>
      </section>
    </div>
  );
}
