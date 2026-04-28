import {
  PortableIdentityCredential,
  IdentityExportRequest,
  CrossDAOProfile,
  ProfileData,
  ReputationData,
  DAOMembership,
  PrivacySettings,
  DIDDocument,
  DIDError,
  CredentialError
} from '../types/did';
import { didManager } from './did';
import { simpleStellarIdentityStorage } from './stellar-storage-simple';

export class IdentityExporter {
  private static instance: IdentityExporter;

  static getInstance(): IdentityExporter {
    if (!IdentityExporter.instance) {
      IdentityExporter.instance = new IdentityExporter();
    }
    return IdentityExporter.instance;
  }

  // Export identity with portable credentials
  async exportIdentity(
    request: IdentityExportRequest,
    currentProfile: CrossDAOProfile
  ): Promise<PortableIdentityCredential[]> {
    try {
      const credentials: PortableIdentityCredential[] = [];
      const issuerDID = currentProfile.did;

      // Export profile data if requested
      if (request.includeProfileData && this.isPrivacyAllowed('profileData', request.privacySettings)) {
        const profileCredential = await this.createProfileCredential(
          issuerDID,
          currentProfile.profileData,
          request.expirationPeriod
        );
        credentials.push(profileCredential);
      }

      // Export reputation data if requested
      if (request.includeReputation && this.isPrivacyAllowed('reputation', request.privacySettings)) {
        const reputationCredential = await this.createReputationCredential(
          issuerDID,
          currentProfile.reputation,
          request.expirationPeriod
        );
        credentials.push(reputationCredential);
      }

      // Export achievements if requested
      if (request.includeAchievements && this.isPrivacyAllowed('achievements', request.privacySettings)) {
        const achievementsCredential = await this.createAchievementsCredential(
          issuerDID,
          currentProfile.reputation.achievements,
          request.expirationPeriod
        );
        credentials.push(achievementsCredential);
      }

      // Export badges if requested
      if (request.includeBadges && this.isPrivacyAllowed('badges', request.privacySettings)) {
        const badgesCredential = await this.createBadgesCredential(
          issuerDID,
          currentProfile.reputation.badges,
          request.expirationPeriod
        );
        credentials.push(badgesCredential);
      }

      // Export DAO memberships if requested
      if (request.includeDaoMemberships && this.isPrivacyAllowed('daoMemberships', request.privacySettings)) {
        const membershipsCredential = await this.createMembershipsCredential(
          issuerDID,
          currentProfile.daoMemberships,
          request.expirationPeriod
        );
        credentials.push(membershipsCredential);
      }

      // Filter by target DAOs if specified
      if (request.targetDAOs && request.targetDAOs.length > 0) {
        return this.filterCredentialsByTargetDAOs(credentials, request.targetDAOs);
      }

      return credentials;
    } catch (error) {
      throw new CredentialError('Failed to export identity', 'EXPORT_ERROR', undefined, error);
    }
  }

  // Create a profile credential
  private async createProfileCredential(
    issuerDID: string,
    profileData: ProfileData,
    expirationDays?: number
  ): Promise<PortableIdentityCredential> {
    try {
      const credential = await didManager.createPortableCredential(
        issuerDID,
        issuerDID,
        {
          type: 'ProfileData',
          profileData: this.filterProfileData(profileData)
        },
        expirationDays
      );

      return credential;
    } catch (error) {
      throw new CredentialError('Failed to create profile credential', 'CREDENTIAL_CREATION_ERROR', undefined, error);
    }
  }

  // Create a reputation credential
  private async createReputationCredential(
    issuerDID: string,
    reputationData: ReputationData,
    expirationDays?: number
  ): Promise<PortableIdentityCredential> {
    try {
      const credential = await didManager.createPortableCredential(
        issuerDID,
        issuerDID,
        {
          type: 'ReputationData',
          reputationData: this.filterReputationData(reputationData)
        },
        expirationDays
      );

      return credential;
    } catch (error) {
      throw new CredentialError('Failed to create reputation credential', 'CREDENTIAL_CREATION_ERROR', undefined, error);
    }
  }

