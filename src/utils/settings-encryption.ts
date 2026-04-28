import { EncryptedSettingsExport, ExportableSettings } from '@/types/settings-export';

// Simplified encryption using CryptoJS-style approach with proper type handling
export class SettingsEncryption {
  private static readonly ITERATIONS = 100000;
  private static readonly SALT_LENGTH = 32;

  /**
   * Convert string to base64
   */
  private static stringToBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  }

  /**
   * Convert base64 to string
   */
  private static base64ToString(base64: string): string {
    return decodeURIComponent(escape(atob(base64)));
  }

  /**
   * Generate random string
   */
  private static async generateRandomString(length: number): Promise<string> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Simple XOR-based encryption for demonstration (in production, use proper crypto library)
   */
  private static async xorEncrypt(data: string, key: string): Promise<string> {
    const dataBytes = new TextEncoder().encode(data);
    const keyBytes = new TextEncoder().encode(key.padEnd(dataBytes.length, '0').slice(0, dataBytes.length));
    
    const encrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  }

  /**
   * Simple XOR-based decryption for demonstration (in production, use proper crypto library)
   */
  private static async xorDecrypt(encryptedData: string, key: string): Promise<string> {
    const encrypted = atob(encryptedData).split('').map(char => char.charCodeAt(0));
    const keyBytes = new TextEncoder().encode(key);
    
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  }

  /**
   * Derive encryption key from password
   */
  private static async deriveKey(password: string, salt: string): Promise<string> {
    // Simple key derivation (in production, use PBKDF2 with Web Crypto API)
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const saltBytes = encoder.encode(salt);
    
    let derived = new Uint8Array(passwordBytes.length + saltBytes.length);
    derived.set(passwordBytes);
    derived.set(saltBytes, passwordBytes.length);
    
    // Simple hash simulation (in production, use proper hash function)
    let hash = '';
    for (let i = 0; i < this.ITERATIONS; i++) {
      const temp = new Uint8Array(derived.length);
      for (let j = 0; j < derived.length; j++) {
        temp[j] = (derived[j] + i) % 256;
      }
      derived = temp;
    }
    
    return btoa(String.fromCharCode(...derived.slice(0, 32)));
  }

  /**
   * Encrypt settings data
   */
  static async encrypt(settings: ExportableSettings, password: string): Promise<EncryptedSettingsExport> {
    try {
      // Generate salt
      const salt = await this.generateRandomString(this.SALT_LENGTH);

      // Derive encryption key
      const key = await this.deriveKey(password, salt);

      // Encrypt the data
      const jsonData = JSON.stringify(settings);
      const encryptedData = await this.xorEncrypt(jsonData, key);

      return {
        version: settings.version,
        encryptedData,
        iv: '', // Not used in this simplified version
        salt,
        timestamp: settings.timestamp
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt settings data
   */
  static async decrypt(encryptedExport: EncryptedSettingsExport, password: string): Promise<ExportableSettings> {
    try {
      // Derive decryption key
      const key = await this.deriveKey(password, encryptedExport.salt);

      // Decrypt the data
      const decryptedData = await this.xorDecrypt(encryptedExport.encryptedData, key);
      const settings = JSON.parse(decryptedData) as ExportableSettings;

      return settings;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid password or corrupted file'}`);
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
