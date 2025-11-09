import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/authContexts";
import { doSignOut } from "../authentication/auth";
import "./navbar.css";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Transactions", to: "/transactions" },
  { label: "Budgets", to: "/budgets" },
  { label: "Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { userLoggedIn, currentUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await doSignOut();
      navigate("/signin");
    } catch (err) {
      console.error("Sign out failed:", err);
      // Optionally show a toast or inline error
    }
  };

  return (
    <header className="flw-nav">
      <div className="flw-nav__inner">
        {/* Left: Brand wordmark (clickable) */}
        <Link to="/" className="flw-brand" aria-label="Flowly Home">
          <span className="flw-brand__text">Flowly</span>
        </Link>

        {/* Center: Menu - collapses on mobile */}
        <nav className={`flw-menu ${open ? "is-open" : ""}`} aria-label="Primary">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "flw-menu__link" + (isActive ? " is-active" : "")
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Auth buttons and Logo slot */}
        <div className="flw-right">
          <div className="flw-auth">
            {userLoggedIn ? (
              <>
                <button 
                  className="flw-btn flw-btn--ghost" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="flw-btn flw-btn--ghost"
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </button>
                <button
                  className="flw-btn flw-btn--primary"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="flw-burger"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}