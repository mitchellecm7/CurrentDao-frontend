import { 
  DIDDocument, 
  VerificationMethod, 
  Service, 
  Proof, 
  PortableIdentityCredential,
  CredentialSubject,
  DIDError,
  VerificationError,
  CredentialError
} from '../types/did';
// Keypair will be imported from stellar utilities

export class DIDManager {
  private static instance: DIDManager;

  static getInstance(): DIDManager {
    if (!DIDManager.instance) {
      DIDManager.instance = new DIDManager();
    }
    return DIDManager.instance;
  }

  // Generate a Stellar-based DID
  generateStellarDID(publicKey: string): string {
    if (!this.isValidStellarPublicKey(publicKey)) {
      throw new DIDError('Invalid Stellar public key', 'INVALID_PUBLIC_KEY');
    }
    return `did:stellar:${publicKey}`;
  }

  // Generate a key-based DID
  generateKeyDID(publicKey: string): string {
    if (!this.isValidPublicKey(publicKey)) {
      throw new DIDError('Invalid public key', 'INVALID_PUBLIC_KEY');
    }
    return `did:key:${publicKey}`;
  }

  // Create a DID document for a Stellar account
  async createStellarDIDDocument(
    publicKey: string,
    serviceEndpoint?: string
  ): Promise<DIDDocument> {
    const did = this.generateStellarDID(publicKey);
    const keyId = `${did}#key-1`;

    const verificationMethod: VerificationMethod = {
      id: keyId,
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58: publicKey
    };

    const document: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/v1'
      ],
      id: did,
      verificationMethod: [verificationMethod],
      authentication: [verificationMethod],
      assertionMethod: [verificationMethod],
      keyAgreement: [verificationMethod],
      capabilityInvocation: [verificationMethod],
      service: serviceEndpoint ? [{
        id: `${did}#service-1`,
        type: 'CredentialRepositoryService',
        serviceEndpoint
      }] : undefined,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    return document;
  }

  // Create a key-based DID document
  async createKeyDIDDocument(publicKey: string): Promise<DIDDocument> {
    const did = this.generateKeyDID(publicKey);
    const keyId = `${did}#key-1`;

    const verificationMethod: VerificationMethod = {
      id: keyId,
      type: 'Ed25519VerificationKey2018',
      controller: did,
      publicKeyBase58: publicKey
    };

    const document: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/v1'
      ],
      id: did,
      verificationMethod: [verificationMethod],
      authentication: [keyId],
      assertionMethod: [keyId],
      keyAgreement: [keyId],
      capabilityInvocation: [keyId],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    return document;
  }

  // Validate a DID document
  validateDIDDocument(document: DIDDocument): boolean {
    try {
      // Check required fields
      if (!document.id || !document['@context']) {
        return false;
      }

      // Validate DID format
      if (!this.isValidDID(document.id)) {
        return false;
      }

      // Validate verification methods
      if (document.verificationMethod) {
        for (const vm of document.verificationMethod) {
          if (!this.isValidVerificationMethod(vm, document.id)) {
            return false;
          }
        }
      }

      // Validate service endpoints
      if (document.service) {
        for (const service of document.service) {
          if (!this.isValidService(service)) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('DID document validation error:', error);
      return false;
    }
  }

  // Resolve a DID to its document (placeholder for actual resolution)
  async resolveDID(did: string): Promise<DIDDocument | null> {
    try {
      // In a real implementation, this would query a DID resolver
      // For now, we'll return null as a placeholder
      console.log(`Resolving DID: ${did}`);
      return null;
    } catch (error) {
      throw new DIDError(`Failed to resolve DID: ${did}`, 'RESOLUTION_ERROR', error);
    }
  }

  // Create a portable identity credential
  async createPortableCredential(
    issuerDID: string,
    subjectDID: string,
    credentialData: any,
    expirationDays?: number
  ): Promise<PortableIdentityCredential> {
    const issuanceDate = new Date().toISOString();
    const expirationDate = expirationDays 
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const credential: PortableIdentityCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiableCredential', 'CrossDAOIdentity'],
      issuer: issuerDID,
      issuanceDate,
      expirationDate,
      credentialSubject: {
        id: subjectDID,
        ...credentialData
      }
    };

    return credential;
  }

  // Sign a credential with a private key
  async signCredential(
    credential: PortableIdentityCredential,
    privateKey: string,
    keyId: string
  ): Promise<PortableIdentityCredential> {
    try {
      // Create the proof
      const proof: Proof = {
        type: 'Ed25519Signature2018',
        created: new Date().toISOString(),
        verificationMethod: keyId,
        proofPurpose: 'assertionMethod'
      };

      // In a real implementation, this would create a proper cryptographic signature
      // For now, we'll add a placeholder proof
      credential.proof = proof;

      return credential;
    } catch (error) {
      throw new CredentialError('Failed to sign credential', 'SIGNING_ERROR', undefined, error);
    }
  }

  // Verify a credential's signature
  async verifyCredential(credential: PortableIdentityCredential): Promise<boolean> {
    try {
      if (!credential.proof) {
        throw new VerificationError('Credential has no proof', 'MISSING_PROOF');
      }

      // Check expiration
      if (credential.expirationDate && new Date(credential.expirationDate) < new Date()) {
        throw new VerificationError('Credential has expired', 'EXPIRED');
      }

      // In a real implementation, this would verify the cryptographic signature
      // For now, we'll return true as a placeholder
      return true;
    } catch (error) {
      if (error instanceof VerificationError) {
        throw error;
      }
      throw new VerificationError('Credential verification failed', 'VERIFICATION_ERROR', undefined, error);
    }
  }

  // Create a credential subject for profile data
  createProfileCredentialSubject(profileData: any): CredentialSubject {
    return {
      id: profileData.did,
      type: 'ProfileData',
      profileData: {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        avatar: profileData.avatar,
        location: profileData.location,
        website: profileData.website,
        verificationStatus: profileData.verificationStatus
      }
    };
  }

  // Create a credential subject for reputation data
  createReputationCredentialSubject(reputationData: any): CredentialSubject {
    return {
      id: reputationData.did,
      type: 'ReputationData',
      reputationData: {
        totalReputation: reputationData.totalReputation,
        daoReputations: reputationData.daoReputations,
        achievements: reputationData.achievements,
        badges: reputationData.badges,
        lastCalculated: reputationData.lastCalculated
      }
    };
  }

  // Create a credential subject for DAO memberships
  createMembershipCredentialSubject(memberships: any): CredentialSubject {
    return {
      id: memberships.did,
      type: 'DAOMemberships',
      memberships: memberships.daoMemberships
    };
  }

  // Utility methods
  private isValidStellarPublicKey(publicKey: string): boolean {
    // Basic validation for Stellar public key format
    // Stellar public keys are 56 characters long and start with 'G'
    return /^[G][A-Z0-9]{55}$/.test(publicKey);
  }

  private isValidPublicKey(publicKey: string): boolean {
    // Basic validation for public key format
    return /^[a-zA-Z0-9]+$/.test(publicKey) && publicKey.length >= 32;
  }

  private isValidDID(did: string): boolean {
    // Basic DID validation
    return /^did:([a-z0-9]+):([a-zA-Z0-9._-]+)$/.test(did);
  }

  private isValidVerificationMethod(vm: VerificationMethod, did: string): boolean {
    return !!(vm.id && vm.type && vm.controller === did && 
      (vm.publicKeyBase58 || vm.publicKeyJwk || vm.publicKeyMultibase));
  }

  private isValidService(service: Service): boolean {
    return !!(service.id && service.type && service.serviceEndpoint);
  }

  // Parse DID to extract method and identifier
  parseDID(did: string): { method: string; identifier: string } | null {
    const match = did.match(/^did:([a-z0-9]+):(.+)$/);
    if (!match) return null;
    
    return {
      method: match[1],
      identifier: match[2]
    };
  }

  // Generate a unique key ID for a DID
  generateKeyId(did: string, keyIndex: number = 1): string {
    return `${did}#key-${keyIndex}`;
  }

  // Generate a unique service ID for a DID
  generateServiceId(did: string, serviceIndex: number = 1): string {
    return `${did}#service-${serviceIndex}`;
  }

  // Update a DID document
  updateDIDDocument(document: DIDDocument, updates: Partial<DIDDocument>): DIDDocument {
    const updated = { ...document, ...updates };
    updated.updated = new Date().toISOString();
    return updated;
  }

  // Add a verification method to a DID document
  addVerificationMethod(
    document: DIDDocument, 
    verificationMethod: VerificationMethod
  ): DIDDocument {
    const updated = { ...document };
    updated.verificationMethod = [
      ...(updated.verificationMethod || []),
      verificationMethod
    ];
    updated.updated = new Date().toISOString();
    return updated;
  }

  // Add a service to a DID document
  addService(document: DIDDocument, service: Service): DIDDocument {
    const updated = { ...document };
    updated.service = [
      ...(updated.service || []),
      service
    ];
    updated.updated = new Date().toISOString();
    return updated;
  }

  // Remove a verification method from a DID document
  removeVerificationMethod(document: DIDDocument, keyId: string): DIDDocument {
    const updated = { ...document };
    if (updated.verificationMethod) {
      updated.verificationMethod = updated.verificationMethod.filter(vm => vm.id !== keyId);
    }
    updated.updated = new Date().toISOString();
    return updated;
  }

  // Remove a service from a DID document
  removeService(document: DIDDocument, serviceId: string): DIDDocument {
    const updated = { ...document };
    if (updated.service) {
      updated.service = updated.service.filter(s => s.id !== serviceId);
    }
    updated.updated = new Date().toISOString();
    return updated;
  }
}

export const didManager = DIDManager.getInstance();
