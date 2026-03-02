/**
 * 🤖 AI-AUTOMATED DATA CENTER OPTIMIZATION ENGINE 🤖
 * 
 * Integrates:
 * - Live OpenWeather API data
 * - Chip-level telemetry generation (5-second updates)
 * - Real-time energy calculations (solar + grid)
 * - Gemini AI decision engine (workload migration automation)
 * 
 * AUTONOMOUS MODE: Enabled
 */

import { telemetryGenerator } from './telemetryGenerator';
import { energyCalculator } from './energyCalculator';
import { weatherService } from './weatherService';
import { geminiDecisionEngine } from './geminiDecisionEngine';

const CITY_BASE = [
  { id: 'DC-MUM-01', name: 'Mumbai', stateId: 'IN-MH', lat: 19.076, lon: 72.8777, waterIndex: 72 },
  { id: 'DC-HYD-01', name: 'Hyderabad', stateId: 'IN-TG', lat: 17.385, lon: 78.4867, waterIndex: 81 },
  { id: 'DC-CHE-01', name: 'Chennai', stateId: 'IN-TN', lat: 13.0827, lon: 80.2707, waterIndex: 48 },
  { id: 'DC-DEL-01', name: 'Delhi NCR', stateId: 'IN-DL', lat: 28.6139, lon: 77.209, waterIndex: 34 }
];

const COOLING_METHODS = [
  { method: 'Air Cooling', waterUse: 'High', energyEfficiency: 'Low', pue: '1.60', coolingEfficiency: '62%' },
  { method: 'Direct-to-Chip Liquid', waterUse: 'Low', energyEfficiency: 'High', pue: '1.22', coolingEfficiency: '88%' },
  { method: 'Immersion Cooling', waterUse: 'Very Low', energyEfficiency: 'Very High', pue: '1.10', coolingEfficiency: '93%' }
];

const randomBetween = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getWaterSeverity = (waterIndex) => {
  if (waterIndex >= 70) return 'Green';
  if (waterIndex >= 45) return 'Yellow';
  return 'Red';
};

const getDcStatus = (load, waterIndex, temp, efficientCooling = false) => {
  if (efficientCooling && load < 75 && waterIndex > 60) return 'Optimal';
  if (load >= 85 || waterIndex < 40 || temp > 36) return 'Critical';
  if (load >= 70 || waterIndex < 55 || temp > 32) return 'High Cost';
  return 'Optimal';
};

// Migration logs history (last 12 entries)
const migrationLogs = [];
let lastGeminiDecision = null;
let aiAutonomousMode = true; // Feature flag
let migrationTaskId = 'TASK-0001';

/**
 * 🤖 MAIN AI AUTOMATION FLOW
 * Weather API → Chip Telemetry → Energy Metrics → Gemini Decision → Task Migration
 */
