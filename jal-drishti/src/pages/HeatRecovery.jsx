import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Sun } from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import SectionCard from '../components/common/SectionCard';
import StatusBadge from '../components/common/StatusBadge';
import { useSustainabilityData } from '../hooks/useSustainabilityData';

const HeatRecovery = () => {
  const { snapshot, loading } = useSustainabilityData();

  if (loading || !snapshot.heatRecovery || !snapshot.waterImpact || !snapshot.solarIntegration) {
    return <p className="text-sm text-slate-400">Loading heat reuse and solar impact dashboard...</p>;
  }

  const isEnergyOptimized = snapshot.autonomousMode?.energyOptimization === 'ACTIVE';
  const renewableIntegration = snapshot.autonomousMode?.renewableIntegration;

  return (
    <div className="space-y-5">
      {/* ⚡ ENERGY OPTIMIZATION MODE BANNER */}
      {isEnergyOptimized && (
        <div className="rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-green-400 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-green-300">⚡ ENERGY OPTIMIZATION: {renewableIntegration || 'OPTIMIZED'}</p>
                <p className="text-xs text-slate-400">Real-time solar + grid + heat recovery integration</p>
              </div>
            </div>
            <StatusBadge value={snapshot.solarIntegration.renewablePct > 50 ? 'optimal' : 'active'} />
          </div>
        </div>
      )}

      <SectionCard
        title="♻️ Heat Reuse, Household Impact & Solar Integration"
        subtitle="Sustainability intelligence for AI-optimized carbon-aware cloud infrastructure"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard 
            title="Recovered Heat" 
            value={`${snapshot.heatRecovery.recoveredHeatMWh} MWh`} 
            helper="Waste reuse" 
            status="optimal" 
          />
          <MetricCard 
            title="Households Supplied" 
            value={snapshot.heatRecovery.householdsSupplied.toLocaleString('en-IN')} 
            helper="Thermal equivalent" 
            status="optimal" 
          />
          <MetricCard 
            title="Water Saved" 
            value={`${snapshot.waterImpact.waterSavedMillionLiters} ML`} 
            helper="Optimization gain" 
            status="optimal" 
          />
          <MetricCard 
            title="Renewable Share" 
            value={`${snapshot.solarIntegration.renewablePct}%`} 
            helper="Solar + clean mix" 
            status={snapshot.solarIntegration.renewablePct > 50 ? 'optimal' : 'active'} 
          />
          <MetricCard 
            title="Carbon Reduction" 
            value={`${snapshot.solarIntegration.carbonReductionPct}%`} 
            helper="vs all-grid baseline" 
            status="optimal" 
          />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard 
          title="🔥 Waste Heat Recovery" 
          subtitle="District-level thermal utilization & carbon savings"
          rightContent={<StatusBadge value="optimal" />}
        >
          <div className="space-y-3">
            <MetricCard 
              title="Equivalent Water Heated" 
              value={`${snapshot.heatRecovery.equivalentWaterHeatedLiters.toLocaleString('en-IN')} L`} 
              helper="Thermal load" 
            />
            <MetricCard 
              title="CO2 Reduction" 
              value={`${snapshot.heatRecovery.co2ReductionTons} tons`} 
              helper="Annual estimate" 
            />
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              ✅ Heat reuse routes data center waste energy to nearby residential/industrial demand, reducing grid draw.
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="💧 Water Supply Impact" 
          subtitle="Reservoir refill support & household equivalents"
          rightContent={<StatusBadge value="optimal" />}
        >
          <div className="space-y-3">
            <MetricCard 
              title="Reservoir Impact" 
              value={`${snapshot.waterImpact.reservoirImpactPct}%`} 
              helper="Projected refill support" 
            />
            <MetricCard
              title="Household Water Equivalent"
              value={snapshot.waterImpact.householdWaterEquivalent.toLocaleString('en-IN')}
              helper="Homes served daily"
            />
            <MetricCard
              title="Cooling Water Usage"
              value={`${snapshot.waterImpact.coolingWaterUsageL?.toLocaleString('en-IN') || '—'} L/hr`}
              helper="Real-time consumption"
            />
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              💡 AI routing reduces evaporative losses and strengthens local water supply resilience.
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="☀️ Solar & Renewable Integration" 
          subtitle="Decarbonization strategy with grid reduction"
          rightContent={<StatusBadge value={snapshot.solarIntegration.renewablePct > 50 ? 'optimal' : 'active'} />}
        >
          <div className="space-y-3">
            <MetricCard 
              title="Solar Generation" 
              value={`${snapshot.solarIntegration.solarGenerationKw} kW`} 
              helper="Current plant output" 
            />
            <MetricCard 
              title="Renewable Percent" 
              value={`${snapshot.solarIntegration.renewablePct}%`} 
              helper="Solar + clean source mix" 
            />
            <MetricCard 
              title="Grid Dependency" 
              value={`${snapshot.solarIntegration.gridDependencyPct}%`} 
              helper="Fossil fuel reliance" 
              status={snapshot.solarIntegration.gridDependencyPct < 50 ? 'optimal' : 'active'}
            />
            <MetricCard 
              title="Carbon Footprint" 
              value={`${snapshot.solarIntegration.carbonFootprintKg} kg CO2`} 
              helper="Current hourly rate" 
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard 
          title="📉 Carbon Footprint Reduction Trend" 
          subtitle="Baseline (all-grid) vs optimized (solar + heat recovery)"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.carbonSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tick" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="baseline" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Baseline" />
                <Area type="monotone" dataKey="optimized" stroke="#10b981" fill="#10b981" fillOpacity={0.25} name="Optimized" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            💚 Weekly carbon footprint comparison showing AI + renewable optimization gains
          </p>
        </SectionCard>

        <SectionCard 
          title="⚡ Renewable vs Grid Mix Trend" 
          subtitle="Solar generation and grid dependency over time"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshot.renewableSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tick" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="solar" stroke="#fbbf24" strokeWidth={2.5} name="Solar (kW)" />
                <Line type="monotone" dataKey="grid" stroke="#a78bfa" strokeWidth={2.5} name="Grid (kW)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            ☀️ Golden line = solar generation | Purple line = grid demand (lower = better)
          </p>
        </SectionCard>
      </div>
    </div>
  );
};

export default HeatRecovery;
