// ChattingScreen.tsx
import React, {useEffect, useState, useCallback, useRef, useMemo} from 'react';
import { View, TextInput, ScrollView, StyleSheet, ActivityIndicator, Keyboard, AppState, AppStateStatus,  TouchableOpacity , Text as RNText, Image} from 'react-native';
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
import {
    chatRoomMember,
    ChatMessage,
    directedChatMessage,
    ChatRoomLocal,
    chatroomInfoAndMsg
} from "../../interfaces/Chatting.type";
import { formatDateToKoreanTime } from "../../service/Chatting/DateHelpers";
import Text from '../../components/common/Text';
import {
    saveChatMessages,
    getChatMessages,
    removeChatMessages,
    removeChatRoom,
    saveChatRoomInfo, decrementUnreadCountBeforeTimestamp, resetUnreadCountForChatRoom
} from '../../service/Chatting/mmkvChatStorage';
import {getMMKVString, setMMKVString, getMMKVObject, setMMKVObject, removeMMKVItem, loginMMKVStorage} from "../../utils/mmkvStorage";
import {IMessage} from "@stomp/stompjs";
import { launchImageLibrary } from 'react-native-image-picker'; // Import ImagePicker
import { axiosPost } from '../../axios/axios.method';
import {urls} from "../../axios/config";
import { AxiosResponse } from "axios";
import { FileResponse } from "../../interfaces";
import RNFS from "react-native-fs";


type ChattingScreenRouteProp = RouteProp<{ ChattingScreen: { chatRoomId: string } }, 'ChattingScreen'>;

