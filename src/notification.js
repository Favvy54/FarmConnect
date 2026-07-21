import {

    getToken,

    onMessage,

} from "firebase/messaging";

import { messaging } from "./firebase";

const requestNotificationPermission = async () => {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {

        console.log("Notification permission denied.");

        return;

    }

    const token = await getToken(

        messaging,

        {

            vapidKey:
                "BOCx0Zc-eoUwQ-5FOPa9rBmnN5nE3HlsHyhhe9nvz_KH1Sk_RS63X_M9161JXDetpNlPI_93U3EL0o6fcUTehzc",

        }

    );

    console.log("FCM Token:", token);

    return token;

};

//  Listen for Foreground Notifications

onMessage(

    messaging,

    (payload) => {

        console.log(

            "Foreground Notification:",

            payload

        );

    }

);

//  Send the token to the backend so it knows this device exists
export async function registerDeviceWithBackend(fcmToken, jwtToken) {
  await fetch('/api/device', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ token: fcmToken }),
  })
}