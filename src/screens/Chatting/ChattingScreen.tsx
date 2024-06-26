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
import { sendFriendRequest, deleteChat } from "../../service/Chatting/chattingScreenAPI";
import 'text-encoding-polyfill';
import CustomHeader from "../../components/common/CustomHeader";
import MenuModal from "../../components/common/MenuModal";
import ImageTextButton from "../../components/common/Button";

type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    const { chatRoomId } = route.params;
    const navigation = useNavigation();

    const userInfo = useRecoilValue<LoginResponse>(userInfoState);
    const currentUserId = userInfo.id;

    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    // chat room info
    const chatRoomTypeRef = useRef<string>('');
    const otherIdRef = useRef<number | null>(null);
    const otherUsernameRef = useRef<string>('');

    // auto scroll
    const scrollViewRef = useRef<ScrollView>(null);

    // Get out of screen -> disconnect
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
                // 여기서 timestamp 저장해야할듯
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    // Leaving TimeStamp: SWR Config 제외하고 테스트 / 여기서 focus effect로 감싸는 의미가..?
    useFocusEffect(
        useCallback(() => {
            const currentTimestamp = new Date().toISOString().slice(0, 19);
            console.log("Focused", currentTimestamp);

            // Fetch initial messages from the API
            const fetchMessages = async () => {
                try {
                    setLoading(true);
                    const response = await axiosInstance.get(
                        `https://chalna.shop/api/v1/chatRoom/message/${chatRoomId}?lastLeaveAt=2024-06-23T10:32:40` //   ${currentTimestamp}` 나가기 전 createdat 넣어주기
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
                    const accessToken = await getKeychain('accessToken');

                    WebSocketManager.connect(chatRoomId, accessToken, (message: IMessage) => {
                        console.log('Received message: ' + message.body);
                        try {
                            const parsedMessage = JSON.parse(message.body);
                            if ((parsedMessage.type === 'CHAT'||parsedMessage.type==='FRIEND_REQUEST' )
                                && parsedMessage.content && parsedMessage.senderId !== 0)
                            {
                                parsedMessage.isSelf = parsedMessage.senderId === currentUserId;
                                setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                                scrollViewRef.current?.scrollToEnd({ animated: true }); // Auto-scroll to the bottom
                            } else {
                                //여기에 상태 메세지 받아서 처리하는 로직 추가
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


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }


    // 연결상태 표기 나중에 추가
    //    <Text style={styles.status}> Status: {WebSocketManager.isConnected() ? 'Connected' : 'Not Connected'} </Text>

    return (
        <SWRConfig value={{}}>
            <CustomHeader
                title={otherUsernameRef.current}
                onBackPress={()=>navigation.navigate("채팅 목록")} //채팅 목록으로 돌아가기
                onBtnPress={()=>sendFriendRequest(chatRoomId, otherIdRef.current)} //친구요청 보내기
                showBtn={chatRoomTypeRef.current!=='FRIEND'} //친구상태 아닐때만 노출
                onMenuPress={toggleModal}
                useNav={true}
                useMenu={true}
            />
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
                            chatRoomId={chatRoomId}
                            otherId={otherIdRef.current}
                            chatRoomType={chatRoomTypeRef.current}
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
                    <ImageTextButton
                        onPress={sendMessage}
                        iconSource={require('../../assets/Icons/sendMsgIcon.png')}
                        disabled={chatRoomTypeRef.current==='WAITING' || messageContent===''}
                        imageStyle={{height:15, width:15}}
                        containerStyle={{paddingRight:15}}
                    />
                </View>
                <MenuModal
                    isVisible = {isModalVisible}
                    onClose={toggleModal}
                    menu1={'채팅방 나가기'}
                    onMenu1={()=>deleteChat(navigation, chatRoomId)}
                    />

            </View>
        </SWRConfig>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 10,
    },
    inputContainer: {
        verticalAlign: 'top',
        backgroundColor: 'white',
        borderColor: "#ececec",
        flexDirection: 'row',
        borderRadius: 25,
        borderWidth:0.8,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        marginLeft: 10
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
