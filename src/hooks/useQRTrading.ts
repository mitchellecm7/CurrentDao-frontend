import { useMutation, useQuery } from '@tanstack/react-query';
import { QRSecurityValidator, SecurityViolationType } from '../services/qr/security-validator';
import { QRService } from '../services/qr/qr-service';
import { QRData, QRAnalytics } from '../types/qr';

interface QRTradeError {
  code: string;
  message: string;
  violation?: SecurityViolationType;
}

export const useQRTrading = () => {
  const scanMutation = useMutation<
    { success: boolean; message: string },
    QRTradeError,
    { scannedData: string; userSecret?: string },
    unknown
  >({
    mutationFn: async ({ scannedData, userSecret }) => {
      const startTime = performance.now();

      try {
        // 1. Validate security
        const validation = QRSecurityValidator.validateXDRWithDetails(scannedData);

        if (!validation.isValid) {
          QRService.recordFailedScan();
          throw {
            code: 'SECURITY_VALIDATION_FAILED',
            message:
              validation.message ||
              QRSecurityValidator.getSecurityMessage(
                validation.violation || SecurityViolationType.INVALID_XDR
              ),
            violation: validation.violation,
          };
        }

        // 2. Execute the trade
        const result = await QRService.executeScannedTrade(scannedData, userSecret);

        // 3. Record success metrics
        const duration = performance.now() - startTime;
        QRService.recordSuccessfulScan(duration);

        // Performance check
        if (duration > 100) {
          console.warn(
            `QR execution took ${duration.toFixed(2)}ms (target: <100ms)`
          );
        }

        return {
          success: true,
          message: 'Trade executed successfully',
        };
      } catch (error: any) {
        QRService.recordFailedScan();

        if (error.code) {
          throw error;
        }

        throw {
          code: 'EXECUTION_FAILED',
          message: error.message || 'Failed to execute trade',
        };
      }
    },
  });

  // Query for analytics
  const analyticsQuery = useQuery<QRAnalytics>({
    queryKey: ['qr-analytics'],
    queryFn: () => QRService.getAnalytics(),
    refetchInterval: 5000, // Update every 5 seconds
  });

  return {
    ...scanMutation,
    analytics: analyticsQuery.data,
    analyticsFetching: analyticsQuery.isLoading,
  };
};

/**
 * Hook to handle portfolio sharing via QR
 */
export const useQRPortfolioShare = () => {
  const generateMutation = useMutation<QRData, Error, { publicKey: string; portfolioId: string }, unknown>({
    mutationFn: async ({ publicKey, portfolioId }) => {
      return QRService.generatePortfolioSharePayload(publicKey, portfolioId, 24);
    },
  });

  return generateMutation;
};

/**
 * Hook to clear expired QR cache
 */
export const useClearQRCache = () => {
  return useMutation({
    mutationFn: async () => {
      QRService.clearExpiredCache();
      return { success: true };
    },
  });
};

/**
 * Hook to reset QR analytics
 */
export const useResetQRAnalytics = () => {
  return useMutation({
    mutationFn: async () => {
      QRService.resetAnalytics();
      return { success: true };
    },
  });
};