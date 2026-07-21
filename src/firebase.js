import { initializeApp } from "firebase/app";

import { getMessaging } from "firebase/messaging";

const firebaseConfig = {

    apiKey: "AIzaSyBI2Q-VAmeMdt7_jX375fB0YHS4TUB8e30",

    authDomain: "farmconnect-9d62e.firebaseapp.com",

    projectId: "farmconnect-9d62e",

    storageBucket: "farmconnect-9d62e.firebasestorage.app",

    messagingSenderId: "982731954682",

    appId: "1:982731954682:web:4b6031e71bb6a2846eac43",

    measurementId: "G-F9C0587GVH",

};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);