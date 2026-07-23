import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';

const VAPID_KEY =
  'BOCx0Zc-eoUwQ-5FOPa9rBmnN5nE3HlsHyhhe9nvz_KH1Sk_RS63X_M9161JXDetpNlPI_93U3EL0o6fcUTehzc';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied.');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    console.log('FCM Token:', token);

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function listenForForegroundNotifications() {
  onMessage(messaging, (payload) => {
    console.log('Foreground Notification:', payload);

    alert(`${payload.notification.title}\n\n${payload.notification.body}`);
  });
}
