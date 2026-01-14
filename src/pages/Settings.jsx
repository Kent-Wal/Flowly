// src/pages/Settings.jsx
import React from "react";
import "./pages.css";
import { getAuthToken } from "../utils/auth";
import { Navigate } from "react-router-dom";

export default function Settings() {
  const isLoggedIn = Boolean(getAuthToken());
  
  if (!isLoggedIn) { return <Navigate to="/signin" />; }

  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Settings</h1>
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
