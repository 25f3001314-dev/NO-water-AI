/**
 * Gemini AI Automated Decision Engine
 * Analyzes weather, chip telemetry, energy metrics, and recommends workload migration
 * Provides AI-driven optimization decisions
 */

import axios from 'axios';

class GeminiDecisionEngine {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.lastDecision = null;
    this.decisionHistory = [];
    this.isAnalyzing = false;
  }

  /**
   * ML-based fallback decision engine (if Gemini API fails)
   */
  fallbackDecision(weatherData, chipTelemetry, energyMetrics, cities) {
    const decisions = cities.map(city => {
      let score = 50; // Base score

      // Temperature scoring (prefer cooler cities)
      if (weatherData[city]) {
        const tempScore = Math.max(0, 100 - (weatherData[city].temp - 15) * 3);
        score += tempScore * 0.25;
      }

      // Water availability (prefer cities with higher water index)
      const cityData = cities.find(c => c.name === city);
      if (cityData) {
        score += (cityData.waterIndex || 50) * 0.2;
      }

      // Energy efficiency (prefer cities with more solar generation)
      if (energyMetrics && energyMetrics.renewablePercent) {
        score += energyMetrics.renewablePercent * 0.15;
      }

      // Chip temperature factor - target 65-70°C range
      if (chipTelemetry) {
        const tempDiff = Math.abs(chipTelemetry.chipTemp - 67);
        const tempBonus = Math.max(0, 30 - tempDiff);
        score += tempBonus * 0.4;
      }

      return { city, score: Math.round(score) };
    });

    // Sort by score and pick top choice
    decisions.sort((a, b) => b.score - a.score);
    const recommended = decisions[0];

    // Calculate savings estimates
    const currentTemp = chipTelemetry?.chipTemp || 70;
    const recommendedTemp = weatherData[recommended.city]?.temp || 28;
    const tempDiff = Math.max(0, currentTemp - recommendedTemp);
    const waterSavingPercent = Math.round(tempDiff * 1.5); // Rough estimate
    const energySavingPercent = Math.round(tempDiff * 1.2);

    return {
      recommended_center: recommended.city,
      reason: `ML analysis: optimal balance of temperature (${recommendedTemp.toFixed(1)}°C), water availability, and renewable energy (${energyMetrics?.renewablePercent || 0}% solar)`,
      water_saving_percent: Math.min(35, waterSavingPercent),
      energy_saving_percent: Math.min(25, energySavingPercent),
      confidence: 0.75,
      method: 'fallback_ml_engine',
      timestamp: Date.now()
    };
  }

  /**
   * Main Gemini AI decision method
   * Analyzes all metrics and returns structured migration recommendation
   */
  async analyzeAndDecide(weatherData, chipTelemetry, energyMetrics, cities) {
    if (!this.apiKey) {
      console.warn('Gemini API key not found in env');
      return this.fallbackDecision(weatherData, chipTelemetry, energyMetrics, cities);
    }

    this.isAnalyzing = true;
    const startTime = Date.now();

    try {
      // Build analysis context
      const cityTempList = cities
        .map(c => `${c.name}: ${(weatherData[c.name]?.temp || 28).toFixed(1)}°C, Water Index: ${c.waterIndex}%`)
        .join('; ');

      const prompt = `You are an AI workload optimization expert. Analyze the following data center telemetry and recommend the optimal city for workload migration.

CURRENT STATUS:
- Chip Temperature: ${chipTelemetry?.chipTemp || 70}°C
- Cooling Flow Rate: ${chipTelemetry?.flowRate || 3.5} L/min
- Power Usage: ${chipTelemetry?.powerUsage || 180} kW
- PUE (Power Usage Effectiveness): ${chipTelemetry?.pue || 1.25}
- Cooling Efficiency: ${chipTelemetry?.efficiency || 72}%

ENERGY METRICS:
- Current Grid Load: ${energyMetrics?.gridLoad || 500} kW
- Solar Generation: ${energyMetrics?.solarGeneration || 200} kW
- Renewable Energy: ${energyMetrics?.renewablePercent || 30}%
- Grid Dependency: ${energyMetrics?.gridDependency || 70}%
- Cooling Water Usage: ${energyMetrics?.coolingWaterUsageL || 500} L/hr

AVAILABLE DATA CENTERS (with weather):
${cityTempList}

OBJECTIVE: Select the data center with:
1. Lowest ambient temperature (reduces cooling load)
2. Best water availability (for liquid cooling)
3. Highest renewable energy potential
4. Lowest overall operational cost

RESPOND with ONLY valid JSON (no markdown, no explanation, no code blocks):
{
  "recommended_center": "CityName",
  "reason": "Brief explanation of decision",
  "water_saving_percent": number,
  "energy_saving_percent": number,
  "confidence": number_0_to_1,
  "thermal_risk_reduction": number_0_to_100
}`;

      const response = await axios.post(
        `${this.apiEndpoint}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Parse Gemini response
      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      let decision;
      try {
        // Try direct parse first
        decision = JSON.parse(responseText);
      } catch (e) {
        // Try extracting JSON from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          decision = JSON.parse(jsonMatch[1]);
        } else {
          // Try finding JSON object pattern
          const objMatch = responseText.match(/\{[\s\S]*"recommended_center"[\s\S]*\}/);
          if (objMatch) {
            decision = JSON.parse(objMatch[0]);
          } else {
            throw new Error('Could not extract JSON from response');
          }
        }
      }

      // Validate response structure
      if (!decision.recommended_center || !decision.reason) {
        throw new Error('Invalid response structure');
      }

      // Add metadata
      decision.timestamp = Date.now();
      decision.method = 'gemini_ai';
      decision.processingTimeMs = Date.now() - startTime;

      // Store in history
      this.lastDecision = decision;
      this.decisionHistory.push(decision);
      if (this.decisionHistory.length > 20) {
        this.decisionHistory.shift(); // Keep last 20
      }

      console.log('✅ Gemini AI Decision:', decision);
      return decision;

    } catch (error) {
      console.warn('⚠️ Gemini API error, using fallback ML engine:', error.message);
      return this.fallbackDecision(weatherData, chipTelemetry, energyMetrics, cities);
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Real-time workload stress analysis
   */
  async analyzeStress(weatherData, chipTelemetry, energyMetrics) {
    if (!this.apiKey) {
      return this.fallbackStressAnalysis(weatherData, chipTelemetry, energyMetrics);
    }

    try {
      const prompt = `Analyze the stress level and risk of the data center based on these metrics:
- Chip Temperature: ${chipTelemetry?.chipTemp}°C
- Cooling Efficiency: ${chipTelemetry?.efficiency}%
- PUE: ${chipTelemetry?.pue}
- Grid Dependency: ${energyMetrics?.gridDependency}%
- Renewable Energy: ${energyMetrics?.renewablePercent}%

RESPOND with ONLY valid JSON:
{
  "stress_level": "critical|high|medium|low",
  "thermal_risk_percent": number_0_to_100,
  "task_pressure_score": number_0_to_100,
  "summary": "One sentence assessment"
}`;

      const response = await axios.post(
        `${this.apiEndpoint}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { timeout: 8000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.fallbackStressAnalysis(weatherData, chipTelemetry, energyMetrics);

    } catch (error) {
      console.warn('Stress analysis fallback:', error.message);
      return this.fallbackStressAnalysis(weatherData, chipTelemetry, energyMetrics);
    }
  }

  /**
   * Fallback stress analysis (if Gemini fails)
   */
  fallbackStressAnalysis(weatherData, chipTelemetry, energyMetrics) {
    const chipTemp = chipTelemetry?.chipTemp || 70;
    let stressLevel = 'low';
    let thermalRisk = 0;

    if (chipTemp > 85) {
      stressLevel = 'critical';
      thermalRisk = Math.min(100, (chipTemp - 70) * 2);
    } else if (chipTemp > 75) {
      stressLevel = 'high';
      thermalRisk = Math.min(100, (chipTemp - 70) * 1.5);
    } else if (chipTemp > 68) {
      stressLevel = 'medium';
      thermalRisk = Math.min(100, (chipTemp - 60) * 1.2);
    }

    const taskPressure = Math.round(
      (energyMetrics?.gridDependency || 50) * 0.4 + 
      thermalRisk * 0.4 + 
      (100 - (energyMetrics?.renewablePercent || 0)) * 0.2
    );

    return {
      stress_level: stressLevel,
      thermal_risk_percent: Math.round(thermalRisk),
      task_pressure_score: Math.min(100, taskPressure),
      summary: `Data center operating at ${stressLevel} stress with ${Math.round(thermalRisk)}% thermal risk`,
      method: 'fallback_analysis'
    };
  }

  /**
   * Get decision history for audit trail
   */
  getHistory() {
    return this.decisionHistory;
  }

  /**
   * Get last decision
   */
  getLastDecision() {
    return this.lastDecision;
  }

  /**
   * Check if currently analyzing
   */
  isAnalyzing() {
    return this.isAnalyzing;
  }
}

// Export singleton
export const geminiDecisionEngine = new GeminiDecisionEngine();

export default GeminiDecisionEngine;
