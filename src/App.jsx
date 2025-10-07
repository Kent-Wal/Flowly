import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

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
        <Route path="/" element={<Placeholder title="Dashboard" />} />
        <Route path="/transactions" element={<Placeholder title="Transactions" />} />
        <Route path="/budgets" element={<Placeholder title="Budgets" />} />
        <Route path="/reports" element={<Placeholder title="Reports" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="/signin" element={<Placeholder title="Sign In" />} />
        <Route path="/signup" element={<Placeholder title="Sign Up" />} />
      </Routes>
    </>
  );
}