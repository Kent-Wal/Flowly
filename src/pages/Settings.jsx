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

        <div className="card">
          <div className="card-head">
            <h2>Profile</h2>
            <button className="chip">Edit</button>
          </div>
          <div className="form-grid">
            <label>
              <span className="muted">Name</span>
              <input className="input" defaultValue="Jordan Lee" />
            </label>
            <label>
              <span className="muted">Email</span>
              <input className="input" defaultValue="jordan@example.com" />
            </label>
            <label>
              <span className="muted">Dark mode</span>
              <div className="switch">
                <input type="checkbox" defaultChecked />
                <span />
              </div>
            </label>
            <label>
              <span className="muted">Two-factor auth</span>
              <div className="switch">
                <input type="checkbox" />
                <span />
              </div>
            </label>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Security</h2>
        </div>
        <div className="form-grid">
          <label>
            <span className="muted">Current password</span>
            <input className="input" type="password" />
          </label>
          <label>
            <span className="muted">New password</span>
            <input className="input" type="password" />
          </label>
          <label>
            <span className="muted">Confirm new password</span>
            <input className="input" type="password" />
          </label>
          <button className="btn-primary">Change password</button>
        </div>
      </section>
    </div>
  );
}
