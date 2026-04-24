import React from 'react';
import {render} from '@testing-library/react-native';
import TradingCard from '../components/TradingCard';

describe('TradingCard', () => {
  it('displays market details', () => {
    const market = {id: '1', name: 'Wind', price: 22, volume: 50, riskScore: 'medium'};
    const {getByText} = render(<TradingCard market={market} />);
    expect(getByText('Wind')).toBeTruthy();
    expect(getByText('Price: 22')).toBeTruthy();
    expect(getByText('Volume: 50')).toBeTruthy();
  });
});