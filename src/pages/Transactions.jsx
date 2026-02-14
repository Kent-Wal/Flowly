// src/pages/Transactions.jsx
import React, { useEffect, useState } from "react";
import "./pages.css";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../utils/auth";

export default function Transactions() {
  const token = getAuthToken();
  const isLoggedIn = Boolean(token);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('All accounts');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const currentToken = getAuthToken();
        if (!currentToken) {
          throw new Error('No auth token found in storage');
        }
        // debug: ensure token present when making request
        // console.debug('fetchTransactions using token', currentToken && currentToken.slice(0,8));
        const res = await fetch('/api/transactions', {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [isLoggedIn, token]);

  if (!isLoggedIn) { return <Navigate to="/signin" />; }

  return (
    <div className="flw-page">
      <header className="flw-page-header">
        <h1 className="flw-h1">Transactions</h1>
        <div className="filters">
          <input
            className="input"
            placeholder="Search merchant or note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
            <option>All accounts</option>
            {[...new Set(transactions.map((t) => t.account?.name).filter(Boolean))].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <input className="input" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All categories</option>
            {[...new Set(transactions.map((t) => t.category).filter(Boolean))].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="card table-wrap">
        {loading && <div className="muted">Loading transactions…</div>}
        {error && <div className="muted">{error}</div>}

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
            {transactions.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="muted">No transactions</td>
              </tr>
            )}

            {(() => {
              const filtered = transactions.filter((t) => {
                if (search) {
                  const s = search.toLowerCase();
                  const merchant = (t.merchantName || t.merchant || '') .toLowerCase();
                  if (!merchant.includes(s)) return false;
                }
                if (accountFilter && accountFilter !== 'All accounts') {
                  if ((t.account?.name || '') !== accountFilter) return false;
                }
                if (dateFilter) {
                  const txDate = t.date ? new Date(t.date).toISOString().slice(0,10) : '';
                  if (txDate < dateFilter) return false;
                }
                if (categoryFilter && categoryFilter !== 'All categories') {
                  if ((t.category || 'Uncategorized') !== categoryFilter) return false;
                }
                return true;
              });

              return filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
                  <td>{t.merchantName || t.merchant || '—'}</td>
                  <td>
                    {editingId === t.id ? (
                      <select
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        onBlur={async () => {
                          // save
                          try {
                            const patchToken = getAuthToken();
                            const res = await fetch(`/api/transactions/${t.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patchToken}` },
                              body: JSON.stringify({ category: editingCategory || null }),
                            });
                            if (!res.ok) throw new Error(await res.text());
                            const data = await res.json();
                            setTransactions((prev) => prev.map((p) => p.id === t.id ? data.transaction : p));
                          } catch (e) {
                            setError(e.message || 'Failed to save category');
                          } finally {
                            setEditingId(null);
                          }
                        }}
                      >
                        <option value="">Uncategorized</option>
                        {[
                          'Groceries',
                          'Transport',
                          'Housing',
                          'Entertainment',
                          'Dining',
                          'Utilities',
                          'Income',
                          'Other',
                          ...new Set(transactions.map((tt) => tt.category).filter(Boolean)),
                        ].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="badge" style={{ cursor: 'pointer' }} onClick={() => { setEditingId(t.id); setEditingCategory(t.category || ''); }}>
                        {t.category || 'Uncategorized'}
                      </span>
                    )}
                  </td>
                  <td>{t.account?.name || '—'}</td>
                  <td className="right">
                    <span className={t.amount < 0 ? "amount negative" : "amount positive"}>
                      {t.amount < 0 ? "-" : "+"} ${Math.abs(Number(t.amount || 0)).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="muted">Showing {transactions.length} transactions</span>
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
