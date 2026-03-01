import { useEffect, useMemo, useState } from 'react';
import { fetchClimateControlSnapshot } from '../services/simulatedApi';

const EMPTY_STATE = {
  generatedAt: null,
  autonomousMode: { enabled: false, status: 'INACTIVE', methodology: '' },
  cities: [],
  weatherData: {},
  chipTelemetry: {},
  energyMetrics: {},
  recommendation: null,
  geminiMonitor: null,
  migration: null,
  lastDecision: null
};

export const useClimateControlData = () => {
  const [snapshot, setSnapshot] = useState(EMPTY_STATE);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      const next = await fetchClimateControlSnapshot();
      if (!active) return;

      setSnapshot(next);
      // Extract migration logs from the API response
      if (next.migration?.logs) {
        setLogs(prev => next.migration.logs.slice(0, 12));
      }
      setLoading(false);
    };

    loadSnapshot();
    const timer = setInterval(loadSnapshot, 4000); // 4 second refresh

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const avgWaterIndex = useMemo(() => {
    if (!snapshot.cities.length) return 0;
    const total = snapshot.cities.reduce((sum, city) => sum + city.waterIndex, 0);
    return Number((total / snapshot.cities.length).toFixed(1));
  }, [snapshot.cities]);

  return {
    snapshot,
    logs,
    loading,
    avgWaterIndex
  };
};
