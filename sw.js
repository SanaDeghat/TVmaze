const version = 'v124'; // Increment this version for updates

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/',                // Root file
        '/index.html',      // Main HTML file
        '/style.css',       // CSS file
        '/apiexample.js',   // JavaScript file
        '/icons/192-192.png',      // 192px icon
        '/icons/icon512_rounded.png' // 512px icon
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Return cached response if available, or fetch from the network
      return response || fetch(event.request);
    })
  );
});
