// Simple singleton WebSocket manager that emits events on new notifications
const HOST = window.location.host;
export const notificationEvents = new EventTarget();
let socket: WebSocket | null = null;
let initialized = false;
let reconnectAttempts = 0;

function connect() {
  try {
    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${HOST}/ws/admin/notifications/`;
    console.info('notificationSocket: connecting to', url);
    socket = new WebSocket(url);

    socket.onopen = () => {
      reconnectAttempts = 0;
      console.info('notificationSocket: connected');
    };

    socket.onmessage = (ev) => {
      // Try parse JSON; if parse fails, still forward raw data
      let payload: any = ev.data;
      try {
        payload = JSON.parse(ev.data);
      } catch (e) {
        // ignore parse error
      }
      notificationEvents.dispatchEvent(new CustomEvent('notification', { detail: payload }));
    };

    socket.onerror = (err) => {
      console.warn('notificationSocket: error', err);
    };

    socket.onclose = (ev) => {
      console.info('notificationSocket: closed', ev.code, ev.reason);
      socket = null;
      // allow re-init after closed
      initialized = false;
      // try reconnect with backoff
      reconnectAttempts += 1;
      const backoff = Math.min(30000, 1000 * Math.pow(1.5, reconnectAttempts));
      console.info(`notificationSocket: reconnecting in ${backoff}ms (attempt ${reconnectAttempts})`);
      setTimeout(() => {
        if (!initialized) initNotificationSocket();
      }, backoff);
    };
  } catch (e) {
    console.warn('notificationSocket: failed to connect', e);
    socket = null;
    initialized = false;
  }
}

export function initNotificationSocket() {
  if (initialized) return;
  initialized = true;
  connect();
}

// Convenience helpers for components
export function subscribeNotification(cb: (payload: any) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  // store reference so caller can unsubscribe using returned function
  notificationEvents.addEventListener('notification', handler as EventListener);
  return () => notificationEvents.removeEventListener('notification', handler as EventListener);
}
