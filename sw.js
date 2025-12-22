/* ============================================
   SOFIANO CAFE - Service Worker (PWA)
============================================ */

const CACHE_NAME = 'sofiano-cafe-v2';
const IMAGE_CACHE = 'sofiano-images-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/images/1.png'
];

const imagesToCache = [
    '/assets/images/2.webp',
    '/assets/images/3.webp',
    '/assets/images/4.webp',
    '/assets/images/5.webp',
    '/assets/images/6.webp',
    '/assets/images/7.webp',
    '/assets/images/8.webp',
    '/assets/images/9.webp',
    '/assets/images/10.webp',
    '/assets/images/11.webp'
];

// Install - Cache core assets and images
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
            caches.open(IMAGE_CACHE).then((cache) => cache.addAll(imagesToCache))
        ])
    );
    self.skipWaiting();
});

// Fetch - Cache-first for images, Network-first for others
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // For images - Cache first, then network
    if (event.request.destination === 'image' || url.pathname.includes('/images/')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(IMAGE_CACHE).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }
    
    // For other assets - Network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Activate - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
