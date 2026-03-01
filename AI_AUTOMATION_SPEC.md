# 🤖 AI AUTOMATION TECHNICAL SPECIFICATION

## Overview
This document provides detailed technical specifications for the fully AI-automated Jal-Drishti system.

---

## 🧠 AI Decision Engine Architecture

### Gemini AI Integration (`geminiDecisionEngine.js`)

**API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

**Input Prompt Structure**:
```javascript
{
  "contents": [{
    "parts": [{
      "text": `You are an AI workload optimization expert. Analyze the following data center telemetry...
      
      CURRENT STATUS:
      - Chip Temperature: ${chipTemp}°C
      - Cooling Flow Rate: ${flowRate} L/min
      - Power Usage: ${powerUsage} kW
      
      ENERGY METRICS:
      - Grid Load: ${gridLoad} kW
      - Solar Generation: ${solarGen} kW
      
      AVAILABLE DATA CENTERS (with weather):
      Mumbai: ${temp}°C, Water Index: ${waterIndex}%
      Hyderabad: ...
      
      OBJECTIVE: Select the data center with:
      1. Lowest ambient temperature
      2. Best water availability
      3. Highest renewable energy potential
      
      RESPOND with ONLY valid JSON:
      {
        "recommended_center": "CityName",
        "reason": "Brief explanation",
        "water_saving_percent": number,
        "energy_saving_percent": number,
        "confidence": number_0_to_1,
        "thermal_risk_reduction": number_0_to_100
      }`
    }]
  }]
}
```

**Response Parsing**:
1. Try direct JSON parse
2. Extract from markdown code blocks: ` ```json ... ``` `
3. Pattern match JSON object: `/\{.*"recommended_center".*\}/`
4. Fallback to ML rule engine if all fail

**Fallback ML Decision Algorithm**:
```javascript
score = 50 (base)
+ (100 - (temperature - 15) * 3) * 0.25  // Temperature factor
+ waterIndex * 0.2                         // Water availability
+ renewablePercent * 0.15                  // Energy efficiency
+ max(0, 30 - abs(chipTemp - 67)) * 0.4  // Chip temp target (65-70°C)
```

**Decision Confidence**: Range 0.0-1.0
- Gemini AI: 0.80-0.95
- ML Fallback: 0.70-0.80

**Rate Limiting**: 60 requests/minute (Gemini API free tier)

**Timeout**: 10 seconds per request

**Error Handling**:
- Network errors → fallback to ML
- API key invalid → fallback to ML
- JSON parse errors → retry with pattern matching
- Quota exceeded → fallback to ML

---

## 🌦️ Weather API Integration (`weatherService.js`)

**Provider**: OpenWeatherMap
**Endpoint**: `https://api.openweathermap.org/data/2.5/weather`

**City Coordinates**:
```javascript
[
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Delhi NCR', lat: 28.7041, lon: 77.1025 }
]
```

**Request Parameters**:
```javascript
{
  lat: city.lat,
  lon: city.lon,
  appid: API_KEY,
  units: 'metric'  // Celsius
}
```

**Response Mapping**:
```javascript
{
  city: string,
  temp: number,           // °C (rounded to 1 decimal)
  humidity: number,       // %
  pressure: number,       // hPa
  feelsLike: number,      // °C
  description: string,    // "clear sky", "partly cloudy", etc.
  windSpeed: number,      // m/s
  cloudiness: number,     // %
  timestamp: number       // Unix timestamp
}
```

**Caching Strategy**:
- Cache duration: 5 minutes
- Per-city cache keys
- Automatic expiration check
- Fallback on cache miss

**Fallback Weather Simulation**:
```javascript
baseTemperature = {
  'Mumbai': 32°C,
  'Hyderabad': 33°C,
  'Chennai': 35°C,
  'Delhi NCR': 38°C
}

// Daily cycle (cooler at night)
if (6 AM <= hour <= 6 PM) {
  tempVariation = cos((hour - 12) / 6) * 5°C
} else {
  tempVariation = -4°C
}

finalTemp = baseTemp + tempVariation + random(-0.5, 0.5)

// Humidity inversely correlated with time
humidity = 60-80% (day), 80-95% (night)
```

**Stress Score Calculation**:
```javascript
tempStress = max(0, (temp - 20) / 30 * 100)    // 20°C baseline
humidityStress = (humidity / 100) * 50          // Max 50 points
windCalmnessStress = (1 - min(1, windSpeed / 20)) * 30

stressScore = min(100, tempStress + humidityStress - windCalmnessStress)

status = stressScore > 70 ? 'critical' : stressScore > 50 ? 'high' : 'normal'
```

