import {showModal} from "../../context/ModalService";

<script src="http://143.248.225.26:8097"></script>

import React, {useEffect, useState, useCallback, useRef, useMemo, Profiler} from 'react';
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
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent
} from 'react-native';
import { RouteProp, useRoute, useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { userInfoState, LocalChatListState } from "../../recoil/atoms";
import { LoginResponse, User } from "../../interfaces";
import { SWRConfig } from 'swr';
import WebSocketManager from '../../utils/WebSocketManager'; // Adjust the path as necessary
import {deleteChat, fetchChatRoomContent, fetchChatRoomMember} from "../../service/Chatting/chattingAPI";
import 'text-encoding-polyfill';
import CustomHeader from "../../components/common/CustomHeader";
import MenuModal from "../../components/common/MenuModal";
import ImageTextButton from "../../components/common/Button";
import {navigate} from '../../navigation/RootNavigation';
import {
    chatRoomMember, ChatMessage, directedChatMessage,
    ChatRoomLocal, chatroomInfoAndMsg, chatRoomMemberInfo
} from "../../interfaces/Chatting.type";
import {formatDateToKoreanTime, formatDateHeader} from "../../service/Chatting/DateHelpers";
import Text from '../../components/common/Text';
import {
    saveChatMessages, getChatMessages, removeChatRoom, getChatRoomInfo,
    saveChatRoomInfo, decrementUnreadCountBeforeTimestamp, getAllChatMessages, doesChatRoomExist
} from '../../service/Chatting/mmkvChatStorage';
import {getMMKVString, loginMMKVStorage, setMMKVString} from "../../utils/mmkvStorage";
import {IMessage} from "@stomp/stompjs";
import {launchImageLibrary, ImageLibraryOptions, ImagePickerResponse} from 'react-native-image-picker'; // Import ImagePicker
import {axiosPost} from '../../axios/axios.method';
import {urls} from "../../axios/config";
import {AxiosResponse} from "axios";
import {FileResponse} from "../../interfaces";
import ImageResizer from 'react-native-image-resizer';
import DateHeader from '../../components/Chat/DateHeader';
import Announcement from "../../components/Chat/Announcement";
import {useBuffer} from "../../context/BufferContext";
import MessageBubble from '../../components/Chat/MessageBubble/MessageBubble';
import { getImageUri } from '../../utils/FileHandling';
import color from "../../styles/ColorTheme";



const onRenderCallback = (
    id, // the "id" prop of the Profiler tree that has just committed
    phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration, // time spent rendering the committed update
    baseDuration, // estimated time to render the entire subtree without memoization
    startTime, // when React began rendering this update
    commitTime, // when React committed this update
    interactions // the Set of interactions belonging to this update
) => {
    console.log({
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions
    });
};

type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen: React.FC = () => {
    const route = useRoute<ChattingScreenRouteProp>();
    let {chatRoomId} = route.params;
    const navigation = useNavigation();

    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;
    const [messageContent, setMessageContent] = useState<string>('');
    const [messages, setMessages] = useState<directedChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [chatRoomType, setChatRoomType] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [members, setMembers] = useState<chatRoomMember[]>([]);
    const [memberCount, setMemberCount] = useState<string>(null);
    const [myname, setMyname] = useState<string>(null);


    const [selectedImage, setSelectedImage] = useState<any>(null);

    // paging
    const [viewableItems, setViewableItems] = useState<number[]>([]);

    const urlQuery = useRef<string>('');
    const isInitialLoadCompleteRef = useRef<boolean>(false);
    const { socketMessageBuffer, addMessageToBuffer, clearBuffer } = useBuffer();
    const updatedMessageBuffer = useRef<directedChatMessage[]>([]);
    const batchSize = 20;

    const chatRoomIdRef = useRef<string>(chatRoomId);
    const chatRoomTypeRef = useRef<string>(chatRoomType);

    const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false); // State for showing announcement

    const chatMessageType = useRef<string>('CHAT');
    const isSending = useRef<boolean>(false);
    const isSendingImage = useRef<boolean>(false);

    const flatListRef = useRef<FlatList<directedChatMessage>>(null);
    const isUserAtBottom = useRef<boolean>(true);
    const [showScrollToEndButton, setShowScrollToEndButton] = useState<boolean>(false);
    const [showNewMessageBadge, setShowNewMessageBadge] = useState<boolean>(false);

    const localChatList = useRecoilValue(LocalChatListState);
    const chatRoomInfo = useMemo(() => {
        const chatRoom = localChatList.find(room => room.localChat.chatRoomId === Number(chatRoomId));
        return chatRoom ? { name: chatRoom.localChat.name, distance: chatRoom.localChat.distance, description: chatRoom.localChat.description } : { name: 'Unknown Chat Room', distance: 0, description: '' };
    }, [chatRoomId, localChatList]);

    const calculateDistanceInMeters = (distanceInKm: number) => {
        const distanceInMeters = distanceInKm * 1000;
        return Math.round(distanceInMeters);
    };

    const distanceDisplay = () => {
        const distanceInMeters = calculateDistanceInMeters(chatRoomInfo.distance);
        return distanceInMeters > 100 ? '100m+' : `${distanceInMeters}m`;
    };

    const AnnouncementMsg = () => {
        if (chatRoomType === 'LOCAL') {
            return "거리가 멀어지면 채팅이 종료됩니다."
            //"이전 대화내역을 볼 수 있습니다." +
            // + chatRoomInfo.name+': '+ chatRoomInfo.description;
        } else if (chatRoomType === 'MATCH') {
            return "상대와 5분동안 대화할 수 있습니다."
        } else {
            return ""
        }
    }

    useEffect(() => {
        if (chatRoomType === 'LOCAL' || chatRoomType === 'MATCH') {
            setShowAnnouncement(true);
        } else {
            setShowAnnouncement(false);
        }
    }, [chatRoomType]);

    const updateRoomInfo = async () => {
        const responseData: chatRoomMemberInfo = await fetchChatRoomMember(chatRoomId);
        // console.log('Update & Render Room info after Befriending');
        if (responseData) {
            setMembers(responseData.members);
            setMemberCount(String(responseData.memberCount));

            console.log("==== Chat Room Type: ", chatRoomTypeRef.current);
            if (chatRoomTypeRef.current!=='LOCAL'){
                const usernames = responseData.members
                    .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                    .map((member: chatRoomMember) => member.username)
                    .join(', ');
                setUsername(usernames)
                console.log("======= update chatroom title =====")
            }
            // const chatRoomName = chatRoomType==='LOCAL'? (chatRoomInfo? chatRoomInfo.name : "장소 채팅"):usernames;
            // setUsername(chatRoomName);

            const chatRoomInfoToStore: ChatRoomLocal = {
                id: parseInt(chatRoomId, 10),
                chatRoomMemberInfo: responseData,
                // name: chatRoomName
            }
            saveChatRoomInfo(chatRoomInfoToStore);
        }

    };




    const handleSelectImage = () => {
        chatRoomIdRef.current = chatRoomId;
        const options: ImageLibraryOptions = {mediaType: 'photo', includeBase64: false};
        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('이미지 선택 취소');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                console.log("이미지 선택 완료");
                setSelectedImage(response.assets[0]);
                chatMessageType.current = 'FILE';
            }
        });
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        chatMessageType.current = 'CHAT';
    };

    const handleUploadAndSend = async () => {
        // console.log("선택된 이미지 : ", selectedImage);
        if (isSendingImage.current) return;
        isSendingImage.current=true;

        if (!selectedImage) {
            sendMessage();
            return;
        }
        const {uri, fileName, fileSize, type: contentType} = selectedImage;

        try {
            // console.log("파일 서버로 전송중..");
            const metadataResponse = await axiosPost<AxiosResponse<FileResponse>>(`${urls.FILE_UPLOAD_URL}`, "파일 업로드", {
                fileName,
                fileSize,
                contentType
            });

            // console.log("콘텐츠 타입 :", selectedImage.type);

            // console.log("서버로 받은 데이터 : ", JSON.stringify(metadataResponse?.data?.data));
            const {fileId, presignedUrl} = metadataResponse?.data?.data;

            const resizedImage = await ImageResizer.createResizedImage(
                uri,
                1500, // 너비를 1500으로 조정
                1500, // 높이를 1500으로 조정
                'JPEG', // 이미지 형식
                80, // 품질 (0-100)
                0, // 회전 (회전이 필요하면 EXIF 데이터에 따라 수정 가능)
                null,
                true,
                {onlyScaleDown: true}
            );

            const resizedUri = resizedImage.uri;

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
                console.log('S3 업로드하고 진짜 자기 파일 url : ', uploadResponse.url);
                WebSocketManager.sendMessage(chatRoomId, fileId, 'FILE');
                setSelectedImage(null);

            } else {
                console.log('실패');
            }
            chatMessageType.current = "CHAT";
        } catch (error) {
            console.error('Error 메시지: ', error);
        }  finally {
        isSendingImage.current=false;
    }
};

    const handleIncomingSocketMessage = (newMessage: directedChatMessage) => {
        console.log("===haneld Incoming socket msg, initialLoad status: ", isInitialLoadCompleteRef.current);
        if (isInitialLoadCompleteRef.current) {
            // Add the new message to the existing state
            console.log("handleincoming SocketMessage | newMessage: ", newMessage);
            setMessages(prevMessages => [...(prevMessages || []), newMessage]); // set incomming messages
            if (isUserAtBottom.current) {
                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                setShowScrollToEndButton(false);
                if (newMessage.senderId !== currentUserId) {
                    setShowNewMessageBadge(false);
                }
            } else {
                setShowScrollToEndButton(true);
                if (newMessage.senderId !== currentUserId) {
                    setShowNewMessageBadge(true);
                }
                setTimeout(() => setShowNewMessageBadge(false), 3000);
            }
            updatedMessageBuffer.current = [...updatedMessageBuffer.current, newMessage]; // append to buffer
            if (updatedMessageBuffer.current.length % batchSize === 0) {
                saveChatMessages(chatRoomId, updatedMessageBuffer.current);
                updatedMessageBuffer.current=[]; // clear buffer
            }
        } else {
            // Buffer the message until the initial load is complete
            socketMessageBuffer.push(newMessage);
        }
    };


    const setupWebSocket = async (newChatRoomId, callback?: () => void) => {
        try {
            const accessToken = loginMMKVStorage.getString('login.accessToken');
            WebSocketManager.connect(newChatRoomId, accessToken, (message: IMessage) => {
                console.log('Received message: ' + message.body);
                try {
                    const parsedMessage: directedChatMessage = JSON.parse(message.body);

                    // 저장할 메세지 필터링
                    if (parsedMessage.type !== 'USER_ENTER' && parsedMessage.content) {
                        parsedMessage.isSelf = parsedMessage.senderId === currentUserId;
                        parsedMessage.formatedTime = formatDateToKoreanTime(parsedMessage.createdAt);

                        if (!(chatRoomType === 'FRIEND' && parsedMessage.type === 'TIMEOUT')) {
                            console.log("=====실행 확인======");
                            console.log(parsedMessage);
                            handleIncomingSocketMessage(parsedMessage); // set 바로 저장 배치 단위로
                        }

                        if (parsedMessage.type === 'FRIEND_REQUEST' && parsedMessage.content.includes('친구가 되었습니다!')) {
                            if ( parsedMessage.senderId!==currentUserId ) {
                                showModal('친구 맺기 성공', '친구와의 인연 기록을 보겠습니까?', () => {
                                    navigate("로그인 성공", {
                                        screen: "친구",
                                        params: {
                                            screen: "스쳐간 기록",
                                            params: {otherId: parsedMessage.senderId}
                                        }
                                    })
                                }, undefined, false);
                            }
                            chatRoomTypeRef.current = 'FRIEND';
                            setChatRoomType('FRIEND')
                            updateRoomInfo();
                        }

                        if (parsedMessage.type==='USER_JOIN' || parsedMessage.type==='USER_LEAVE'){
                            updateRoomInfo();
                        }

                        if (parsedMessage.type === 'TIMEOUT' && chatRoomType !== 'FRIEND') {
                            chatRoomTypeRef.current = 'WAITING';
                            setChatRoomType('WAITING');
                        }

                    } else {
                        if (parsedMessage.type === 'USER_ENTER') {
                            // handle unread count
                            const lastLeaveAt = parsedMessage.content.lastLeaveAt;
                            console.log('user enter since ', lastLeaveAt);

                            decrementUnreadCountBeforeTimestamp(newChatRoomId, lastLeaveAt);

                            // 현재 화면에 띄어져 있는 메시지도 unreadCount 업데이트
                            setMessages(messages => {
                                const updatedMessages = (messages || []).map(message => {
                                    if (message && message.createdAt >= lastLeaveAt && message.unreadCount > 0) {
                                        return { ...message, unreadCount: message.unreadCount - 1 };
                                    }
                                    return message
                                })
                                return updatedMessages
                            })

                            // 버퍼에 있는 메시지도 unreadCount 업데이트
                            updatedMessageBuffer.current = updatedMessageBuffer.current.map(message => {
                                if (message.createdAt >= lastLeaveAt && message.unreadCount > 0) {
                                    return { ...message, unreadCount: message.unreadCount - 1 };
                                }
                                return message;
                            })


                            // const updateMessages = async () => {
                            //     const updatedMessages = await getAllChatMessages(newChatRoomId);
                            //     console.log("updatedMessages", updatedMessages)
                            //     setMessages(updatedMessages || []);
                            // };
                            // updateMessages();
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            });

            if (callback) {
                callback();
            }

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
        if (isUserAtBottom.current) {
            flatListRef.current?.scrollToOffset({animated: true, offset: 0});
        }
    };

    const handleKeyboardDidHide = () => {
        setShowScrollToEndButton(false);
        if (isUserAtBottom.current) {
            flatListRef.current?.scrollToOffset({animated: true, offset: 0});
        }
    };

    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                WebSocketManager.disconnect();
            } else {
                const savedRoute = getMMKVString('currentRouteName');
                if (savedRoute === '채팅') {
                chatRoomId = chatRoomIdRef.current;
                setupWebSocket(chatRoomId,()=>fetchMessages(false));
            }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [currentUserId]);

        const fetchMessages = async (isInitialLoad: boolean) => {


            try {

                if (isInitialLoad){
                    const showLocalModal = getMMKVString('showPrevModal')==='local';
                    if (showLocalModal && !doesChatRoomExist(Number(chatRoomId))){
                        await new Promise<void>((resolve)=> {
                            showModal(
                                "장소톡 입장",
                                "이전 대화내역을 불러오시겠습까?",
                                () => {
                                    urlQuery.current = '?includePrevious=true'
                                    resolve();
                                },
                                ()=>{
                                    resolve();
                                },
                                true,
                                '예',
                                '아니오'
                            );
                        });
                    }
                    setMMKVString('showPrevModal','');

                    setLoading(true);
                    // Step 1: Load stored messages and information first
                    const latestMessages = await getChatMessages(chatRoomId, batchSize, null);
                    // console.log('latest MSGs: ', latestMessages)
                    if (latestMessages && latestMessages.length > 0) {
                        setMessages(latestMessages); // Load latest messages
                        console.log("Loaded latest messages from local storage");
                    }
                    // Load basic chat room information from stored data
                    const chatRoomInfoFromStorage = getChatRoomInfo(Number(chatRoomId)); // Assuming this function exists
                    // console.log("=========== on fetching data from Local Storage chatRoomId: ", chatRoomId);
                    // console.log("data from storage: ", chatRoomInfoFromStorage);
                    if (chatRoomInfoFromStorage) {
                        setChatRoomType(chatRoomInfoFromStorage.type);
                        setMembers(chatRoomInfoFromStorage.chatRoomMemberInfo.members);
                        setUsername(chatRoomInfoFromStorage.name);
                        setMemberCount(String(chatRoomInfoFromStorage.chatRoomMemberInfo.memberCount));
                    }
                    setLoading(false);

                }


                // Step 2: Fetch the latest data from the API

                const responseData = await fetchChatRoomContent(chatRoomId, currentUserId, urlQuery.current);
                urlQuery.current='';
                console.log("response ", responseData);
                if (responseData) {
                    const fetchedMessages: directedChatMessage[] = (responseData.messages || []).map((msg: ChatMessage) => ({
                        ...msg,
                        isSelf: msg.senderId === currentUserId,
                        formatedTime: formatDateToKoreanTime(msg.createdAt)
                    }));

                    if (fetchedMessages.length > 0) {
                        // console.log("API fetched messages: ", fetchedMessages);
                        // saveChatMessages(chatRoomId, fetchedMessages);

                        // Merge fetched messages with stored messages and keep all messages

                        // setMessages(prevMessages => {
                        //     const allMessages = [
                        //         ...(prevMessages || []),
                        //         ...fetchedMessages,
                        //         ...(socketMessageBuffer || [])
                        //     ].filter(msg => msg !== null && msg !== undefined);
                        //     saveChatMessages(chatRoomId, allMessages); // Save merged messages to storage
                        //     return allMessages;
                        // });


                        setMessages(prevMessages => {
                            const messageMap = new Map();

                            prevMessages?.forEach(msg => {
                                if (msg && msg.id) {
                                    messageMap.set(msg.id, msg)
                                }
                            });

                            // 메시지 id가 겹치는 경우 새로운 메시지로 업데이트
                            fetchedMessages?.forEach(msg => {
                                if (msg && msg.id) {
                                    messageMap.set(msg.id, msg);
                                }
                            });

                            if (socketMessageBuffer) {
                                socketMessageBuffer.forEach(msg => {
                                    if (msg && msg.id) {
                                        messageMap.set(msg.id, msg);
                                    }
                                })
                            };

                            const allMessages = Array.from(messageMap.values());
                            saveChatMessages(chatRoomId, allMessages); // Save merged messages to storage
                            return allMessages;
                        })


                        // handle scroll
                        if (isUserAtBottom.current) {
                            flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                            setShowScrollToEndButton(false);
                        } else {
                            setShowNewMessageBadge(false);
                            setTimeout(() => setShowNewMessageBadge(false), 3000);
                        }

                        // clear the buffer
                        socketMessageBuffer.length = 0;
                        // reset query

                    }

                    chatRoomTypeRef.current = responseData.type;
                    setChatRoomType(responseData.type);
                    setMembers(responseData.chatRoomMemberInfo.members);

                    const usernames = responseData.chatRoomMemberInfo.members
                        .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                        .map((member: chatRoomMember) => member.username)
                        .join(', ');

                    const chatRoomName =
                        responseData.type !== 'LOCAL' ? usernames :
                            chatRoomInfo? chatRoomInfo.name : "";

                    setUsername(chatRoomName);
                    setMemberCount(String(responseData.chatRoomMemberInfo.memberCount));

                    const chatRoomInfoToSave: ChatRoomLocal = {
                        id: parseInt(chatRoomId, 10),
                        type: responseData.type,
                        chatRoomMemberInfo: responseData.chatRoomMemberInfo,
                        name: chatRoomName
                    };
                    saveChatRoomInfo(chatRoomInfoToSave);

                    const myname = responseData.chatRoomMemberInfo.members
                        .filter((member: chatRoomMember)=> member.memberId===currentUserId)
                        .map((member: chatRoomMember)=> member.username)
                    setMyname(myname);

                }

            } catch (error) {
                console.error('채팅방 내역 조회 실패:', error);
            } finally {
                isInitialLoadCompleteRef.current = true;
            }
        };


    useFocusEffect(
        useCallback(() => {
            isInitialLoadCompleteRef.current=false;
            const socketMessageBuffer: directedChatMessage[] = [];
            setupWebSocket(chatRoomId,()=>fetchMessages(true));

            return () => {
                // console.log("loose focus");
                WebSocketManager.disconnect();
                // console.log("===소켓 메세지 버퍼=== ",updatedMessageBuffer.current);
                saveChatMessages(chatRoomId, updatedMessageBuffer.current);
                updatedMessageBuffer.current=[]; // empty buffer
                setMembers([]);
                setChatRoomType(null);
                setMessages(null);
                setUsername("");
                setMemberCount("");
            };
        }, [chatRoomId, currentUserId])
    );

    const sendMessage = () => {
        if (isSending.current) return;
        if (chatRoomType === 'WAITING') return;
        if (chatMessageType.current !== 'FILE' && messageContent === '') return;

        isSending.current = true;

        try{
            if (chatMessageType.current === 'CHAT') {
                WebSocketManager.sendMessage(chatRoomId, messageContent, 'CHAT');
                setMessageContent('');
            } else {
                handleUploadAndSend();
            }
        } catch {
            console.log("failed to send messages");
        } finally {
            isSending.current = false;
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
            WebSocketManager.disconnect();
            clearBuffer();
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


    const senderIdToProfileIdMap = useMemo(() => {
        const map = new Map<number, number>();
        members.forEach(member => {
            map.set(member.memberId, member.profileImageId);
        });
        return map;
    }, [members]);

    const getProfileIdBySenderId = (senderId: number) => {
        return senderIdToProfileIdMap.get(senderId) || 0;
    }


    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const {contentOffset} = event.nativeEvent;
        const buffer = 300; // Adjust buffer as necessary
        const isAtBottom = contentOffset.y <= buffer; // inverted라서 offset 0 기준으로 잡아야함
        isUserAtBottom.current = isAtBottom;
        setShowScrollToEndButton(!isAtBottom);
        if (isAtBottom) {
            setShowNewMessageBadge(false);
        }
    };

    const scrollToBottom = () => {
        flatListRef.current?.scrollToOffset({animated: true, offset: 0});
        setShowScrollToEndButton(false);
        setShowNewMessageBadge(false);
    };


    const fetchEarlierMessages = async () => {
        const lastMessageId = messages.length > 0 ? messages[0].id : null;
        const moreMessages = await getChatMessages(chatRoomId, batchSize, lastMessageId); // Load more messages with lastMessageId
        if (moreMessages && moreMessages.length > 0) {
            setMessages(prevMessages => [...moreMessages, ...(prevMessages || [])]);
        }
    };


    // Viewable Items
    const onViewableItemsChanged = useCallback(({viewableItems}) => {
        setViewableItems(viewableItems.map(item => item.index));
    }, []);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    const renderItem = ({ item, index }) => {
        const reverseIndex = messages.length - 1 - index;
        const showProfileTime = reverseIndex < 5 ||
            (!messages[reverseIndex - 1] || messages[reverseIndex - 1].senderId !== item.senderId || messages[reverseIndex - 1].type === 'FRIEND_REQUEST') ||
            (!messages[reverseIndex - 1] || messages[reverseIndex - 1].formatedTime !== item.formatedTime);

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
                    profileImageId={getProfileIdBySenderId(item.senderId)}
                    username={getUsernameBySenderId(item.senderId)}
                    showProfileTime={showProfileTime}
                    myname={myname}
                />
                {showDateHeader && <DateHeader date={formatDateHeader(item.createdAt)} />}
            </>
        );
    };


    return (
        <SWRConfig value={{}}>
            <CustomHeader
                title={username}
                MemberCnt={memberCount}
                subtitle={chatRoomType === 'LOCAL' ? distanceDisplay() : ''}
                onBackPress={() => {
                    navigate("로그인 성공", {
                        screen: "대화",
                    });
                }}
                showBtn={false}
                onMenuPress={toggleModal}
                useNav={true}
                useMenu={true}
            />
            <View style={styles.container}>
                {showAnnouncement && (
                    <Announcement
                        message={AnnouncementMsg()}
                        onClose={() => setShowAnnouncement(false)}
                    />
                )}
                <View style={styles.scrollView}>
                    <FlatList
                        data={messages?.slice().reverse()} // Reverse the order of messages
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderItem}
                        ref={flatListRef}
                        inverted
                        onContentSizeChange={() => {
                            if (isUserAtBottom.current) {
                                flatListRef.current?.scrollToOffset({animated: true, offset: 0});
                            } else {
                                setShowScrollToEndButton(true);
                            }
                        }}
                        onScroll={handleScroll}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        onEndReached={fetchEarlierMessages}
                        onEndReachedThreshold={0.5}
                    />
                </View>
                {showScrollToEndButton && (
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
                            imageStyle={{height: 20, width: 20, marginLeft: 12}}
                            onPress={handleSelectImage}
                        />
                        {selectedImage && (
                            <View style={styles.selectedImageContainer}>
                                <Image
                                    source={{uri: selectedImage.uri}}
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
                                imageStyle={{height: 15, width: 15, tintColor: color.colors.main}}
                                containerStyle={{paddingRight: 15}}
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
                    myname={myname}
                />
            </View>
        </SWRConfig>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: "#F2F8FF"
    },
    scrollView: {
        justifyContent: 'flex-start',
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
        shadowOffset: {width: 0, height: 4},
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
        tintColor: color.colors.main
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
        borderRadius: 20,
        height: 20,
        width: 20,
    },
    scrollToEndButtonText: {
        color: 'white',
        fontSize: 14,
    },
    newMessageBadge: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'rgba(27, 116, 118, 0.4)',
        minWidth: 85,
        bottom: 62,
        borderRadius: 20,
        height: 20,
    },
    newMessageBadgeText: {
        color: 'white',
        fontSize: 12,
    },
});

export default ChattingScreen;
