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
              <input
                className="flw-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </label>
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
