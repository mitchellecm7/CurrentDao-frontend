import React from 'react';
import {render} from '@testing-library/react-native';
import OfflineIndicator from '../components/OfflineIndicator';

describe('OfflineIndicator', () => {
  it('shows offline message when offline', () => {
    const {getByText} = render(<OfflineIndicator offline={true} />);
    expect(getByText('Offline mode active: transactions queued')).toBeTruthy();
  });

  it('renders nothing when online', () => {
    const {queryByText} = render(<OfflineIndicator offline={false} />);
    expect(queryByText('Offline mode active: transactions queued')).toBeNull();
  });
});