---

## 🖥️ Chip Telemetry Generator (`telemetryGenerator.js`)

**Update Frequency**: 5 seconds

**State Variables**:
```javascript
{
  chipTemp: 65°C (initial),
  flowRate: 3.5 L/min (initial),
  powerUsage: 180 kW (initial),
  pue: 1.25 (initial),
  coolantPressure: 2.2 bar,
  efficiency: 72%
}
```

**Temperature Simulation**:
```javascript
chipTemp += random(-0.3, 0.7) * 2   // -0.6 to +1.4°C per cycle
chipTemp = clamp(chipTemp, 55, 92)  // Safe operating range
```

**Flow Rate Simulation**:
```javascript
flowRate += random(-0.4, 0.6) * 0.3   // -0.12 to +0.18 L/min
flowRate = clamp(flowRate, 2.0, 6.0)
```

**Power Usage Correlation**:
```javascript
tempFactor = (chipTemp - 55) / 37    // Normalize to 0-1
powerUsage = round(150 + 100 * tempFactor + random(-0.5, 0.5) * 20)
// Range: 130-270 kW
```

**PUE Calculation** (simplified):
```javascript
pue = 1 + (powerUsage / flowRate / 30)
pue = clamp(pue, 1.08, 1.40)
// Ideal PUE: 1.1-1.2 (very efficient)
// Acceptable: 1.2-1.4
// Poor: >1.4
```

**Cooling Efficiency Score**:
```javascript
efficiency = round(85 - (chipTemp - 55) * 0.5 + random(0, 10))
efficiency = clamp(efficiency, 45, 95)
// Inversely proportional to chip temperature
```

**History Tracking**:
- **Buffer Size**: 8 data points
- **Metrics Stored**: temps[], flowRates[], efficiencies[], powerUsages[], timestamps[]
- **Shift Strategy**: FIFO (first-in-first-out)

**Chart Data Format**:
```javascript
{
  temps: [65.2, 66.1, 65.8, ...],
  flowRates: [3.5, 3.4, 3.6, ...],
  efficiencies: [72, 71, 73, ...],
  powerUsages: [180, 182, 179, ...],
  timestamps: [
    { value: 1709328000000, label: "21:00:00" },
    ...
  ]
}
```

---

## ⚡ Energy Calculator (`energyCalculator.js`)

**Base Consumption**: 850 kW

**Solar Generation Model** (Time-of-Day Cosine Curve):
```javascript
solarCapacity = 400 kW (peak)

if (6 AM <= hour <= 6 PM) {
  timeFromNoon = abs(hour - 12) + minutes / 60
  solarGeneration = solarCapacity * cos(timeFromNoon / 6)
  solarGeneration = max(0, solarGeneration)
} else {
  solarGeneration = 0  // No solar at night
}

// Peak solar: 12:00 PM = 400 kW
// Morning/Evening: 6 AM/6 PM = ~0 kW
```

**Temperature-Dependent Cooling Load**:
```javascript
tempFactor = max(0, (weatherTemp - 20) / 40)  // 0-1 scale (20°C baseline)
additionalLoad = tempFactor * 150 kW          // Up to +150 kW
totalConsumption = baselineConsumption + chipPower + additionalLoad + 25 kW
```

**Carbon Footprint Calculation**:
```javascript
gridCO2 = (gridLoad / baselineConsumption) * 0.8 kg/kWh   // Grid: 0.8 kg CO2/kWh
solarCO2 = (solarGeneration / baselineConsumption) * 0.05 kg/kWh  // Solar lifecycle: 0.05 kg CO2/kWh

totalCarbonFootprint = round((gridCO2 + solarCO2) * 1000) / 1000
```

**Carbon Reduction vs Baseline**:
```javascript
baselineCO2 = totalConsumption * 0.8  // If all from grid
actualCO2 = carbonFootprint
carbonReduction = round((baselineCO2 - actualCO2) / baselineCO2 * 100) + "%"
```

**Water Usage Estimation**:
```javascript
coolingLoad = totalConsumption - baselineConsumption
coolingWaterUsage = coolingLoad * 3.8 liters/hour   // 3.8 L per kWh of cooling
```

