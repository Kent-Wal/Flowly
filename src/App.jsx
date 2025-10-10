import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

function Placeholder({ title }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>{title}</h1>
      <p>This is a placeholder page. Wire up real content later.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signin" element={<Placeholder title="Sign In" />} />
        <Route path="/signup" element={<Placeholder title="Sign Up" />} />
      </Routes>
    </>
  );
}