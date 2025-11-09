import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "../authentication/auth";
import { useAuth } from "../authentication/authContexts";

export default function SignIn() {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (userLoggedIn) {
    navigate("/");      //brings the user back to the dashboard
  }

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
    <div style={{ maxWidth: 420, margin: "2rem auto", padding: "1.5rem" }}>
      <h1>Sign In</h1>
      <form onSubmit={onEmailPasswordSignIn} style={{ display: "grid", gap: 12 }}>
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
          />
        </label>
        {error && (
          <div style={{ color: "#b00020", fontSize: 14 }} role="alert">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="flw-btn flw-btn--primary">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <button onClick={onGoogleSignIn} disabled={loading} className="flw-btn flw-btn--ghost">
          Continue with Google
        </button>
      </div>

      <p style={{ marginTop: 16 }}>
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </div>
  );
}
