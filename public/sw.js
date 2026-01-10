// ============================================
// NOTIFICACIONES PUSH
// ============================================

// Escuchar notificaciones push
self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push received:", event);

  let data = {
    title: "MyYear",
    body: "¿Ya completaste tus objetivos de hoy?",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: "daily-reminder",
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      console.log("Could not parse push data:", e);
    }
  }

  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: {
      url: data.url || "/",
    },
  });

  event.waitUntil(promiseChain);
});

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification clicked:", event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/today";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Si ya hay una ventana abierta, enfócala
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Si no, abre una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