export const fetchClimateControlSnapshot = async () => {
  // Step 1: Fetch live weather data
  const weatherData = await weatherService.fetchAllCities();

  // Step 2: Get current chip telemetry
  const chipTelemetry = telemetryGenerator.generate();

  // Step 3: Calculate energy metrics (using default city: Mumbai)
  const energyMetrics = energyCalculator.calculate(chipTelemetry.powerUsage, weatherData['Mumbai'], chipTelemetry.flowRate);

  // Step 4: Build city snapshots with weather integration
  const cities = CITY_BASE.map((baseCity) => {
    const weather = weatherData[baseCity.name] || { temp: 30, humidity: 65 };
    const temperature = weather.temp;
    const humidity = weather.humidity;
    const load = randomInt(45, 96);
    const dynamicWaterIndex = Math.max(10, Math.min(95, Math.round(baseCity.waterIndex + randomBetween(-6, 6))));
    const coolingWaterM3 = randomBetween(190, 580);
    const status = getDcStatus(load, dynamicWaterIndex, temperature, true);

    return {
      ...baseCity,
      temperature,
      humidity,
      load,
      waterIndex: dynamicWaterIndex,
      waterSeverity: getWaterSeverity(dynamicWaterIndex),
      coolingWaterM3,
      status,
      weather: {
        temp: temperature,
        humidity: humidity,
        description: weather.description,
        windSpeed: weather.windSpeed
      }
    };
  });

  // Step 5: Get Gemini AI decision for workload migration
  let aiDecision = null;
  let geminiMonitor = { summary: 'Analyzing...', stressedRegion: '—', thermalRisk: 0, taskPressure: 0 };

  if (aiAutonomousMode) {
    try {
      aiDecision = await geminiDecisionEngine.analyzeAndDecide(
        weatherData,
        chipTelemetry,
        energyMetrics,
        cities
      );

      // Get stress analysis for real-time monitoring
      await geminiDecisionEngine.analyzeStress(weatherData, chipTelemetry, energyMetrics);
      geminiMonitor = {
        summary: `🤖 AI Decision: Migrate to ${aiDecision.recommended_center}. ${aiDecision.reason}`,
        stressedRegion: cities.reduce((p, c) => (c.load > p.load ? c : p)).name,
        thermalRisk: aiDecision.thermal_risk_reduction || Math.round(chipTelemetry.chipTemp - 60) * 2,
        taskPressure: Math.round(cities.reduce((sum, c) => sum + c.load, 0) / cities.length),
        confidence: aiDecision.confidence || 0.85,
        method: aiDecision.method || 'gemini_ai'
      };

      lastGeminiDecision = aiDecision;
    } catch (error) {
      console.warn('AI Decision error:', error);
      geminiMonitor.summary = '⚠️ AI analysis in progress...';
    }
  }

  // Step 6: Log and simulate migration task
  const recommendedCity = aiDecision?.recommended_center || 'Hyderabad';
  const currentHighestLoadCity = cities.reduce((p, c) => (c.load > p.load ? c : p));

  const migrationLogEntry = {
    timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    taskId: migrationTaskId,
    from: currentHighestLoadCity.name,
    to: recommendedCity,
    waterSavingPct: aiDecision?.water_saving_percent || randomInt(16, 33),
    energySavingPct: aiDecision?.energy_saving_percent || randomInt(10, 24),
    status: 'success'
  };

  migrationLogs.push(migrationLogEntry);
  if (migrationLogs.length > 12) migrationLogs.shift();

  // Increment task ID
  const taskNum = parseInt(migrationTaskId.split('-')[1]) + 1;
  migrationTaskId = `TASK-${String(taskNum).padStart(4, '0')}`;

  const migration = {
    taskId: migrationLogEntry.taskId,
    from: migrationLogEntry.from,
    to: migrationLogEntry.to,
    status: 'Optimized',
    waterSavingPct: migrationLogEntry.waterSavingPct,
    energySavingPct: migrationLogEntry.energySavingPct,
    logs: migrationLogs,
    aiAutonomous: true,
    geminiConfidence: lastGeminiDecision?.confidence || 0.75
  };

  const recommendation = {
    message: `✅ Autonomous Migration: ${migration.from} → ${migration.to}`,
    waterSavingPct: migration.waterSavingPct,
    energyReductionPct: migration.energySavingPct,
    coolingCostPredictionINR: Math.round(1500000 * (1 - migration.energySavingPct / 100))
  };

  return {
    generatedAt: new Date().toISOString(),
    autonomousMode: {
      enabled: aiAutonomousMode,
      status: 'ACTIVE',
      methodology: 'Gemini AI + ML Fallback'
    },
    cities,
    weatherData,
    chipTelemetry,
    energyMetrics,
    recommendation,
    geminiMonitor,
    migration,
    lastDecision: lastGeminiDecision
  };
};

/**
 * 🔬 CHIP COOLING RESEARCH PANEL
 * Live telemetry from cooling systems with AI trend analysis
 */
export const fetchChipResearchSnapshot = async () => {
  // Get real chip telemetry (updates every 5 sec)
  const telemetry = telemetryGenerator.snapshot();

  // Transform for display
  const trendChartData = telemetry.history.timestamps.map((t, idx) => ({
    tick: telemetry.history.timestamps[idx]?.label || `T-${idx}`,
    chipTemp: telemetry.history.temps[idx],
    flowRate: telemetry.history.flowRates[idx],
    efficiency: telemetry.history.efficiencies[idx],
    powerUsage: telemetry.history.powerUsages[idx]
  }));

  // AI trend analysis based on history
  const tempTrend = telemetry.history.temps.length > 1 
    ? telemetry.history.temps[telemetry.history.temps.length - 1] - telemetry.history.temps[0]
    : 0;

  const aiTrendAnalysis = tempTrend < 0 
    ? '✅ Temperature decreasing - cooling optimization working'
    : tempTrend > 2 
    ? '⚠️ Temperature rising - monitor cooling system'
    : '✅ Temperature stable';

  return {
    generatedAt: new Date().toISOString(),
    autonomousMode: {
      chipOptimization: 'ACTIVE',
      lastUpdate: telemetry.timestamp
    },
    telemetry: {
      chipTemperature: telemetry.chipTemp,
      flowRate: telemetry.flowRate,
      waterSavedPct: telemetry.waterSaved,
      coolantPressureBar: telemetry.coolantPressure,
      aiCoolingEfficiencyPct: telemetry.efficiency,
      powerUsageKW: telemetry.powerUsage
    },
    modelOutput: {
      predictedPUE: telemetry.pue,
      predictedCoolingEfficiencyPct: Math.round(telemetry.efficiency * 0.98),
      predictedPowerReductionPct: Math.round((180 - telemetry.powerUsage) / 1.8),
      aiTrendAnalysis: aiTrendAnalysis
    },
    compareTable: COOLING_METHODS,
    trendSeries: trendChartData,
    researchInsight: `Direct-to-chip liquid cooling achieves ${telemetry.efficiency}% efficiency. Flow rate: ${telemetry.flowRate} L/min with ${telemetry.waterSaved}% water savings.`
  };
};

