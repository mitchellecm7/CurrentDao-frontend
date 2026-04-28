// W3C DID (Decentralized Identity) types for Cross-DAO Profile Portability

export interface DIDDocument {
  '@context': string | string[];
  id: string; // DID identifier
  verificationMethod?: VerificationMethod[];
  authentication?: VerificationMethod[] | string[];
  assertionMethod?: VerificationMethod[] | string[];
  keyAgreement?: VerificationMethod[] | string[];
  capabilityInvocation?: VerificationMethod[] | string[];
  capabilityDelegation?: VerificationMethod[] | string[];
  service?: Service[];
  created?: string;
  updated?: string;
  proof?: Proof;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58?: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyMultibase?: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue?: string;
  jws?: string;
  [key: string]: any;
}

export interface PortableIdentityCredential {
  '@context': string[];
  type: string[];
  issuer: string; // DID of the issuing DAO
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  proof?: Proof;
  credentialStatus?: CredentialStatus;
  refreshService?: Service[];
}

export interface CredentialSubject {
  id: string; // DID of the subject
  [key: string]: any; // Profile data, reputation, etc.
}

export interface CredentialStatus {
  id: string;
  type: string;
  revocationListIndex?: number;
  revocationListCredential?: string;
}

export interface CrossDAOProfile {
  did: string;
  publicKey: string;
  profileData: ProfileData;
  reputation: ReputationData;
  daoMemberships: DAOMembership[];
  credentials: PortableIdentityCredential[];
  privacySettings: PrivacySettings;
  created: string;
  lastUpdated: string;
  version: string;
}

export interface ProfileData {
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  verificationStatus?: VerificationStatus;
}

export interface VerificationStatus {
  isVerified: boolean;
  verificationMethod: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ReputationData {
  totalReputation: number;
  daoReputations: DAOReputation[];
  achievements: Achievement[];
  badges: Badge[];
  lastCalculated: string;
}

export interface DAOReputation {
  daoId: string;
  daoName: string;
  reputation: number;
  level: string;
  joinDate: string;
  contributions: number;
  ratings: Rating[];
}

export interface Rating {
  id: string;
  fromUser: string;
  rating: number;
  comment?: string;
  category: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  earnedAt: string;
  daoId: string;
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  issuer: string;
  issuedAt: string;
  imageUrl?: string;
  verificationUrl?: string;
  expiresAt?: string;
}

export interface DAOMembership {
  daoId: string;
  daoName: string;
  role: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  contributions: number;
  reputation: number;
}

export interface PrivacySettings {
  shareProfileData: boolean;
  shareReputation: boolean;
  shareAchievements: boolean;
  shareBadges: boolean;
  shareDaoMemberships: boolean;
  allowedDAOs: string[];
  dataRetentionPeriod: number; // in days
  autoRevoke: boolean;
}

export interface IdentityExportRequest {
  did: string;
  includeProfileData: boolean;
  includeReputation: boolean;
  includeAchievements: boolean;
  includeBadges: boolean;
  includeDaoMemberships: boolean;
  targetDAOs?: string[];
  expirationPeriod?: number; // in days
  privacySettings: PrivacySettings;
}

export interface IdentityImportRequest {
  credentialData: string; // JSON string of PortableIdentityCredential
  sourceDAO: string;
  verificationLevel: 'basic' | 'enhanced' | 'full';
  privacySettings: PrivacySettings;
}

export interface IdentityVerificationResult {
  isValid: boolean;
  credential: PortableIdentityCredential;
  verificationDetails: VerificationDetails;
  importedReputation: ReputationData;
  warnings?: string[];
  errors?: string[];
}

export interface VerificationDetails {
  signatureValid: boolean;
  issuerValid: boolean;
  notExpired: boolean;
  notRevoked: boolean;
  verifiedAt: string;
  verificationMethod: string;
}

export interface StellarAccountData {
  account: string;
  dataEntries: AccountDataEntry[];
}

export interface AccountDataEntry {
  key: string;
  value: string; // Base64 encoded
  type: 'string' | 'json' | 'did_document' | 'credential';
  lastModified: string;
}

export interface IdentityStorageConfig {
  dataKeyPrefix: string;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  maxDataSize: number; // in bytes
}

export interface FederatedIdentityState {
  currentIdentity: CrossDAOProfile | null;
  exportedCredentials: PortableIdentityCredential[];
  importedCredentials: PortableIdentityCredential[];
  verificationResults: IdentityVerificationResult[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

export interface FederatedIdentityContextType {
  state: FederatedIdentityState;
  generateDID: () => Promise<string>;
  createDIDDocument: (publicKey: string) => Promise<DIDDocument>;
  exportIdentity: (request: IdentityExportRequest) => Promise<PortableIdentityCredential>;
  importIdentity: (request: IdentityImportRequest) => Promise<IdentityVerificationResult>;
  verifyCredential: (credential: PortableIdentityCredential) => Promise<VerificationDetails>;
  revokeCredential: (credentialId: string) => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
  calculateCrossDAOReputation: (daoMemberships: DAOMembership[]) => Promise<number>;
  syncWithStellar: () => Promise<void>;
  refreshCredentials: () => Promise<void>;
}

export interface CredentialValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
}

export interface CredentialTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  context: string[];
  types: string[];
  validationRules: CredentialValidationRule[];
  requiredFields: string[];
}

export interface DAORegistry {
  id: string;
  name: string;
  did: string;
  publicKey: string;
  endpoint: string;
  supportedCredentialTypes: string[];
  trustLevel: number;
  isActive: boolean;
}

export interface RevocationList {
  id: string;
  issuer: string;
  type: string;
  revokedCredentials: string[];
  lastUpdated: string;
}

// Utility types
export type DIDMethod = 'stellar' | 'key' | 'ion' | 'ethr';
export type CredentialType = 'profile' | 'reputation' | 'achievement' | 'membership' | 'verification';
export type VerificationLevel = 'basic' | 'enhanced' | 'full';
export type PrivacyLevel = 'public' | 'restricted' | 'private';

// Error types
export class DIDError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DIDError';
  }
}

export class CredentialError extends Error {
  constructor(
    message: string,
    public code: string,
    public credentialId?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CredentialError';
  }
}

export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public verificationDetails?: Partial<VerificationDetails>,
    public details?: any
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}
