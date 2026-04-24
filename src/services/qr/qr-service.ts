import * as StellarSdk from '@stellar/stellar-sdk';
import { QRData, QRAnalytics, QRActionType, QRSecurityLevel } from '../../types/qr';

const { Transaction, Networks, TransactionBuilder, Horizon } = StellarSdk;

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// Cache for offline support
const qrCache = new Map<string, { data: QRData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Analytics storage
let analytics: QRAnalytics = {
  totalScans: 0,
  successfulScans: 0,
  failedScans: 0,
  averageScanTime: 0,
  securityViolations: 0,
  lastUpdated: Date.now(),
};

export class QRService {
  /**
   * Generates a QR code with all necessary trading data
   * Performance: <50ms
   */
  static generateQRPayload(
    type: QRActionType,
    payload: Record<string, any>,
    expiresInMinutes = 15
  ): QRData {
    const startTime = performance.now();

    const data: QRData = {
      version: '1.0',
      type,
      payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
      expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
      origin: 'currentdao-frontend',
      securityLevel: QRSecurityLevel.HIGH,
    };

    // Generate checksum for integrity
    data.checksum = this.generateChecksum(data.payload);

    // Cache for offline support
    qrCache.set(data.payload, {
      data,
      timestamp: Date.now(),
    });

    const duration = performance.now() - startTime;
    console.log(`QR generation took ${duration.toFixed(2)}ms`);

    return data;
  }

  /**
   * Executes a trade from a scanned QR XDR string
   * Performance target: <100ms for validation
   */
  static async executeScannedTrade(xdr: string, userSecret?: string) {
    const startTime = performance.now();

    try {
      // 1. Load the transaction from XDR
      const transaction = new Transaction(xdr, Networks.TESTNET);

      // 2. If the user has a secret (or via a connected wallet), sign it
      if (userSecret) {
        const sourceKeys = StellarSdk.Keypair.fromSecret(userSecret);
        transaction.sign(sourceKeys);
      }

      // 3. Submit to the network
      const result = await server.submitTransaction(transaction as any);

      const duration = performance.now() - startTime;
      this.recordSuccessfulScan(duration);

      return result;
    } catch (error) {
      console.error('Trade Execution Failed:', error);
      analytics.failedScans++;
      throw error;
    }
  }

  /**
   * Generates a "Wallet Connect" payload (Standard SEP-0007 format)
   */
  static generateWalletConnectPayload(publicKey: string): string {
    return `web+stellar:contact?address=${publicKey}&memo_id=${Date.now()}`;
  }

  /**
   * Generates a portfolio sharing QR code
   */
  static generatePortfolioSharePayload(
    publicKey: string,
    portfolioId: string,
    expiresInHours = 24
  ): QRData {
    const shareToken = this.generateShareToken();
    const payload = {
      publicKey,
      portfolioId,
      shareToken,
      expiresAt: Date.now() + expiresInHours * 60 * 60 * 1000,
    };

    return this.generateQRPayload(
      QRActionType.PORTFOLIO_SHARE,
      payload,
      expiresInHours * 60
    );
  }

  /**
   * Retrieves cached QR data for offline support
   */
  static getCachedQR(payload: string): QRData | null {
    const cached = qrCache.get(payload);

    if (!cached) return null;

    // Check if cache has expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      qrCache.delete(payload);
      return null;
    }

    return cached.data;
  }

  /**
   * Clears expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    let cleared = 0;

    qrCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_DURATION) {
        qrCache.delete(key);
        cleared++;
      }
    });

    console.log(`Cleared ${cleared} expired QR cache entries`);
  }

  /**
   * Gets current analytics data
   */
  static getAnalytics(): QRAnalytics {
    return { ...analytics };
  }

  /**
   * Records successful scan for analytics
   */
  static recordSuccessfulScan(scanDurationMs: number): void {
    analytics.totalScans++;
    analytics.successfulScans++;
    analytics.averageScanTime =
      (analytics.averageScanTime * (analytics.totalScans - 1) + scanDurationMs) /
      analytics.totalScans;
    analytics.lastUpdated = Date.now();
  }

  /**
   * Records failed scan for analytics
   */
  static recordFailedScan(): void {
    analytics.totalScans++;
    analytics.failedScans++;
    analytics.lastUpdated = Date.now();
  }

  /**
   * Records security violation
   */
  static recordSecurityViolation(): void {
    analytics.securityViolations++;
    analytics.lastUpdated = Date.now();
  }

  /**
   * Resets analytics
   */
  static resetAnalytics(): void {
    analytics = {
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      averageScanTime: 0,
      securityViolations: 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Generates a checksum for QR integrity verification
   */
  private static generateChecksum(payload: string): string {
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generates a unique share token
   */
  private static generateShareToken(): string {
    return `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validates QR checksum
   */
  static validateChecksum(payload: string, checksum: string): boolean {
    return this.generateChecksum(payload) === checksum;
  }
}