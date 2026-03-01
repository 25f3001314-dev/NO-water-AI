import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Cpu } from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';
import { useChipResearchData } from '../hooks/useChipResearchData';

const Gauge = ({ value }) => {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={radius} stroke="#1e293b" strokeWidth="12" fill="none" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#22d3ee"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-semibold text-cyan-300">{normalized.toFixed(1)}%</p>
        <p className="text-xs text-slate-400">AI Efficiency</p>
      </div>
    </div>
  );
};

const ChipCooling = () => {
  const { snapshot, loading } = useChipResearchData();

  if (loading || !snapshot.telemetry || !snapshot.modelOutput) {
    return <p className="text-sm text-slate-400">Loading advanced chip cooling research panel...</p>;
  }

  const isChipOptimized = snapshot.autonomousMode?.chipOptimization === 'ACTIVE';

  return (
    <div className="space-y-5">
      {/* 🤖 CHIP OPTIMIZATION MODE BANNER */}
      {isChipOptimized && (
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-purple-400 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-purple-300">🔬 CHIP OPTIMIZATION: LIVE</p>
                <p className="text-xs text-slate-400">Real-time telemetry generation & efficiency analysis</p>
              </div>
            </div>
            <StatusBadge value="optimal" />
          </div>
        </div>
      )}

      <SectionCard
        title="🔬 Advanced Chip-Level Cooling Research Panel"
        subtitle="Direct-to-chip liquid cooling with live telemetry & AI optimization"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard 
            title="Chip Temperature" 
            value={`${snapshot.telemetry.chipTemperature}°C`} 
            helper="Real-time sensors" 
            status={snapshot.telemetry.chipTemperature > 78 ? 'critical' : snapshot.telemetry.chipTemperature > 72 ? 'high cost' : 'optimal'} 
          />
          <MetricCard 
            title="Cooling Liquid Flow" 
            value={`${snapshot.telemetry.flowRate} L/min`} 
            helper="Pump network" 
            status="active" 
          />
          <MetricCard 
            title="Water Saved" 
            value={`${snapshot.telemetry.waterSavedPct}%`} 
            helper="vs traditional" 
            status="optimal" 
          />
          <MetricCard 
            title="PUE" 
            value={String(snapshot.telemetry.pue)} 
            helper="Power efficiency" 
            status={snapshot.telemetry.pue < 1.2 ? 'optimal' : 'active'} 
          />
          <MetricCard 
            title="Power Usage" 
            value={`${snapshot.telemetry.powerUsageKW} kW`} 
            helper="Current draw" 
            status="active" 
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Cooling Technology Comparison" subtitle="Water use, efficiency and PUE benchmarks">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Water Use</th>
                  <th className="px-3 py-2">Energy Efficiency</th>
                  <th className="px-3 py-2">PUE</th>
                  <th className="px-3 py-2">Cooling Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.compareTable.map((row) => (
                  <tr key={row.method} className="border-b border-slate-900 text-slate-200">
                    <td className="px-3 py-2 font-medium">{row.method}</td>
                    <td className="px-3 py-2">{row.waterUse}</td>
                    <td className="px-3 py-2">{row.energyEfficiency}</td>
                    <td className="px-3 py-2">{row.pue}</td>
                    <td className="px-3 py-2">{row.coolingEfficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Efficiency Gauge" subtitle="Circular AI cooling meter">
          <div className="flex justify-center">
            <Gauge value={snapshot.telemetry.aiCoolingEfficiencyPct} />
          </div>
          <p className="text-center text-xs text-slate-400">Continuous simulation for chip-level thermal stability.</p>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="📈 Thermal & Efficiency Trends" subtitle="Real-time 8-sample history with AI analysis">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.trendSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tick" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="chipTemp" fill="#ef4444" radius={[6, 6, 0, 0]} name="Temp (°C)" />
                <Bar dataKey="efficiency" fill="#10b981" radius={[6, 6, 0, 0]} name="Efficiency (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {snapshot.modelOutput?.aiTrendAnalysis && (
            <p className="mt-3 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300">
              📊 {snapshot.modelOutput.aiTrendAnalysis}
            </p>
          )}
        </SectionCard>

        <SectionCard title="🎯 AI Model Predictions" subtitle="ML-driven optimization insights">
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
              {snapshot.researchInsight}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Predicted PUE"
                value={String(snapshot.telemetry.pue)}
                helper="Current efficiency"
                status={snapshot.telemetry.pue < 1.2 ? 'optimal' : 'active'}
              />
              <MetricCard
                title="Cooling Efficiency"
                value={`${snapshot.modelOutput.predictedCoolingEfficiencyPct}%`}
                helper="Model output"
                status="optimal"
              />
              <MetricCard
                title="Coolant Pressure"
                value={`${snapshot.telemetry.coolantPressureBar} bar`}
                helper="Hydraulic loop"
                status={snapshot.telemetry.coolantPressureBar > 3 ? 'high cost' : 'optimal'}
              />
              <MetricCard
                title="Power Reduction"
                value={`${snapshot.modelOutput.predictedPowerReductionPct}%`}
                helper="vs air cooling"
                status="optimal"
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default ChipCooling;
