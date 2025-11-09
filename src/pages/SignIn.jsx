import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "../authentication/auth";
import { useAuth } from "../authentication/authContexts";
import "./auth.css";

export default function SignIn() {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect once logged in (keep side-effect out of render path)
  useEffect(() => {
    if (userLoggedIn) navigate("/");
  }, [userLoggedIn, navigate]);

  const onEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await doSignInWithEmailAndPassword(email.trim(), password);
      navigate("/");
    } catch (err) {
      console.error("Email sign-in error:", err);
      setError(err?.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await doSignInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err?.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flw-auth-page">
      <div className="flw-auth-card">
        <header className="flw-auth-head">
          <h1 className="flw-auth-title">Sign In</h1>
          <p className="flw-auth-sub">Access your Flowly dashboard</p>
        </header>
        <form onSubmit={onEmailPasswordSignIn} className="flw-auth-form">
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
              <div className="flw-input-wrap">
                <input
                  className="flw-input has-icon"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="flw-eye-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    // Eye off icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10.58 10.59A2 2 0 0012 16a2 2 0 001.41-.59M9.88 4.24A9.77 9.77 0 0112 4c5 0 9.27 3.11 11 8- .36 1.01-.87 1.95-1.5 2.8M6.06 6.05C4.19 7.3 2.75 9.02 2 12c1.73 4.89 6 8 10 8 1.18 0 2.32-.2 3.39-.57" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    // Eye icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" fill="none" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
          </div>
          <div style={{ textAlign: 'right', fontSize: '.85rem' }}>
            <Link to="/reset" className="flw-link">Forgot password?</Link>
          </div>
          {error && (
            <div className="flw-error" role="alert">{error}</div>
          )}
          <div className="flw-actions">
            <button type="submit" disabled={loading} className="flw-btn flw-btn--primary">
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <div className="flw-divider">or</div>
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={loading}
              className="flw-btn flw-btn--ghost"
            >
              Continue with Google
            </button>
          </div>
        </form>
        <footer className="flw-auth-footer">
          Don't have an account? <Link to="/signup" className="flw-link">Create one</Link>
        </footer>
      </div>
    </div>
  );
}
