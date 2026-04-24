import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_KEY = '@currentdao_offline_queue';

export async function checkOfflineMode() {
  try {
    const status = await AsyncStorage.getItem('@currentdao_online_status');
    return status === 'offline';
  } catch {
    return true;
  }
}

export async function queueTrade(order) {
  const existing = JSON.parse((await AsyncStorage.getItem(OFFLINE_KEY)) || '[]');
  existing.push(order);
  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(existing));
}

export async function processQueue(executeTradeFn) {
  const queue = JSON.parse((await AsyncStorage.getItem(OFFLINE_KEY)) || '[]');
  for (const order of queue) {
    await executeTradeFn(order);
  }
  await AsyncStorage.removeItem(OFFLINE_KEY);
}
