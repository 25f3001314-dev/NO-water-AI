import { useEffect, useState } from "react";
import { getHeatRecovery } from "./api";

export default function HeatRecovery() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHeatRecovery().then(setData);
  }, []);

  if (!data) return <div className="text-white">Loading...</div>;

  return (
    <div className="text-white">
      <h1 className="text-xl font-bold">Heat Recovery</h1>
      <pre className="mt-4 bg-black p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
