import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (userId, onMessage) => {
  if (!userId) {
    return;
  }

  if (stompClient?.active) {
    return;
  }

  const socket = new SockJS("http://localhost:8081/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("Connected to WebSocket");

      stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    },
    onStompError: (frame) => {
      console.error("WebSocket STOMP error:", frame);
    },
  });

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
