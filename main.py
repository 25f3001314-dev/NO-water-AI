
from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
import random
import os
import glob
import re
import secrets
from datetime import datetime
from functools import wraps

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try to use joblib if available, else pickle
try:
    import joblib as _joblib
    _PERSIST_LOADER = lambda p: _joblib.load(p)
except Exception:
    import pickle as _pickle
    _PERSIST_LOADER = lambda p: _pickle.load(open(p, 'rb'))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-key-change-in-production')

# Allow CORS from any origin for development convenience
CORS(app, resources={r"/*": {"origins": "*"}})

# Session storage (in-memory for simplicity, use Redis/DB in production)
SESSIONS = {}

# Model holder (attempt to find and load a .pkl model in the repo)
MODEL = None
MODEL_PATH = None
try:
    # find first .pkl under repo
    candidates = glob.glob(os.path.join(os.getcwd(), '**', '*.pkl'), recursive=True)
    if candidates:
        MODEL_PATH = candidates[0]
        try:
            MODEL = _PERSIST_LOADER(MODEL_PATH)
        except Exception:
            MODEL = None
except Exception:
    MODEL = None


# Authentication helpers
def load_valid_users():
    """Load valid users from env.

    Format:
      VALID_USERS=username:password,company,role;user2:pass2,company2,role2
    """
    users_str = os.getenv('VALID_USERS', 'admin:admin123,Jal-Drishti,Officer;techuser:tech456,TechCorp,Engineer')
    users = {}
    for user_entry in users_str.split(';'):
        user_entry = user_entry.strip()
        if not user_entry or ':' not in user_entry:
            continue

        username, rest = user_entry.split(':', 1)
        username = username.strip()
        fields = [item.strip() for item in rest.split(',')]

        if len(fields) < 1 or not username or not fields[0]:
            continue

        password = fields[0]
        company = fields[1] if len(fields) > 1 and fields[1] else 'Company'
        role = fields[2] if len(fields) > 2 and fields[2] else 'User'

        users[username] = {
            'password': password,
            'company': company,
            'role': role
        }

    if not users:
        users['admin'] = {
            'password': 'admin123',
            'company': 'Jal-Drishti',
            'role': 'Officer'
        }

    return users

VALID_USERS = load_valid_users()


def generate_token():
    """Generate a secure session token."""
    return secrets.token_urlsafe(32)


def require_token(f):
    """Decorator to check for valid authentication token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token or token not in SESSIONS:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

def _pick_number(s):
    """Extract first number from a string, or return None."""
    if s is None:
        return None
    if isinstance(s, (int, float)):
        return s
    m = re.search(r"[-+]?[0-9]*\.?[0-9]+", str(s))
    return float(m.group(0)) if m else None

def MODEL_predict(features):
    """Call the loaded model's predict if available, else raise."""
    if MODEL is None:
        raise RuntimeError("No model loaded")
    try:
        # Try sklearn-like API
        res = MODEL.predict([features])
        # return scalar if array-like
        if hasattr(res, '__len__'):
            return res[0]
        return res
    except Exception as e:
        # Surface a clear error for the caller
        raise RuntimeError(f"Model predict failed: {e}")

# Dashboard endpoint for React integration
@app.route("/api/dashboard")
def dashboard():
    # Example ML/analytics data
    base = {
        "vuln_score": "2/10 (Shimla)",
        "aqi": 42,
        "cooling": 3.7
    }
    # Attach model prediction when available
    try:
        fake = generate_fake_realtime_data()
        ambient = round(random.uniform(10, 45), 2)
        humidity = round(random.uniform(30, 85), 2)
        # Model expects [temp, humidity]
        features = [ambient, humidity]
        if MODEL is not None:
            try:
                pred = MODEL_predict(features)
                base['model_prediction'] = float(pred) if pred is not None else None
            except Exception as e:
                base['model_prediction_error'] = str(e)
                base['model_prediction'] = None
        else:
            base['model_prediction'] = None
    except Exception as e:
        base['model_prediction_error'] = str(e)

    return jsonify(base)


@app.route('/api/heat-recovery')
def heat_recovery():
    # Fake recovery data
    return jsonify({
        "efficiency": round(random.uniform(0.35, 0.6), 2),
        "output_kw": round(random.uniform(2.5, 6.0), 2),
        "homes_supplied": random.randint(1000, 5000)
    })