  // Create an achievements credential
  private async createAchievementsCredential(
    issuerDID: string,
    achievements: any[],
    expirationDays?: number
  ): Promise<PortableIdentityCredential> {
    try {
      const credential = await didManager.createPortableCredential(
        issuerDID,
        issuerDID,
        {
          type: 'Achievements',
          achievements: achievements.filter(achievement => 
            achievement.rarity !== 'legendary' // Filter out ultra-rare achievements for privacy
          )
        },
        expirationDays
      );

      return credential;
    } catch (error) {
      throw new CredentialError('Failed to create achievements credential', 'CREDENTIAL_CREATION_ERROR', undefined, error);
    }
  }

  // Create a badges credential
  private async createBadgesCredential(
    issuerDID: string,
    badges: any[],
    expirationDays?: number
  ): Promise<PortableIdentityCredential> {
    try {
      const credential = await didManager.createPortableCredential(
        issuerDID,
        issuerDID,
        {
          type: 'Badges',
          badges: badges.filter(badge => 
            !badge.expiresAt || new Date(badge.expiresAt) > new Date()
          )
        },
        expirationDays
      );

      return credential;
    } catch (error) {
      throw new CredentialError('Failed to create badges credential', 'CREDENTIAL_CREATION_ERROR', undefined, error);
    }
  }

  // Create a DAO memberships credential
  private async createMembershipsCredential(
    issuerDID: string,
    memberships: DAOMembership[],
    expirationDays?: number
  ): Promise<PortableIdentityCredential> {
    try {
      const credential = await didManager.createPortableCredential(
        issuerDID,
        issuerDID,
        {
          type: 'DAOMemberships',
          memberships: memberships.filter(membership => 
            membership.status === 'active'
          )
        },
        expirationDays
      );

      return credential;
    } catch (error) {
      throw new CredentialError('Failed to create memberships credential', 'CREDENTIAL_CREATION_ERROR', undefined, error);
    }
  }

  // Filter credentials by target DAOs
  private filterCredentialsByTargetDAOs(
    credentials: PortableIdentityCredential[],
    targetDAOs: string[]
  ): PortableIdentityCredential[] {
    return credentials.filter(credential => {
      const subject = credential.credentialSubject;
      
      // Check if credential contains DAO-specific data
      if (subject.type === 'DAOMemberships') {
        return subject.memberships.some((membership: DAOMembership) => 
          targetDAOs.indexOf(membership.daoId) !== -1
        );
      }
      
      if (subject.type === 'ReputationData') {
        return subject.reputationData.daoReputations.some((daoRep: any) => 
          targetDAOs.indexOf(daoRep.daoId) !== -1
        );
      }
      
      if (subject.type === 'Achievements') {
        return subject.achievements.some((achievement: any) => 
          targetDAOs.indexOf(achievement.daoId) !== -1
        );
      }
      
      // For profile data, include it as it's generally useful
      return subject.type === 'ProfileData';
    });
  }

  // Check if data type is allowed by privacy settings
  private isPrivacyAllowed(dataType: string, privacySettings: PrivacySettings): boolean {
    switch (dataType) {
      case 'profileData':
        return privacySettings.shareProfileData;
      case 'reputation':
        return privacySettings.shareReputation;
      case 'achievements':
        return privacySettings.shareAchievements;
      case 'badges':
        return privacySettings.shareBadges;
      case 'daoMemberships':
        return privacySettings.shareDaoMemberships;
      default:
        return false;
    }
  }

  // Filter profile data based on privacy
  private filterProfileData(profileData: ProfileData): Partial<ProfileData> {
    const filtered: Partial<ProfileData> = {
      username: profileData.username,
      displayName: profileData.displayName,
      verificationStatus: profileData.verificationStatus
    };

    // Include optional fields if they exist
    if (profileData.bio) filtered.bio = profileData.bio;
    if (profileData.avatar) filtered.avatar = profileData.avatar;
    if (profileData.location) filtered.location = profileData.location;
    if (profileData.website) filtered.website = profileData.website;
    if (profileData.socialLinks) filtered.socialLinks = profileData.socialLinks;

    return filtered;
  }

