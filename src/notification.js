import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

/**
 * Request browser notification permission
 * and retrieve the Firebase Cloud Messaging token.
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied.');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        'BOCx0Zc-eoUwQ-5FOPa9rBmnN5nE3HlsHyhhe9nvz_KH1Sk_RS63X_M9161JXDetpNlPI_93U3EL0o6fcUTehzc',
    });

    if (!token) {
      console.log('No FCM registration token available.');
      return null;
    }

    console.log('FCM Token:', token);

    return token;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Listen for notifications while
 * the application is open (foreground).
 */
export const listenForForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Foreground Notification:', payload);

    // Optional:
    // Display a simple alert while developing.
    // Remove this in production if you build
    // your own notification UI.
    if (payload.notification) {
      alert(`${payload.notification.title}\n\n${payload.notification.body}`);
    }
  });
};

/**
 * Register this device with the backend
 * after login so push notifications can
 * be sent to this browser.
 */
export const registerDeviceWithBackend = async (fcmToken, jwtToken) => {
  if (!fcmToken || !jwtToken) {
    console.warn('Missing FCM token or JWT.');
    return;
  }

  try {
    const response = await fetch(
      'https://farmconnect-backend-1.onrender.com/api/user/device',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          token: fcmToken,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to register device.');
    }

    console.log('Device registered successfully.');
    return result;
  } catch (error) {
    console.error('Device registration failed:', error);
  }
};
