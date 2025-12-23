import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const apiBase = '';

    if(confirmPassword !== password){
        setError("Passwords do not match!");
        return; 
    }

    //clear the error
    setError("");

    fetch(apiBase +'/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, password})
    }); 
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
      <div style={{ width: 480, maxWidth: "95%" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Create your account</h1>
          <p style={{ color: "#666", marginTop: "0.25rem" }}>Start managing your finances — no credit card required.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }} aria-label="Sign up form">
          <label style={{ display: "grid" }}>
            <span style={{ fontSize: 14, color: "#666" }}>Full name</span>
            <input
              type="text"
              placeholder="First Last"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

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
              placeholder="Create a password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

          <label style={{ display: "grid" }}>
            <span style={{ fontSize: 14, color: "#666" }}>Confirm password</span>
            <input
              type="password"
              placeholder="Re-enter password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ padding: "0.6rem", borderRadius: 6, border: "1px solid #ddd" }}
            />
          </label>

          {error ? (
            <div style={{ color: "#d04545", fontSize: 14, marginBottom: 6 }}>{error}</div>
          ) : null}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
            <button type="submit" className="flw-btn flw-btn--primary" style={{ flex: 1 }}>
              Create account
            </button>
          </div>

          <div style={{ textAlign: "center", paddingTop: "0.5rem", color: "#555" }}>
            Already registered? <Link to="/signin">Sign in</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
