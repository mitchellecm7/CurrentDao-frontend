import { ThemeSyncData, CustomTheme } from '@/types/theme-engine'

export class ThemeSyncService {
  private static instance: ThemeSyncService
  private syncInterval: NodeJS.Timeout | null = null
  private deviceId: string
  private userId: string | null = null
  private lastSyncTime: Date | null = null
  private isOnline: boolean = navigator.onLine

  private constructor() {
    this.deviceId = this.generateDeviceId()
    this.setupEventListeners()
  }

  static getInstance(): ThemeSyncService {
    if (!ThemeSyncService.instance) {
      ThemeSyncService.instance = new ThemeSyncService()
    }
    return ThemeSyncService.instance
  }

  private generateDeviceId(): string {
    const stored = localStorage.getItem('theme-sync-device-id')
    if (stored) return stored

    const deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('theme-sync-device-id', deviceId)
    return deviceId
  }

  private setupEventListeners(): void {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.attemptSync()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Monitor storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'currentdao-theme-sync') {
        this.handleStorageChange(e.newValue)
      }
    })
  }

  private handleStorageChange(newValue: string | null): void {
    if (!newValue) return

    try {
      const syncData = JSON.parse(newValue) as ThemeSyncData
      if (syncData.userId === this.userId) return // Ignore own changes

      // Apply synced themes if newer
      if (syncData.settings.lastSync > (this.lastSyncTime || new Date(0))) {
        this.applySyncedThemes(syncData.themes)
        this.lastSyncTime = syncData.settings.lastSync
      }
    } catch (error) {
      console.error('Failed to handle storage change:', error)
    }
  }

  private applySyncedThemes(themes: CustomTheme[]): void {
    const currentThemes = this.getLocalThemes()
    const mergedThemes = this.mergeThemes(currentThemes, themes)
    
    localStorage.setItem('currentdao-custom-themes', JSON.stringify(mergedThemes))
    
    // Dispatch custom event for theme engine to update
    window.dispatchEvent(new CustomEvent('theme-sync-update', {
      detail: { themes: mergedThemes }
    }))
  }

  private mergeThemes(local: CustomTheme[], remote: CustomTheme[]): CustomTheme[] {
    const themeMap = new Map<string, CustomTheme>()

    // Add local themes
    local.forEach(theme => {
      themeMap.set(theme.id, theme)
    })

    // Merge with remote themes (remote takes precedence if newer)
    remote.forEach(theme => {
      const existing = themeMap.get(theme.id)
      if (!existing || theme.metadata.updatedAt > existing.metadata.updatedAt) {
        themeMap.set(theme.id, theme)
      }
    })

    return Array.from(themeMap.values())
  }

  private getLocalThemes(): CustomTheme[] {
    try {
      const stored = localStorage.getItem('currentdao-custom-themes')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private async attemptSync(): Promise<void> {
    if (!this.isOnline || !this.userId) return

    try {
      await this.syncThemes()
    } catch (error) {
      console.error('Auto sync failed:', error)
    }
  }

  async initialize(userId: string): Promise<void> {
    this.userId = userId

    try {
      // Load themes from cloud storage
      const cloudThemes = await this.loadFromCloud()
      const localThemes = this.getLocalThemes()
      
      const mergedThemes = this.mergeThemes(localThemes, cloudThemes)
      
      // Save merged themes locally
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(mergedThemes))
      
      // Update sync data
      const syncData: ThemeSyncData = {
        userId: this.userId,
        themes: mergedThemes,
        settings: {
          autoSync: true,
          syncInterval: 300000, // 5 minutes
          lastSync: new Date(),
          deviceId: this.deviceId,
        }
      }
      
      localStorage.setItem('currentdao-theme-sync', JSON.stringify(syncData))
      this.lastSyncTime = syncData.settings.lastSync

      // Start auto-sync
      this.startAutoSync(syncData.settings.syncInterval)

      // Dispatch update event
      window.dispatchEvent(new CustomEvent('theme-sync-update', {
        detail: { themes: mergedThemes }
      }))

    } catch (error) {
      console.error('Failed to initialize sync:', error)
      throw error
    }
  }

  private startAutoSync(interval: number): void {
    this.stopAutoSync()
    this.syncInterval = setInterval(() => {
      this.attemptSync()
    }, interval)
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async syncThemes(): Promise<void> {
    if (!this.userId || !this.isOnline) {
      throw new Error('Cannot sync: user not authenticated or offline')
    }

    try {
      const localThemes = this.getLocalThemes()
      
      // Upload to cloud storage
      await this.saveToCloud(localThemes)
      
      // Update sync data
      const syncData: ThemeSyncData = {
        userId: this.userId,
        themes: localThemes,
        settings: {
          autoSync: true,
          syncInterval: 300000,
          lastSync: new Date(),
          deviceId: this.deviceId,
        }
      }
      
      localStorage.setItem('currentdao-theme-sync', JSON.stringify(syncData))
      this.lastSyncTime = syncData.settings.lastSync

      // Dispatch sync event
      window.dispatchEvent(new CustomEvent('theme-sync-complete', {
        detail: { timestamp: syncData.settings.lastSync }
      }))

    } catch (error) {
      console.error('Sync failed:', error)
      throw error
    }
  }

  private async saveToCloud(themes: CustomTheme[]): Promise<void> {
    // In a real implementation, this would save to a cloud service
    // For now, we'll simulate with localStorage and broadcast to other tabs
    const syncData: ThemeSyncData = {
      userId: this.userId!,
      themes,
      settings: {
        autoSync: true,
        syncInterval: 300000,
        lastSync: new Date(),
        deviceId: this.deviceId,
      }
    }

    localStorage.setItem('currentdao-theme-sync', JSON.stringify(syncData))
    
    // Broadcast to other tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('theme-sync')
      channel.postMessage({
        type: 'sync-update',
        data: syncData
      })
    }
  }

  private async loadFromCloud(): Promise<CustomTheme[]> {
    // In a real implementation, this would load from a cloud service
    // For now, we'll simulate with localStorage
    const syncData = localStorage.getItem('currentdao-theme-sync')
    if (syncData) {
      const parsed = JSON.parse(syncData) as ThemeSyncData
      return parsed.themes
    }
    return []
  }

  async exportThemes(): Promise<string> {
    const themes = this.getLocalThemes()
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      deviceId: this.deviceId,
      themes,
    }

    return JSON.stringify(exportData, null, 2)
  }

  async importThemes(data: string): Promise<CustomTheme[]> {
    try {
      const importData = JSON.parse(data)
      
      if (!importData.themes || !Array.isArray(importData.themes)) {
        throw new Error('Invalid import data format')
      }

      const importedThemes = importData.themes as CustomTheme[]
      const localThemes = this.getLocalThemes()
      
      // Merge imported themes with local themes
      const mergedThemes = this.mergeThemes(localThemes, importedThemes)
      
      // Save locally
      localStorage.setItem('currentdao-custom-themes', JSON.stringify(mergedThemes))
      
      // Sync to cloud if user is authenticated
      if (this.userId && this.isOnline) {
        await this.saveToCloud(mergedThemes)
      }

      // Dispatch update event
      window.dispatchEvent(new CustomEvent('theme-sync-update', {
        detail: { themes: mergedThemes }
      }))

      return importedThemes

    } catch (error) {
      console.error('Import failed:', error)
      throw error
    }
  }

  getSyncStatus(): {
    isOnline: boolean
    lastSync: Date | null
    userId: string | null
    deviceId: string
    autoSyncEnabled: boolean
  } {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      userId: this.userId,
      deviceId: this.deviceId,
      autoSyncEnabled: this.syncInterval !== null,
    }
  }

  enableAutoSync(interval: number = 300000): void {
    if (this.userId) {
      this.startAutoSync(interval)
    }
  }

  disableAutoSync(): void {
    this.stopAutoSync()
  }

  async forceSync(): Promise<void> {
    await this.syncThemes()
  }

  clearLocalData(): void {
    localStorage.removeItem('currentdao-custom-themes')
    localStorage.removeItem('currentdao-theme-sync')
    this.lastSyncTime = null
  }

  destroy(): void {
    this.stopAutoSync()
    this.clearLocalData()
  }
}

// Export singleton instance
export const themeSyncService = ThemeSyncService.getInstance()
