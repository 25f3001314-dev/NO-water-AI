# 🤖 Jal-Drishti AI-Automated Dashboard - Deployment Guide

## 🚀 System Overview

**Jal-Drishti** is now a fully AI-automated climate & water-optimized cloud workload system powered by:

- **Gemini AI Decision Engine**: Autonomous workload migration recommendations
- **OpenWeather API Integration**: Live temperature & humidity data for 4 Indian cities
- **Chip-Level Telemetry Generator**: Real-time cooling system monitoring (5-second updates)
- **Energy Supply Calculator**: Solar + grid mix with carbon footprint tracking
- **3 Advanced Dashboards**: Climate Control Center, Chip Cooling Research, Heat Reuse & Solar Impact

---

## 📁 Project Structure

```
NO-water-AI/
├── main.py                     # Flask backend with authentication & API proxying
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (API keys, credentials)
├── .env.example               # Example env template
├── vercel.json                # Vercel deployment config
├── .gitignore                 # Git ignore patterns
└── jal-drishti/               # React frontend
    ├── package.json           # Node dependencies
    ├── postcss.config.js      # PostCSS + Tailwind config
    ├── tailwind.config.js     # Tailwind CSS config
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js             # Root router with officer-only gate
        ├── index.css          # Global dark theme styles
        ├── main.tsx
        ├── components/
        │   ├── common/        # Reusable UI components
        │   │   ├── MetricCard.js
        │   │   ├── SectionCard.js
        │   │   └── StatusBadge.js
        │   └── layout/
        │       └── AppShell.js   # Enterprise header/nav
        ├── hooks/             # Custom React hooks
        │   ├── useClimateControlData.js
        │   ├── useChipResearchData.js
        │   └── useSustainabilityData.js
        ├── pages/             # Dashboard pages
        │   ├── Dashboard.js      # Climate Control Center
        │   ├── ChipCooling.js    # Chip Cooling Research
        │   ├── HeatRecovery.js   # Heat Reuse & Solar
        │   └── Login.js          # Officer-only authentication
        └── services/          # AI Automation Services
            ├── simulatedApi.js         # Main automation orchestrator
            ├── telemetryGenerator.js   # Chip telemetry simulator
            ├── energyCalculator.js     # Solar + grid calculator
            ├── weatherService.js       # OpenWeather API integration
            ├── geminiDecisionEngine.js # Gemini AI decision logic
            └── configService.js        # Config loader
```

---

## 🔑 Environment Variables Setup

### Required API Keys

1. **OpenWeather API Key**
   - Get from: https://openweathermap.org/api
   - Sign up for free tier (60 calls/minute, 1M calls/month)
   - Copy API key to `.env`

2. **Gemini AI API Key**
   - Get from: https://ai.google.dev/
   - Sign up for free tier (60 requests/minute)
   - Copy API key to `.env`

### `.env` File Configuration

```bash
# User Authentication (format: username:password,company,role)
VALID_USERS=admin:admin123,Jal-Drishti,Officer;techuser:tech456,TechCorp,Engineer

# Backend API Keys (used by Flask)
OPENWEATHER_API_KEY=your_openweather_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend Environment Variables (injected at React build time)
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_API_URL=http://localhost:8000

# Flask Configuration
FLASK_ENV=production
FLASK_SECRET_KEY=generate-a-secure-random-key-here
```

⚠️ **Security Note**: Use `.env.example` as template. Never commit `.env` to git.

---

## 📦 Installation

### Backend (Flask)

```bash
cd /workspaces/NO-water-AI

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and fill in API keys)
cp .env.example .env
nano .env  # Edit and add your API keys
```

### Frontend (React)

```bash
cd /workspaces/NO-water-AI/jal-drishti

# Install Node dependencies
npm install

# Build production bundle
npm run build
```

---

## 🚦 Running Locally

### Development Mode

**Terminal 1 - Backend:**
```bash
cd /workspaces/NO-water-AI
python main.py
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/NO-water-AI/jal-drishti
npm start
# Frontend runs on http://localhost:3000
```

### Production Mode

```bash
cd /workspaces/NO-water-AI

# Build React frontend first
cd jal-drishti
npm run build
cd ..

# Run Flask backend (serves built React app)
python main.py

# Access at: http://localhost:8000
```

---

## 🌐 Vercel Deployment

### Prerequisites
- Vercel account (free tier available)
- Vercel CLI installed: `npm install -g vercel`

### Deployment Steps

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Set Environment Variables in Vercel Dashboard**
   - Go to: https://vercel.com/your-username/jal-drishti/settings/environment-variables
   - Add all variables from `.env file` (both REACT_APP_* and Flask vars)

3. **Deploy**
   ```bash
   cd /workspaces/NO-water-AI
   vercel --prod
   ```