# Home route for root URL (friendly web page)
@app.route("/")
def home():
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Jal-Drishti</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f7fb; text-align: center; padding: 60px; }
            .card { background: white; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            h1 { color: #1f4cff; }
            .btn { padding: 10px 16px; border-radius: 8px; border: none; background: #1f4cff; color: #fff; cursor: pointer; }
            pre { text-align: left; background: #0b1020; color: #e6e6e6; padding: 12px; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💧 Jal-Drishti</h1>
            <p>AI for Water Sustainability</p>
            <button class="btn" onclick="load()">Check Backend Status</button>
            <pre id="out">Click the button to fetch API status…</pre>
        </div>
        <script>
            async function load() {
                const r = await fetch('/api/status');
                const j = await r.json();
                document.getElementById('out').innerText = JSON.stringify(j, null, 2);
            }
        </script>
    </body>
    </html>
    """)

# API status endpoint for homepage
@app.route("/api/status")
def status():
    return jsonify({"status":"Jal-Drishti Backend is Active","version":"1.0.0 Premium"})


# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return session token."""
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    
    user = VALID_USERS.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Generate session token
    token = generate_token()
    SESSIONS[token] = {
        'username': username,
        'company': user['company'],
        'role': user['role'],
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify({
        "token": token,
        "username": username,
        "company": user['company'],
        "role": user['role']
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
@require_token
def logout():
    """Clear session token."""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in SESSIONS:
        del SESSIONS[token]
    return jsonify({"status": "logged out"}), 200


@app.route('/api/auth/verify', methods=['GET'])
@require_token
def verify_auth():
    """Verify that the token is still valid."""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    session = SESSIONS.get(token)
    if session:
        return jsonify({"valid": True, "session": session}), 200
    return jsonify({"valid": False}), 401


# Chip thermal diagnostic endpoint for Page 2
@app.route('/api/chip-thermal')
def chip_thermal():
    temp = round(random.uniform(62.5, 79.8), 2)
    # High-level thermal analysis for operations dashboard
    analysis = f"Gemini: Chip temp is {temp}°C. {'Warning: Thermal risk!' if temp > 75 else 'Status: Optimal.'}"
    return {
        "temperature": temp,
        "fan_speed": "4500 RPM",
        "gemini_report": analysis,
        "status": "Warning" if temp > 75 else "Optimal"
    }

def generate_fake_realtime_data():
    return {
        "chip_temp": round(random.uniform(55.0, 78.0), 2),
        "server_load": random.randint(40, 98),
        "heat_recovered": round(random.uniform(10.5, 25.2), 1),
        "solar_gain": "15% Increase (via Hybrid Panel Research)"
    }

@app.route('/api/fake-data', methods=['GET'])
def fake_data():
    return jsonify(generate_fake_realtime_data())

@app.route('/api/weather', methods=['GET'])
def weather():
    """Get weather data for operational planning."""
    return jsonify({
        "ambient_temp": round(random.uniform(10, 40), 2),
        "location": "Delhi",
        "humidity": round(random.uniform(30, 80), 1),
        "pressure": round(random.uniform(1000, 1020), 1)
    })

@app.route('/api/gemini-analysis', methods=['POST'])
def gemini_analysis():
    """Analyze thermal and performance data for the dashboard."""
    data = request.json or {}
    chip_temp = data.get('chip_temp', 70)
    server_load = data.get('server_load', 50)
    
    # Simulated AI analysis based on telemetry
    if chip_temp > 80:
        analysis = f"CRITICAL: Thermal throttling detected. Chip temp {chip_temp}°C exceeds safe limits. Recommend immediate cooling intervention."
    elif chip_temp > 75:
        analysis = f"WARNING: Elevated thermal stress at {chip_temp}°C. Current load: {server_load}%. Consider load redistribution or cooling upgrade."
    else:
        analysis = f"OPTIMAL: Chip operating normally at {chip_temp}°C with {server_load}% load. All systems nominal. Continue monitoring."
    
    return jsonify({
        "analysis": analysis,
        "chip_temp": chip_temp,
        "server_load": server_load,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/global-state', methods=['GET'])
def global_state():
    """Return global system state across all pages."""
    return jsonify({
        "status": "operational",
        "last_sync": datetime.now().isoformat(),
        "active_sessions": len(SESSIONS),
        "system_health": "nominal"
    })


# New endpoint for React Page 1 compatibility
@app.route('/get-data', methods=['GET'])
def get_data():
    fake = generate_fake_realtime_data()
    weather = random.uniform(10, 45)
    return jsonify({
        "server_load": fake["server_load"],
        "temp": weather,
        "chip_temp": fake["chip_temp"],
        "heat_recovered": fake["heat_recovered"],
        "solar_gain": fake["solar_gain"]
    })


@app.route('/api/config', methods=['GET'])
@require_token
def get_config():
    """Serve frontend configuration from environment variables.
    Restricted to authenticated users only.
    """
    return jsonify({
        "config": {
            "REACT_APP_OPENWEATHER_API_KEY": os.getenv('OPENWEATHER_API_KEY', ''),
            "REACT_APP_GEMINI_API_KEY": os.getenv('GEMINI_API_KEY', ''),
            "REACT_APP_API_URL": os.getenv('REACT_APP_API_URL', 'http://localhost:8000'),
            "autonomousMode": True,
            "features": {
                "geminiIntegration": True,
                "weatherIntegration": True,
                "chipTelemetry": True,
                "energyOptimization": True
            }
        }
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict endpoint: accepts JSON with optional `features` list.
    If no features provided, will assemble a simple feature vector from fake data.
    Returns JSON with `prediction` or an error message.
    """
    payload = request.get_json(silent=True) or {}
    features = payload.get('features')
    if features is None:
        fake = generate_fake_realtime_data()
        ambient = round(random.uniform(10, 45), 2)
        humidity = round(random.uniform(30, 85), 2)
        features = [ambient, humidity]

    try:
        if MODEL is None:
            return jsonify({"prediction": None, "warning": "No model loaded on server.", "model_path": MODEL_PATH}), 200
        result = MODEL_predict(features)
        return jsonify({"prediction": result, "model_path": MODEL_PATH})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
