const STATIC_CACHE = 'static-cache-v125';
const DYNAMIC_CACHE = 'dynamic-cache-v125';

const STATIC_ASSETS = [
    '/TVmaze/', // Root
    '/TVmaze/index.html', // Main HTML file
    '/TVmaze/style.css', // CSS file
    '/TVmaze/apiexample.js' // JavaScript file
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

// Fetch event: Network-first strategy with dynamic caching and dynamic fallback
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
                        return new Response(`
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Offline</title>
                                <style>
                                    body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
                                    h1 { color: #ff6f61; }
                                    p { color: #333; }
                                </style>
                            </head>
                            <body>
                                <h1>You are offline</h1>
                                <p>It seems you are offline. Please check your internet connection and try again.</p>
                            </body>
                            </html>
                        `, { headers: { 'Content-Type': 'text/html' } });
                    } else if (event.request.destination === 'image') {
                        return new Response(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                                <rect width="100" height="100" fill="#ccc"></rect>
                                <text x="10" y="55" font-size="12" fill="black">No Image</text>
                            </svg>`,
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    } else {
                        return new Response('You are offline. Please reconnect to access this resource.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                        });
                    }
                });
            })
    );
});
