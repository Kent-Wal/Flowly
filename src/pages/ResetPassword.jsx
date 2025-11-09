import { useState } from "react";
import { Link } from "react-router-dom";
import { doPasswordReset } from "../authentication/auth";
import "./auth.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await doPasswordReset(email.trim());
      setInfo("If an account exists for that email, a reset link has been sent.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flw-auth-page">
      <div className="flw-auth-card">
        <header className="flw-auth-head">
          <h1 className="flw-auth-title">Reset Password</h1>
          <p className="flw-auth-sub">We'll email you a link to reset your password</p>
        </header>
        <form onSubmit={onSubmit} className="flw-auth-form">
          <div className="flw-field">
            <label>
              <span className="flw-label">Email</span>
              <input
                className="flw-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
          </div>
          {error && <div className="flw-error" role="alert">{error}</div>}
          {info && <div className="flw-error" style={{ color: '#86efac', borderColor: 'rgba(34,197,94,.35)', background: 'rgba(34,197,94,.08)' }}>{info}</div>}
          <div className="flw-actions">
            <button type="submit" disabled={loading} className="flw-btn flw-btn--primary">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </div>
        </form>
        <footer className="flw-auth-footer">
          Remembered your password? <Link to="/signin" className="flw-link">Back to sign in</Link>
        </footer>
      </div>
    </div>
  );
}
