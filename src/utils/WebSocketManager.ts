import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketManager {
    private client: Client | null = null;
    private connected: boolean = false;

    connect(chatRoomId: string, token: string, onMessage: (message: IMessage) => void) {
        if (this.client) {
            this.client.deactivate();
        }

        this.client = new Client({
            brokerURL: 'wss://chalna.shop/ws',
            connectHeaders: {
                chatRoomId,
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            webSocketFactory: () => {
                console.log('Creating SockJS instance');
                return new SockJS('https://chalna.shop/ws');
            },
        });

        this.client.onConnect = () => {
            console.log('Connected');
            this.connected = true;
            this.client?.subscribe(`/topic/${chatRoomId}`, onMessage);
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.onDisconnect = () => {
            console.log('Disconnected');
            this.connected = false;
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
            console.log('Disconnected');
        }
    }

    sendMessage(chatRoomId: string, message: string) {
        if (this.client) {
            this.client.publish({ destination: `/app/chat/${chatRoomId}/sendMessage`, body: message });
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketManager();
