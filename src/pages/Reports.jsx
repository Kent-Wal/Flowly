// src/pages/Reports.jsx
import React from "react";
import "./pages.css";

export default function Reports() {
  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Reports</h1>
        <div className="filters">
            <select className="select">
            <option>Last Month</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Year to date</option>
          </select>
          <button className="btn-outline">Export PDF</button>
          <button className="btn-primary">Export CSV</button>
        </div>
      </header>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Spending trends</h2>
          </div>
          <div className="chart line" />
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Category breakdown</h2>
          </div>
          <div className="chart bars" />
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Income vs. Expense</h2>
          <div className="legend">
            <span className="dot green" /> Income
            <span className="dot red" /> Expense
          </div>
        </div>
        <div className="chart area" />
      </section>
    </div>
  );
}
