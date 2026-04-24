import React from 'react';
import {render} from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

jest.mock('../services/offlineService', () => ({checkOfflineMode: () => Promise.resolve(false)}));
jest.mock('../services/tradeService', () => ({fetchMarkets: () => Promise.resolve([{id: '1', name: 'Solar', price: 10, volume: 1, riskScore: 'low'}])}));

describe('HomeScreen', () => {
  it('renders title and market card', async () => {
    const {findByText} = render(<HomeScreen navigation={{navigate: jest.fn()}} />);
    expect(await findByText('CurrentDao Energy Trading')).toBeTruthy();
    expect(await findByText('Solar')).toBeTruthy();
  });
});