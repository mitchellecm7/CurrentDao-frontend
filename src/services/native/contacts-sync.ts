export interface TradingPartner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
  energyType: 'solar' | 'wind' | 'hydro' | 'grid' | 'mixed';
  averageProduction: number; // kWh
  trustScore: number; // 0-100
  lastSync?: Date;
  isNativeContact?: boolean;
  source: 'native' | 'manual' | 'import';
  metadata?: {
    company?: string;
    location?: string;
    rating?: number;
    verified?: boolean;
  };
}

export interface ContactSyncResult {
  totalContacts: number;
  tradingPartners: number;
  newlyAdded: number;
  updated: number;
  errors: string[];
  duration: number;
}

export interface SyncProgress {
  step: string;
  progress: number; // 0-100
  current?: number;
  total?: number;
}

class ContactsSyncService {
  private static readonly STORAGE_KEY = 'currentdao_trading_partners';
  private static readonly SYNC_SETTINGS_KEY = 'currentdao_sync_settings';

  /**
   * Check if contacts API is available
   */
  isContactsAPIAvailable(): boolean {
    return !!(navigator as any).contacts && 'ContactsManager' in window;
  }

  /**
   * Check contacts permission status
   */
  async checkContactsPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!this.isContactsAPIAvailable()) {
      return 'denied';
    }

    try {
      // Try to select contacts to check permission
      await (navigator as any).contacts.select(['name'], { multiple: false });
      return 'granted';
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return 'denied';
      }
      return 'prompt';
    }
  }

  /**
   * Request contacts permission
   */
  async requestContactsPermission(): Promise<boolean> {
    if (!this.isContactsAPIAvailable()) {
      return false;
    }

    try {
      await (navigator as any).contacts.select(['name'], { multiple: false });
      return true;
    } catch (error) {
      console.error('Contacts permission denied:', error);
      return false;
    }
  }

  /**
   * Get native contacts from device
   */
  async getNativeContacts(
    properties: string[] = ['name', 'email', 'tel', 'address'],
    onProgress?: (progress: SyncProgress) => void
  ): Promise<any[]> {
    if (!this.isContactsAPIAvailable()) {
      throw new Error('Contacts API not available');
    }

    onProgress?.({
      step: 'Requesting contacts access',
      progress: 10,
    });

    try {
      const contacts = await (navigator as any).contacts.select(properties, {
        multiple: true,
      });

      onProgress?.({
        step: 'Processing contacts',
        progress: 50,
        current: 0,
        total: contacts.length,
      });

      // Process contacts with progress updates
      const processedContacts = [];
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        processedContacts.push(this.normalizeContact(contact));

        onProgress?.({
          step: 'Processing contacts',
          progress: 50 + (i / contacts.length) * 40,
          current: i + 1,
          total: contacts.length,
        });
      }

      onProgress?.({
        step: 'Contacts processed',
        progress: 90,
      });

      return processedContacts;
    } catch (error) {
      console.error('Failed to get native contacts:', error);
      throw error;
    }
  }

  /**
   * Normalize contact data
   */
  private normalizeContact(contact: any): any {
    const normalized: any = {
      id: this.generateContactId(contact),
      name: this.formatContactName(contact),
      email: contact.email?.[0] || null,
      phone: contact.tel?.[0] || null,
      address: contact.address?.[0] || null,
    };

    return normalized;
  }

  /**
   * Generate unique contact ID
   */
  private generateContactId(contact: any): string {
    const name = this.formatContactName(contact);
    const email = contact.email?.[0] || '';
    const phone = contact.tel?.[0] || '';
    
    const combined = `${name}-${email}-${phone}`;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Format contact name
   */
  private formatContactName(contact: any): string {
    if (contact.name && contact.name.length > 0) {
      const name = contact.name[0];
      if (name.given && name.family) {
        return `${name.given} ${name.family}`;
      }
      return name.given || name.family || 'Unknown';
    }
    return 'Unknown Contact';
  }

  /**
   * Identify potential trading partners from contacts
   */
  identifyTradingPartners(contacts: any[]): TradingPartner[] {
    const tradingPartners: TradingPartner[] = [];
    const energyKeywords = [
      'energy', 'solar', 'wind', 'power', 'grid', 'electric', 
      'renewable', 'hydro', 'nuclear', 'battery', 'storage'
    ];

    for (const contact of contacts) {
      if (this.isPotentialTradingPartner(contact, energyKeywords)) {
        const partner = this.convertContactToTradingPartner(contact);
        if (partner) {
          tradingPartners.push(partner);
        }
      }
    }

    return tradingPartners;
  }

  /**
   * Check if contact might be a trading partner
   */
  private isPotentialTradingPartner(contact: any, keywords: string[]): boolean {
    const name = contact.name?.toLowerCase() || '';
    const email = contact.email?.[0]?.toLowerCase() || '';
    const phone = contact.tel?.[0] || '';
    
    // Check for energy-related keywords
    const hasEnergyKeyword = keywords.some(keyword => 
      name.includes(keyword) || 
      email.includes(keyword) ||
      email.includes('energy') ||
      email.includes('power')
    );

    // Check for company domains that might indicate energy companies
    const energyDomains = [
      'energy.com', 'power.com', 'solar.com', 'wind.com',
      'electric.com', 'grid.com', 'renewable.com'
    ];
    
    const hasEnergyDomain = energyDomains.some(domain => 
      email.includes(domain)
    );

    return hasEnergyKeyword || hasEnergyDomain;
  }

  /**
   * Convert contact to trading partner
   */
  private convertContactToTradingPartner(contact: any): TradingPartner | null {
    try {
      const partner: TradingPartner = {
        id: this.generateContactId(contact),
        name: this.formatContactName(contact),
        email: contact.email?.[0] || undefined,
        phone: contact.tel?.[0] || undefined,
        energyType: this.inferEnergyType(contact),
        averageProduction: this.estimateProduction(contact),
        trustScore: this.calculateTrustScore(contact),
        lastSync: new Date(),
        isNativeContact: true,
        source: 'native',
        metadata: {
          company: this.extractCompany(contact),
          location: contact.address?.[0]?.city || undefined,
          verified: false,
        },
      };

      return partner;
    } catch (error) {
      console.error('Failed to convert contact to trading partner:', error);
      return null;
    }
  }

  /**
   * Infer energy type from contact information
   */
  private inferEnergyType(contact: any): TradingPartner['energyType'] {
    const name = (contact.name?.[0]?.given || '').toLowerCase();
    const email = contact.email?.[0]?.toLowerCase() || '';

    if (email.includes('solar') || name.includes('solar')) return 'solar';
    if (email.includes('wind') || name.includes('wind')) return 'wind';
    if (email.includes('hydro') || name.includes('hydro')) return 'hydro';
    if (email.includes('grid') || name.includes('grid')) return 'grid';
    
    return 'mixed';
  }

  /**
   * Estimate energy production (simplified heuristic)
   */
  private estimateProduction(contact: any): number {
    // This would normally use more sophisticated logic or API calls
    // For demo purposes, return a reasonable estimate
    const baseProduction = 1000; // kWh
    const randomFactor = Math.random() * 10; // 0-10x multiplier
    return Math.floor(baseProduction * randomFactor);
  }

  /**
   * Calculate trust score based on contact completeness
   */
  private calculateTrustScore(contact: any): number {
    let score = 50; // Base score
    
    if (contact.email?.length) score += 15;
    if (contact.tel?.length) score += 15;
    if (contact.address?.length) score += 10;
    if (contact.name?.[0]?.given && contact.name?.[0]?.family) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Extract company name from contact
   */
  private extractCompany(contact: any): string | undefined {
    const email = contact.email?.[0] || '';
    const domain = email.split('@')[1];
    
    if (domain) {
      const parts = domain.split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    
    return undefined;
  }

  /**
   * Get existing trading partners from storage
   */
  getStoredPartners(): TradingPartner[] {
    try {
      const stored = localStorage.getItem(ContactsSyncService.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load stored partners:', error);
      return [];
    }
  }

  /**
   * Save trading partners to storage
   */
  savePartners(partners: TradingPartner[]): void {
    try {
      localStorage.setItem(
        ContactsSyncService.STORAGE_KEY,
        JSON.stringify(partners)
      );
    } catch (error) {
      console.error('Failed to save partners:', error);
    }
  }

  /**
   * Sync contacts with existing partners
   */
  async syncContacts(
    onProgress?: (progress: SyncProgress) => void
  ): Promise<ContactSyncResult> {
    const startTime = Date.now();
    const result: ContactSyncResult = {
      totalContacts: 0,
      tradingPartners: 0,
      newlyAdded: 0,
      updated: 0,
      errors: [],
      duration: 0,
    };

    try {
      onProgress?.({
        step: 'Getting native contacts',
        progress: 0,
      });

      // Get native contacts
      const nativeContacts = await this.getNativeContacts(
        ['name', 'email', 'tel', 'address'],
        onProgress
      );

      result.totalContacts = nativeContacts.length;

      onProgress?.({
        step: 'Identifying trading partners',
        progress: 95,
      });

      // Identify trading partners
      const newPartners = this.identifyTradingPartners(nativeContacts);
      result.tradingPartners = newPartners.length;

      // Get existing partners
      const existingPartners = this.getStoredPartners();

      // Merge partners
      const { merged, newlyAdded, updated } = this.mergePartners(
        existingPartners,
        newPartners
      );

      result.newlyAdded = newlyAdded;
      result.updated = updated;

      // Save merged partners
      this.savePartners(merged);

      result.duration = Date.now() - startTime;

      onProgress?.({
        step: 'Sync complete',
        progress: 100,
      });

      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Merge existing and new partners
   */
  private mergePartners(
    existing: TradingPartner[],
    newPartners: TradingPartner[]
  ): {
    merged: TradingPartner[];
    newlyAdded: number;
    updated: number;
  } {
    const merged = [...existing];
    let newlyAdded = 0;
    let updated = 0;

    for (const newPartner of newPartners) {
      const existingIndex = merged.findIndex(p => p.id === newPartner.id);
      
      if (existingIndex >= 0) {
        // Update existing partner
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...newPartner,
          lastSync: new Date(),
          source: 'native',
        };
        updated++;
      } else {
        // Add new partner
        merged.push(newPartner);
        newlyAdded++;
      }
    }

    return { merged, newlyAdded, updated };
  }

  /**
   * Add manual trading partner
   */
  addManualPartner(partner: Omit<TradingPartner, 'id' | 'source' | 'lastSync'>): TradingPartner {
    const newPartner: TradingPartner = {
      ...partner,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: 'manual',
      lastSync: new Date(),
    };

    const existing = this.getStoredPartners();
    const updated = [...existing, newPartner];
    this.savePartners(updated);

    return newPartner;
  }

  /**
   * Remove trading partner
   */
  removePartner(partnerId: string): boolean {
    const existing = this.getStoredPartners();
    const filtered = existing.filter(p => p.id !== partnerId);
    
    if (filtered.length < existing.length) {
      this.savePartners(filtered);
      return true;
    }
    
    return false;
  }

  /**
   * Update trading partner
   */
  updatePartner(partnerId: string, updates: Partial<TradingPartner>): boolean {
    const existing = this.getStoredPartners();
    const index = existing.findIndex(p => p.id === partnerId);
    
    if (index >= 0) {
      existing[index] = {
        ...existing[index],
        ...updates,
        lastSync: new Date(),
      };
      this.savePartners(existing);
      return true;
    }
    
    return false;
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    totalPartners: number;
    nativeContacts: number;
    manualContacts: number;
    lastSync: Date | null;
    averageTrustScore: number;
  } {
    const partners = this.getStoredPartners();
    
    const stats = {
      totalPartners: partners.length,
      nativeContacts: partners.filter(p => p.source === 'native').length,
      manualContacts: partners.filter(p => p.source === 'manual').length,
      lastSync: partners.length > 0 
        ? new Date(Math.max(...partners.map(p => p.lastSync?.getTime() || 0)))
        : null,
      averageTrustScore: partners.length > 0
        ? partners.reduce((sum, p) => sum + p.trustScore, 0) / partners.length
        : 0,
    };

    return stats;
  }

  /**
   * Export partners to JSON
   */
  exportPartners(): string {
    const partners = this.getStoredPartners();
    return JSON.stringify(partners, null, 2);
  }

  /**
   * Import partners from JSON
   */
  importPartners(jsonData: string): { imported: number; errors: string[] } {
    const result = { imported: 0, errors: [] };

    try {
      const imported = JSON.parse(jsonData);
      
      if (!Array.isArray(imported)) {
        throw new Error('Invalid data format');
      }

      const existing = this.getStoredPartners();
      const merged = [...existing];

      for (const partner of imported) {
        try {
          // Validate partner structure
          if (!partner.name || !partner.id) {
            throw new Error('Invalid partner data');
          }

          // Check if already exists
          const existingIndex = merged.findIndex(p => p.id === partner.id);
          
          if (existingIndex >= 0) {
            merged[existingIndex] = {
              ...merged[existingIndex],
              ...partner,
              source: 'import',
              lastSync: new Date(),
            };
          } else {
            merged.push({
              ...partner,
              source: 'import',
              lastSync: new Date(),
            });
          }

          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.savePartners(merged);
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
}

// Export singleton instance
export const contactsSyncService = new ContactsSyncService();
export default contactsSyncService;