**Household Equivalents**:
```javascript
// Energy
avgIndianHouseholdPower = 150 W continuous (1.2 kWh/day)
householdEquivalent = round(solarGeneration / 0.15)

// Water
avgHouseholdWaterPerHour = 25 liters
waterHouseholdEquivalent = round(coolingWaterUsage / 25)
```

---

## 🔄 Data Flow Architecture

### Main Orchestrator (`simulatedApi.js`)

**Climate Control Snapshot Flow**:
```
1. weatherService.fetchAllCities()
   ↓
2. telemetryGenerator.generate()
   ↓
3. energyCalculator.calculate(chipPower, weather, flowRate)
   ↓
4. Build 4 city snapshots (merge weather + city data)
   ↓
5. geminiDecisionEngine.analyzeAndDecide(weather, telemetry, energy, cities)
   ↓
6. geminiDecisionEngine.analyzeStress(weather, telemetry, energy)
   ↓
7. Create migration log entry with AI decision
   ↓
8. Return complete snapshot + logs + lastDecision
```

**Chip Research Snapshot Flow**:
```
1. telemetryGenerator.snapshot()
   ↓
2. Transform history to chart format
   ↓
3. AI trend analysis (tempTrend = last - first)
   ↓
4. Return telemetry + modelOutput + trendSeries + analysis
```

**Sustainability Snapshot Flow**:
```
1. telemetryGenerator.snapshot()
   ↓
2. weatherService.fetchAllCities()
   ↓
3. energyCalculator.calculate(chipPower, weather, flowRate)
   ↓
4. Calculate heat recovery metrics (coolingLoad * 0.024 MWh)
   ↓
5. Calculate water impact (coolingWater / 1M liters)
   ↓
6. Calculate solar integration (renewable%, carbon reduction)
   ↓
7. Build trend chart data (carbonSeries, renewableSeries)
   ↓
8. Return heatRecovery + waterImpact + solarIntegration + series
```

---

## 🎣 React Hooks

### `useClimateControlData()`
- **Interval**: 4 seconds
- **Data**: cities, weatherData, chipTelemetry, energyMetrics, recommendation, geminiMonitor, migration, lastDecision
- **Logs**: Last 12 migration entries (with timestamps)
- **State**: loading (boolean), snapshot (object), logs (array)

### `useChipResearchData()`
- **Interval**: 3.5 seconds
- **Data**: telemetry, modelOutput, compareTable, trendSeries, researchInsight
- **State**: loading (boolean), snapshot (object)

### `useSustainabilityData()`
- **Interval**: 4.5 seconds
- **Data**: heatRecovery, waterImpact, solarIntegration, carbonSeries, renewableSeries, energyMetrics
- **State**: loading (boolean), snapshot (object)

---

## 📊 Chart Data Formats

### Line Chart (Load vs Water Index)
```javascript
chartData = [
  { city: 'Mumbai', load: 72, waterIndex: 75 },
  { city: 'Hyderabad', load: 58, waterIndex: 83 },
  ...
]
```

### Bar Chart (Chip Thermal Trends)
```javascript
trendSeries = [
  { tick: 'T-7', chipTemp: 65.2, flowRate: 3.5, efficiency: 72 },
  { tick: 'T-6', chipTemp: 66.1, flowRate: 3.4, efficiency: 71 },
  ...
]
```

### Area Chart (Carbon Footprint)
```javascript
carbonSeries = [
  { tick: 'W-7', baseline: 110, optimized: 65 },
  { tick: 'W-6', baseline: 108, optimized: 62 },
  ...
]
```

### Line Chart (Renewable vs Grid)
```javascript
renewableSeries = [
  { tick: 'W-7', solar: 320, grid: 580 },
  { tick: 'W-6', solar: 350, grid: 520 },
  ...
]
```

---

## 🔐 Security Implementation

### Authentication Flow
```
1. User submits credentials → POST /api/auth/login
2. Flask validates against VALID_USERS (from .env)
3. Generate secure token: secrets.token_urlsafe(32)
4. Store in SESSIONS dict: SESSIONS[token] = {username, company, role, timestamp}
5. Return token + user info to frontend
6. Frontend stores token in localStorage
7. All subsequent API calls include: Authorization: Bearer <token>
8. Flask @require_token decorator validates token before processing
```

### Token Lifecycle
- **Generation**: `secrets.token_urlsafe(32)` (256-bit entropy)
- **Storage**: In-memory SESSIONS dict (Flask backend)
- **Persistence**: localStorage (Frontend)
- **Expiration**: No automatic expiry (stateless session)
- **Invalidation**: Manual logout → DELETE from SESSIONS

