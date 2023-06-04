const STATIC_CACHE = "STATIC_CACHE_V3";
const DYNAMIC_CACHE = "DYNAMIC_CACHE_V3";
const ASSESTS_TO_CACHE = [
  "/",
  "/index.html",
  "offline.html",
  "/src/js/app.js",
  "/src/css/style.css",
  "/manifest.json",
];

self.addEventListener("install", function (event) {
  console.log("Service worker installed", event);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      cache.addAll(ASSESTS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("service worker activated");

  event.waitUntil(
    caches.keys().then((keysList) =>
      Promise.all(
        keysList.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log("removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  console.log("fetching...", event);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then((res) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(() => {
            return caches.open(STATIC_CACHE).then((cache) => {
              return cache.match("/offline.html");
            });
          });
      }
    })
  );
});
