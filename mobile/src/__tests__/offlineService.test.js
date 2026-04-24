import {checkOfflineMode, queueTrade, processQueue} from '../services/offlineService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('offlineService', () => {
  beforeEach(() => AsyncStorage.clear());

  it('returns false by default', async () => {
    await AsyncStorage.setItem('@currentdao_online_status', 'online');
    expect(await checkOfflineMode()).toBe(false);
  });

  it('queues and processes trades', async () => {
    const order = {asset: 'ENERGY', amount: 10};
    await queueTrade(order);
    const results = [];
    await processQueue(async (o) => results.push(o));
    expect(results).toEqual([order]);
  });
});