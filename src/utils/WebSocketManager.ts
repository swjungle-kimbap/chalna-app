import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Config from "react-native-config";

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

        // console.log('URL:',Config.BROKER_URL);
        this.client = new Client({
            brokerURL: Config.BROKER_URL,
            connectHeaders: {
                chatRoomId,
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 2000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            webSocketFactory: () => {
                console.log('Creating SockJS instance');
                return new SockJS(Config.SOCKET_URL);
            },
        });

        this.client.onConnect = () => {
            console.log('Connected');
            this.connected = true;
            this.client?.subscribe(`/api/sub/${chatRoomId}`, onMessage);
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
            this.client.publish({ destination: `/api/send/${chatRoomId}`, body: messageBody });
        }
    };

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketManager();
