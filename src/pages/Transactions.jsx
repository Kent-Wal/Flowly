// src/pages/Transactions.jsx
import React from "react";
import "./pages.css";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";

const rows = Array.from({ length: 10 }).map((_, i) => ({
  date: "2025-10-0" + ((i % 9) + 1),
  merchant: ["Target", "Uber", "Whole Foods", "Rent", "Netflix"][i % 5],
  category: ["Groceries", "Transport", "Groceries", "Housing", "Entertainment"][i % 5],
  amount: [-42.13, -18.23, -63.41, -1400, -15.99][i % 5],
  account: ["Checking", "Credit", "Credit", "Checking", "Credit"][i % 5],
}));

export default function Transactions() {
  const isLoggedIn = Boolean(getAuthToken());
  
  if (!isLoggedIn) { return <Navigate to="/signin" />; }

  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Transactions</h1>
        <div className="filters">
          <input className="input" placeholder="Search merchant or note…" />
          <select className="select">
            <option>All accounts</option>
            <option>Checking</option>
            <option>Credit</option>
          </select>
          <input className="input" type="date" />
          <select className="select">
            <option>All categories</option>
            <option>Groceries</option>
            <option>Transport</option>
            <option>Housing</option>
          </select>
        </div>
      </header>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Category</th>
              <th>Account</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.merchant}</td>
                <td>
                  <span className="badge">{r.category}</span>
                </td>
                <td>{r.account}</td>
                <td className="right">
                  <span className={r.amount < 0 ? "amount negative" : "amount positive"}>
                    {r.amount < 0 ? "-" : "+"} ${Math.abs(r.amount).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted">Page 1 of 5</span>
          <div className="pager">
            <button className="chip">Prev</button>
            <button className="chip primary">1</button>
            <button className="chip">2</button>
            <button className="chip">3</button>
            <button className="chip">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
