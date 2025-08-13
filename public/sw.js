self.addEventListener('push', event => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'Уведомление', body: event.data.text() };
    }
  } else {
    payload = { title: 'Уведомление', body: 'Новое событие' };
  }

  // Если сервер не прислал url, но это админ — ставим /admin по умолчанию
  if (!payload.url && payload.forAdmin) {
    payload.url = '/admin';
  }

  const title = payload.title || 'Уведомление';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-72.png',
    data: {
      url: payload.url || '/', // по клику откроем
      ...payload.data
    },
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
