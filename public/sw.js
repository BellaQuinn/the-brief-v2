// Minimal Web Push service worker. Two jobs only: show a notification
// when a push arrives, and focus/open the right page when it's clicked.
// No caching, no offline strategy — this app doesn't need a full PWA
// shell, just the push delivery path.

self.addEventListener("push", (event) => {
  let payload = { title: "The Brief", body: "", url: "/brief" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Fall back to the defaults above if the payload isn't valid JSON.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/brief";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
