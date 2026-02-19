import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChipCooling from './pages/ChipCooling';
import HeatRecovery from './pages/HeatRecovery';
import { Menu, X } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
        <nav className="bg-black/50 backdrop-blur-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jal-Drishti</h1>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ul className={`md:flex space-x-4 absolute md:static top-16 left-0 w-full md:w-auto bg-black/80 md:bg-transparent p-4 md:p-0 ${isMenuOpen ? 'block' : 'hidden'}`}>
            <li><a href="/dashboard" className="hover:text-blue-300 block py-2">EquiShift Map</a></li>
            <li><a href="/chip-cooling" className="hover:text-blue-300 block py-2">Chip Cooling</a></li>
            <li><a href="/heat-recovery" className="hover:text-blue-300 block py-2">Heat Recovery</a></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chip-cooling" element={<ChipCooling />} />
          <Route path="/heat-recovery" element={<HeatRecovery />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
