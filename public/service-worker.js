/* 
 * Service Worker for Progressive Web App (PWA)
 * Provides core functionality for offline mode,
 * static resource caching and performance optimization
 */

const CACHE_NAME = 'ai-store-v1';

// Resources that will be cached during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/images/ai-store-icon.png',
  '/images/ai-store-icon-small.png',
  '/images/app-screenshot.jpg'
];

// Service worker installation
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation completed');
        return self.skipWaiting();
      })
  );
});

// Service worker activation and removal of old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Caching strategy and offline mode handling
self.addEventListener('fetch', event => {
  // Do not intercept API requests and third-party resources
  if (event.request.url.includes('/api/') || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Special handling for navigation in offline mode
  if (event.request.mode === 'navigate' && !navigator.onLine) {
    event.respondWith(
      caches.match('/offline.html')
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving offline page');
            return cachedResponse;
          }
          // If offline page is not available, return cached home page
          return caches.match('/');
        })
    );
    return;
  }

  // Using Network First strategy for HTML pages
  if (event.request.headers.get('accept') && 
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Create a copy of the response and save it to cache
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If the page is not found in cache and we're offline
              if (!navigator.onLine) {
                return caches.match('/offline.html');
              }
              // Otherwise return cached home page
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Using Cache First strategy for other resources
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If resource is not in cache, try to get it from network
        return fetch(event.request)
          .then(response => {
            // Check that the response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Create a copy of the response for caching
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clonedResponse));
            
            return response;
          })
          .catch(() => {
            // For images, return a placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/image-placeholder.svg');
            }
            return new Response('Resource not available in offline mode', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Listen for messages from client code
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});