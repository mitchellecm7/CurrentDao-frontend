import {fetchMarkets, fetchBalance, createSwap} from '../services/tradeService';

describe('tradeService', () => {
  it('returns sample markets when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject('fail'));
    const data = await fetchMarkets();
    expect(data.length).toBeGreaterThan(0);
  });

  it('returns fallback balance when offline', async () => {
    global.fetch = jest.fn(() => Promise.reject('fail'));
    const bal = await fetchBalance();
    expect(bal).toBe(1000);
  });

  it('supports offline createSwap queue', async () => {
    const result = await createSwap('ENERGY', 1, true);
    expect(result.success).toBe(true);
    expect(result.offline).toBe(true);
  });

  it('supports online createSwap success path', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => Promise.resolve({tradeId: 123})}));
    const result = await createSwap('ENERGY', 5, false);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({tradeId: 123});
  });
});