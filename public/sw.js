// public/sw.js
// Basic service worker

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Optional: You can uncomment and modify the caching logic below
  // if you want to pre-cache assets for offline use.
  // event.waitUntil(
  //   caches.open('seating-savior-cache-v1').then((cache) => {
  //     return cache.addAll([
  //       '/',
  //       '/manifest.json',
  //       // Add paths to other critical assets like CSS, JS, main images if needed
  //       // e.g., '/_next/static/...', '/images/app-logo.png'
  //     ]);
  //   })
  // );
  self.skipWaiting(); // Ensures the new service worker activates immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Optional: Clean up old caches
  // event.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cacheName) => {
  //         if (cacheName !== 'seating-savior-cache-v1') { // Replace with your current cache name
  //           console.log('Service Worker: Deleting old cache', cacheName);
  //           return caches.delete(cacheName);
  //         }
  //       })
  //     );
  //   })
  // );
  return self.clients.claim(); // Makes the service worker take control of open clients immediately
});

self.addEventListener('fetch', (event) => {
  // This is a simple pass-through fetch handler.
  // For offline capabilities, you would implement more complex strategies here
  // (e.g., cache-first, network-first, stale-while-revalidate).
  // For the install prompt to appear, having a fetch handler is sufficient.
  // console.log('Service Worker: Fetching ', event.request.url);
  event.respondWith(fetch(event.request));
});
