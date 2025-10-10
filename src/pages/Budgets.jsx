// src/pages/Budgets.jsx
import React from "react";
import "./pages.css";

const items = [
  { name: "Groceries", limit: 400, used: 260, color: "cyan" },
  { name: "Transport", limit: 150, used: 120, color: "blue" },
  { name: "Dining Out", limit: 200, used: 190, color: "orange" },
  { name: "Utilities", limit: 220, used: 110, color: "green" },
];

export default function Budgets() {
  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Budgets</h1>
        <button className="btn-primary">New Budget</button>
      </header>

      <section className="grid-3">
        {items.map((b, i) => {
          const pct = Math.round((b.used / b.limit) * 100);
          const warn = pct >= 85;
          return (
            <div key={i} className={"card budget " + (warn ? "warn" : "")}>
              <div className="card-head">
                <h2>{b.name}</h2>
                <span className="muted">
                  ${b.used} / ${b.limit}
                </span>
              </div>
              <div className={"progress large " + b.color}>
                <div className={"progress-bar " + (warn ? "warn" : "")} style={{ width: pct + "%" }} />
              </div>
              <div className="budget-footer">
                <span className="muted">{100 - pct}% remaining</span>
                <button className="chip">Edit</button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
