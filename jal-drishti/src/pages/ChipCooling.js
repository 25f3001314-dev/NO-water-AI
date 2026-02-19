import React, { useState, useEffect } from 'react';

const ChipCooling = () => {
  const [telemetry, setTelemetry] = useState({
    chipTemp: 82, flowRate: 2.5, efficiency: '96%', waterUsed: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        chipTemp: 75 + Math.random() * 10,
        flowRate: 2.3 + Math.random() * 0.4,
        efficiency: `${94 + Math.random() * 4}%`,
        waterUsed: 0
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">Direct-to-Chip Cooling Dashboard</h2>
      <div className="bg-black/30 backdrop-blur-md p-8 rounded-2xl text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div><span className="text-4xl">{telemetry.chipTemp}°C</span><p>Chip Hotspot</p></div>
          <div><span className="text-4xl">{telemetry.flowRate} L/min</span><p>Coolant Flow</p></div>
          <div><span className="text-4xl">{telemetry.efficiency}</span><p>Efficiency</p></div>
          <div><span className="text-4xl">{telemetry.waterUsed}L</span><p>Water Evap.</p></div>
        </div>
        <div className="w-full h-64 bg-gradient-to-r from-red-500 to-blue-500 rounded-xl animate-pulse flex items-center justify-center text-2xl font-bold">
          3D Chip View (Micro-jets Active - Dummy Telemetry)
        </div>
      </div>
    </div>
  );
};

export default ChipCooling;
