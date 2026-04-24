import {queueTrade} from './offlineService';

const BASE_API = 'https://api.currentdao.org/trading';

export async function fetchMarkets() {
  try {
    const res = await fetch(`${BASE_API}/markets`);
    return (await res.json()) || [];
  } catch (err) {
    return [{id: '1', name: 'Solar', price: 12.5, volume: 80, riskScore: 'low'}];
  }
}

export async function fetchBalance() {
  try {
    const res = await fetch(`${BASE_API}/balance`);
    const data = await res.json();
    return data.balance || 0;
  } catch {
    return 1000;
  }
}

export async function createSwap(asset, amount, isOffline = false) {
  const payload = {asset, amount, time: new Date().toISOString()};
  if (isOffline) {
    await queueTrade(payload);
    return {success: true, offline: true};
  }
  try {
    const res = await fetch(`${BASE_API}/swap`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    const body = await res.json();
    return {success: res.ok, data: body};
  } catch {
    return {success: false};
  }
}
