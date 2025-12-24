import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import { authUser } from "../utils/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    try {
      await authUser('login', { email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <div style={{ width: 420, maxWidth: "95%" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Welcome back</h1>
          <p style={{ color: "#666", marginTop: "0.25rem" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }} aria-label="Sign in form">
          <label style={{ display: "grid" }}>
            <span style={{ fontSize: 14, color: "#666" }}>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

          <label style={{ display: "grid" }}>
            <span style={{ fontSize: 14, color: "#666" }}>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
            <button type="submit" className="flw-btn flw-btn--primary" style={{ flex: 1 }}>
              Sign In
            </button>
          </div>

          {error ? (
            <div style={{ color: '#d04545', fontSize: 14, marginTop: 6 }}>{error}</div>
          ) : null}

          <div style={{ textAlign: "center", paddingTop: "0.5rem", color: "#555" }}>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
