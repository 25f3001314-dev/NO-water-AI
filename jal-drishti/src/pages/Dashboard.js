import React, { useEffect, useState } from 'react';
import axios from 'axios';
import IndiaMap from '@vishalvoid/react-india-map';

const dataCenters = [
  { id: 'DC_DEL_01', state: 'Delhi', lat: 28.61, lon: 77.23, temp: 0, waterStress: 'High (8/10)', groundwater: 'Depleted', load: 85, action: 'Shift to Shimla' },
  { id: 'DC_MUM_01', state: 'Maharashtra', lat: 19.07, lon: 72.88, temp: 0, waterStress: 'Medium (5/10)', groundwater: 'Stressed', load: 70, action: '' },
  { id: 'DC_SHI_01', state: 'Himachal Pradesh', lat: 31.10, lon: 77.17, temp: 0, waterStress: 'Low (2/10)', groundwater: 'Abundant', load: 20, action: 'Optimal' },
  // Add more: Chennai, Bengaluru etc.
];

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      const promises = dataCenters.map(dc => 
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${dc.lat}&lon=${dc.lon}&appid=${apiKey}&units=metric`)
          .then(res => ({ ...dc, temp: res.data.main.temp }))
      );
      const updated = await Promise.all(promises);
      setWeatherData(updated);
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  const mapData = weatherData.reduce((acc, dc) => {
    acc[dc.state] = { value: dc.temp, load: dc.load, fill: dc.waterStress === 'Low (2/10)' ? '#10B981' : '#EF4444' };
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-8">EquiShift Workload Router</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl">
          <IndiaMap
            data={mapData}
            onClick={(state) => console.log('Clicked:', state)}
            width={600}
            className="hover:scale-105 transition-transform"
          />
        </div>
        <div>
          {weatherData.map(dc => (
            <div key={dc.id} className="bg-black/30 p-6 mb-4 rounded-xl">
              <h3>{dc.state}</h3>
              <p>Temp: {dc.temp}°C [Real API]</p>
              <p>Water Stress: {dc.waterStress} [Dummy NITI CWMI]</p>
              <p>Groundwater: {dc.groundwater}</p>
              <p>Action: {dc.action}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-8 text-blue-300">Low temp + low water stress pe auto-shift (e.g., Delhi -> Shimla)</p>
    </div>
  );
};

export default Dashboard;
