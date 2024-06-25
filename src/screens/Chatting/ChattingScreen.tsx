import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, Button as RNButton, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, AppState, AppStateStatus, Alert, Image } from 'react-native';
import { RouteProp, useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { LoginResponse } from "../../interfaces";
import { getKeychain } from "../../utils/keychain";
import { SWRConfig } from 'swr';
import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the path as necessary
import Modal from 'react-native-modal';
import WebSocketManager from '../../utils/WebSocketManager'; // Adjust the path as necessary
import sendFriendRequest from "../../service/Chatting/sendFriendRequest";
import 'text-encoding-polyfill';

type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    const { chatRoomId } = route.params;
    const navigation = useNavigation();

    const userInfo = useRecoilValue<LoginResponse>(userInfoState);
    const currentUserId = userInfo.id;
    console.log("currentUserId: ", currentUserId);
    console.log("chatRoomId: ", chatRoomId);

    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    // chat room info
    const chatRoomTypeRef = useRef<string>('');
    const otherIdRef = useRef<number | null>(null);
    const otherUsernameRef = useRef<string>('');

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


                    const responseData = response.data.data;

                    // Extract chatRoomType
                    chatRoomTypeRef.current = responseData.type;

                    // Extract other member info
                    const otherMember = responseData.members.find((member: any) => member.memberId !== currentUserId);
                    if (otherMember) {
                        otherIdRef.current = otherMember.memberId;
                        otherUsernameRef.current = otherMember.username;
                    }

                    // Extract messages
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
                            if ((parsedMessage.type === 'CHAT'||parsedMessage.type==='FRIEND_REQUEST' )
                                && parsedMessage.content && parsedMessage.senderId === 0)
                            {
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
        if (chatRoomTypeRef.current === 'WAITING'){
            return;
        }
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

    const deleteChat = () => {
        Alert.alert(
            "채팅방 나가기",
            "정말 나가시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "나가기",
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(
                                `https://chalna.shop/api/v1/chatRoom/leave/${chatRoomId}`
                            );
                            Alert.alert("채팅방 삭제 완료", "채팅 목록 화면으로 돌아갑니다.");
                            navigation.navigate('채팅 목록');
                        } catch (error) {
                            console.error('Failed to delete chat:', error);
                            Alert.alert("Error", "Failed to delete the chat.");
                        }
                    }
                }
            ]
        );
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
                        editable={chatRoomTypeRef.current !== 'WAITING'}
                    />
                    <RNButton title="Send" onPress={sendMessage} disabled={chatRoomTypeRef.current==='WAITING'}/>
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
                        <RNButton title="채팅방 나가기" onPress={() => { deleteChat() }} />
                        <RNButton title="Close" onPress={toggleModal} />
                    </View>
                </Modal>
                <Text style={styles.status}>
                    Status: {WebSocketManager.isConnected() ? 'Connected' : 'Not Connected'}
                </Text>
                <TouchableOpacity style={styles.topRightButton}
                                  onPress={() => sendFriendRequest(chatRoomId, otherIdRef.current)}>
                    <Image
                        source = {require('../../assets/Icons/addFriendIcon.png')}
                        style = {styles.topRightButtonImage}
                    />
                </TouchableOpacity>

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
    topRightButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'transparent',
        padding: 10,
    },
    topRightButtonImage: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
});

export default ChattingScreen;
