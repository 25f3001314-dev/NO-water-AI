import React from 'react';
import { IndiaMap } from '@vishalvoid/react-india-map';
import { Activity, Droplets, TrendingDown, Zap } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import MetricCard from '../components/common/MetricCard';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';
import { useClimateControlData } from '../hooks/useClimateControlData';

const STATUS_COLOR = {
  Green: '#22c55e',
  Yellow: '#f59e0b',
  Red: '#ef4444'
};

const Dashboard = () => {
  const { snapshot, logs, loading, avgWaterIndex } = useClimateControlData();

  if (loading || !snapshot.recommendation || !snapshot.migration) {
    return <p className="text-sm text-slate-400">Loading climate control center...</p>;
  }

  const stateData = snapshot.cities.map((city) => ({
    id: city.stateId,
    customData: {
      city: city.city,
      temperature: `${city.temperature}°C`,
      humidity: `${city.humidity}%`,
      waterIndex: city.waterIndex,
      status: city.status
    },
    fill: STATUS_COLOR[city.waterSeverity]
  }));

  const mapStyle = {
    backgroundColor: '#020617',
    hoverColor: '#0f172a',
    stroke: '#334155',
    strokeWidth: 1,
    tooltipConfig: {
      backgroundColor: 'rgba(2, 6, 23, 0.95)',
      textColor: '#e2e8f0'
    }
  };

  const chartData = snapshot.cities.map((city) => ({
    city: city.city,
    load: city.load,
    waterIndex: city.waterIndex
  }));

  const autonomousMode = snapshot.autonomousMode;
  const isAIActive = autonomousMode?.enabled && autonomousMode?.status === 'ACTIVE';

  return (
    <div className="space-y-5">
      {/* 🤖 AI AUTONOMOUS MODE BANNER */}
      {isAIActive && (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 p-4 backdrop-blur">
          <div className="absolute right-0 top-0 -z-10 h-full w-1/3 bg-cyan-500/5 blur-3xl" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-3 w-3 items-center justify-center">
                <span className="relative h-3 w-3 rounded-full bg-cyan-400">
                  <span className="absolute h-3 w-3 rounded-full bg-cyan-400 animate-ping opacity-75" />
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-cyan-300">🤖 AI AUTONOMOUS MODE: ACTIVE</p>
                <p className="text-xs text-slate-400">Gemini AI + Weather Integration + Energy Optimization</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-slate-400">Method: {autonomousMode?.methodology || 'Hybrid'}</p>
              {snapshot.lastDecision && (
                <p className="text-xs text-emerald-400">Confidence: {Math.round(snapshot.lastDecision.confidence * 100)}%</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Average Water Availability Index"
          value={`${avgWaterIndex}`}
          helper="Across 4 active data centers"
          status={avgWaterIndex >= 60 ? 'Optimal' : 'Warning'}
        />
        <MetricCard
          title="AI Cooling Cost Prediction"
          value={`₹ ${snapshot.recommendation.coolingCostPredictionINR.toLocaleString('en-IN')}`}
          helper="Simulated ML output"
          status="Active"
        />
        <MetricCard
          title="Estimated Water Saving"
          value={`${snapshot.recommendation.waterSavingPct}%`}
          helper="Current migration cycle"
          status="Optimal"
        />
        <MetricCard
          title="Estimated Energy Reduction"
          value={`${snapshot.recommendation.energyReductionPct}%`}
          helper="Post optimization"
          status="Optimal"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="India Data Center Map"
          subtitle="State-level water risk overlay for Mumbai, Hyderabad, Chennai, Delhi NCR"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <IndiaMap stateData={stateData} mapStyle={mapStyle} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Green: Water healthy
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Yellow: Moderate stress
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Red: Critical stress
            </span>
          </div>
        </SectionCard>

        <SectionCard title="🤖 Real-Time Gemini Monitoring" subtitle="AI-driven workload and climate stress analysis">
          <div className="space-y-3">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100">
              <p className="mb-2 font-medium">✨ AI Decision:</p>
              <p>{snapshot.geminiMonitor.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard 
                title="Stressed Region" 
                value={snapshot.geminiMonitor.stressedRegion}
                status="critical"
              />
              <MetricCard 
                title="Thermal Risk" 
                value={`${snapshot.geminiMonitor.thermalRisk}%`}
                status={snapshot.geminiMonitor.thermalRisk > 60 ? 'critical' : 'active'}
              />
              <MetricCard 
                title="Task Pressure" 
                value={`${snapshot.geminiMonitor.taskPressure}/100`}
                status={snapshot.geminiMonitor.taskPressure > 70 ? 'high cost' : 'optimal'}
              />
              <MetricCard 
                title="AI Confidence" 
                value={`${Math.round((snapshot.geminiMonitor.confidence || 0.75) * 100)}%`}
                status="active"
              />
            </div>
            {snapshot.lastDecision && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-xs text-slate-400">
                <p className="font-mono mb-1">📊 Method: <span className="text-slate-300">{snapshot.lastDecision.method}</span></p>
                <p className="line-clamp-2">💡 Reason: <span className="text-slate-300">{snapshot.lastDecision.reason}</span></p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Data Center Status Cards" subtitle="Live city-level thermal, load and water intelligence">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {snapshot.cities.map((city) => (
            <div key={city.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-base font-semibold">{city.city}</h4>
                <StatusBadge value={city.status} />
              </div>

              <div className="space-y-2 text-sm text-slate-300">
                <p className="flex justify-between"><span>Temperature</span> <strong>{city.temperature}°C</strong></p>
                <p className="flex justify-between"><span>Humidity</span> <strong>{city.humidity}%</strong></p>
                <p className="flex justify-between"><span>Cooling Water</span> <strong>{city.coolingWaterM3} m³</strong></p>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Data Center Load</span>
                  <span>{city.load}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      city.load > 84 ? 'bg-red-500' : city.load > 68 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${city.load}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          title="AI Optimization Panel"
          subtitle="Migration and cost intelligence"
          rightContent={<StatusBadge value="Active" />}
        >
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200">
              <p className="font-medium">{snapshot.recommendation.message}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">Water Saving</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-emerald-300">
                  <Droplets className="h-4 w-4" /> {snapshot.recommendation.waterSavingPct}%
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">Energy Cost Reduction</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-cyan-300">
                  <TrendingDown className="h-4 w-4" /> {snapshot.recommendation.energyReductionPct}%
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">Cooling Cost Estimate</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-blue-300">
                  <Zap className="h-4 w-4" /> ₹{snapshot.recommendation.coolingCostPredictionINR.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Task Migration Simulation" subtitle="Running → Migrating → Running with live logs">
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
            <p className="text-sm text-slate-300">Task ID: <strong className="text-slate-100">{snapshot.migration.taskId}</strong></p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {snapshot.migration.statusFlow.map((step, index) => {
                const isActive = index === snapshot.migration.currentStatusIndex;
                return (
                  <div
                    key={`${step}-${index}`}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-medium ${
                      isActive
                        ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200 animate-pulse'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {step}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700 px-2 py-1">Water Saving: {snapshot.migration.waterSavingPct}%</span>
              <span className="rounded-full border border-slate-700 px-2 py-1">Energy Saving: {snapshot.migration.energySavingPct}%</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <Activity className="h-4 w-4 text-cyan-300" /> Migration Logs
            </p>
            <div className="max-h-40 space-y-1 overflow-auto text-xs text-slate-400">
              {logs.map((line, index) => (
                <p key={`${line}-${index}`} className="rounded bg-slate-900 px-2 py-1">{line}</p>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Load vs Water Availability" subtitle="City-wise balancing indicators for AI scheduler">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="city" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="load" stroke="#22d3ee" strokeWidth={2} />
              <Line type="monotone" dataKey="waterIndex" stroke="#34d399" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
};

export default Dashboard;