4. **Configuration** (already setup in `vercel.json`)
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "main.py", "use": "@vercel/python" },
       { "src": "jal-drishti/package.json", "use": "@vercel/static-build" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/main.py" },
       { "src": "/static/(.*)", "dest": "/jal-drishti/build/static/$1" },
       { "src": "/(.*)", "dest": "/jal-drishti/build/index.html" }
     ]
   }
   ```

---

## 🔒 Authentication

### Default Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `Officer` (required for dashboard access)

### Adding More Users

Edit `VALID_USERS` in `.env`:
```bash
VALID_USERS=admin:admin123,Jal-Drishti,Officer;analyst:pass456,TechCorp,Analyst
```

Format: `username:password,company,role;user2:pass2,company2,role2`

---

## 🤖 AI Automation Features

### 1. **Gemini AI Decision Engine**

**Location**: `jal-drishti/src/services/geminiDecisionEngine.js`

**Functionality**:
- Analyzes weather, chip telemetry, energy metrics
- Recommends optimal data center for workload migration
- Falls back to ML rule engine if Gemini API unavailable
- Returns structured JSON:
  ```json
  {
    "recommended_center": "Hyderabad",
    "reason": "Lower temperature and reduced cooling water demand",
    "water_saving_percent": 18,
    "energy_saving_percent": 12,
    "confidence": 0.85
  }
  ```

**Testing Gemini Integration**:
```bash
# Check if API key is set
echo $REACT_APP_GEMINI_API_KEY

# Watch browser console for:
# ✅ Gemini AI Decision: {...}  (success)
# ⚠️ Gemini API error, using fallback ML engine (fallback)
```

### 2. **OpenWeather API Integration**

**Location**: `jal-drishti/src/services/weatherService.js`

**Cities Monitored**:
- Mumbai (19.076°N, 72.878°E)
- Hyderabad (17.385°N, 78.487°E)
- Chennai (13.083°N, 80.271°E)
- Delhi NCR (28.704°N, 77.103°E)

**Data Fetched**:
- Temperature (°C)
- Humidity (%)
- Wind speed (m/s)
- Pressure (hPa)
- Cloud coverage (%)

**Caching**: 5-minute refresh rate

**Testing**:
```bash
# Check browser console logs:
# ✅ Weather data loaded for all cities
# ⚠️ OpenWeather API key not found, using fallback simulation
```

### 3. **Chip-Level Telemetry Generator**

**Location**: `jal-drishti/src/services/telemetryGenerator.js`

**Metrics Generated** (every 5 seconds):
- Chip Temperature: 55-92°C (realistic fluctuations)
- Cooling Flow Rate: 2.0-6.0 L/min
- Power Usage: 150-250 kW
- PUE (Power Usage Effectiveness): 1.08-1.40
- Cooling Efficiency: 45-95%
- Cool ant Pressure: 1.8-3.4 bar

**History Tracking**: Last 8 data points for trend visualization

**Realistic Simulation**:
- Temperature correlates with power usage
- Flow rate affects PUE calculations
- Efficiency inversely proportional to chip temp

### 4. **Energy Supply Calculator**

**Location**: `jal-drishti/src/services/energyCalculator.js`

**Calculations**:
- **Total Energy Consumption**: Baseline + chip power + weather-dependent cooling
- **Solar Generation**: Time-of-day cosine curve (peak at 12 PM)
- **Grid Load**: Consumption - Solar
- **Renewable Percentage**: Solar / Total * 100
- **Carbon Footprint**: (Grid * 0.8 + Solar * 0.05) kg CO2/kWh
- **Cooling Water Usage**: Cooling load * 3.8 liters/kWh

**Output**:
- Household energy equivalent
- Water household equivalent
- Carbon reduction vs all-grid baseline

---

## 📊 Dashboard Pages

### 1. Climate-Aware AI Cloud Control Center (`/control-center`)

**Features**:
- 🤖 **AI Autonomous Mode Banner**: Shows Gemini + ML status
- 🗺️ **India Map**: State-level water risk overlay (Green/Yellow/Red)
- 🏢 **4 Data Center Cards**: Live city-level temp, humidity, load, cooling water
- 🤖 **Gemini Monitoring Panel**: AI stress summary, thermal risk, task pressure
- 📊 **AI Optimization Panel**: Migration recommendation, water/energy savings, cost prediction
- 🔄 **Task Migration Simulation**: Running → Migrating → Running with live logs
- 📈 **Load vs Water Availability Chart**: City-wise balancing indicators

**Auto-Refresh**: 4-second intervals

### 2. Advanced Chip Cooling Research Panel (`/chip-cooling-research`)

**Features**:
- 🔬 **Chip Optimization Status Banner**: Live telemetry confirmation
- 🌡️ **5 Real-Time Telemetry Cards**: Temp, flow, water saved, PUE, power
- 📊 **Cooling Tech Comparison Table**: Air vs Liquid vs Immersion
- 🎯 **Circular Efficiency Gauge**: SVG-based rotating meter
- 📈 **8-Sample Thermal Trend Chart**: Temp + efficiency bars
- 🤖 **AI Model Predictions**: PUE forecast, cooling efficiency, power reduction
- ✅ **AI Trend Analysis**: Temperature trending analysis in text

**Auto-Refresh**: 3.5-second intervals

### 3. Heat Reuse & Solar Impact Dashboard (`/heat-reuse-solar-impact`)

**Features**:
- ⚡ **Energy Optimization Status Banner**: Solar + grid + heat recovery status
- 🔥 **Waste Heat Recovery Section**: Recovered heat (MWh), households supplied, CO2 reduction
- 💧 **Water Supply Impact Section**: Saved water (ML), reservoir impact, household equivalent
- ☀️ **Solar Integration Section**: Solar generation (kW), renewable %, grid dependency, carbon footprint
- 📉 **Carbon Footprint Trend Chart**: Baseline vs optimized (area chart)
- ⚡ **Renewable vs Grid Mix Chart**: Solar + grid power over time (line chart)

**Auto-Refresh**: 4.5-second intervals

---

## 🎯 Hackathon Demonstration Flow

### 1. **Login** (`http://localhost:8000`)
- Enter: `admin` / `admin123`
- Show officer-only enforcement message

