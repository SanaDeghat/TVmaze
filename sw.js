const STATIC_CACHE = 'static-cache-v124';
const DYNAMIC_CACHE = 'dynamic-cache-v124';

const STATIC_ASSETS = [
    '/TVmaze/',
    '/TVmaze/index.html',
    '/TVmaze/style.css',
    '/TVmaze/apiexample.js',
    '/TVmaze/no-results.html' // Offline fallback
];

// Install event: Cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.addAll(STATIC_ASSETS).catch(error => {
                console.error('Failed to cache static assets:', error);
            });
        })
    );
    console.log('Service Worker installed and static assets cached.');
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
    console.log('Service Worker activated, old caches cleaned.');
});

// Fetch event: Network-first strategy with dynamic caching
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                return caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    } else if (event.request.destination === 'document') {
                        return caches.match('/TVmaze/no-results.html');
                    } else {
                        return new Response(
                            'App needs to be online to perform this action.',
                            { status: 503, statusText: 'Service Unavailable' }
                        );
                    }
                });
            })
    );
});
