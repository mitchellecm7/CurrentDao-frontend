/* global self, caches, fetch */

const CACHE_NAME = 'currentdao-v1'
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json', '/favicon.ico']

// Background sync configuration
const SYNC_CONFIG = {
  backgroundSync: true,
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
}

// Store sync queue and status
let syncQueue = new Map()
let syncStatus = new Map()
let backgroundSyncTimer = null

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return response
        })
      })
      .catch(() => undefined),
  )
})

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
          return undefined
        }),
      )
    }),
  )
})

self.addEventListener('push', (event) => {
  const defaults = {
    title: 'CurrentDao',
    body: '',
    icon: '/icons/icon-192x192.png',
    image: undefined,
    tag: 'currentdao',
    url: '/',
    actions: undefined,
    data: {},
  }

  event.waitUntil(
    (async () => {
      let payload = { ...defaults }
      if (event.data) {
        try {
          const parsed = await event.data.json()
          payload = { ...defaults, ...parsed }
        } catch {
          try {
            const text = await event.data.text()
            payload = { ...defaults, ...JSON.parse(text) }
          } catch {
            /* use defaults */
          }
        }
      }

      const notificationId =
        payload.notificationId || payload.data?.notificationId || `push-${Date.now()}`
      const data = {
        ...(typeof payload.data === 'object' && payload.data ? payload.data : {}),
        url: payload.url || '/',
        notificationId,
      }

      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        image: payload.image,
        tag: payload.tag,
        data,
        actions: payload.actions,
      })
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const rootData = event.notification.data || {}
  let targetUrl = typeof rootData.url === 'string' ? rootData.url : '/'

  if (event.action && rootData.actions && typeof rootData.actions === 'object') {
    const mapped = rootData.actions[event.action]
    if (typeof mapped === 'string') targetUrl = mapped
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlObj = new URL(targetUrl, self.location.origin)
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if ('focus' in client && client.url && client.url.indexOf(urlObj.pathname) >= 0) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlObj.href)
      }
      return undefined
    }),
  )
})

self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {}
  const notificationId = data.notificationId || null
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_DISMISSED',
          notificationId,
        })
      })
    }),
  )
})

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' })
      })
    }),
  )
})

// Background sync functionality
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'START_BACKGROUND_SYNC':
      startBackgroundSync(data)
      break
    case 'STOP_BACKGROUND_SYNC':
      stopBackgroundSync()
      break
    case 'SYNC_REQUEST':
      handleSyncRequest(data)
      break
    case 'GET_SYNC_STATUS':
      event.ports[0].postMessage({
        type: 'SYNC_STATUS_RESPONSE',
        status: getSyncStatus()
      })
      break
  }
})

function startBackgroundSync(config = {}) {
  if (!SYNC_CONFIG.backgroundSync) return
  
  const syncConfig = { ...SYNC_CONFIG, ...config }
  
  // Clear existing timer
  if (backgroundSyncTimer) {
    clearInterval(backgroundSyncTimer)
  }
  
  // Start periodic sync
  backgroundSyncTimer = setInterval(() => {
    performBackgroundSync()
  }, syncConfig.syncInterval)
  
  // Initial sync
  performBackgroundSync()
}

function stopBackgroundSync() {
  if (backgroundSyncTimer) {
    clearInterval(backgroundSyncTimer)
    backgroundSyncTimer = null
  }
}

function performBackgroundSync() {
  const clients = self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  
  clients.then(clientList => {
    clientList.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_TRIGGER',
        timestamp: Date.now()
      })
    })
  })
}

function handleSyncRequest(data) {
  const { queryKey, endpoint } = data
  
  // Add to sync queue
  syncQueue.set(JSON.stringify(queryKey), {
    queryKey,
    endpoint,
    timestamp: Date.now(),
    retryCount: 0
  })
  
  // Process sync request
  processSyncQueue()
}

async function processSyncQueue() {
  for (const [key, request] of syncQueue.entries()) {
    try {
      const response = await fetch(request.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Worker-Sync': 'true'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update sync status
        syncStatus.set(key, {
          status: 'success',
          timestamp: Date.now(),
          data
        })
        
        // Remove from queue
        syncQueue.delete(key)
        
        // Notify clients
        notifyClientsOfSyncSuccess(request.queryKey, data)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // Handle retry logic
      if (request.retryCount < SYNC_CONFIG.maxRetries) {
        request.retryCount++
        request.timestamp = Date.now() + SYNC_CONFIG.retryDelay
        
        syncStatus.set(key, {
          status: 'retrying',
          timestamp: Date.now(),
          error: error.message,
          retryCount: request.retryCount
        })
      } else {
        // Max retries reached
        syncStatus.set(key, {
          status: 'failed',
          timestamp: Date.now(),
          error: error.message,
          retryCount: request.retryCount
        })
        
        syncQueue.delete(key)
        notifyClientsOfSyncFailure(request.queryKey, error)
      }
    }
  }
}

function notifyClientsOfSyncSuccess(queryKey, data) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    clientList.forEach(client => {
      client.postMessage({
        type: 'SYNC_SUCCESS',
        queryKey,
        data,
        timestamp: Date.now()
      })
    })
  })
}

function notifyClientsOfSyncFailure(queryKey, error) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
    clientList.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILURE',
        queryKey,
        error: error.message,
        timestamp: Date.now()
      })
    })
  })
}

function getSyncStatus() {
  return {
    queue: Array.from(syncQueue.entries()),
    status: Array.from(syncStatus.entries()),
    backgroundSyncEnabled: SYNC_CONFIG.backgroundSync,
    lastSync: backgroundSyncTimer ? Date.now() : null
  }
}

// Handle periodic sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync())
  }
})
