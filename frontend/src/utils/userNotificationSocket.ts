// User-specific WebSocket manager that emits events on new notifications
const HOST = window.location.host;
export const userNotificationEvents = new EventTarget();
let socket: WebSocket | null = null;
let initialized = false;
let reconnectAttempts = 0;

function connect() {
  try {
    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${HOST}/ws/user/notifications/`;
    console.info('userNotificationSocket: connecting to', url);
    socket = new WebSocket(url);

    socket.onopen = () => {
      reconnectAttempts = 0;
      console.info('userNotificationSocket: connected');
    };

    socket.onmessage = (ev) => {
      let payload: any = ev.data;
      try {
        payload = JSON.parse(ev.data);
      } catch (e) {
        // ignore
      }
      userNotificationEvents.dispatchEvent(new CustomEvent('notification', { detail: payload }));
    };

    socket.onerror = (err) => {
      console.warn('userNotificationSocket: error', err);
    };

    socket.onclose = (ev) => {
      console.info('userNotificationSocket: closed', ev.code, ev.reason);
      socket = null;
      initialized = false;
      reconnectAttempts += 1;
      const backoff = Math.min(30000, 1000 * Math.pow(1.5, reconnectAttempts));
      setTimeout(() => {
        if (!initialized) initUserNotificationSocket();
      }, backoff);
    };
  } catch (e) {
    console.warn('userNotificationSocket: failed to connect', e);
    socket = null;
    initialized = false;
  }
}

export function initUserNotificationSocket() {
  if (initialized) return;
  initialized = true;
  connect();
}

export function subscribeUserNotification(cb: (payload: any) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  userNotificationEvents.addEventListener('notification', handler as EventListener);
  return () => userNotificationEvents.removeEventListener('notification', handler as EventListener);
}
