import { Transaction, Networks } from '@stellar/stellar-sdk';
import { QRService } from './qr-service';

export enum SecurityViolationType {
  INVALID_XDR = 'INVALID_XDR',
  BLACKLISTED_OPERATION = 'BLACKLISTED_OPERATION',
  EXPIRED = 'EXPIRED',
  INVALID_CHECKSUM = 'INVALID_CHECKSUM',
  UNKNOWN_ORIGIN = 'UNKNOWN_ORIGIN',
}

export class QRSecurityValidator {
  // Blacklisted operations that are often used in drainer scams
  private static readonly BLACKLISTED_OPERATIONS = [
    'accountMerge',
    'setOptions',
    'changeTrust', // Can be used to revoke access
    'manageData', // Can be exploited
  ];

  // Whitelisted origins
  private static readonly WHITELISTED_ORIGINS = ['currentdao-frontend'];

  /**
   * Comprehensive XDR validation
   * Performance: <50ms
   */
  static validateXDR(xdr: string): boolean {
    const result = this.validateXDRWithDetails(xdr);
    return result.isValid;
  }

  /**
   * Validate XDR with detailed information
   */
  static validateXDRWithDetails(
    xdr: string
  ): { isValid: boolean; violation?: SecurityViolationType; message?: string } {
    try {
      // 1. Validate XDR format
      if (!xdr || typeof xdr !== 'string') {
        QRService.recordSecurityViolation();
        return { isValid: false, violation: SecurityViolationType.INVALID_XDR };
      }

      // 2. Try to parse as transaction
      let tx: Transaction;
      try {
        // Try both networks for flexibility
        try {
          tx = new Transaction(xdr, Networks.PUBLIC);
        } catch {
          tx = new Transaction(xdr, Networks.TESTNET);
        }
      } catch (error) {
        QRService.recordSecurityViolation();
        return {
          isValid: false,
          violation: SecurityViolationType.INVALID_XDR,
          message: 'Invalid XDR format',
        };
      }

      // 3. Check for blacklisted operations
      const unsafeOperation = tx.operations.find(op =>
        this.BLACKLISTED_OPERATIONS.includes(op.type)
      );

      if (unsafeOperation) {
        QRService.recordSecurityViolation();
        return {
          isValid: false,
          violation: SecurityViolationType.BLACKLISTED_OPERATION,
          message: `Blacklisted operation detected: ${unsafeOperation.type}`,
        };
      }

      // 4. Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (
        tx.timeBounds &&
        parseInt(tx.timeBounds.maxTime as any) < now &&
        parseInt(tx.timeBounds.maxTime as any) !== 0
      ) {
        return {
          isValid: false,
          violation: SecurityViolationType.EXPIRED,
          message: 'Transaction has expired',
        };
      }

      // 5. Ensure transaction has reasonable bounds
      if (tx.timeBounds) {
        const minTime = parseInt(tx.timeBounds.minTime as any);
        const maxTime = parseInt(tx.timeBounds.maxTime as any);

        // Check for unreasonable timeout (more than 7 days)
        if (maxTime !== 0 && maxTime - minTime > 7 * 24 * 60 * 60) {
          console.warn('Warning: Transaction has unusually long timeout');
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Security validation error:', error);
      QRService.recordSecurityViolation();
      return { isValid: false, violation: SecurityViolationType.INVALID_XDR };
    }
  }

  /**
   * Validate QR payload with checksum
   */
  static validatePayloadWithChecksum(payload: string, checksum: string): boolean {
    return QRService.validateChecksum(payload, checksum);
  }

  /**
   * Validate QR origin
   */
  static validateOrigin(origin: string): boolean {
    return this.WHITELISTED_ORIGINS.includes(origin);
  }

  /**
   * Validate QR expiration
   */
  static validateExpiration(expiresAt?: number): boolean {
    if (!expiresAt) return true;
    return Date.now() <= expiresAt;
  }

  /**
   * Comprehensive QR validation including all checks
   */
  static validateComplete(
    xdr: string,
    checksum?: string,
    origin?: string,
    expiresAt?: number
  ): { isValid: boolean; violations: SecurityViolationType[] } {
    const violations: SecurityViolationType[] = [];

    // 1. Validate XDR
    const xdrResult = this.validateXDRWithDetails(xdr);
    if (!xdrResult.isValid && xdrResult.violation) {
      violations.push(xdrResult.violation);
    }

    // 2. Validate checksum if provided
    if (checksum && !this.validatePayloadWithChecksum(xdr, checksum)) {
      violations.push(SecurityViolationType.INVALID_CHECKSUM);
    }

    // 3. Validate origin if provided
    if (origin && !this.validateOrigin(origin)) {
      violations.push(SecurityViolationType.UNKNOWN_ORIGIN);
    }

    // 4. Validate expiration
    if (!this.validateExpiration(expiresAt)) {
      violations.push(SecurityViolationType.EXPIRED);
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }

  /**
   * Get human-readable security message
   */
  static getSecurityMessage(violation: SecurityViolationType): string {
    const messages: Record<SecurityViolationType, string> = {
      [SecurityViolationType.INVALID_XDR]: 'This QR code contains invalid data',
      [SecurityViolationType.BLACKLISTED_OPERATION]:
        'This QR code contains potentially malicious operations',
      [SecurityViolationType.EXPIRED]: 'This QR code has expired',
      [SecurityViolationType.INVALID_CHECKSUM]: 'This QR code has been tampered with',
      [SecurityViolationType.UNKNOWN_ORIGIN]: 'This QR code comes from an unknown source',
    };

    return messages[violation] || 'Unknown security violation';
  }
}   