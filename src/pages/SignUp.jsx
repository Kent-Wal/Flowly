import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../authentication/auth";
import { useAuth } from "../authentication/authContexts";
import "./auth.css";

export default function SignUp() {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoggedIn) navigate("/");
  }, [userLoggedIn, navigate]);

  const onSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await doCreateUserWithEmailAndPassword(email.trim(), password);
      navigate("/");
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flw-auth-page">
      <div className="flw-auth-card">
        <header className="flw-auth-head">
          <h1 className="flw-auth-title">Create Account</h1>
          <p className="flw-auth-sub">Start managing your finances</p>
        </header>
        <form onSubmit={onSignUp} className="flw-auth-form">
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
          <div className="flw-field">
            <label>
              <span className="flw-label">Password</span>
              <div style={{ position: 'relative' }}>
                <input
                  className="flw-input has-icon"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 8,
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '.75rem'
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          </div>
          <div className="flw-field">
            <label>
              <span className="flw-label">Confirm Password</span>
              <div style={{ position: 'relative' }}>
                <input
                  className="flw-input has-icon"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Re-type password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 8,
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '.75rem'
                  }}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          </div>
          {error && (
            <div className="flw-error" role="alert">{error}</div>
          )}
          <div className="flw-actions">
            <button type="submit" disabled={loading} className="flw-btn flw-btn--primary">
              {loading ? "Creating…" : "Create Account"}
            </button>
          </div>
        </form>
        <footer className="flw-auth-footer">
          Already have an account? <Link to="/signin" className="flw-link">Sign in</Link>
        </footer>
      </div>
    </div>
  );
}
