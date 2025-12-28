// src/pages/Settings.jsx
import React from "react";
import "./pages.css";

export default function Settings() {
  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Settings</h1>
        <p className="flw-sub">Manage preferences and connections</p>
      </header>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Bank connections</h2>
            <button className="btn-primary">Link account</button>
          </div>
          <ul className="list">
            <li>
              <span>Chase • Checking</span>
              <span className="muted">••• 1234</span>
              <button className="chip">Unlink</button>
            </li>
            <li>
              <span>Amex • Credit</span>
              <span className="muted">••• 7788</span>
              <button className="chip">Unlink</button>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
