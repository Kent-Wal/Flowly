import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";
import { getAuthToken, logout } from "../utils/auth";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Transactions", to: "/transactions" },
  { label: "Budgets", to: "/budgets" },
  { label: "Reports", to: "/reports" },
  { label: "Settings", to: "/settings" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));

    function onStorage(e) {
      if (e.key === 'authToken') setIsLoggedIn(Boolean(e.newValue));
    }

    function onAuthChanged() {
      setIsLoggedIn(Boolean(getAuthToken()));
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('authChanged', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authChanged', onAuthChanged);
    };
  }, []);

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
            {isLoggedIn ? (
              <button
                className="flw-btn flw-btn--ghost"
                onClick={() => {
                  logout();
                  setIsLoggedIn(false);
                  navigate('/');
                }}
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/signin" className="flw-btn flw-btn--ghost">Sign In</Link>
                <Link to="/signup" className="flw-btn flw-btn--primary">Sign Up</Link>
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