  // Filter reputation data based on privacy
  private filterReputationData(reputationData: ReputationData): Partial<ReputationData> {
    return {
      totalReputation: reputationData.totalReputation,
      daoReputations: reputationData.daoReputations.map(daoRep => ({
        daoId: daoRep.daoId,
        daoName: daoRep.daoName,
        reputation: daoRep.reputation,
        level: daoRep.level,
        joinDate: daoRep.joinDate,
        contributions: 0, // Exclude for privacy
        ratings: [] // Exclude for privacy
      })),
      achievements: reputationData.achievements.filter(achievement => 
        achievement.rarity !== 'legendary'
      ),
      badges: reputationData.badges.filter(badge => 
        !badge.expiresAt || new Date(badge.expiresAt) > new Date()
      ),
      lastCalculated: reputationData.lastCalculated
    };
  }

  // Generate export summary
  generateExportSummary(credentials: PortableIdentityCredential[]): {
    totalCredentials: number;
    credentialTypes: string[];
    expirationDates: string[];
    dataTypes: string[];
  } {
    const credentialTypes = credentials.map(c => c.type.join(', '));
    const expirationDates = credentials
      .filter(c => c.expirationDate)
      .map(c => c.expirationDate!);
    const dataTypes = credentials.map(c => c.credentialSubject.type);

    return {
      totalCredentials: credentials.length,
      credentialTypes: [...new Set(credentialTypes)],
      expirationDates,
      dataTypes: [...new Set(dataTypes)]
    };
  }

  // Export credentials to JSON format for download
  exportToJSON(credentials: PortableIdentityCredential[]): string {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      credentials: credentials,
      summary: this.generateExportSummary(credentials)
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Export credentials to QR code data (simplified)
  exportToQRCode(credentials: PortableIdentityCredential[]): string {
    // For QR codes, we need to keep the data small
    // Just export the credential hashes and basic info
    const qrData = {
      type: 'CrossDAOIdentityExport',
      version: '1.0',
      timestamp: new Date().toISOString(),
      credentialHashes: credentials.map(c => ({
        type: c.type.join(','),
        issuer: c.issuer,
        subject: c.credentialSubject.id,
        issuanceDate: c.issuanceDate,
        hash: this.generateCredentialHash(c)
      }))
    };

    return btoa(JSON.stringify(qrData));
  }

  // Generate a simple hash for a credential (placeholder)
  private generateCredentialHash(credential: PortableIdentityCredential): string {
    const credentialString = JSON.stringify({
      issuer: credential.issuer,
      subject: credential.credentialSubject.id,
      type: credential.type,
      issuanceDate: credential.issuanceDate
    });
    
    return btoa(credentialString).slice(0, 16);
  }

  // Validate export request
  validateExportRequest(request: IdentityExportRequest): string[] {
    const errors: string[] = [];

    if (!request.did) {
      errors.push('DID is required');
    }

    if (!request.privacySettings) {
      errors.push('Privacy settings are required');
    }

    if (request.expirationPeriod && request.expirationPeriod < 1) {
      errors.push('Expiration period must be at least 1 day');
    }

    if (request.expirationPeriod && request.expirationPeriod > 365) {
      errors.push('Expiration period cannot exceed 365 days');
    }

    if (request.targetDAOs && request.targetDAOs.length > 10) {
      errors.push('Cannot export to more than 10 target DAOs at once');
    }

    return errors;
  }

  // Store exported credentials for later retrieval
  async storeExportedCredentials(
    publicKey: string,
    credentials: PortableIdentityCredential[]
  ): Promise<string[]> {
    try {
      const storagePromises = credentials.map(credential =>
        simpleStellarIdentityStorage.storeCredential(publicKey, credential)
      );

      const results = await Promise.all(storagePromises);
      return results;
    } catch (error) {
      throw new CredentialError('Failed to store exported credentials', 'STORAGE_ERROR', undefined, error);
    }
  }

  // Get previously exported credentials
  async getExportedCredentials(publicKey: string): Promise<PortableIdentityCredential[]> {
    try {
      const credentialIds = await simpleStellarIdentityStorage.listCredentials(publicKey);
      const credentialPromises = credentialIds.map(id =>
        simpleStellarIdentityStorage.retrieveCredential(publicKey, id)
      );

      const credentials = await Promise.all(credentialPromises);
      return credentials.filter((c): c is PortableIdentityCredential => c !== null);
    } catch (error) {
      throw new CredentialError('Failed to retrieve exported credentials', 'RETRIEVAL_ERROR', undefined, error);
    }
  }
}

export const identityExporter = IdentityExporter.getInstance();
