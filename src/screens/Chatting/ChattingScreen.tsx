import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, TextInput, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, AppState, AppStateStatus, Alert, Image, KeyboardAvoidingView } from 'react-native';
import { RouteProp, useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../recoil/atoms";
import { LoginResponse } from "../../interfaces";
import { getKeychain } from "../../utils/keychain";
import { SWRConfig } from 'swr';
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the path as necessary
import WebSocketManager from '../../utils/WebSocketManager'; // Adjust the path as necessary
import {deleteChat, fetchChatRoomContent} from "../../service/Chatting/chattingAPI";
import { sendFriendRequest } from "../../service/FriendRelationService";
import 'text-encoding-polyfill';
import CustomHeader from "../../components/common/CustomHeader";
import MenuModal from "../../components/common/MenuModal";
import ImageTextButton from "../../components/common/Button";
import { navigate } from '../../navigation/RootNavigation';
import { Keyboard } from 'react-native';
import {chatRoomMember, ChatMessage, directedChatMessage} from "../../interfaces/Chatting";


type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

// lastLeaveAt timestamp 저장: 소켓통신 끊을 때
// 첫 입장시 값이 없으면 createdAt으로 대체
// 소켓통신 끊어졌을동안에 온 메세지: 화면 로딩시 저장? or 올때마다 저장? batch로 저장하면 그렇게 큰 부하가 있을까?


const ChattingScreen = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    const { chatRoomId } = route.params;
    const navigation = useNavigation();

    // MyId 저장해둔 것 가져오기
    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;
    // 메세지 입력창
    const [messageContent, setMessageContent] = useState<string>('');
    // 화면에 띄우는 메세지들
    const [messages, setMessages] = useState<directedChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chatRoomType, setChatRoomType] = useState<string>('');
    const [username, setUsername] = useState<string>('');

    const otherIdRef = useRef<number | null>(null);
    const friendNameRef = useRef<string>('');
    const anonNameRef = useRef<string>('');
    const chatRoomTypeRef = useRef<string>('');

    // 채팅방 연결하고 실시간으로 메세지 보내고 받기
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

                        // 친구요청 수락시 채팅방 타입 변경
                        if (parsedMessage.type==='FRIEND_REQUEST' && parsedMessage.content==='친구가 되었습니다!\n' +
                            '대화를 이어가보세요.'){
                            console.log("친구 맺기 성공!!!")
                            //타입 & 대화명 변경
                            setChatRoomType('FRIEND');
                            setUsername(friendNameRef.current);
                            console.log("친구 맺기 성공! 채팅룸 타입: ",chatRoomType);
                            // chatRoomTypeRef.current='FRIEND';
                        }
                        // 수신 메세지 화면에 표기
                        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                        scrollViewRef.current?.scrollToEnd({ animated: true }); // Auto-scroll to the bottom
                    } else {  //채팅방에 표시안하는 메세지 여기서 처리
                        // TIMEOUT 메세지 오면 채팅방 타입 변경
                        // 이미 친구가 된 상태에서 5분이 지나면 상태변경 하지않음
                        if (parsedMessage.type==='TIMEOUT' && parsedMessage.senderId===0 && chatRoomType!=='FRIEND' ){
                            setChatRoomType('WAITING');
                            console.log("5분지남! 채팅기능 비활성화 & 채팅룸타입 변경: ",chatRoomType);
                            // chatRoomTypeRef.current='WAITING';
                        }
                        // type==='USER_ENTER' 메세지 관련 상태로직 필요시 추가 -> senderId 확인 필요 0인지 userId인지
                    }
                } catch (error) { //양식과 다른 메세지 형태를 받는 경우
                    console.error('Failed to parse received message:', error);
                }
            });
        } catch (error) {
            console.error('Failed to set up WebSocket:', error);
        }
    };

    // auto scroll. 1) 새로운 메세지 받은 경우 2) 키보드 상태에 따라 스크롤 아래로
    const scrollViewRef = useRef<ScrollView>(null);

    // 키보드 상태 변화감지 -> 스크롤 맨아래로 이동
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

    // 키보드 나왔을 때 액션
    const handleKeyboardDidShow = (e) => {
        const keyboardHeight = e.endCoordinates.height;
        scrollViewRef.current.scrollToEnd({ animated: true });
    };
    // 키보드 들어갔을 때 액션
    const handleKeyboardDidHide = () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    };

    // Get out of screen -> disconnect
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
                // 여기서 timestamp 저장
            } else {
                setupWebSocket();
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
                    // lastLeaveAt 형태확인/Null일때 createdAt으로 대체하는 로직 추가
                    const responseData = await fetchChatRoomContent(chatRoomId, '2024-06-23T10:32:40', currentUserId);
                    // 채팅방 타입, 유저네임, 받은 메세지 리턴받아서 화면에 렌더링
                    if (responseData){
                        console.log('chatRoomType: ', responseData.type);
                        const usernames = responseData.members
                            .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                            .map((member: chatRoomMember) => responseData.type === 'FRIEND' ? member.username : `익명${member.memberId}`);
                        console.log('username: ',usernames);
                        // 메세지 목록
                        const fetchedMessages: directedChatMessage[] = (responseData.list || []).map((msg: ChatMessage) => ({
                            ...msg,
                            isSelf: msg.senderId === currentUserId,
                        }));
                        console.log("응답 메세지 목록: ", responseData.list);
                        console.log("fetched msg: ", fetchedMessages);

                        setChatRoomType(responseData.type);
                        setUsername(usernames);
                        setMessages(fetchedMessages);
                    } else {
                        console.log("no data to load");
                    }




                } catch (error) {
                    console.error('채팅방 메세지 목록조회 실패:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchMessages(); // 첫 입장시 메세지 로드 & 로두 후 소켓통신 열기
            setupWebSocket(); // 소켓통신 열기

            return () => {
                const leaveTimestamp = new Date().toISOString();
                console.log("Unfocused", leaveTimestamp);
                WebSocketManager.disconnect();
            };
        }, [chatRoomId, currentUserId])
    );

    // 일반 메세지 전송
    const sendMessage = () => {
        if (chatRoomType=== 'WAITING'){ //WAITING 상태 통신 로직 개선 필요
            return;
        }
        WebSocketManager.sendMessage(chatRoomId, messageContent, 'CHAT');
        // setMessages((prevMessages) => [...prevMessages, { ...messageObject, isSelf: true, createdAt: new Date().toISOString() }]);
        setMessageContent(''); //  입력창 초기화
        // scrollViewRef.current?.scrollToEnd({ animated: true }); // Auto-scroll to the bottom
    };

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    // 채팅방 나가기
    const handleMenu1Action = () => {

            const response = deleteChat(navigation, chatRoomId);
            if (response)
                toggleModal();
    };

    const sendOneOnOneFriendRequest = () => {
        // 친구 요청 전송
        const response = sendFriendRequest(chatRoomId, otherIdRef.current);
        if (response){ // 성공시 친구요청 채팅메세지 보내기
            WebSocketManager.sendMessage(chatRoomId, "친구 요청을 보냈습니다.",'FRIEND_REQUEST');
        }
    }

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
                    onBackPress={()=>{
                        navigate("로그인 성공", {
                            screen: "채팅목록",
                            params: {
                                screen: "채팅 목록",
                            }
                        });
                        navigation.navigate("채팅 목록");
                    }}
                    onBtnPress={()=>sendOneOnOneFriendRequest()} //친구요청 보내기(API+메세지 전송)
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
                            {Array.isArray(messages) && messages.map((msg, index) => (
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
                                    username={"익명12"}
                                    profilePicture={"https://oceancolor.gsfc.nasa.gov/gallery/feature/images/LC08_L1TP_174029-031_20201230_20201230_01_RT.EasternBlackSea.crop.small.jpg"}
                                />
                            ))}
                        </ScrollView>
                        <View style={chatRoomType !== 'WAITING' ? styles.inputContainer : styles.disabledInputContainer}>
                            <TextInput
                                style={styles.input}
                                value={messageContent}
                                onChangeText={setMessageContent}
                                placeholder={chatRoomType === 'WAITING' ? '5분이 지났습니다.\n' +
                                    '대화를 이어가려면 친구요청을 보내보세요.' : ''}
                                placeholderTextColor={'#a9a9a9'}
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
                            onMenu1={handleMenu1Action}
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
        marginBottom: 15,
        shadowOffset: { width: 0, height: 4 },  // Direction and distance of the shadow
        shadowOpacity: 0.25,        // Opacity of the shadow
        shadowRadius: 5,
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
    disabledInputContainer: {
        flex: 1,
        padding: 10,
        marginLeft: 10,
        backgroundColor: '#f0f0f0', // greyed-out background color
        color: '#a9a9a9', // greyed-out text color
    },
});

export default ChattingScreen;
