export enum QRActionType {
  TRANSFER = 'TRANSFER',
  CONNECT = 'CONNECT',
  INFO = 'INFO',
  TRADE = 'TRADE',
  WALLET_CONNECT = 'WALLET_CONNECT',
  PORTFOLIO_SHARE = 'PORTFOLIO_SHARE',
}

export enum QRSecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface QRData {
  version: string;
  type: QRActionType;
  payload: string; // Base64 encoded JSON or Stellar XDR
  expiresAt?: number;
  origin: 'currentdao-frontend';
  checksum?: string; // For integrity verification
  securityLevel?: QRSecurityLevel;
}

export interface EnergyTradePayload {
  asset: string;
  amount: string;
  price: string;
  recipient: string;
  timestamp?: number;
  orderId?: string;
}

export interface WalletConnectPayload {
  publicKey: string;
  network: 'public' | 'testnet';
  timestamp: number;
}

export interface PortfolioSharePayload {
  publicKey: string;
  portfolioId: string;
  shareToken: string;
  expiresAt: number;
}

export interface QRScanResult {
  data: string;
  timestamp: number;
  duration: number; // ms to scan
  isValid: boolean;
  errorMessage?: string;
}

export interface QRAnalytics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageScanTime: number; // ms
  securityViolations: number;
  lastUpdated: number;
}

export interface QRGenerationOptions {
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  offline?: boolean;
}