// A minimal service worker to make the app installable and provide basic offline capabilities.
const CACHE_NAME = 'ai-cartoon-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/icon-192.svg',
    '/icon-512.svg'
];

// On install, cache the core app shell.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache and caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// On fetch, use a network-first strategy.
// Go to the network first. If that fails (e.g., offline), serve from cache.
self.addEventListener('fetch', (event) => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If we get a valid response, cache it and return it.
                if (response) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // If the network request fails, try to serve from the cache.
                return caches.match(event.request);
            })
    );
});
