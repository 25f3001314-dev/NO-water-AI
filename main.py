
from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
import random
import os
import glob
import re

# Try to use joblib if available, else pickle
try:
    import joblib as _joblib
    _PERSIST_LOADER = lambda p: _joblib.load(p)
except Exception:
    import pickle as _pickle
    _PERSIST_LOADER = lambda p: _pickle.load(open(p, 'rb'))

app = Flask(__name__)
# Allow CORS from any origin for development convenience
CORS(app, resources={r"/*": {"origins": "*"}})

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

# Chip thermal diagnostic endpoint for Page 2
@app.route('/api/chip-thermal')
def chip_thermal():
    temp = round(random.uniform(62.5, 79.8), 2)
    # Gemini Analysis for Officer
    prompt = f"Microchip temperature is {temp}°C. Give a high-level thermal safety report for an IT Officer."
    # Placeholder Gemini analysis
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
    # Placeholder: Integrate real weather API here
    return jsonify({"ambient_temp": random.uniform(10, 40), "location": "Delhi"})

@app.route('/api/gemini-analysis', methods=['POST'])
def gemini_analysis():
    data = request.json
    chip_temp = data.get('chip_temp')
    server_load = data.get('server_load')
    # Placeholder: Integrate Gemini API here
    response = f"Thermal throttling detected at Core 4. Initiating liquid cooling bypass. Chip Temp: {chip_temp}C, Load: {server_load}%"
    return jsonify({"analysis": response})

@app.route('/api/global-state', methods=['GET'])
def global_state():
    # Placeholder: Sync state across pages
    return jsonify({"status": "synced"})


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
