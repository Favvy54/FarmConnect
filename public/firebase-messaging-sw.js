importScripts(
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

firebase.initializeApp({

    apiKey: "AIzaSyBI2Q-VAmeMdt7_jX375fB0YHS4TUB8e30",

    authDomain: "farmconnect-9d62e.firebaseapp.com",

    projectId: "farmconnect-9d62e",

    storageBucket: "farmconnect-9d62e.firebasestorage.app",

    messagingSenderId: "982731954682",

    appId: "1:982731954682:web:4b6031e71bb6a2846eac43",

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log(
        "Background Notification:",
        payload
    );

    self.registration.showNotification(

        payload.notification.title,

        {

            body:
                payload.notification.body,

            icon: "/logo192.png",

            badge: "/logo192.png",

            data: payload.data,

            requireInteraction: false,

        }

    );

});


self.addEventListener(

    "notificationclick",

    function(event){

        event.notification.close();

        event.waitUntil(

            clients.openWindow("/")

        );

    }

);