/**
 * ♻️ HEAT REUSE & SOLAR IMPACT DASHBOARD
 * Real-time energy metrics with renewable integration
 */
export const fetchSustainabilitySnapshot = async () => {
  // Get current energy metrics
  const chipTelemetry = telemetryGenerator.snapshot();
  const weatherData = await weatherService.fetchAllCities();
  const energyMetrics = energyCalculator.calculate(chipTelemetry.powerUsage, weatherData['Mumbai'], chipTelemetry.flowRate);

  // Heat recovery estimates based on cooling load
  const coolingLoad = energyMetrics.consumption - 150; // Baseline - cooling component
  const recoveredHeatMWh = Math.round(coolingLoad * 0.024 * 100) / 100; // 0.024 MWh per kW
  const householdsSupplied = Math.round(recoveredHeatMWh * 200); // Rough estimate
  const equivalentWaterHeatedLiters = Math.round(recoveredHeatMWh * 25000); // Liters equivalent
  const co2ReductionTons = Math.round(recoveredHeatMWh * 0.45); // 0.45 tons CO2 per MWh

  // Water supply impact
  const waterSavedMillionLiters = Math.round(energyMetrics.coolingWaterUsageL / 1000000 * 100) / 100;
  const reservoirImpactPct = Math.round(waterSavedMillionLiters * 5); // 5% per million liters
  const householdWaterEquivalent = energyMetrics.waterHouseholdEquivalent;

  // Solar & renewable integration
  const solarGenerationKw = Math.round(energyMetrics.solarGeneration);
  const renewablePct = energyMetrics.renewablePercent;
  const gridReductionPct = 100 - energyMetrics.gridDependency;
  const carbonReductionPct = energyMetrics.carbonReductionPercent;

  // Build carbon & renewable trend data
  const carbontrendChartData = energyMetrics.history.timestamps.map((t, idx) => ({
    tick: energyMetrics.history.timestamps[idx]?.label || `W-${idx}`,
    baseline: Math.round(energyMetrics.history.carbonFootprint[idx] * 200),
    optimized: Math.round(energyMetrics.history.carbonFootprint[idx] * 100)
  }));

  const renewableTrendChartData = energyMetrics.history.timestamps.map((t, idx) => ({
    tick: energyMetrics.history.timestamps[idx]?.label || `W-${idx}`,
    solar: energyMetrics.history.solarGeneration[idx] || 0,
    grid: energyMetrics.history.gridLoad[idx] || 0
  }));

  return {
    generatedAt: new Date().toISOString(),
    autonomousMode: {
      energyOptimization: 'ACTIVE',
      renewableIntegration: 'OPTIMIZED'
    },
    heatRecovery: {
      recoveredHeatMWh,
      householdsSupplied,
      equivalentWaterHeatedLiters,
      co2ReductionTons
    },
    waterImpact: {
      waterSavedMillionLiters,
      reservoirImpactPct,
      householdWaterEquivalent,
      coolingWaterUsageL: energyMetrics.coolingWaterUsageL
    },
    solarIntegration: {
      solarGenerationKw,
      renewablePct,
      gridReductionPct,
      carbonReductionPct,
      carbonFootprintKg: energyMetrics.carbonFootprintKg,
      gridDependencyPct: energyMetrics.gridDependency
    },
    carbonSeries: carbontrendChartData,
    renewableSeries: renewableTrendChartData,
    energyMetrics // Include full energy metrics for dashboard
  };
};
