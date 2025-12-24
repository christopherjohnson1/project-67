// Service Worker for PWA
const CACHE_VERSION = 'v3';
const CACHE_NAME = `treasure-hunt-${CACHE_VERSION}`;

// Assets to precache (only static assets, not hashed build files)
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/apple-touch-icon.png'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((error) => {
        console.error('Failed to cache assets:', error);
        // Continue even if some assets fail to cache
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('treasure-hunt-')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - network first
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error('API request failed:', error);
          throw error;
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  if (request.destination === 'image' ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      url.pathname.includes('/icons/') ||
      url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache the new resource
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache the HTML response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return cached index.html for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          throw new Error('No cached response available');
        });
      })
  );
});

