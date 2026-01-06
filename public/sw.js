const CACHE_NAME = "biblos-mf-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/src/main.jsx", // Vite handles this differently in prod, but good for dev awareness
  // In production, Vite generates hashed assets.
  // We rely on the SW intercepting requests and caching them dynamically for the first run.
];

// Install Event: Cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching critical assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // PREVIOUSLY: self.skipWaiting();
  // NOW: We wait for the user to click "Update"
});

// Listener for SKIP_WAITING message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First Strategy
self.addEventListener("fetch", (event) => {
  // Ignore non-http requests (like extensions)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        // Clone the response because it's a stream and can only be consumed once
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Cache the new resource for future use
          // Important: This dynamic caching captures the hashed JS/CSS files from Vite build
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
