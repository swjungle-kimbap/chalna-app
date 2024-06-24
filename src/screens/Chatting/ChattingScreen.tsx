import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button as RNButton, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the path as necessary
import Modal from 'react-native-modal';

import { TextEncoder, TextDecoder } from 'text-encoding';
import { RouteProp, useRoute, useFocusEffect } from "@react-navigation/native";
import { useRecoilValue} from "recoil";
import { userInfoState} from "../../recoil/atoms.ts";
import {LoginResponse} from "../../interfaces";
import {getKeychain} from "../../utils/keychain.ts";

Object.assign(global, {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
});

type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    const { chatRoomId } = route.params;

    const userInfo = useRecoilValue<LoginResponse>(userInfoState);
    const currentUserId = userInfo.id;
    console.log("currentUserId: ", currentUserId);
    console.log("chatRoomId: ", chatRoomId);

    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [client, setClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastLeaveAt, setLastLeaveAt] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            const currentTimestamp = new Date().toISOString().slice(0,19);
            setLastLeaveAt(currentTimestamp);
            console.log("Focused", currentTimestamp);

            // Fetch initial messages from the API
            const fetchMessages = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(
                        `https://chalna.shop/api/v1/chatRoom/message/${chatRoomId}?lastLeaveAt=${currentTimestamp}`
                    );

                    const fetchedMessages = response.data.data.list.map((msg: any) => ({
                        ...msg,
                        isSelf: msg.senderId === currentUserId,

                    }));
                    setMessages(fetchedMessages);
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchMessages();

            const setupWebSocket = async () => {
                try {
                    const accessToken = await getKeychain('accessToken');;

                    const newClient = new Client({
                        brokerURL: 'wss://chalna.shop/ws',
                        connectHeaders: {
                            chatRoomId: `${chatRoomId}`,
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
                        newClient.subscribe(`/topic/${chatRoomId}`, (message: IMessage) => {
                            console.log('Received message: ' + message.body);
                            try {
                                const parsedMessage = JSON.parse(message.body);
                                if (parsedMessage.type === 'CHAT' && parsedMessage.content) {
                                    parsedMessage.isSelf = parsedMessage.senderId === currentUserId;
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

            return () => {
                const leaveTimestamp = new Date().toISOString();
                setLastLeaveAt(leaveTimestamp);
                console.log("Unfocused", leaveTimestamp);
                if (client) {
                    client.deactivate();
                    setConnected(false);
                }
            };
        }, [chatRoomId, currentUserId])
    );

    const sendMessage = () => {
        if (client && connected) {
            const messageObject = {
                type: 'CHAT',
                content: messageContent,
            };
            const messageJson = JSON.stringify(messageObject);
            console.log('Sending message: ' + messageJson);
            client.publish({ destination: `/app/chat/${chatRoomId}/sendMessage`, body: messageJson });
            // setMessages((prevMessages) => [...prevMessages, messageObject]);
            setMessageContent('');
        } else {
            console.log('Client is not connected.');
        }
    };

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
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
                        datetime={msg.createdAt}
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
                    multiline
                    textBreakStrategy="highQuality"
                />
                <RNButton title="Send" onPress={sendMessage} />
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={toggleModal}>
                <Text style={styles.menuButtonText}>Menu</Text>
            </TouchableOpacity>
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <RNButton title="Option 1" onPress={() => { /* Handle Option 1 */ }} />
                    <RNButton title="Option 2" onPress={() => { /* Handle Option 2 */ }} />
                    <RNButton title="Option 3" onPress={() => { /* Handle Option 3 */ }} />
                    <RNButton title="Close" onPress={toggleModal} />
                </View>
            </Modal>
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
    menuButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007BFF',
        borderRadius: 30,
        padding: 10,
    },
    menuButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
    },
});

export default ChattingScreen;

