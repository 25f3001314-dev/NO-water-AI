import { useEffect, useState } from "react";
import { getDashboardData } from "./api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => setData(await getDashboardData());
    fetchData();
    const id = setInterval(fetchData, 7000);
    return () => clearInterval(id);
  }, []);

  if (!data) return <div className="text-white">Loading...</div>;

  return (
    <div className="text-white">
      <h1 className="text-xl font-bold">Smart Task Dashboard</h1>
      <pre className="mt-4 bg-black p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