const ChattingScreen = (factory: () => T, deps: React.DependencyList) => {
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
    const [members, setMembers] = useState<chatRoomMember[]>([]);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const otherIdRef = useRef<number | null>(null);
    const chatMessageType = useRef('CHAT');

    useBackToScreen("로그인 성공", { screen: "채팅목록", params: { screen: "채팅 목록" } });

    const scrollViewRef = useRef<ScrollView>(null);

    // const memoizedMessages = useMemo(() => {
    //     return messages.map(msg => ({
    //         ...msg,
    //         isSelf: msg.senderId === currentUserId,
    //         formatedTime: formatDateToKoreanTime(msg.createdAt)
    //     }));
    // }, [messages, currentUserId]);

    const updateRoomInfo = async () => {
            const responseData: chatroomInfoAndMsg = await fetchChatRoomContent(chatRoomId, currentUserId);
            if (responseData) {
                const usernames = responseData.members
                    .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                    .map((member: chatRoomMember) => member.username);

                setChatRoomType(responseData.type);
                setMembers(responseData.members);
                setUsername(usernames.join(', '));

                const chatRoomInfo: ChatRoomLocal = {
                    id: parseInt(chatRoomId, 10),
                    type: responseData.type,
                    members: responseData.members
                }
                saveChatRoomInfo(chatRoomInfo);
            }
    };


    const handleSelectImage = () => {
        launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                console.log("handleSelectImage")
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

    const hadleUploadAndSend = async () => {
        console.log("선택된 이미지 : ",selectedImage);
        if (!selectedImage) {
            sendMessage();
            return; 
        }
        // const uri = response.assets[0].uri; // assets 여러개 중 0번방 꺼
        const { uri, fileName, fileSize, type: contentType } = selectedImage;
        
        // 선택된 이미지 서버로 전송
        try {
            console.log("파일 서버로 전송중..");
            const metadataResponse = await axiosPost<AxiosResponse<FileResponse>>(`${urls.FILE_UPLOAD_URL}${chatRoomId}`,"파일 업로드",{
                fileName,
                fileSize,
                contentType 
        });

        console.log("콘텐츠 타입 :",selectedImage.type);

        console.log("서버로 받은 데이터 : ", JSON.stringify(metadataResponse?.data?.data));
        const { fileId, presignedUrl } = metadataResponse?.data?.data;

        // 프리사인드 URL을 사용하여 S3에 파일 업로드
        const file = await fetch(uri);
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
            console.log('S3 업로드하고 진짜 자기 파일 url : ',uploadResponse.url);

            // 업로드된 파일 URL을 소켓 ?? 에 전송
            const content = {
                fileId: fileId,
                fileUrl: uploadResponse.url
            }
            console.log("fileId랑 진짜 자기 파일 url : ", content)
            WebSocketManager.sendMessage(chatRoomId, content, 'FILE');            

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


    // update unread count
    // const updateUnreadCount = (timestamp: string) => {
    //     setMessages((prevMessages) => {
    //         const updatedMessages = prevMessages.map(msg => {
    //             if (msg.createdAt >= timestamp) {
    //                 return { ...msg, unreadCount: (msg.unreadCount || 0) - 1 };
    //             }
    //             return msg;
    //         });
    //         saveChatMessages(chatRoomId, updatedMessages);
    //         console.log('========= ON USER ENTER ===========' +
    //             'update chat msg: ',updatedMessages);
    //         return updatedMessages;
    //     });
    // }

    // Set up WebSocket connection and message handling
    const setupWebSocket = async () => {
        try {
            const accessToken = loginMMKVStorage.getString('login.accessToken');
            WebSocketManager.connect(chatRoomId, accessToken, (message: IMessage) => {
                console.log('Received message: ' + message.body);
                try {
                    const parsedMessage:directedChatMessage = JSON.parse(message.body);
                    // 저장할 메세지
                    if (parsedMessage.type !== 'USER_ENTER' && parsedMessage.content) {
                        parsedMessage.isSelf = parsedMessage.senderId === currentUserId;
                        parsedMessage.formatedTime = formatDateToKoreanTime(parsedMessage.createdAt)

                        if (parsedMessage.type === 'FRIEND_REQUEST' && parsedMessage.content === '친구가 되었습니다!\n대화를 이어가보세요.') {
                            updateRoomInfo();
                        }

                        // 5분 지났으면 채팅방 타입 다시로드
                        if (parsedMessage.type === 'TIMEOUT' && parsedMessage.senderId === 0 && chatRoomType !== 'FRIEND') {
                            setChatRoomType('WAITING');
                        }

                        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
                        console.log("setMessage", parsedMessage)
                        saveChatMessages(chatRoomId, [parsedMessage])
                        scrollViewRef.current?.scrollToEnd({ animated: true });

                    }
                    // 저장 안할 메세지
                    else {
                        if (parsedMessage.type==='USER_ENTER'){
                            const lastLeaveAt = parsedMessage.content.lastLeaveAt;
                            console.log('user enter since ', lastLeaveAt);
                            decrementUnreadCountBeforeTimestamp(chatRoomId, lastLeaveAt);
                            const fetchMessages = async () => {
                                const fetchedMessages = await getChatMessages(chatRoomId);
                                setMessages(fetchedMessages || []);
                            };
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
                    //onetime 지우기

                    // 로컬 스토리지에서 채팅가져와 렌더링하기
                    const storedMessages = await getChatMessages(chatRoomId);
                    // console.log("Get Messages from LocalStorage: ", storedMessages);
                    if (storedMessages) {
                        console.log("저장된 메세지 렌더링");
                        setMessages(storedMessages);
                    }

                    // 채팅방 정보 & 그동안 못받은 메세지 가져오기
                    const responseData = await fetchChatRoomContent(chatRoomId, currentUserId);
                    if (responseData) {
                        const usernames = responseData.members
                            .filter((member: chatRoomMember) => member.memberId !== currentUserId)
                            .map((member: chatRoomMember) => member.username);
                        const fetchedMessages: directedChatMessage[] = (responseData.messages || []).map((msg: ChatMessage) => ({
                            ...msg,
                            isSelf: msg.senderId === currentUserId,
                            formatedTime: formatDateToKoreanTime(msg.createdAt)
                        }));

                        //채팅방 정보 받아오기: 렌더링용
                        setChatRoomType(responseData.type); //채팅방 타입 업데이트
                        setMembers(responseData.members); //멤버정보 업데이트
                        setUsername(usernames.join(', ')); //title 수정하기

                        // 채팅방 정보 저장 필요
                        const chatRoomInfo: ChatRoomLocal = {
                            id: parseInt(chatRoomId, 10),
                            type: responseData.type,
                            members: responseData.members
                        }
                        saveChatRoomInfo(chatRoomInfo);

                        // 메세지 렌더링 & 저장
                        setMessages((prevMessages) => [...prevMessages, ... fetchedMessages]);
                        console.log("api 호출 채팅데이터: ", fetchedMessages);
                        saveChatMessages(chatRoomId, fetchedMessages); // Save new messages to MMKV
                    }



                } catch (error) {
                    console.error('채팅방 메세지 목록조회 실패:', error);
                } finally {
                    console.log("로딩 끝");
                    setLoading(false); //Text string must be rendered within a text component
                }
            };

            fetchMessages();
            setupWebSocket();

            return () => {
                console.log("loose focus");
                WebSocketManager.disconnect();
                resetUnreadCountForChatRoom(Number(chatRoomId));
            };
        }, [chatRoomId, currentUserId])
    );


    const sendMessage = () => {
        if (chatRoomType === 'WAITING') 
            return;
        else if (chatMessageType.current == 'CHAT') {
            WebSocketManager.sendMessage(chatRoomId, messageContent, 'CHAT');
            setMessageContent('');
        }else {
            hadleUploadAndSend();
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

    // Memoized map of memberId to username
    const memberIdToUsernameMap = useMemo(() => {
        const map = new Map<number, string>();
        members.forEach(member => {
            map.set(member.memberId, member.username);
        });
        return map;
    },[members]);

    const getUsernameBySenderId = (senderId: number) => {
        return memberIdToUsernameMap.get(senderId) || '익명의 하마';
    }

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
                subtitle={'안내문구 출력용'}
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
            <Text>{chatRoomType}: {WebSocketManager.isConnected() ? 'Connected' : ' - '} </Text>
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
                                unreadCnt={msg.unreadCount}
                                chatRoomId={Number(chatRoomId)}
                                otherId={otherIdRef.current}
                                chatRoomType={chatRoomType}
                                profilePicture={msg.isSelf ? '' : 'https://img.freepik.com/premium-photo/full-frame-shot-rippled-water_1048944-5521428.jpg?size=626&ext=jpg&ga=GA1.1.2034235092.1718206967&semt=ais_user'}
                                username={getUsernameBySenderId(msg.senderId)}
                                showProfileTime={showProfile || showTime}
                                // onFileDownload={msg.type==='FILE' ? () => handleFileDownload(msg.id):undefined}
                            />
                        );
                    })}
                </ScrollView>
                <View style={chatRoomType !== 'WAITING' ? styles.inputContainer : styles.disabledInputContainer}>
                     <TouchableOpacity onPress={handleSelectImage} style={styles.imagePickerButton}>
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity> 
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
                            // disabled={chatRoomType === 'WAITING' || messageContent === ''}
                            disabled={chatRoomType === 'WAITING'}

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
        marginRight: 10,
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
    
});

export default ChattingScreen;
