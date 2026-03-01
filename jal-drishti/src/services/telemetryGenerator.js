/**
 * Chip-Level Telemetry Generator
 * Generates realistic chip cooling and power telemetry data
 * Updates every 5 seconds
 */

class TelemetryGenerator {
  constructor() {
    this.chipTemp = 65;
    this.flowRate = 3.5;
    this.powerUsage = 180; // kW
    this.pue = 1.25;
    this.coolantPressure = 2.2;
    this.efficiency = 72;
    
    // Trend history for charts
    this.history = {
      temps: [65, 66, 65, 67, 66],
      flowRates: [3.5, 3.4, 3.6, 3.5, 3.7],
      efficiencies: [72, 71, 73, 72, 74],
      powerUsages: [180, 182, 179, 181, 180],
      timestamps: []
    };
    
    // Initialize timestamps
    const now = Date.now();
    for (let i = 4; i >= 0; i--) {
      this.history.timestamps.push(now - i * 5000);
    }
  }

  /**
   * Simulate realistic chip telemetry with minor fluctuations
   */
  generate() {
    // Simulate temperature fluctuations (-2 to +3°C per cycle)
    this.chipTemp += (Math.random() - 0.3) * 2;
    this.chipTemp = Math.max(55, Math.min(92, this.chipTemp)); // Clamp 55-92°C
    
    // Simulate flow rate variations
    this.flowRate += (Math.random() - 0.4) * 0.3;
    this.flowRate = Math.max(2.0, Math.min(6.0, this.flowRate)); // Clamp 2.0-6.0 L/min
    
    // Simulate power usage (correlated with temp)
    const tempFactor = (this.chipTemp - 55) / 37; // 0-1 scale
    this.powerUsage = Math.round(150 + 100 * tempFactor + (Math.random() - 0.5) * 20);
    
    // Calculate PUE (Power Usage Effectiveness)
    // Lower is better: 1.1-1.4 range
    // Cooling is ~35% of total power; effectiveness depends on flow rate
    this.pue = 1 + (this.powerUsage / this.flowRate / 30); // Simplified PUE calc
    this.pue = Math.max(1.08, Math.min(1.40, this.pue));
    
    // Cooling efficiency score
    this.efficiency = Math.round(85 - (this.chipTemp - 55) * 0.5 + Math.random() * 10);
    this.efficiency = Math.max(45, Math.min(95, this.efficiency));
    
    // Coolant pressure indicator
    this.coolantPressure = 2.0 + (this.flowRate - 2.0) * 0.3 + (Math.random() - 0.5) * 0.2;
    this.coolantPressure = Math.max(1.8, Math.min(3.4, this.coolantPressure));
    
    return this.snapshot();
  }

  /**
   * Get current snapshot with history
   */
  snapshot() {
    const now = Date.now();
    
    // Update history (keep last 8 data points)
    this.history.temps.push(Math.round(this.chipTemp * 10) / 10);
    this.history.flowRates.push(Math.round(this.flowRate * 10) / 10);
    this.history.efficiencies.push(this.efficiency);
    this.history.powerUsages.push(this.powerUsage);
    this.history.timestamps.push(now);
    
    // Keep only last 8 entries
    const maxHistory = 8;
    if (this.history.temps.length > maxHistory) {
      this.history.temps.shift();
      this.history.flowRates.shift();
      this.history.efficiencies.shift();
      this.history.powerUsages.shift();
      this.history.timestamps.shift();
    }
    
    return {
      chipTemp: Math.round(this.chipTemp * 10) / 10,
      flowRate: Math.round(this.flowRate * 10) / 10,
      powerUsage: this.powerUsage,
      pue: Math.round(this.pue * 100) / 100,
      coolantPressure: Math.round(this.coolantPressure * 10) / 10,
      efficiency: this.efficiency,
      waterSaved: Math.round((6 - this.flowRate) * 10), // Baseline 6 L/min
      timestamp: now,
      history: {
        temps: [...this.history.temps],
        flowRates: [...this.history.flowRates],
        efficiencies: [...this.history.efficiencies],
        powerUsages: [...this.history.powerUsages],
        timestamps: [...this.history.timestamps.map((t, i) => ({
          value: t,
          label: new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }))],
      }
    };
  }

  /**
   * Reset to baseline (useful for testing)
   */
  reset() {
    this.chipTemp = 65;
    this.flowRate = 3.5;
    this.powerUsage = 180;
    this.pue = 1.25;
    this.efficiency = 72;
  }
}

// Export singleton instance
export const telemetryGenerator = new TelemetryGenerator();

export default TelemetryGenerator;
