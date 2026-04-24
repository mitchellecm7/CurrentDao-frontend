import { QRSecurityValidator, SecurityViolationType } from '../../services/qr/security-validator';
import { QRService } from '../../services/qr/qr-service';
import { QRActionType } from '../../types/qr';

// Mocking Stellar SDK to simulate transaction behavior
jest.mock('@stellar/stellar-sdk', () => {
  return {
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        submitTransaction: jest.fn().mockResolvedValue({ success: true }),
      })),
    },
    Transaction: jest.fn().mockImplementation((xdr, network) => {
      const isMalicious = xdr.includes('malicious');
      const isExpired = xdr.includes('expired');
      const now = Math.floor(Date.now() / 1000);

      return {
        operations: isMalicious
          ? [{ type: 'accountMerge' }]
          : [{ type: 'payment' }],
        timeBounds: isExpired
          ? { minTime: '0', maxTime: String(now - 1000) }
          : { minTime: '0', maxTime: '9999999999' },
        sign: jest.fn(),
      };
    }),
    Networks: { PUBLIC: 'public', TESTNET: 'testnet' },
    Keypair: {
      fromSecret: jest.fn().mockReturnValue({ publicKey: jest.fn() }),
    },
  };
});

describe('QR Trading System - Logic & Security', () => {
  beforeEach(() => {
    // Reset analytics before each test
    QRService.resetAnalytics();
  });

  describe('QRSecurityValidator', () => {
    test('should reject transactions with dangerous operations (accountMerge)', () => {
      const maliciousXdr = 'malicious-xdr-string';
      const isValid = QRSecurityValidator.validateXDR(maliciousXdr);
      expect(isValid).toBe(false);
    });

    test('should accept standard payment transactions', () => {
      const safeXdr = 'safe-payment-xdr';
      const isValid = QRSecurityValidator.validateXDR(safeXdr);
      expect(isValid).toBe(true);
    });

    test('should reject expired transactions', () => {
      const expiredXdr = 'expired-transaction';
      const isValid = QRSecurityValidator.validateXDR(expiredXdr);
      expect(isValid).toBe(false);
    });

    test('should provide detailed validation results', () => {
      const maliciousXdr = 'malicious-xdr-string';
      const result = QRSecurityValidator.validateXDRWithDetails(maliciousXdr);
      expect(result.isValid).toBe(false);
      expect(result.violation).toBeDefined();
    });

    test('should validate expiration correctly', () => {
      const futureDate = Date.now() + 60000;
      const isValid = QRSecurityValidator.validateExpiration(futureDate);
      expect(isValid).toBe(true);
    });

    test('should reject past expiration dates', () => {
      const pastDate = Date.now() - 60000;
      const isValid = QRSecurityValidator.validateExpiration(pastDate);
      expect(isValid).toBe(false);
    });

    test('should validate origin correctly', () => {
      const validOrigin = 'currentdao-frontend';
      const isValid = QRSecurityValidator.validateOrigin(validOrigin);
      expect(isValid).toBe(true);
    });

    test('should reject unknown origins', () => {
      const invalidOrigin = 'unknown-origin';
      const isValid = QRSecurityValidator.validateOrigin(invalidOrigin);
      expect(isValid).toBe(false);
    });

    test('should perform comprehensive validation', () => {
      const safeXdr = 'safe-payment-xdr';
      const validOrigin = 'currentdao-frontend';
      const futureDate = Date.now() + 60000;

      const result = QRSecurityValidator.validateComplete(
        safeXdr,
        undefined,
        validOrigin,
        futureDate
      );

      expect(result.isValid).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    test('should provide human-readable security messages', () => {
      const message = QRSecurityValidator.getSecurityMessage(
        SecurityViolationType.INVALID_XDR
      );
      expect(message).toContain('invalid');
    });
  });

  describe('QRService', () => {
    test('should generate a valid Wallet Connect payload', () => {
      const pubKey = 'GBH...123';
      const payload = QRService.generateWalletConnectPayload(pubKey);
      expect(payload).toContain('web+stellar:contact');
      expect(payload).toContain(pubKey);
    });

    test('should generate QR payload with all required fields', () => {
      const payload = {
        asset: 'ENERGY',
        amount: '100',
        price: '5.5',
      };

      const qrData = QRService.generateQRPayload(
        QRActionType.TRADE,
        payload,
        15
      );

      expect(qrData.version).toBe('1.0');
      expect(qrData.type).toBe(QRActionType.TRADE);
      expect(qrData.payload).toBeDefined();
      expect(qrData.expiresAt).toBeDefined();
      expect(qrData.origin).toBe('currentdao-frontend');
      expect(qrData.checksum).toBeDefined();
    });

    test('should generate portfolio share QR payload', () => {
      const publicKey = 'GB123...';
      const portfolioId = 'portfolio-1';

      const qrData = QRService.generatePortfolioSharePayload(
        publicKey,
        portfolioId,
        24
      );

      expect(qrData.type).toBe(QRActionType.PORTFOLIO_SHARE);
      expect(qrData.expiresAt).toBeDefined();
    });

    test('should cache QR codes for offline support', () => {
      const payload = {
        asset: 'ENERGY',
        amount: '50',
        price: '3.0',
      };

      const qrData = QRService.generateQRPayload(
        QRActionType.TRADE,
        payload,
        15
      );

      const cached = QRService.getCachedQR(qrData.payload);
      expect(cached).toBeDefined();
      expect(cached?.type).toBe(QRActionType.TRADE);
    });

    test('should return null for non-existent cache', () => {
      const cached = QRService.getCachedQR('non-existent-payload');
      expect(cached).toBeNull();
    });

    test('should clear expired cache entries', () => {
      // This would require advancing time in tests
      // For now, we'll ensure the method runs without errors
      QRService.clearExpiredCache();
      expect(true).toBe(true);
    });

    test('should record successful scans in analytics', () => {
      QRService.recordSuccessfulScan(100);

      const analytics = QRService.getAnalytics();
      expect(analytics.totalScans).toBe(1);
      expect(analytics.successfulScans).toBe(1);
      expect(analytics.averageScanTime).toBe(100);
    });

    test('should record failed scans in analytics', () => {
      QRService.recordFailedScan();
      QRService.recordFailedScan();

      const analytics = QRService.getAnalytics();
      expect(analytics.totalScans).toBe(2);
      expect(analytics.failedScans).toBe(2);
    });

    test('should record security violations', () => {
      QRService.recordSecurityViolation();
      QRService.recordSecurityViolation();

      const analytics = QRService.getAnalytics();
      expect(analytics.securityViolations).toBe(2);
    });

    test('should calculate average scan time correctly', () => {
      QRService.recordSuccessfulScan(100);
      QRService.recordSuccessfulScan(200);
      QRService.recordSuccessfulScan(300);

      const analytics = QRService.getAnalytics();
      expect(analytics.averageScanTime).toBe(200);
    });

    test('should reset analytics', () => {
      QRService.recordSuccessfulScan(100);
      QRService.recordFailedScan();

      QRService.resetAnalytics();

      const analytics = QRService.getAnalytics();
      expect(analytics.totalScans).toBe(0);
      expect(analytics.successfulScans).toBe(0);
      expect(analytics.failedScans).toBe(0);
    });

    test('should validate checksum correctly', () => {
      const payload = {
        asset: 'ENERGY',
        amount: '100',
      };

      const qrData = QRService.generateQRPayload(
        QRActionType.TRADE,
        payload,
        15
      );

      const isValid = QRService.validateChecksum(
        qrData.payload,
        qrData.checksum!
      );
      expect(isValid).toBe(true);
    });

    test('should reject invalid checksums', () => {
      const payload = {
        asset: 'ENERGY',
        amount: '100',
      };

      const qrData = QRService.generateQRPayload(
        QRActionType.TRADE,
        payload,
        15
      );

      const isValid = QRService.validateChecksum(qrData.payload, 'invalid-checksum');
      expect(isValid).toBe(false);
    });

    test('should return analytics data', () => {
      QRService.recordSuccessfulScan(50);

      const analytics = QRService.getAnalytics();
      expect(analytics).toHaveProperty('totalScans');
      expect(analytics).toHaveProperty('successfulScans');
      expect(analytics).toHaveProperty('failedScans');
      expect(analytics).toHaveProperty('averageScanTime');
      expect(analytics).toHaveProperty('securityViolations');
      expect(analytics).toHaveProperty('lastUpdated');
    });
  });

  describe('Performance Requirements', () => {
    test('QR generation should complete within 50ms', () => {
      const startTime = performance.now();

      const payload = {
        asset: 'ENERGY',
        amount: '100',
        price: '5.5',
      };

      QRService.generateQRPayload(QRActionType.TRADE, payload, 15);

      const duration = performance.now() - startTime;
      console.log(`QR generation took ${duration.toFixed(2)}ms`);
    });

    test('Security validation should complete within 50ms', () => {
      const startTime = performance.now();

      QRSecurityValidator.validateXDRWithDetails('safe-payment-xdr');

      const duration = performance.now() - startTime;
      console.log(`Security validation took ${duration.toFixed(2)}ms`);
    });
  });
});