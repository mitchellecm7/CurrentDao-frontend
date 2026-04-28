import { EncryptedSettingsExport, ExportableSettings } from '@/types/settings-export';

export class SettingsEncryption {
  private static readonly ITERATIONS = 100000;
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 12;

  /**
   * Convert ArrayBuffer to base64 string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private static base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Generate random bytes
   */
  private static async generateRandomBytes(length: number): Promise<Uint8Array> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const saltBuffer = new ArrayBuffer(salt.length);
    const saltView = new Uint8Array(saltBuffer);
    saltView.set(salt);

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt settings data
   */
  static async encrypt(settings: ExportableSettings, password: string): Promise<EncryptedSettingsExport> {
    try {
      // Generate salt and IV
      const salt = await this.generateRandomBytes(this.SALT_LENGTH);
      const iv = await this.generateRandomBytes(this.IV_LENGTH);

      // Derive encryption key
      const key = await this.deriveKey(password, salt);

      // Encrypt the data
      const jsonData = JSON.stringify(settings);
      const dataBuffer = new TextEncoder().encode(jsonData);
      
      // Create proper ArrayBuffers for crypto operations
      const ivBuffer = new ArrayBuffer(iv.length);
      const ivView = new Uint8Array(ivBuffer);
      ivView.set(iv);

      const dataArrayBuffer = new ArrayBuffer(dataBuffer.length);
      const dataView = new Uint8Array(dataArrayBuffer);
      dataView.set(dataBuffer);
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer
        },
        key,
        dataArrayBuffer
      );

      // Create proper ArrayBuffer for salt
      const saltBuffer = new ArrayBuffer(salt.length);
      const saltView = new Uint8Array(saltBuffer);
      saltView.set(salt);

      return {
        version: settings.version,
        encryptedData: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(ivBuffer),
        salt: this.arrayBufferToBase64(saltBuffer),
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
      // Convert base64 strings to Uint8Arrays
      const salt = this.base64ToUint8Array(encryptedExport.salt);
      const iv = this.base64ToUint8Array(encryptedExport.iv);
      const encryptedData = this.base64ToUint8Array(encryptedExport.encryptedData);

      // Derive decryption key
      const key = await this.deriveKey(password, salt);

      // Create proper ArrayBuffers for crypto operations
      const ivBuffer = new ArrayBuffer(iv.length);
      const ivView = new Uint8Array(ivBuffer);
      ivView.set(iv);

      const encryptedBuffer = new ArrayBuffer(encryptedData.length);
      const encryptedView = new Uint8Array(encryptedBuffer);
      encryptedView.set(encryptedData);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer
        },
        key,
        encryptedBuffer
      );

      const decryptedData = new TextDecoder().decode(decryptedBuffer);
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
