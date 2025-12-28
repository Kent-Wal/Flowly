import React, { useState, useEffect, useRef } from 'react';
import { getUserId } from '../utils/auth';

// Plaid Link implementation that loads the Plaid script directly.
// Expects server routes:
// POST /plaid/create_link_token -> { link_token }
// POST /plaid/exchange_public_token -> { access_token }

export default function ConnectPlaid({ userId, children }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const plaidHandlerRef = useRef(null);

  // Shared helper to load Plaid script only once and return a promise
  function loadPlaidScript() {
    if (window.__plaidScriptPromise) return window.__plaidScriptPromise;

    window.__plaidScriptPromise = new Promise((resolve, reject) => {
      // If Plaid already available, resolve immediately
      if (window.Plaid) return resolve(window.Plaid);

      // If script element already exists on the page, wait for window.Plaid
      const existing = document.querySelector('script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]');
      if (existing) {
        const checkInterval = setInterval(() => {
          if (window.Plaid) {
            clearInterval(checkInterval);
            resolve(window.Plaid);
          }
        }, 50);
        // timeout after 10s
        setTimeout(() => {
          clearInterval(checkInterval);
          if (window.Plaid) resolve(window.Plaid);
          else reject(new Error('Plaid script failed to initialize'));
        }, 10000);
        return;
      }

      const s = document.createElement('script');
      s.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      s.async = true;
      s.onload = () => {
        if (window.Plaid) return resolve(window.Plaid);
        // wait a short time for Plaid to attach
        const check = setInterval(() => {
          if (window.Plaid) {
            clearInterval(check);
            resolve(window.Plaid);
          }
        }, 50);
        setTimeout(() => {
          clearInterval(check);
          if (window.Plaid) resolve(window.Plaid);
          else reject(new Error('Plaid script loaded but Plaid object not found'));
        }, 10000);
      };
      s.onerror = () => reject(new Error('Failed to load Plaid script'));
      document.body.appendChild(s);
    });

    return window.__plaidScriptPromise;
  }
  // Safe JSON parser for fetch responses (handles empty/non-JSON bodies)
  async function parseResponse(res) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  // Format a response body (object/string) into a readable message
  function formatBodyMessage(body) {
    if (!body) return null;
    if (typeof body === 'string') return body;
    if (typeof body === 'object') {
      if (body.error) return typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
      if (body.message) return typeof body.message === 'string' ? body.message : JSON.stringify(body.message);
      return JSON.stringify(body);
    }
    return String(body);
  }

  // fetch a link token from the server, waiting for Plaid script to load
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await loadPlaidScript();
      } catch (err) {
        console.error('Plaid script load failed', err);
        if (mounted) setError(err.message || 'Failed to load Plaid script');
        return;
      }

      try {
        const derivedUserId = userId || getUserId();
        const res = await fetch('/plaid/create_link_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(derivedUserId ? { userId: derivedUserId } : {}),
        });
        const body = await parseResponse(res);
        if (!res.ok) {
          const msg = formatBodyMessage(body) || res.statusText || 'Failed to get link token';
          throw new Error(msg);
        }
        if (mounted) setLinkToken(body && (body.link_token || body.linkToken || body.link_token_string || body.linkTokenString));
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || 'Failed to create link token');
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [userId]);
  const openLink = () => {
    if (!linkToken) return setError('Link token not ready');
    if (!window.Plaid) return setError('Plaid script not loaded yet');

    // create a new Plaid Link handler
    plaidHandlerRef.current = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token, metadata) => {
        setLoading(true);
        try {
          const derivedUserId = userId || getUserId();
          const res = await fetch('/plaid/exchange_public_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(derivedUserId ? { public_token, userId: derivedUserId } : { public_token }),
          });
          const body = await parseResponse(res);
          if (!res.ok) {
            const msg = formatBodyMessage(body) || res.statusText || 'Failed to exchange public token';
            throw new Error(msg);
          }
          setLoading(false);
          setError(null);
          window.dispatchEvent(new CustomEvent('plaidConnected', { detail: body }));
        } catch (err) {
          console.error(err);
          setError(err.message || 'Exchange failed');
          setLoading(false);
        }
      },
      onExit: (err, metadata) => {
        if (err) {
          console.error('Plaid onExit', err);
          setError(err.display_message || err.error_message || 'Plaid exited with an error');
        }
      },
    });

    // open the Link flow
    try {
      plaidHandlerRef.current.open();
    } catch (e) {
      console.error('Failed to open Plaid Link', e);
      setError('Failed to open Plaid Link');
    }
  };

  return (
    <div>
      {error ? <div style={{ color: '#d04545' }}>{error}</div> : null}
      <button
        className="flw-btn flw-btn--primary"
        onClick={openLink}
        disabled={loading || !linkToken}
      >
        {children || (loading ? 'Connecting…' : 'Connect bank')}
      </button>
    </div>
  );
}
