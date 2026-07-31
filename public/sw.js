/* Service worker da Agenda: recebe os pushes e abre o app ao tocar no aviso. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Agenda", body: event.data.text(), tag: "agenda", url: "/agenda" };
  }

  const isLembrete = payload.kind === "lembrete";

  event.waitUntil(
    self.registration.showNotification(payload.title || "Agenda", {
      body: payload.body || "",
      tag: payload.tag || "agenda",
      renotify: true,
      icon: "/icone-192.png",
      badge: "/badge.png",
      vibrate: isLembrete ? [180, 90, 180, 90, 300] : [120, 60, 120],
      requireInteraction: isLembrete,
      data: { url: payload.url || "/agenda" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = new URL(event.notification.data?.url || "/agenda", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate?.(destino);
          return client.focus();
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});
