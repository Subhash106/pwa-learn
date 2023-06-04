const STATIC_CACHE = "STATIC_CACHE";
const DYNAMIC_CACHE = "DYNAMIC_CACHE";

self.addEventListener("install", function (event) {
  console.log("Service worker installed", event);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      cache.addAll([
        "/src/js/app.js",
        "/src/css/style.css",
        "/index.html",
        "/",
        "/manifest.json",
      ]);
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
        return fetch(event.request).then((res) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request.url, res.clone());

            return res;
          });
        });
      }
    })
  );
});
