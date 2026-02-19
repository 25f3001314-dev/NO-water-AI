from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get-data")
def get_data():
    return {"tasks": 12, "migrated": 3, "status": "ok"}

@app.get("/api/chip-thermal")
def chip_thermal():
    return {"temp": 67, "status": "stable", "gemini_analysis": "Thermal profile within safe limits."}

@app.get("/api/heat-recovery")
def heat_recovery():
    return {"efficiency": 0.42, "output_kw": 3.1}
