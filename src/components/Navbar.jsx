import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
            <button className="flw-btn flw-btn--ghost">Sign In</button>
            <button className="flw-btn flw-btn--primary">Sign Up</button>
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