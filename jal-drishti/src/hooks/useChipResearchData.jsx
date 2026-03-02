import { useEffect, useState } from 'react';
import { fetchChipResearchSnapshot } from '../services/simulatedApi';

const EMPTY_STATE = {
  generatedAt: null,
  autonomousMode: { chipOptimization: 'INACTIVE', lastUpdate: null },
  telemetry: {},
  modelOutput: {},
  compareTable: [],
  trendSeries: [],
  researchInsight: ''
};

export const useChipResearchData = () => {
  const [snapshot, setSnapshot] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      const next = await fetchChipResearchSnapshot();
      if (!active) return;
      setSnapshot(next);
      setLoading(false);
    };

    loadSnapshot();
    const timer = setInterval(loadSnapshot, 3500);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { snapshot, loading };
};
