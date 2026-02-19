export const API_BASE = "http://localhost:8000";

export async function getDashboardData() {
  const res = await fetch(`${API_BASE}/get-data`);
  return res.json();
}

export async function getChipThermal() {
  const res = await fetch(`${API_BASE}/api/chip-thermal`);
  return res.json();
}

export async function getHeatRecovery() {
  const res = await fetch(`${API_BASE}/api/heat-recovery`);
  return res.json();
}
