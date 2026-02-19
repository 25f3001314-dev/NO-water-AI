import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Thermal from "./Thermal";
import Recovery from "./Recovery";
import "./styles.css";

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-left">Jal-Drishti</div>
      <div className="nav-right">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/thermal">Thermal</Link>
        <Link to="/recovery">Recovery</Link>
      </div>
    </nav>
  );
}

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Signup onComplete={() => navigate('/dashboard')} />} />
        <Route path="/dashboard" element={<>
          <Nav />
          <Dashboard />
        </>} />
        <Route path="/thermal" element={<>
          <Nav />
          <Thermal />
        </>} />
        <Route path="/recovery" element={<>
          <Nav />
          <Recovery />
        </>} />
      </Routes>
    </div>
  );
}
