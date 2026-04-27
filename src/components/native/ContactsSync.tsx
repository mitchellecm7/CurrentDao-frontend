'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Sync, SyncOff, Search, CheckCircle, AlertCircle, UserPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TradingPartner {
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
}

interface ContactsSyncProps {
  onPartnersUpdate?: (partners: TradingPartner[]) => void;
  enableAutoSync?: boolean;
  syncInterval?: number; // minutes
}

const ContactsSync: React.FC<ContactsSyncProps> = ({
  onPartnersUpdate,
  enableAutoSync = false,
  syncInterval = 30,
}) => {
  const [partners, setPartners] = useState<TradingPartner[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [syncStats, setSyncStats] = useState({
    totalContacts: 0,
    tradingPartners: 0,
    newlyAdded: 0,
    updated: 0,
  });

  // Check for contacts API availability and permissions
  const checkContactsPermission = useCallback(async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const contacts = await (navigator as any).contacts.select(['name', 'email', 'tel'], { multiple: true });
        setPermissionStatus('granted');
        return true;
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('prompt');
        }
        return false;
      }
    }
    return false;
  }, []);

  // Import contacts from native device
  const importNativeContacts = useCallback(async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      toast.error('Contacts API not supported on this device');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Request contacts permission
      const hasPermission = await checkContactsPermission();
      if (!hasPermission) {
        toast.error('Contacts permission denied');
        setIsSyncing(false);
        return;
      }

      // Select contacts
      const contacts = await (navigator as any).contacts.select(
        ['name', 'email', 'tel', 'address'],
        { multiple: true }
      );

      setSyncProgress(25);

      // Process contacts and identify potential trading partners
      const processedPartners: TradingPartner[] = [];
      let newlyAdded = 0;
      let updated = 0;

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const progress = 25 + (i / contacts.length) * 50;
        setSyncProgress(progress);

        // Check if contact might be a trading partner based on name/email patterns
        const isTradingPartner = isPotentialTradingPartner(contact);
        
        if (isTradingPartner) {
          const partner: TradingPartner = {
            id: generatePartnerId(contact),
            name: `${contact.name[0].given} ${contact.name[0].family}`,
            email: contact.email?.[0],
            phone: contact.tel?.[0],
            energyType: inferEnergyType(contact),
            averageProduction: estimateProduction(contact),
            trustScore: calculateTrustScore(contact),
            lastSync: new Date(),
            isNativeContact: true,
          };

          // Check if partner already exists
          const existingPartner = partners.find(p => p.id === partner.id);
          if (existingPartner) {
            // Update existing partner
            Object.assign(existingPartner, partner);
            updated++;
          } else {
            // Add new partner
            processedPartners.push(partner);
            newlyAdded++;
          }
        }
      }

      setSyncProgress(90);

      // Update partners list
      const updatedPartners = [...partners.filter(p => !processedPartners.find(np => np.id === p.id)), ...processedPartners];
      setPartners(updatedPartners);
      onPartnersUpdate?.(updatedPartners);

      setSyncProgress(100);
      setLastSyncTime(new Date());
      setSyncStats({
        totalContacts: contacts.length,
        tradingPartners: processedPartners.length,
        newlyAdded,
        updated,
      });

      toast.success(`Synced ${contacts.length} contacts, found ${processedPartners.length} trading partners`);

    } catch (error) {
      console.error('Contacts sync failed:', error);
      toast.error('Failed to sync contacts');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  }, [partners, onPartnersUpdate, checkContactsPermission]);

  // Helper function to determine if contact might be a trading partner
  const isPotentialTradingPartner = (contact: any): boolean => {
    const name = `${contact.name?.[0]?.given || ''} ${contact.name?.[0]?.family || ''}`.toLowerCase();
    const email = contact.email?.[0]?.toLowerCase() || '';
    const phone = contact.tel?.[0] || '';

    // Keywords that might indicate energy trading involvement
    const energyKeywords = ['energy', 'solar', 'wind', 'power', 'grid', 'electric', 'renewable'];
    
    return energyKeywords.some(keyword => 
      name.includes(keyword) || 
      email.includes(keyword) ||
      email.includes('energy') ||
      email.includes('power')
    );
  };

  // Infer energy type based on contact information
  const inferEnergyType = (contact: any): TradingPartner['energyType'] => {
    const email = contact.email?.[0]?.toLowerCase() || '';
    const name = `${contact.name?.[0]?.given || ''} ${contact.name?.[0]?.family || ''}`.toLowerCase();

    if (email.includes('solar') || name.includes('solar')) return 'solar';
    if (email.includes('wind') || name.includes('wind')) return 'wind';
    if (email.includes('hydro') || name.includes('hydro')) return 'hydro';
    if (email.includes('grid') || name.includes('grid')) return 'grid';
    
    return 'mixed';
  };

  // Estimate energy production (simplified heuristic)
  const estimateProduction = (contact: any): number => {
    // This would normally use more sophisticated logic or API calls
    return Math.floor(Math.random() * 10000) + 1000; // 1,000 - 11,000 kWh
  };

  // Calculate trust score based on contact completeness and other factors
  const calculateTrustScore = (contact: any): number => {
    let score = 50; // Base score
    
    if (contact.email?.length) score += 15;
    if (contact.tel?.length) score += 15;
    if (contact.address?.length) score += 10;
    if (contact.name?.[0]?.given && contact.name?.[0]?.family) score += 10;
    
    return Math.min(score, 100);
  };

  // Generate unique partner ID
  const generatePartnerId = (contact: any): string => {
    const name = `${contact.name?.[0]?.given || ''}${contact.name?.[0]?.family || ''}`;
    const email = contact.email?.[0] || '';
    return btoa(`${name}-${email}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  };

  // Manual partner addition
  const addManualPartner = useCallback(() => {
    const newPartner: TradingPartner = {
      id: `manual-${Date.now()}`,
      name: 'New Trading Partner',
      energyType: 'mixed',
      averageProduction: 5000,
      trustScore: 50,
      lastSync: new Date(),
      isNativeContact: false,
    };

    const updatedPartners = [...partners, newPartner];
    setPartners(updatedPartners);
    onPartnersUpdate?.(updatedPartners);
    toast.success('Added new trading partner');
  }, [partners, onPartnersUpdate]);

  // Remove partner
  const removePartner = useCallback((partnerId: string) => {
    const updatedPartners = partners.filter(p => p.id !== partnerId);
    setPartners(updatedPartners);
    onPartnersUpdate?.(updatedPartners);
    toast.success('Trading partner removed');
  }, [partners, onPartnersUpdate]);

  // Filter partners based on search
  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.energyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-sync functionality
  useEffect(() => {
    if (enableAutoSync && permissionStatus === 'granted') {
      const interval = setInterval(() => {
        importNativeContacts();
      }, syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [enableAutoSync, syncInterval, permissionStatus, importNativeContacts]);

  // Check permissions on mount
  useEffect(() => {
    checkContactsPermission();
  }, [checkContactsPermission]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 border-green-500 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-green-500" />
          <h3 className="text-white font-bold text-lg">Trading Partners Sync</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            permissionStatus === 'granted' ? 'bg-green-500/20 text-green-400' :
            permissionStatus === 'denied' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {permissionStatus === 'granted' ? 'Connected' :
             permissionStatus === 'denied' ? 'Denied' : 'Not Connected'}
          </span>
          {lastSyncTime && (
            <span className="text-xs text-gray-400">
              Last: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Sync Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={importNativeContacts}
          disabled={isSyncing || permissionStatus === 'denied'}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {isSyncing ? (
            <SyncOff className="w-4 h-4 animate-spin" />
          ) : (
            <Sync className="w-4 h-4" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync Contacts'}
        </button>

        <button
          onClick={addManualPartner}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Sync Progress</span>
            <span>{syncProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search trading partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Sync Stats */}
      {syncStats.totalContacts > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{syncStats.totalContacts}</div>
            <div className="text-xs text-gray-400">Total Contacts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{syncStats.tradingPartners}</div>
            <div className="text-xs text-gray-400">Trading Partners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{syncStats.newlyAdded}</div>
            <div className="text-xs text-gray-400">New Partners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{syncStats.updated}</div>
            <div className="text-xs text-gray-400">Updated</div>
          </div>
        </div>
      )}

      {/* Partners List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPartners.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No trading partners found</p>
            <p className="text-sm mt-2">Sync contacts or add partners manually</p>
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-green-500 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{partner.name}</div>
                    <div className="text-sm text-gray-400">
                      {partner.energyType} • {partner.averageProduction.toLocaleString()} kWh/year
                    </div>
                    {partner.isNativeContact && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Native Contact
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-green-400">
                    Trust: {partner.trustScore}%
                  </div>
                  <div className="text-xs text-gray-400">
                    Score: {partner.trustScore}/100
                  </div>
                </div>
                <button
                  onClick={() => removePartner(partner.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${partners.length >= 1000 ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>
            {partners.length >= 1000 ? '✓ Supports 1000+ partners' : `${partners.length}/1000 partners loaded`}
          </span>
        </div>
        {enableAutoSync && (
          <span>Auto-sync: {syncInterval}min</span>
        )}
      </div>
    </div>
  );
};

export default ContactsSync;
