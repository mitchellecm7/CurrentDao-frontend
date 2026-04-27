export interface OracleResponse {
  providerId: string;
  value: number;
  timestamp: number;
}

export const validateOracleData = (responses: OracleResponse[]): number => {
  if (responses.length === 0) return 0;

  // Filter out stale data (older than 10 minutes)
  const now = Date.now();
  const freshData = responses.filter(r => now - r.timestamp < 10 * 60 * 1000);

  if (freshData.length === 0) return 0;

  // Sort values to find median (robust against outliers)
  const sortedValues = freshData.map(r => r.value).sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  } else {
    return sortedValues[mid];
  }
};

export const detectOutliers = (responses: OracleResponse[], consensusValue: number, threshold: number = 0.1): string[] => {
  return responses
    .filter(r => Math.abs(r.value - consensusValue) / consensusValue > threshold)
    .map(r => r.providerId);
};
