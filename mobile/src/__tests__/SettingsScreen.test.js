import React from 'react';
import {render} from '@testing-library/react-native';
import SettingsScreen from '../screens/SettingsScreen';

jest.mock('../services/authService', () => ({isBiometricAvailable: () => Promise.resolve(true), authenticateBiometric: () => Promise.resolve(true)}));
jest.mock('../native/GPSManager', () => ({getGPSLocation: () => Promise.resolve({latitude: 1, longitude: 2})}));

describe('SettingsScreen', () => {
  it('renders integration options', async () => {
    const {findByText} = render(<SettingsScreen />);
    expect(await findByText('Settings & Device Integration')).toBeTruthy();
  });
});