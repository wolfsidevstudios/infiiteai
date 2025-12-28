
const CACHE_NAME = 'infinite-study-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Chewy&display=swap'
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// WIDGET TEMPLATE (Adaptive Card)
const WIDGET_TEMPLATE = {
    "type": "AdaptiveCard",
    "body": [
        {
            "type": "TextBlock",
            "size": "Medium",
            "weight": "Bolder",
            "text": "Infinite Study",
            "color": "Accent"
        },
        {
            "type": "TextBlock",
            "text": "Current Streak",
            "isSubtle": true,
            "spacing": "None"
        },
        {
            "type": "TextBlock",
            "text": "${streak} Days 🔥",
            "size": "ExtraLarge",
            "weight": "Bolder",
            "spacing": "Small"
        }
    ],
    "actions": [
        {
            "type": "Action.OpenUrl",
            "title": "Study Now",
            "url": "./"
        }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.5"
};

const DEFAULT_WIDGET_DATA = {
    streak: 0
};

// Handle Widget Data Updates from App
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'WIDGET_UPDATE') {
         caches.open('widget-data').then(cache => {
             cache.put('data', new Response(JSON.stringify(event.data.payload), { 
                 headers: { 'content-type': 'application/json' } 
             }));
         });
    }
});

// Fetch event: Network first, fall back to cache + Widget Handling
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Intercept Widget Template Request
  if (url.includes('widget-template.json')) {
      event.respondWith(new Response(JSON.stringify(WIDGET_TEMPLATE), { 
          headers: { 'content-type': 'application/json' } 
      }));
      return;
  }

  // Intercept Widget Data Request
  if (url.includes('widget-data.json')) {
      event.respondWith(
          caches.open('widget-data').then(cache => 
              cache.match('data').then(response => 
                  response || new Response(JSON.stringify(DEFAULT_WIDGET_DATA), { 
                      headers: { 'content-type': 'application/json' } 
                  })
              )
          )
      );
      return;
  }

  // Skip non-GET requests and external API calls (except our specific assets)
  if (event.request.method !== 'GET') return;
  
  // Specific strategy for known static assets (Cache First)
  if (url.includes('fonts.googleapis.com') || 
      url.includes('iili.io') || 
      url.includes('cdn.tailwindcss.com')) {
      event.respondWith(
          caches.match(event.request).then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              return fetch(event.request).then((response) => {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                      cache.put(event.request, responseToCache);
                  });
                  return response;
              });
          })
      );
      return;
  }

  // Default Strategy: Network First (to ensure latest app logic), fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, 'widget-data'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// --- PUSH NOTIFICATIONS ---
self.addEventListener('push', function(event) {
  let data = { title: 'Infinite Study AI', body: 'Time to study!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'https://iili.io/fVhsBY7.png',
    badge: 'https://iili.io/fVhsBY7.png',
    vibrate: [100, 50, 100],
    data: {
      url: './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then( windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('infinitestudy') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// --- BACKGROUND SYNC ---
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-study-data') {
    console.log('[ServiceWorker] Background sync executed for study data.');
  }
});

// --- PERIODIC BACKGROUND SYNC ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-streak-check') {
    console.log('[ServiceWorker] Periodic sync: Checking daily streak...');
    // In a real app, fetch fresh data here to update cache/widget
  }
});
