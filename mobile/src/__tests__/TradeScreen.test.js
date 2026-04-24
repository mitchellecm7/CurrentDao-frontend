import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import TradeScreen from '../screens/TradeScreen';

jest.mock('../services/tradeService', () => ({
  createSwap: jest.fn(() => Promise.resolve({success: true})),
  fetchBalance: jest.fn(() => Promise.resolve(100))
}));
jest.mock('../services/offlineService', () => ({checkOfflineMode: () => Promise.resolve(false)}));
jest.mock('../services/notificationService', () => ({triggerNotification: jest.fn()}));

describe('TradeScreen', () => {
  it('renders trade inputs and executes trade', async () => {
    const {getByPlaceholderText, getByText} = render(<TradeScreen />);

    fireEvent.changeText(getByPlaceholderText('Amount'), '12');
    fireEvent.press(getByText('Execute Trade'));

    await waitFor(() => expect(getByText(/Balance:/)).toBeTruthy());
  });
});