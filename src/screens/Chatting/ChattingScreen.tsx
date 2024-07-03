// ChattingScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, TextInput, ScrollView, StyleSheet, ActivityIndicator, Keyboard, AppState, AppStateStatus } from 'react-native';
import { RouteProp, useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import {LoginResponse, User} from "../../interfaces";
import { SWRConfig } from 'swr';
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the path as necessary
import WebSocketManager from '../../utils/WebSocketManager'; // Adjust the path as necessary
import { deleteChat, fetchChatRoomContent } from "../../service/Chatting/chattingAPI";
import 'text-encoding-polyfill';
import CustomHeader from "../../components/common/CustomHeader";
import MenuModal from "../../components/common/MenuModal";
import ImageTextButton from "../../components/common/Button";
import { navigate } from '../../navigation/RootNavigation';
import useBackToScreen from '../../hooks/useBackToScreen';
import { chatRoomMember, ChatMessage, directedChatMessage } from "../../interfaces/Chatting";
import { formatDateToKoreanTime } from "../../service/Chatting/DateHelpers";
import Text from '../../components/common/Text';
import {saveChatMessages, getChatMessages, removeChatMessages, removeChatRoom} from '../../localstorage/mmkvStorage';
import {getMMKVString, setMMKVString, getMMKVObject, setMMKVObject, removeMMKVItem, loginMMKVStorage} from "../../utils/mmkvStorage";
import {IMessage} from "@stomp/stompjs";

type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    const { chatRoomId } = route.params;
    const navigation = useNavigation();

    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;
    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<directedChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chatRoomType, setChatRoomType] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    const otherIdRef = useRef<number | null>(null);
    const friendNameRef = useRef<string>('');

    useBackToScreen("로그인 성공", { screen: "채팅목록", params: { screen: "채팅 목록" } });

    const scrollViewRef = useRef<ScrollView>(null);

    // Set up WebSocket connection and message handling
    const setupWebSocket = async () => {
        try {
            const accessToken = loginMMKVStorage.getString('accessToken');
            WebSocketManager.connect(chatRoomId, accessToken, (message: IMessage) => {
                console.log('Received message: ' + message.body);
                try {
                    const parsedMessage:directedChatMessage = JSON.parse(message.body);
                    if ((parsedMessage.type === 'CHAT' || parsedMessage.type === 'FRIEND_REQUEST')
                        && parsedMessage.content && parsedMessage.senderId !== 0) {
                        parsedMessage.isSelf = parsedMessage.senderId === currentUserId;
                        parsedMessage.formatedTime = formatDateToKoreanTime(parsedMessage.createdAt)

                        if (parsedMessage.type === 'FRIEND_REQUEST' && parsedMessage.content === '친구가 되었습니다!\n대화를 이어가보세요.') {
                            setChatRoomType('FRIEND');
                            setUsername(friendNameRef.current);
                        }

                        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                        saveChatMessages(chatRoomId, [parsedMessage])
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    } else {
                        if (parsedMessage.type === 'TIMEOUT' && parsedMessage.senderId === 0 && chatRoomType !== 'FRIEND') {
                            setChatRoomType('WAITING');
                            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                            saveChatMessages(chatRoomId, [parsedMessage])
                            scrollViewRef.current?.scrollToEnd({ animated: true });
                        }
                    }
                } catch (error) {
                    console.error('Failed to parse received message:', error);
                }
            });
        } catch (error) {
            console.error('Failed to set up WebSocket:', error);
        }
    };

    // Keyboard handling
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleKeyboardDidShow = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const handleKeyboardDidHide = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    // Handle app state changes
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
            } else {
                setupWebSocket();
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    // Focus effect to fetch initial messages and set up WebSocket
    useFocusEffect(
        useCallback(() => {
            const fetchMessages = async () => {
                try {
                    setLoading(true);

                    // 채팅방 정보 & 그동안 못받은 메세지 가져오기
                    const currentTimestamp = new Date().toISOString().slice(0, 19);
                    const responseData = await fetchChatRoomContent(chatRoomId, '2024-06-23T10:32:40', currentUserId);
                    if (responseData) {
                        const usernames = responseData.members
                            .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                            .map((member: chatRoomMember) => responseData.type === 'FRIEND' ? member.username : `익명${member.memberId}`);
                        const fetchedMessages: directedChatMessage[] = (responseData.list || []).map((msg: ChatMessage) => ({
                            ...msg,
                            isSelf: msg.senderId === currentUserId,
                            formatedTime: formatDateToKoreanTime(msg.createdAt)
                        }));

                        //채팅방 정보 받아오기 & 메세지 저장
                        setChatRoomType(responseData.type);
                        setUsername(usernames.join(', '));
                        console.log("api 호출 채팅데이터: ", fetchedMessages);
                        saveChatMessages(chatRoomId, fetchedMessages); // Save new messages to MMKV
                    }

                    // 로컬 스토리지에서 채팅가져와 렌더링하기
                    const storedMessages = await getChatMessages(chatRoomId);
                    console.log("Get Messages from LocalStorage: ", storedMessages);
                    if (storedMessages) {
                        console.log("저장된 메세지 렌더링");
                        setMessages(storedMessages);
                    }

                } catch (error) {
                    console.error('채팅방 메세지 목록조회 실패:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchMessages();
            setupWebSocket();

            return () => {
                WebSocketManager.disconnect();
            };
        }, [chatRoomId, currentUserId])
    );

    const sendMessage = () => {
        if (chatRoomType === 'WAITING') return;
        WebSocketManager.sendMessage(chatRoomId, messageContent, 'CHAT');
        setMessageContent('');
    };

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const handleMenu1Action = () => {
        try {
            WebSocketManager.disconnect(); // socket 통신 끊기
            deleteChat(navigation, chatRoomId); // 채팅방 나가기 api 호출
            toggleModal(); // 모달 닫기
            removeChatRoom(Number(chatRoomId)); // Remove chatroom from MMKV storage
        } catch (error) {
            console.error('Failed to delete chat:', error);
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
        <SWRConfig value={{}}>
            <CustomHeader
                title={username}
                subtitle={'경고문구 출력용'}
                onBackPress={() => {
                    navigate("로그인 성공", {
                        screen: "채팅목록",
                        params: {
                            screen: "채팅 목록",
                        }
                    });
                    navigation.navigate("채팅 목록");
                }}
                showBtn={false}
                onMenuPress={toggleModal}
                useNav={true}
                useMenu={true}
            />
            <Text>Status: {WebSocketManager.isConnected() ? 'Connected' : 'Not Connected'} </Text>
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {Array.isArray(messages) && messages.map((msg, index) => {
                        const showProfile = index === 0 || messages[index - 1].senderId !== msg.senderId;
                        const showTime = index === 0 || messages[index - 1].formatedTime !== msg.formatedTime;

                        return (
                            <MessageBubble
                                key={index}
                                message={msg.content}
                                datetime={msg.formatedTime}
                                isSelf={msg.isSelf}
                                type={msg.type}
                                unreadCnt={1}
                                chatRoomId={Number(chatRoomId)}
                                otherId={otherIdRef.current}
                                chatRoomType={chatRoomType}
                                profilePicture={msg.isSelf ? '' : 'https://img.freepik.com/premium-photo/full-frame-shot-rippled-water_1048944-5521428.jpg?size=626&ext=jpg&ga=GA1.1.2034235092.1718206967&semt=ais_user'}
                                username={msg.isSelf ? '' : '익명12'}
                                showProfileTime={showProfile || showTime}
                            />
                        );
                    })}
                </ScrollView>
                <View style={chatRoomType !== 'WAITING' ? styles.inputContainer : styles.disabledInputContainer}>
                    <TextInput
                        style={styles.input}
                        value={messageContent}
                        onChangeText={setMessageContent}
                        placeholder={chatRoomType === 'WAITING' ? '5분이 지났습니다.\n대화를 이어가려면 친구요청을 보내보세요.' : ''}
                        placeholderTextColor={'#a9a9a9'}
                        multiline
                        textBreakStrategy="highQuality"
                        editable={chatRoomType !== 'WAITING'}
                    />
                    {chatRoomType !== 'WAITING' && (
                        <ImageTextButton
                            onPress={sendMessage}
                            iconSource={require('../../assets/Icons/sendMsgIcon.png')}
                            disabled={chatRoomType === 'WAITING' || messageContent === ''}
                            imageStyle={{ height: 15, width: 15 }}
                            containerStyle={{ paddingRight: 15 }}
                        />
                    )}
                </View>
                <MenuModal
                    isVisible={isModalVisible}
                    onClose={toggleModal}
                    menu1={'채팅방 나가기'}
                    onMenu1={handleMenu1Action}
                />
            </View>
        </SWRConfig>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
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
        borderRadius: 20,
        borderWidth: 0.8,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 15,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    input: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
        color: '#a9a9a9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledInputContainer: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
        backgroundColor: '#f0f0f0',
        color: '#a9a9a9',
    },
});

export default ChattingScreen;