### 2 **AI Autonomous Mode Activation**
- Navigate to **Climate Control Center**
- Point out 🤖 banner: "AI AUTONOMOUS MODE: ACTIVE"
- Highlight confidence % and method (Gemini AI vs Fallback)

### 3. **Real-Time Weather Integration**
- Open browser DevTools → Console
- Show live API calls: "✅ Weather data loaded for all cities"
- Point to India map color changes based on live weather

### 4. **Gemini AI Decision**
- Watch **Gemini Monitoring Panel** update
- Read aloud AI recommendation: "Migrate to Hyderabad. Reason: [...]"
- Show water/energy saving percentages
- Highlight **Task Migration Simulation** logs updating in real-time

### 5. **Chip-Level Telemetry**
- Navigate to **Chip Cooling Research**
- Show 5-second auto-refresh of telemetry cards
- Point to thermal trend chart updating
- Read AI trend analysis text: "✅ Temperature decreasing - cooling optimization working"

### 6. **Energy & Carbon Optimization**
- Navigate to **Heat Reuse & Solar Impact**
- Show solar generation varying by time of day
- Point to renewable % and carbon reduction
- Highlight household equivalent metrics (e.g., "Powering 1,200 homes")

### 7. **Full Automation Proof**
- Let dashboard run for 30 seconds
- Count: chip telemetry updates (5-sec), climate control (4-sec), energy (4.5-sec)
- Show migration logs growing with timestamped entries
- Demonstrate AI stress analysis changing based on chip temp

---

## 🛠️ Troubleshooting

### Issue: Build fails with Tailwind CSS error
**Solution**: Reinstall dependencies
```bash
cd jal-drishti
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Gemini API not responding
**Check**:
1. API key is valid: https://ai.google.dev/
2. Check browser console for error messages
3. Verify `.env` has `REACT_APP_GEMINI_API_KEY` set

**Fallback**: System automatically uses ML rule engine if Gemini fails

### Issue: Weather data not updating
**Check**:
1. OpenWeather API key is valid
2. Check browser console for "OpenWeather API error"
3. Verify API quota: https://openweathermap.org/api

**Fallback**: System uses realistic simulation based on time-of-day

### Issue: Authentication fails
**Check**:
1. `.env` has `VALID_USERS` configured correctly
2. Format: `username:password,company,role`
3. Role must be "Officer" (case-sensitive) for dashboard access

### Issue: Charts not rendering
**Check**:
1. `recharts` package installed: `npm list recharts`
2. Browser console for JavaScript errors
3. Build completed successfully

---

## 📈 Build Output

**Production Bundle (Gzipped)**:
- JavaScript: **260.72 kB**
- CSS: **4.6 kB**

**Dependencies**:
- React 18.2.0
- Recharts 3.7.0 (charts)
- Axios 1.6.0 (HTTP client)
- Tailwind CSS 3.3.0 (styling)
- Lucide React 0.293.0 (icons)
- @vishalvoid/react-india-map 1.0.6 (India map)

---

## 🔐 Security Considerations

1. **Never commit `.env` file** - Contains API keys and secrets
2. **Use strong `FLASK_SECRET_KEY`** - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. **Rotate API keys regularly** - Especially after public demos
4. **Use HTTPS in production** - Vercel provides this automatically
5. **Limit CORS origins** - Update Flask CORS config for production
6. **Session tokens in production** - Use Redis/PostgreSQL instead of in-memory SESSIONS dict

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 👥 Credits

**Developed by**: [Your Team Name]
**Project**: Jal-Drishti - AI-Driven Climate & Water Optimized Cloud Workload System
**Hackathon**: [Hackathon Name]
**Date**: March 2026

**AI Integrations**:
- Google Gemini 1.5 Flash API
- OpenWeatherMap API
- Custom ML Fallback Engine

**Frontend**: React 18 + Tailwind CSS 3 + Recharts
**Backend**: Flask 3 + python-dotenv + flask-cors
**Deployment**: Vercel

---

## 📞 Support

For issues or questions:
1. Check console logs (browser DevTools → Console)
2. Verify `.env` configuration
3. Test API keys independently
4. Review this README troubleshooting section

**Happy Demonstrating! 🚀**
