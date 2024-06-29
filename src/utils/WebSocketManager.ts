import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface sendMessageProps {
    chatRoomId: string,
    message: string,
    type?: string
}

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
            reconnectDelay: 1000,
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

    parseMsgToSend = <sendMessageProps>(message, type) =>{
        const messageObject = {
            type: type? type:'CHAT', //type null일경우 CHAT으로 기본 설정
            content: message,
        };
        const messageJson = JSON.stringify(messageObject);
        console.log('Sending Message: '+ messageJson);
        return messageJson
    }

    sendMessage = <sendMessageProps>(chatRoomId, message, type) => {
        const messageBody = this.parseMsgToSend(message, type);
        if (this.client) {
            this.client.publish({ destination: `/app/chat/${chatRoomId}/sendMessage`, body: messageBody });
        }
    };

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketManager();
