import crypto from 'crypto';

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  salt: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 32;
  private static readonly TAG_LENGTH = 16;

  /**
   * Derives encryption key from password using PBKDF2
   */
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
  }

  /**
   * Encrypts sensitive data using AES-256-GCM
   */
  static encrypt(data: string, password: string): EncryptionResult {
    try {
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const key = this.deriveKey(password, salt);
      
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from('CurrentDao-Privacy', 'utf8'));
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted + ':' + tag.toString('hex'),
        iv: iv.toString('hex'),
        salt: salt.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypts data using AES-256-GCM
   */
  static decrypt(encryptedResult: EncryptionResult, password: string): string {
    try {
      const salt = Buffer.from(encryptedResult.salt, 'hex');
      const iv = Buffer.from(encryptedResult.iv, 'hex');
      const key = this.deriveKey(password, salt);
      
      const [encryptedData, tagHex] = encryptedResult.encryptedData.split(':');
      const tag = Buffer.from(tagHex, 'hex');
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from('CurrentDao-Privacy', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid password or corrupted data'}`);
    }
  }

  /**
   * Hashes sensitive data using SHA-256
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generates a secure random password
   */
  static generateSecurePassword(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Validates data integrity
   */
  static verifyIntegrity(data: string, expectedHash: string): boolean {
    const actualHash = this.hash(data);
    return actualHash === expectedHash;
  }

  /**
   * Sanitizes data by removing sensitive patterns
   */
  static sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '****-****-****-****')
                 .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****')
                 .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '****@****.***');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('key')) {
          sanitized[key] = '****';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
}
