import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../authentication/auth";
import { useAuth } from "../authentication/authContexts";

export default function SignUp() {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (userLoggedIn) {
    navigate("/");
  }

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
    <div style={{ maxWidth: 420, margin: "2rem auto", padding: "1.5rem" }}>
      <h1>Create account</h1>
      <form onSubmit={onSignUp} style={{ display: "grid", gap: 12 }}>
        <label>
          <div>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          <div>Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <label>
          <div>Confirm password</div>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error && (
          <div style={{ color: "#b00020", fontSize: 14 }} role="alert">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="flw-btn flw-btn--primary">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}
