import { useEffect, useState } from 'react';
import { fetchSustainabilitySnapshot } from '../services/simulatedApi';

const EMPTY_STATE = {
  generatedAt: null,
  autonomousMode: { energyOptimization: 'INACTIVE', renewableIntegration: '' },
  heatRecovery: {},
  waterImpact: {},
  solarIntegration: {},
  carbonSeries: [],
  renewableSeries: [],
  energyMetrics: {}
};

export const useSustainabilityData = () => {
  const [snapshot, setSnapshot] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      const next = await fetchSustainabilitySnapshot();
      if (!active) return;
      setSnapshot(next);
      setLoading(false);
    };

    loadSnapshot();
    const timer = setInterval(loadSnapshot, 4500);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { snapshot, loading };
};
