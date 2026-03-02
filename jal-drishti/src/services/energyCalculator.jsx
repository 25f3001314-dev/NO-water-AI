/**
 * Energy Supply & Consumption Calculator
 * Computes total energy metrics, renewable contribution, and carbon impact
 */

class EnergyCalculator {
  constructor() {
    this.baselineConsumption = 850; // kW baseline consumption
    this.solarCapacity = 400; // kW peak solar capacity
    this.gridCapacity = 1200; // kW grid max
    this.coolingWaterUsage = 0;
    this.history = {
      gridLoad: [],
      solarGeneration: [],
      renewablePercent: [],
      carbonFootprint: [],
      waterUsage: [],
      timestamps: []
    };
  }

  /**
   * Calculate energy metrics based on time of day and telemetry
   */
  calculate(chipPower, weatherData, waterFlowRate) {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Solar generation varies by time of day (peak at 12:00)
    let solarGeneration = 0;
    if (hour >= 6 && hour <= 18) {
      const timeFromNoon = Math.abs(hour - 12) + minute / 60;
      solarGeneration = this.solarCapacity * Math.cos(timeFromNoon / 6); // Cosine curve
      solarGeneration = Math.max(0, solarGeneration);
    }
    
    // Current consumption (base + chip power + weather-dependent cooling)
    let currentConsumption = this.baselineConsumption + chipPower + 25;
    
    // Temperature-dependent consumption (higher temp = more cooling load)
    if (weatherData && weatherData.temp) {
      const tempFactor = Math.max(0, (weatherData.temp - 20) / 40); // 0-1 scale
      currentConsumption += tempFactor * 150; // Up to +150 kW additional load
    }
    
    // Grid load
    const gridLoad = Math.max(0, currentConsumption - solarGeneration);
    
    // Renewable percentage
    const renewablePercent = Math.round((solarGeneration / currentConsumption) * 100);
    
    // Grid dependency
    const gridDependency = Math.round(((currentConsumption - solarGeneration) / currentConsumption) * 100);
    
    // Water usage estimate (correlation: 3.8 liters per kWh of cooling)
    const coolingLoad = currentConsumption - this.baselineConsumption;
    this.coolingWaterUsage = coolingLoad * 3.8; // Estimated liters per hour
    
    // Carbon footprint
    // Grid: ~0.8 kg CO2/kWh, Solar: ~0.05 kg CO2/kWh (lifecycle)
    const gridCO2 = (gridLoad / this.baselineConsumption) * 0.8;
    const solarCO2 = (solarGeneration / this.baselineConsumption) * 0.05;
    const carbonFootprint = Math.round((gridCO2 + solarCO2) * 1000) / 1000; // kg CO2
    
    // Carbon reduction vs all-grid baseline
    const baselineCO2 = currentConsumption * 0.8; // If all from grid
    const carbonReduction = Math.round((baselineCO2 - carbonFootprint) / baselineCO2 * 100);
    
    // Household equivalent (avg Indian household = ~1.2 kWh/day = ~150W continuous)
    const householdEquivalent = Math.round((solarGeneration / 0.15) * 100) / 100;
    
    // Water household equivalent (avg = 150 liters/day per person, 4 people ~600L/day)
    const waterHouseholdEquivalent = Math.round(this.coolingWaterUsage / 25); // ~25L per hour typical
    
    const timestamp = Date.now();
    
    // Update history (keep last 8 entries)
    this.history.gridLoad.push(Math.round(gridLoad));
    this.history.solarGeneration.push(Math.round(solarGeneration));
    this.history.renewablePercent.push(renewablePercent);
    this.history.carbonFootprint.push(Math.round(carbonFootprint * 100) / 100);
    this.history.waterUsage.push(Math.round(this.coolingWaterUsage));
    this.history.timestamps.push(timestamp);
    
    const maxHistory = 8;
    if (this.history.gridLoad.length > maxHistory) {
      this.history.gridLoad.shift();
      this.history.solarGeneration.shift();
      this.history.renewablePercent.shift();
      this.history.carbonFootprint.shift();
      this.history.waterUsage.shift();
      this.history.timestamps.shift();
    }
    
    return {
      timestamp,
      consumption: Math.round(currentConsumption),
      solarGeneration: Math.round(solarGeneration),
      gridLoad: Math.round(gridLoad),
      renewablePercent,
      gridDependency,
      carbonFootprintKg: Math.round(carbonFootprint * 100) / 100,
      carbonReductionPercent: Math.max(0, carbonReduction),
      coolingWaterUsageL: Math.round(this.coolingWaterUsage),
      householdEnergyEquivalent: householdEquivalent,
      waterHouseholdEquivalent: waterHouseholdEquivalent,
      
      // For charts
      history: {
        gridLoad: [...this.history.gridLoad],
        solarGeneration: [...this.history.solarGeneration],
        renewablePercent: [...this.history.renewablePercent],
        carbonFootprint: [...this.history.carbonFootprint],
        waterUsage: [...this.history.waterUsage],
        timestamps: [...this.history.timestamps.map((t, i) => ({
          value: t,
          label: new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }))],
      }
    };
  }

  /**
   * Get carbon footprint trend (last 8 entries)
   */
  getCarbonTrend() {
    return this.history.carbonFootprint;
  }

  /**
   * Get renewable percentage trend
   */
  getRenewableTrend() {
    return this.history.renewablePercent;
  }

  /**
   * Check if system is carbon-positive (more renewable than grid)
   */
  isCarbonPositive(metrics) {
    return metrics.renewablePercent > 50;
  }

  /**
   * Estimate water savings vs benchmark (benchmark = all cooling via utility water)
   */
  estimateWaterSavings(savedWater) {
    // Each cooled degree of 1L water = ~2.1 kJ (4.18 kJ/(L·°C) × 50°C average drop)
    return Math.round(savedWater * 2.1 / 3600); // kWh equivalent
  }
}

// Export singleton
export const energyCalculator = new EnergyCalculator();

export default EnergyCalculator;
