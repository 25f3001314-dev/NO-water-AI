import { useEffect, useState } from "react";
import { getChipThermal } from "./api";

export default function ChipCooling() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => setData(await getChipThermal());
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!data) return <div className="text-white">Loading thermal data...</div>;

  return (
    <div className="text-white">
      <h1 className="text-xl font-bold">Chip Thermal</h1>
      <p>Temp: {data.temp}°C</p>
      <p>Status: {data.status}</p>
      <p className="mt-2 text-green-400">Gemini: {data.gemini_analysis}</p>
    </div>
  );
}
