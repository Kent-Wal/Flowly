// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./pages.css";

export default function Dashboard() {
  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Dashboard</h1>
        <p className="flw-sub">High-level financial overview</p>
      </header>

      <section className="grid-4">
        <div className="card stat">
          <h3 className="muted">Total Balance</h3>
          <div className="stat-value">$24,380.12</div>
          <div className="sparkline positive" />
        </div>
        <div className="card stat">
          <h3 className="muted">Monthly Spend</h3>
          <div className="stat-value">$3,210.44</div>
          <div className="sparkline negative" />
        </div>
        <div className="card stat">
          <h3 className="muted">Upcoming Bills</h3>
          <div className="pill-list">
            <span className="pill">Rent • Oct 30 • $1,400</span>
            <span className="pill">Internet • Oct 18 • $60</span>
            <span className="pill">Gym • Oct 20 • $45</span>
          </div>
        </div>
        <div className="card stat">
          <h3 className="muted">Quick Budgets</h3>
          <div className="progress small">
            <div className="progress-bar" style={{ width: "65%" }} />
          </div>
          <div className="progress small">
            <div className="progress-bar warn" style={{ width: "88%" }} />
          </div>
          <div className="progress small">
            <div className="progress-bar ok" style={{ width: "35%" }} />
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
            <li>
              <span>Starbucks</span>
              <span className="muted">Oct 09</span>
              <span className="amount negative">- $6.45</span>
            </li>
            <li>
              <span>Amazon</span>
              <span className="muted">Oct 08</span>
              <span className="amount negative">- $42.90</span>
            </li>
            <li>
              <span>Payroll</span>
              <span className="muted">Oct 08</span>
              <span className="amount positive">+ $1,842.00</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
