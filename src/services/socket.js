import { io } from "socket.io-client";

const SOCKET_URL =
    "https://farmconnect-backend-docker.onrender.com";

let socket = null;

export const connectSocket = (token) => {
    console.log("🚀 connectSocket() called");
    console.log("🔑 Token exists:", !!token);

    if (!token) {
        console.warn("❌ Cannot connect socket: token is missing.");
        return null;
    }

    if (socket?.connected) {
        console.log("🟢 Socket already connected:", socket.id);
        return socket;
    }

    console.log("🌐 Connecting to Socket.IO:", SOCKET_URL);

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
    });

    socket.on("connect", () => {
        console.log("=================================");
        console.log("🟢 SOCKET CONNECTED");
        console.log("Socket ID:", socket.id);
        console.log("=================================");
    });

    socket.on("connect_error", (error) => {
        console.error("=================================");
        console.error("🔴 SOCKET CONNECTION ERROR");
        console.error("Message:", error.message);
        console.error("=================================");
    });

    socket.on("disconnect", (reason) => {
        console.log("🔌 SOCKET DISCONNECTED");
        console.log("Reason:", reason);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        console.log("🔌 Disconnecting Socket.IO...");
        socket.disconnect();
        socket = null;
    }
};