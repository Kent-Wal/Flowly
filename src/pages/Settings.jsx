// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import "./pages.css";
import { getAuthToken } from "../utils/auth";
import { Navigate } from "react-router-dom";
import ConnectPlaid from "../components/ConnectPlaid";

export default function Settings() {
  const token = getAuthToken();
  const isLoggedIn = Boolean(token);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchMe() {
      setLoading(true);
      try {
        const res = await fetch('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setAccounts(data.user?.accounts || []);
      } catch (err) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [isLoggedIn, token]);

  async function unlinkAccount(accountId) {
    if (!confirm('Unlink this account?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let bodyText = '';
        try { bodyText = await res.text(); } catch (e) { /* ignore */ }
        const msg = bodyText || res.statusText || `Status ${res.status}`;
        throw new Error(`Failed to unlink account: ${msg}`);
      }
      // remove from local state
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch (err) {
      setError(err.message || 'Error unlinking');
    } finally {
      setLoading(false);
    }
  }

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
            <ConnectPlaid>Link account</ConnectPlaid>
          </div>

          {loading && <div className="muted">Loading accounts…</div>}
          {error && <div className="muted">{error}</div>}

          <ul className="list">
            {accounts.length === 0 && !loading && (
              <li className="muted">No linked accounts</li>
            )}

            {accounts.map((acct) => {
              const institution = acct.item?.institutionName || acct.institutionId || acct.item?.institutionId || 'Unknown';
              const accountTitle = `${institution} • ${acct.officialName || acct.name}`;
              return (
                <li key={acct.id}>
                  <span>{accountTitle}</span>
                  <span className="muted">{acct.mask ? `••• ${acct.mask}` : ''}</span>
                  <button className="chip" onClick={() => unlinkAccount(acct.id)}>Unlink</button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
