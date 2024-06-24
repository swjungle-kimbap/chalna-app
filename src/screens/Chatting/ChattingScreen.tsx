import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button as RNButton, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the path as necessary

import { TextEncoder, TextDecoder } from 'text-encoding';

Object.assign(global, {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
});

const ChattingScreen = () => {
    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [client, setClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Fetch initial messages from the API
        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.get('/api/messages?chatRoomId=1');
                setMessages(response.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const setupWebSocket = async () => {
            try {
                // Fetch the token using the axios instance
                const tokenResponse = await axiosInstance.get('/api/token'); // Example endpoint to get the token
                const accessToken = tokenResponse.data.token;

                const newClient = new Client({
                    brokerURL: 'wss://chalna.shop/ws',
                    connectHeaders: {
                        chatRoomId: "1",
                        Authorization: `Bearer ${accessToken}`, // Use fetched token
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

                newClient.onConnect = (frame) => {
                    console.log('Connected: ' + frame);
                    setConnected(true);
                    newClient.subscribe('/topic/1', (message: IMessage) => {
                        console.log('Received message: ' + message.body);
                        try {
                            const parsedMessage = JSON.parse(message.body);
                            if (parsedMessage.type === 'CHAT' && parsedMessage.content) {
                                setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                            } else {
                                console.warn('Received message format is invalid:', message.body);
                            }
                        } catch (error) {
                            console.error('Failed to parse received message:', error);
                        }
                    });
                };

                newClient.onStompError = (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                };

                newClient.activate();
                setClient(newClient);

                return () => {
                    newClient.deactivate();
                    setConnected(false);
                };
            } catch (error) {
                console.error('Failed to set up WebSocket:', error);
            }
        };

        setupWebSocket();
    }, []);

    const sendMessage = () => {
        if (client && connected) {
            const messageObject = {
                type: 'CHAT',
                content: messageContent,
                datetime: new Date().toISOString(),
                isSelf: true, // Assuming the sender is the user
                status: false, // Assuming the message is initially unread
            };
            const messageJson = JSON.stringify(messageObject);
            console.log('Sending message: ' + messageJson);
            client.publish({ destination: '/app/chat/1/sendMessage', body: messageJson });
            setMessages((prevMessages) => [...prevMessages, messageObject]);
            setMessageContent('');
        } else {
            console.log('Client is not connected.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={index}
                        message={msg.content}
                        datetime={msg.datetime}
                        isSelf={msg.isSelf}
                        type={msg.type}
                        status={msg.status}
                    />
                ))}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={messageContent}
                    onChangeText={setMessageContent}
                    placeholder="Type a message"
                />
                <RNButton title="Send" onPress={sendMessage} />
            </View>
            <Text style={styles.status}>
                Status: {connected ? 'Connected' : 'Not Connected'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        padding: 10,
        marginRight: 10,
    },
    status: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChattingScreen;
