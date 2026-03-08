const CACHE_NAME = 'tradutor-ia-v1'
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/offline.html',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching app shell')
      return cache.addAll(URLS_TO_CACHE)
    })
  )
  self.skipWaiting() // Force activation
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip API calls - always fetch fresh
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then((c) => c.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Fallback to cached version if offline
          return caches.match(event.request).then((response) => {
            return response || new Response(
              JSON.stringify({ offline: true, error: 'Network unavailable' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          })
        })
    )
    return
  }

  // For page and static resources - cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page if available
          return caches.match('/offline.html').then((response) => {
            return response || new Response('Offline - Page not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            })
          })
        })
    })
  )
})

// Background sync for offline calls
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calls') {
    event.waitUntil(
      // Retry failed API calls
      caches.keys().then((cacheNames) => {
        console.log('🔄 Background sync triggered')
      })
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova chamada recebida',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'translation-notification',
    requireInteraction: true,
  }

  event.waitUntil(
    self.registration.showNotification('Tradutor IA', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/?view=call')
      }
    })
  )
})

// Send message to clients about activation
self.addEventListener('activate', () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_ACTIVATED' })
    })
  })
})
