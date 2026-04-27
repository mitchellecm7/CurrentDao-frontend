import { useState, useEffect } from 'react';
import { validateOracleData, OracleResponse } from '../services/oracles/consensus-algorithm';

export const useOracleNetwork = (symbol: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate fetching from multiple providers
        const responses: OracleResponse[] = [
          { providerId: 'chainlink', value: 0.1245, timestamp: Date.now() },
          { providerId: 'pyth', value: 0.1247, timestamp: Date.now() },
          { providerId: 'band', value: 0.1242, timestamp: Date.now() },
          { providerId: 'switchboard', value: 0.1260, timestamp: Date.now() }, // Slightly off
        ];

        const consensus = validateOracleData(responses);
        setPrice(consensus);
        setProviders(responses.map(r => ({
          ...r,
          status: 'healthy',
          isOutlier: Math.abs(r.value - consensus) / consensus > 0.01
        })));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch oracle data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  return { price, loading, error, providers };
};
