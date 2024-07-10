import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Keyboard,
    AppState,
    AppStateStatus,
    TouchableOpacity,
    Image,
    FlatList
} from 'react-native';
import { RouteProp, useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { userInfoState, ProfileImageMapState, JoinedLocalChatListState } from "../../recoil/atoms";
import { LoginResponse, User } from "../../interfaces";
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
import {
    chatRoomMember,
    ChatMessage,
    directedChatMessage,
    ChatRoomLocal,
    chatroomInfoAndMsg
} from "../../interfaces/Chatting.type";
import { formatDateToKoreanTime, formatDateHeader } from "../../service/Chatting/DateHelpers";
import Text from '../../components/common/Text';
import {
    saveChatMessages,
    getChatMessages,
    removeChatMessages,
    removeChatRoom,
    saveChatRoomInfo, decrementUnreadCountBeforeTimestamp, resetUnreadCountForChatRoom
} from '../../service/Chatting/mmkvChatStorage';
import { getMMKVString, setMMKVString, getMMKVObject, setMMKVObject, removeMMKVItem, loginMMKVStorage } from "../../utils/mmkvStorage";
import { IMessage } from "@stomp/stompjs";
import { launchImageLibrary } from 'react-native-image-picker'; // Import ImagePicker
import { axiosPost } from '../../axios/axios.method';
import { urls } from "../../axios/config";
import { AxiosResponse } from "axios";
import { FileResponse } from "../../interfaces";
import RNFS from "react-native-fs";
import ImageResizer from 'react-native-image-resizer';
import DateHeader from '../../components/Chat/DateHeader';
import { handleDownloadProfile } from '../../service/Friends/FriendListAPI';
import {sendFriendRequest} from "../../service/Friends/FriendRelationService";


type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    let { chatRoomId } = route.params;
    const navigation = useNavigation();

    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;
    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<directedChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chatRoomType, setChatRoomType] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [members, setMembers] = useState<chatRoomMember[]>([]);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [disconnected, setDisconnected] = useState<boolean>(false); // Add this line
    const chatRoomIdRef = useRef<string>(chatRoomId)
    const [profilePicture, setProfilePicture] = useState("");
    const profileImageMap = useRecoilValue(ProfileImageMapState);

    const otherIdRef = useRef<number | null>(null);
    const chatMessageType = useRef('CHAT');

    useBackToScreen("로그인 성공", { screen: "채팅목록", params: { screen: "채팅 목록" } });

    const flatListRef = useRef<FlatList<directedChatMessage>>(null);
    const isUserAtBottom = useRef(true);
    const [showScrollToEndButton, setShowScrollToEndButton] = useState(false);
    const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);

    const joinedLocalChatList = useRecoilValue(JoinedLocalChatListState);
    const chatRoomInfo = useMemo(() => {
        const chatRoom = joinedLocalChatList.find(room => room.chatRoomId === Number(chatRoomId));
        return chatRoom ? { name: chatRoom.name, distance: chatRoom.distance, description: chatRoom.description } : { name: 'Unknown Chat Room', distance: 0, description: '' };
    }, [chatRoomId, joinedLocalChatList]);

    const calculateDistanceInMeters = (distanceInKm) => {
        const distanceInMeters = distanceInKm * 1000;
        return Math.round(distanceInMeters);
    };

    const distanceDisplay =() => {
        const distanceInMeters = calculateDistanceInMeters(chatRoomInfo.distance);
        return distanceInMeters > 50 ? '50m+' : `${distanceInMeters}m`;
    };

    // const scrollViewRef = useRef<ScrollView>(null);


    const updateRoomInfo = async () => {
        const responseData: chatroomInfoAndMsg = await fetchChatRoomContent(chatRoomId, currentUserId);
        console.log('Update & Render Room info after Befriending');
        if (responseData) {
            const usernames = responseData.members
                .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                .map((member: chatRoomMember) => member.username);

            setChatRoomType(responseData.type);
            setMembers(responseData.members);
            setUsername(usernames.join(', ')); // for chatroom title
            const chatRoomInfo: ChatRoomLocal = {
                id: parseInt(chatRoomId, 10),
                type: responseData.type,
                members: responseData.members
            }
            saveChatRoomInfo(chatRoomInfo);
        }
        // 프로필 이미지 로드
        const filteredMembers = responseData.members.filter(member => member.memberId !== currentUserId);
        if (filteredMembers[0].profileImageId) {
            const findProfileImageId = filteredMembers[0].profileImageId;
            const newprofile = profileImageMap.get(findProfileImageId);
            if (newprofile)
                setProfilePicture(newprofile);
            else {
                const newProfileImageUri = await handleDownloadProfile(findProfileImageId);
                profileImageMap.set(findProfileImageId, newProfileImageUri);
                setProfilePicture(newprofile);
            }
        } else {
            setProfilePicture("");
        }
    };

    const handleSelectImage = () => {
        chatRoomIdRef.current = chatRoomId
        launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
            if (response.didCancel) {
                console.log('이미지 선택 취소');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                console.log("이미지 선택 완료")
                setSelectedImage(response.assets[0]);
                chatMessageType.current = 'FILE';
            }
        });
    };

    // 이미지 제거 함수 추가
    const handleRemoveImage = () => {
        setSelectedImage(null);
        chatMessageType.current = 'CHAT';
    };

    const handleUploadAndSend = async () => {
        console.log("선택된 이미지 : ", selectedImage);
        if (!selectedImage) {
            sendMessage();
            return;
        }
        const { uri, fileName, fileSize, type: contentType } = selectedImage;

        // 선택된 이미지 서버로 전송
        try {
            console.log("파일 서버로 전송중..");
            const metadataResponse = await axiosPost<AxiosResponse<FileResponse>>(`${urls.FILE_UPLOAD_URL}`, "파일 업로드", {
                fileName,
                fileSize,
                contentType
            });

            console.log("콘텐츠 타입 :", selectedImage.type);

            console.log("서버로 받은 데이터 : ", JSON.stringify(metadataResponse?.data?.data));
            const { fileId, presignedUrl } = metadataResponse?.data?.data;


            // 이미지를 리사이징
            const resizedImage = await ImageResizer.createResizedImage(
                uri,
                1500, // 너비를 500으로 조정
                1500, // 높이를 500으로 조정
                'JPEG', // 이미지 형식
                100, // 품질 (0-100)
                0, // 회전 (회전이 필요하면 EXIF 데이터에 따라 수정 가능)
                null,
                true,
                { onlyScaleDown: true }
            );

            const resizedUri = resizedImage.uri;


            // 프리사인드 URL을 사용하여 S3에 파일 업로드
            const file = await fetch(resizedUri);
            const blob = await file.blob();
            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': selectedImage.type
                },
                body: blob
            });

            if (uploadResponse.ok) {
                console.log('S3 파일에 업로드 성공');
                console.log('S3 업로드하고 진짜 자기 파일 url : ', uploadResponse.url);

                // 업로드된 파일 URL을 소켓 ?? 에 전송

                WebSocketManager.sendMessage(chatRoomId, fileId, 'FILE');

                console.log('소켓에 전송 완료');
                setSelectedImage(null);

            } else {
                console.log('실패');
            }

            chatMessageType.current = "CHAT"

        } catch (error) {
            console.error('Error 메시지: ', error);
        }
    };

    const setupWebSocket = async () => {
        try {
            const accessToken = loginMMKVStorage.getString('login.accessToken');
            WebSocketManager.connect(chatRoomId, accessToken, (message: IMessage) => {
                console.log('Received message: ' + message.body);
                try {
                    const parsedMessage: directedChatMessage = JSON.parse(message.body);
                    // 저장할 메세지
                    if (parsedMessage.type !== 'USER_ENTER' && parsedMessage.content) {

                        parsedMessage.isSelf = parsedMessage.senderId === currentUserId;
                        parsedMessage.formatedTime = formatDateToKoreanTime(parsedMessage.createdAt);

                        if(!(chatRoomType ==='FRIEND' && parsedMessage.type==='TIMEOUT')){
                            // 메세지 렌더링 & 저장 & 스크롤 업데이트
                            setMessages((prevMessages) => (prevMessages ? [...prevMessages, parsedMessage] : [parsedMessage]));
                            if (isUserAtBottom.current) {
                                flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
                                setShowScrollToEndButton(false);
                                if (parsedMessage.senderId!==currentUserId){
                                    setShowNewMessageBadge(false);
                                }
                            } else {
                                setShowScrollToEndButton(true);
                                if (parsedMessage.senderId!==currentUserId){
                                    setShowNewMessageBadge(true);
                                }
                                setTimeout(() => setShowNewMessageBadge(false), 3000);
                            }
                            // if (isUserAtBottom.current) {
                            //     flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
                            // } else {
                            //     setShowScrollToEndButton(true);
                            // }
                            saveChatMessages(chatRoomId, [parsedMessage]);
                            // setShowScrollToEndButton(false);
                        }

                        // 친구가 되었으면 채팅방 정보 다시 로드
                        if (parsedMessage.type === 'FRIEND_REQUEST'  && parsedMessage.content.includes('친구가 되었습니다!')) {
                            updateRoomInfo();
                        }

                        // TIMEOUT 메세지 왔을 때 채팅방타입 친구가 아니면 타입변경
                        if (parsedMessage.type === 'TIMEOUT' && chatRoomType !== 'FRIEND') {
                            setChatRoomType('WAITING');
                        }

                    } else {
                        // 저장 안할 메세지
                        if (parsedMessage.type === 'USER_ENTER') {
                            const lastLeaveAt = parsedMessage.content.lastLeaveAt;
                            console.log('user enter since ', lastLeaveAt);
                            decrementUnreadCountBeforeTimestamp(chatRoomId, lastLeaveAt); // readCount update
                            // load again
                            const fetchMessages = async () => {
                                const fetchedMessages = await getChatMessages(chatRoomId);
                                setMessages(fetchedMessages || []);
                            };
                            fetchMessages();
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        } catch (error) {
            console.error('Failed to set up WebSocket:', error);
        }
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleKeyboardDidShow = () => {
        setShowScrollToEndButton(false);
        // if (isUserAtBottom.current) {
        flatListRef.current?.scrollToOffset({animated: true, offset: 0});
        // }
    };

    const handleKeyboardDidHide = () => {
        setShowScrollToEndButton(false);
        // if (isUserAtBottom.current) {
        flatListRef.current?.scrollToOffset({animated: true, offset: 0});
        // }
    };

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
                setDisconnected(true); // Set disconnected to true
            } else {
                chatRoomId = chatRoomIdRef.current
                setupWebSocket();
                if (disconnected) {
                    const fetchNewMessages = async() => {
                        const responseData = await fetchChatRoomContent(chatRoomId, currentUserId);
                        if (responseData) {
                            // 메세지 형식 붙이기
                            const fetchedNewMessages: directedChatMessage[] = (responseData.messages || []).map((msg: ChatMessage) => ({
                                ...msg,
                                isSelf: msg.senderId === currentUserId,
                                formatedTime: formatDateToKoreanTime(msg.createdAt)
                            }));
                            // 렌더링
                            setMessages((prevMessages) => (prevMessages ? [...prevMessages, ...fetchedNewMessages] : fetchedNewMessages));
                            if (isUserAtBottom.current) {
                                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                                setShowScrollToEndButton(false);
                                setShowNewMessageBadge(false);
                            }
                            // 메세지 저장
                            if (fetchedNewMessages && fetchedNewMessages.length > 0) {
                                console.log("Disconnect 후 api 호출 채팅데이터: ", fetchedNewMessages);
                                saveChatMessages(chatRoomId, fetchedNewMessages);
                            }
                        }
                    };
                    fetchNewMessages();
                    setDisconnected(false);
                }
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [disconnected, currentUserId]);
     // Add disconnected to dependency array

    useFocusEffect(
        useCallback(() => {
            const fetchMessages = async () => {
                try {
                    setLoading(true);

                    const responseData = await fetchChatRoomContent(chatRoomId, currentUserId);
                    if (responseData) {
                        // 메세지 형식 붙이기
                        const fetchedMessages: directedChatMessage[] = (responseData.messages || []).map((msg: ChatMessage) => ({
                            ...msg,
                            isSelf: msg.senderId === currentUserId,
                            formatedTime: formatDateToKoreanTime(msg.createdAt)
                        }));
                        // 메세지 저장
                        if (fetchedMessages && fetchedMessages.length > 0) {
                            console.log("api 호출 채팅데이터: ", fetchedMessages);
                            saveChatMessages(chatRoomId, fetchedMessages);
                        }

                        // 채팅방 정보 저장 & 로드
                        const usernames = responseData.members
                            .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                            .map((member: chatRoomMember) => member.username);

                        setChatRoomType(responseData.type);
                        setMembers(responseData.members);
                        setUsername(usernames.join(', '));

                        // 채팅 메세지 로드
                        const storedMessages = await getChatMessages(chatRoomId);
                        setMessages(storedMessages);
                        console.log("저장된 메세지 렌더링")

                        // 채팅방 정보 저장
                        const chatRoomInfo: ChatRoomLocal = {
                            id: parseInt(chatRoomId, 10),
                            type: responseData.type,
                            members: responseData.members
                        }
                        saveChatRoomInfo(chatRoomInfo);

                        // 프로필 이미지 로드
                        const filteredMembers = responseData.members.filter(member => member.memberId !== currentUserId);
                        if (responseData.type === 'FRIEND' && filteredMembers.length === 1 && filteredMembers[0].profileImageId) {
                            const findProfileImageId = filteredMembers[0].profileImageId;
                            const newprofile = profileImageMap.get(findProfileImageId);
                            if (newprofile)
                                setProfilePicture(newprofile);
                            else {
                                const newProfileImageUri = await handleDownloadProfile(findProfileImageId);
                                profileImageMap.set(findProfileImageId, newProfileImageUri);
                                setProfilePicture(newprofile);
                            }
                        } else {
                            setProfilePicture("");
                        }
                    }
                } catch (error) {
                    console.error('채팅방 메세지 목록조회 실패:', error);
                } finally {

                    console.log("로딩 끝");
                    setLoading(false);
                }
            };

            fetchMessages();
            setupWebSocket();

            return () => {
                console.log("loose focus");
                WebSocketManager.disconnect();
                setMessages(null)
                // resetUnreadCountForChatRoom(Number(chatRoomId));
            };
        }, [chatRoomId, currentUserId])
    );

    const sendMessage = () => {
        if (chatRoomType === 'WAITING')
            return;

        if (chatMessageType.current != 'FILE' && messageContent === '')
            return;

        else if (chatMessageType.current == 'CHAT') {
            WebSocketManager.sendMessage(chatRoomId, messageContent, 'CHAT');
            setMessageContent('');
        } else {
            handleUploadAndSend();
        }
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

    const memberIdToUsernameMap = useMemo(() => {
        const map = new Map<number, string>();
        members.forEach(member => {
            map.set(member.memberId, member.username);
        });
        return map;
    }, [members]);

    const getUsernameBySenderId = (senderId: number) => {
        return memberIdToUsernameMap.get(senderId) || '(알 수 없는 사용자)';
    }


    const handleScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const buffer = 400; // Adjust buffer as necessary
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - buffer;
        isUserAtBottom.current = isAtBottom;
        setShowScrollToEndButton(!isAtBottom);
        if (isAtBottom) {
            setShowNewMessageBadge(false);
        }
    };

    const scrollToBottom = () => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
        setShowScrollToEndButton(false);
        setShowNewMessageBadge(false);
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
                // title={username}
                titleSmall = {chatRoomType==='LOCAL'? chatRoomInfo.name: username? username: '(알 수 없는 사용자)'}
                subtitle={chatRoomType==='LOCAL'? distanceDisplay(): ''}
                onBackPress={() => {
                    navigate("로그인 성공", {
                        screen: "채팅목록",
                        params: {
                            screen: "채팅 목록",
                        }
                    });
                }}
                showBtn={false}
                onMenuPress={toggleModal}
                useNav={true}
                useMenu={true}
            />
            {/*<Text>{chatRoomType}: {WebSocketManager.isConnected() ? 'Connected' : ' - '} </Text>*/}
            <View style={styles.container}>
                <View style={styles.scrollView}>
                    <FlatList
                        data={messages?.slice().reverse()} // Reverse the order of messages
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={({ item, index }) => {
                            // show profile(image & name)
                            const reverseIndex = messages.length - 1 - index;
                            const showProfileTime = reverseIndex < 5 ||
                                (!messages[reverseIndex - 1] || messages[reverseIndex - 1].senderId !== item.senderId || messages[reverseIndex -1].type==='FRIEND_REQUEST') ||
                                (!messages[reverseIndex - 1] || messages[reverseIndex - 1].formatedTime !== item.formatedTime);

                            // show date header
                            const previousMessage = messages[reverseIndex - 1];
                            const showDateHeader = !previousMessage || new Date(item.createdAt).toDateString() !== new Date(previousMessage.createdAt).toDateString();

                            return (
                                <>
                                    <MessageBubble
                                        message={item.content}
                                        datetime={item.formatedTime}
                                        isSelf={item.isSelf}
                                        type={item.type}
                                        unreadCnt={item.unreadCount}
                                        chatRoomId={Number(chatRoomId)}
                                        senderId={item.senderId}
                                        chatRoomType={chatRoomType}
                                        profilePicture={profilePicture}
                                        username={getUsernameBySenderId(item.senderId)}
                                        showProfileTime={showProfileTime}
                                    />
                                    {showDateHeader && <DateHeader date={formatDateHeader(item.createdAt)} />}

                                </>
                            );
                        }}
                        ref={flatListRef}
                        inverted
                        onContentSizeChange={() => {
                            if (isUserAtBottom.current) {
                                flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
                            } else {
                                setShowScrollToEndButton(true);
                            }
                        }}
                        onScroll={handleScroll}
                        // onContentSizeChange={() => flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })}
                    />
                </View>
                {showScrollToEndButton && (
                    // <ImageTextButton
                    //     iconSource={require('../../assets/Icons/scrollDown.png')}
                    //     imageStyle={{ height: 15, width: 15 }}
                    // />
                    <TouchableOpacity style={styles.scrollToEndButton} onPress={scrollToBottom}>
                        <Text style={styles.scrollToEndButtonText}>↓</Text>
                    </TouchableOpacity>
                )}
                {showNewMessageBadge && (
                    <TouchableOpacity style={styles.newMessageBadge} onPress={scrollToBottom}>
                        <Text style={styles.newMessageBadgeText}>새로운 메세지</Text>
                    </TouchableOpacity>
                )}
                {chatRoomType !== 'WAITING' && (
                    <View style={styles.inputContainer}>
                        <ImageTextButton
                            iconSource={require('../../assets/Icons/addImageIcon.png')}
                            imageStyle={{ height: 20, width: 20, marginLeft: 12 }}
                            onPress={handleSelectImage}
                        >
                        </ImageTextButton>
                        {selectedImage && (
                            <View style={styles.selectedImageContainer}>
                                <Image
                                    source={{ uri: selectedImage.uri }}
                                    style={styles.selectedImage}
                                />
                                <TouchableOpacity onPress={handleRemoveImage} style={styles.removeImageButton}>
                                    <Text style={styles.removeImageButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <TextInput
                            style={styles.input}
                            value={messageContent}
                            onChangeText={setMessageContent}
                            placeholder={''}
                            placeholderTextColor={'#3b3b3b'}
                            multiline
                            textBreakStrategy="highQuality"
                            editable={chatRoomType !== 'WAITING'}
                        />
                        {chatRoomType !== 'WAITING' && (
                            <ImageTextButton
                                onPress={sendMessage}
                                iconSource={require('../../assets/Icons/sendMsgIcon.png')}
                                disabled={chatRoomType === 'WAITING'}
                                imageStyle={{ height: 15, width: 15 }}
                                containerStyle={{ paddingRight: 15 }}
                            />
                        )}
                    </View>
                )}
                <MenuModal
                    isVisible={isModalVisible}
                    onClose={toggleModal}
                    menu1={'채팅방 나가기'}
                    onMenu1={handleMenu1Action}
                    members={members}
                    chatRoomId={Number(chatRoomId)}
                    chatRoomType={chatRoomType}
                />
            </View>
        </SWRConfig>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: 10,
        paddingHorizontal: 10,
    },
    scrollView: {
        // flexDirection: 'column',
        justifyContent: 'flex-end',
        flex: 1,
        paddingTop: 5,
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
        marginBottom: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        minHeight: 50,
    },
    input: {
        flex: 1,
        padding: 10,
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
    imagePickerButton: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
    },
    selectedImageContainer: {
        position: 'relative',
        marginLeft: 10,
    },
    selectedImage: {
        width: 50,
        height: 50,
    },
    removeImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageButtonText: {
        color: 'white',
        fontSize: 18,
    },
    scrollToEndButton: {
        position: 'absolute',
        right: 15,
        bottom: 62,
        backgroundColor: 'rgba(27, 116, 118, 0.4)',
        // padding: 5,
        borderRadius: 20,
        height: 20,
        width:20,
    },
    scrollToEndButtonText: {
        color: 'white',
        fontSize: 14,
    },
    newMessageBadge: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'rgba(27, 116, 118, 0.4)',
        // maxWidth: '45%',
        minWidth: 85,
        bottom: 62,
        // padding: 5,
        borderRadius: 20,
        height: 20,
    },
    newMessageBadgeText: {
        color: 'white',
        fontSize: 12,
    },
});

export default ChattingScreen;


