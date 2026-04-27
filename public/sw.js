const CACHE_NAME = 'currentdao-v1';
const STATIC_CACHE = 'currentdao-static-v1';
const API_CACHE = 'currentdao-api-v1';
const IMAGE_CACHE = 'currentdao-images-v1';

// Cache URLs
const STATIC_URLS = [
  '/',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/_next/static/media/',
];

const API_URLS = [
  '/api/portfolio/',
  '/api/metrics/',
];

// Cache strategies
const cacheStrategies = {
  // Cache first for static assets
  static: async (request) => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Return cached version if network fails
      return cached || new Response('Offline', { status: 503 });
    }
  },

  // Network first for API calls
  api: async (request) => {
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Return cached version if network fails
      if (cached) {
        return cached;
      }
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Stale while revalidate for images
  image: async (request) => {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    
    // Always try to fetch fresh version
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cached);

    // Return cached version immediately, update in background
    return cached || fetchPromise;
  },

  // Network only for non-cacheable requests
  network: async (request) => {
    return fetch(request);
  }
};

// Determine cache strategy
function getStrategy(request) {
  const url = new URL(request.url);
  
  // Static assets
  if (STATIC_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    return 'static';
  }
  
  // API calls
  if (API_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    return 'api';
  }
  
  // Images
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    return 'image';
  }
  
  // Navigation requests
  if (request.mode === 'navigate') {
    return 'static';
  }
  
  return 'network';
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const strategy = getStrategy(event.request);
  
  if (strategy && cacheStrategies[strategy]) {
    event.respondWith(cacheStrategies[strategy](event.request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get all pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    // Retry each request
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New portfolio update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('CurrentDAO', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/portfolio')
    );
  }
});

// IndexedDB helpers for offline storage
function getPendingRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-requests', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['requests'], 'readonly');
      const store = transaction.objectStore('requests');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('requests', { keyPath: 'id' });
    };
  });
}

function removePendingRequest(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-requests', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Cache cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches());
  }
});

async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const currentTime = Date.now();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseTime = new Date(dateHeader).getTime();
          // Remove entries older than 30 days
          if (currentTime - responseTime > 30 * 24 * 60 * 60 * 1000) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}
