import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, Button as RNButton, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { RouteProp, useRoute, useFocusEffect } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { LoginResponse } from "../../interfaces";
import { getKeychain } from "../../utils/keychain";
import { SWRConfig } from 'swr';
import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the path as necessary
import Modal from 'react-native-modal';
import WebSocketManager from '../../utils/WebSocketManager'; // Adjust the path as necessary
import 'text-encoding-polyfill';

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
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const currentTimestamp = new Date().toISOString().slice(0, 19);
            console.log("Focused", currentTimestamp);

            // Fetch initial messages from the API
            const fetchMessages = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(
                        `https://chalna.shop/api/v1/chatRoom/message/${chatRoomId}?lastLeaveAt=2024-06-23T10:32:40` //   ${currentTimestamp}`
                    );

                    const fetchedMessages = response.data.data.list.map((msg: any) => ({
                        ...msg,
                        isSelf: msg.senderId === 2 //currentUserId,
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
                    const accessToken = await getKeychain('accessToken');

                    WebSocketManager.connect(chatRoomId, accessToken, (message: IMessage) => {
                        console.log('Received message: ' + message.body);
                        try {
                            const parsedMessage = JSON.parse(message.body);
                            if (parsedMessage.type === 'CHAT' && parsedMessage.content) {
                                parsedMessage.isSelf = parsedMessage.senderId === 2; //currentUserId;
                                setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                                scrollViewRef.current?.scrollToEnd({ animated: true }); // Auto-scroll to the bottom
                            } else {
                                console.warn('Received message format is invalid:', message.body);
                            }
                        } catch (error) {
                            console.error('Failed to parse received message:', error);
                        }
                    });
                } catch (error) {
                    console.error('Failed to set up WebSocket:', error);
                }
            };

            setupWebSocket();

            return () => {
                const leaveTimestamp = new Date().toISOString();
                console.log("Unfocused", leaveTimestamp);
                WebSocketManager.disconnect();
            };
        }, [chatRoomId, currentUserId])
    );

    const sendMessage = () => {
        const messageObject = {
            type: 'CHAT',
            content: messageContent,
        };
        const messageJson = JSON.stringify(messageObject);
        console.log('Sending message: ' + messageJson);
        WebSocketManager.sendMessage(chatRoomId, messageJson);
        // setMessages((prevMessages) => [...prevMessages, { ...messageObject, isSelf: true, createdAt: new Date().toISOString() }]);
        setMessageContent('');
        scrollViewRef.current?.scrollToEnd({ animated: true }); // Auto-scroll to the bottom
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
        <SWRConfig value={{}}>
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // Auto-scroll to the bottom on content change
                >
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
                    Status: {WebSocketManager.isConnected() ? 'Connected' : 'Not Connected'}
                </Text>
            </View>
        </SWRConfig>
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