### Environment Variable Loading
```python
# Flask Backend
from dotenv import load_dotenv
load_dotenv()

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
VALID_USERS = os.getenv('VALID_USERS', 'admin:admin123,Jal-Drishti,Officer')
```

```javascript
// React Frontend (build-time injection)
const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
const weatherKey = process.env.REACT_APP_OPENWEATHER_API_KEY || '';
```

---

## 🚀 Performance Optimization

### Frontend
- **Code Splitting**: React.lazy() for route-based splitting
- **Memoization**: useMemo() for expensive calculations (avgWaterIndex)
- **Debouncing**: Auto-refresh intervals (4s, 3.5s, 4.5s)
- **Gzip**: 260.72 kB JS + 4.6 kB CSS (production build)

### Backend
- **CORS Wildcard**: `{"origins": "*"}` (dev only, restrict in prod)
- **Session Storage**: In-memory dict (fast, but not scalable)
- **API Caching**: Weather data cached for 5 minutes

### API Integration
- **Timeout**: 8-10 seconds for external API calls
- **Fallback**: Automatic fallback to simulation on API failure
- **Rate Limiting**: Respects free tier limits (60 req/min)

---

## 🧪 Testing Checklist

### Unit Tests (Not Implemented Yet)
- [ ] telemetryGenerator.generate() returns valid telemetry
- [ ] energyCalculator.calculate() produces correct solar curve
- [ ] weatherService fallback matches expected format
- [ ] geminiDecisionEngine fallback ML scores correctly

### Integration Tests
- [x] Flask /api/auth/login accepts valid credentials
- [x] Flask /api/auth/logout invalidates token
- [x] React build completes without errors
- [x] All 3 dashboard pages render without crashes
- [x] Charts display data correctly

### End-to-End Tests
- [ ] Full authentication flow (login → dashboard → logout)
- [ ] Real-time data auto-refresh (verify 4-second intervals)
- [ ] Gemini API integration (with valid API key)
- [ ] OpenWeather API integration (with valid API key)
- [ ] Migration logs accumulate correctly

---

## 📝 API Endpoints Summary

### Backend (Flask)
- `GET /` - Homepage (HTML page)
- `GET /api/status` - Backend health check
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session invalidation
- `GET /api/auth/verify` - Token validation
- `GET /api/dashboard` - Legacy fake data endpoint
- `GET /api/heat-recovery` - Legacy fake recovery data
- `GET /api/chip-thermal` - Legacy chip thermal data
- `GET /api/weather` - Legacy weather endpoint
- `POST /api/gemini-analysis` - Legacy Gemini analysis
- `GET /api/global-state` - Global system state
- `GET /api/config` - Frontend configuration (requires auth)
- `POST /api/predict` - ML model prediction endpoint

### Frontend (React Router)
- `/` - Redirects to /control-center (if authenticated)
- `/login` - Officer-only authentication page
- `/control-center` - Climate Control Center dashboard
- `/chip-cooling-research` - Chip Cooling Research Panel
- `/heat-reuse-solar-impact` - Heat Reuse & Solar Impact Dashboard

---

## 🔮 Future Enhancements

### Phase 2 (Not Yet Implemented)
1. **Real-time WebSocket Updates**: Replace polling with WebSocket for sub-second updates
2. **Historical Data Storage**: PostgreSQL/MongoDB for long-term trend analysis
3. **Multi-User Roles**: Analyst, Engineer, Viewer roles with different access levels
4. **Alert System**: Email/SMS alerts for critical thermal events
5. **Advanced ML Models**: LSTM for temperature prediction, anomaly detection
6. **Multi-Region Support**: Expand beyond 4 Indian cities
7. **Kubernetes Integration**: Real workload migration (not simulated)
8. **Cost Optimization**: AWS/Azure/GCP cost calculator integration

### Phase 3 (Long-Term)
1. **Mobile App**: React Native dashboard
2. **Voice Commands**: Alexa/Google Assistant integration
3. **AR/VR Visualization**: 3D data center tour
4. **Blockchain Audit Trail**: Immutable migration logs
5. **Quantum-Ready Encryption**: Post-quantum crypto for API keys

---

**Document Version**: 1.0  
**Last Updated**: March 1, 2026  
**Maintained By**: [Your Team]
