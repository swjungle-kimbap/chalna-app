import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, Button as RNButton, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, AppState, AppStateStatus, Alert, Image, KeyboardAvoidingView } from 'react-native';
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
import { sendFriendRequest, deleteChat } from "../../service/Chatting/chattingAPI";
import 'text-encoding-polyfill';
import CustomHeader from "../../components/common/CustomHeader";
import MenuModal from "../../components/common/MenuModal";
import ImageTextButton from "../../components/common/Button";
import {SafeAreaView} from "react-native-safe-area-context";
import { Keyboard } from 'react-native';

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
    const [chatRoomType, setChatRoomType] = useState<string>('');
    const [username, setUsername] = useState<string>('');


    const otherIdRef = useRef<number | null>(null);
    const friendNameRef = useRef<string>('');
    const anonNameRef = useRef<string>('');
    const chatRoomTypeRef = useRef<string>('');

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

                        // 채팅방 타입 변경
                        if (parsedMessage.type==='FRIEND_REQUEST' && parsedMessage.content==='친구가 되었습니다!\n' +
                            '대화를 이어가보세요.'){
                            console.log("친구 맺기 성공!!!")
                            //타입 & 대화명 변경
                            setChatRoomType('FRIEND');
                            setUsername(friendNameRef.current);
                            console.log("친구 맺기 성공! 채팅룸 타입: ",chatRoomType);
                            // chatRoomTypeRef.current='FRIEND';
                            // console.log("친구가 되었습니다");
                        }
                        // 화면에 표기
                        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                        scrollViewRef.current?.scrollToEnd({ animated: true }); // Auto-scroll to the bottom

                    } else {
                        //여기에 상태 메세지 받아서 처리하는 로직 추가
                        // 이미 친구가 된 상태에서 5분이 지나면 상태변경 하지않음
                        if (parsedMessage.type==='TIMEOUT' && parsedMessage.senderId===0 && chatRoomType!=='FRIEND' ){
                            setChatRoomType('WAITING');
                            console.log("5분지남! 채팅기능 비활성화 & 채팅룸타입 변경: ",chatRoomType);
                            // chatRoomTypeRef.current='WAITING';
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

    // auto scroll
    const scrollViewRef = useRef<ScrollView>(null);

    // Get out of screen -> disconnect
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
                // 여기서 timestamp 저장해야할듯
            } else {
                setupWebSocket();
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    // keyboard aware scroll
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => handleKeyboardDidShow(e)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            handleKeyboardDidHide
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleKeyboardDidShow = (e) => {
        const keyboardHeight = e.endCoordinates.height;
        scrollViewRef.current.scrollToEnd({ animated: true });
        // Optionally use keyboardHeight to adjust scroll position
    };

    const handleKeyboardDidHide = () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    };

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
                    setChatRoomType(responseData.type);
                    chatRoomTypeRef.current=responseData.type;
                    console.log('set chatroomto: ',responseData.type);

                    // Extract other member info
                    const otherMember = responseData.members.find((member: any) => member.memberId !== currentUserId);
                    if (otherMember) {
                        otherIdRef.current = otherMember.memberId;
                        friendNameRef.current = otherMember.username;
                        anonNameRef.current = `익명${otherMember.memberId}`;
                        console.log( 'friendName', friendNameRef.current);
                        setUsername(chatRoomTypeRef.current==='FRIEND'? friendNameRef.current : anonNameRef.current  );
                        console.log('채팅방 타입: 유저네임',chatRoomType, ' : ', username)

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

            fetchMessages(); // 첫 입장시 메세지 로드
            setupWebSocket(); // 소켓통신 열기

            return () => {
                const leaveTimestamp = new Date().toISOString();
                console.log("Unfocused", leaveTimestamp);
                WebSocketManager.disconnect();
            };
        }, [chatRoomId, currentUserId])
    );

    const sendMessage = () => {
        if (chatRoomType=== 'WAITING'){
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
                    title={username}
                    onBackPress={()=>navigation.navigate("채팅 목록")} //채팅 목록으로 돌아가기
                    onBtnPress={()=>sendFriendRequest(chatRoomId, otherIdRef.current)} //친구요청 보내기
                    showBtn={chatRoomType!=='FRIEND'} //친구상태 아닐때만 노출
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
                                    chatRoomType={chatRoomType}
                                />
                            ))}
                        </ScrollView>
                        <View style={chatRoomType !== 'WAITING' ? styles.inputContainer : styles.disabledInput}>
                            <TextInput
                                style={styles.input}
                                value={messageContent}
                                onChangeText={setMessageContent}
                                placeholder={chatRoomType === 'WAITING' ? '5분이 지났습니다.\n' +
                                    '대화를 이어가려면 친구요청을 보내보세요.' : ''}
                                multiline
                                textBreakStrategy="highQuality"
                                editable={chatRoomType !== 'WAITING'}
                            />
                            {chatRoomType!=='WAITING' && (
                                <ImageTextButton
                                    onPress={sendMessage}
                                    iconSource={require('../../assets/Icons/sendMsgIcon.png')}
                                    disabled={chatRoomType==='WAITING' || messageContent===''}
                                    imageStyle={{height:15, width:15}}
                                    containerStyle={{paddingRight:15}}
                            />)}
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
        borderRadius: 20,
        borderWidth:0.8,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
        color: '#a9a9a9',

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
    disabledInput: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
        backgroundColor: '#f0f0f0', // greyed-out background color
        color: '#a9a9a9', // greyed-out text color
    },
});

export default ChattingScreen;
