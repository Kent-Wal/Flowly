import { Link } from "react-router-dom";
import "./auth.css";

export default function SignIn() {
  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <div style={{ width: 420, maxWidth: "95%" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Welcome back</h1>
          <p style={{ color: "#666", marginTop: "0.25rem" }}>Sign in to your account</p>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: "grid", gap: "0.75rem" }}
          aria-label="Sign in form"
        >
          <label style={{ display: "grid" }}>
            <span style={{ fontSize: 14, color: "#666" }}>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              required
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

          <label style={{ display: "grid" }}>
            <span style={{ fontSize: 14, color: "#666" }}>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              required
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="remember">
              <input type="checkbox" aria-label="Remember me" />
              <span className="remember__switch">
                <span className="remember__knob" />
              </span>
              <span className="remember__text">Remember me</span>
            </label>
            <a href="#" style={{ color: "#0b74de", fontSize: 14 }}>Forgot?</a>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
            <button className="flw-btn flw-btn--primary" style={{ flex: 1 }} onClick={(e) => e.preventDefault()}>
              Sign In
            </button>
          </div>

          <div style={{ textAlign: "center", paddingTop: "0.5rem", color: "#555" }}>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
