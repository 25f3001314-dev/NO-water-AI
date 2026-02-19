import axios from 'axios'

export async function getDashboardData(base = 'http://localhost:8000'){
  const res = await axios.get(`${base}/api/dashboard`)
  return res.data
}

export async function getChipThermal(base = 'http://localhost:8000'){
  const res = await axios.get(`${base}/api/chip-thermal`)
  return res.data
}

export async function getHeatRecovery(base = 'http://localhost:8000'){
  const res = await axios.get(`${base}/api/heat-recovery`)
  return res.data
}
