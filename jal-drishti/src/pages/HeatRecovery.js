import React, { useState, useEffect } from 'react';

const HeatRecovery = () => {
  const [data, setData] = useState({ heatCaptured: 10, homes: 1500, revenue: '$500K' });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        heatCaptured: 9 + Math.random() * 2,
        homes: 1400 + Math.random() * 200,
        revenue: '$500K - $1M'
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">Heat Recovery & Community Grid</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-black/30 p-6 rounded-xl"><span className="text-4xl block">{data.heatCaptured} MW</span> Waste Heat Captured</div>
        <div className="bg-black/30 p-6 rounded-xl"><span className="text-4xl block">{data.homes}</span> Homes Supplied</div>
        <div className="bg-black/30 p-6 rounded-xl"><span className="text-4xl block">{data.revenue}</span> Annual Revenue</div>
      </div>
      <div className="mt-8 bg-black/30 p-6 rounded-xl">
        <p>Solar ORC Integration: Active (Rice University model inspired)</p>
        <p>District Heating Grid: 45,000 kWh delivered</p>
      </div>
    </div>
  );
};

export default HeatRecovery;
