import React, {useState, useEffect, useRef, useMemo} from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, SafeAreaView, AppState, AppStateStatus } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import { useIsFocused } from '@react-navigation/native';
import CustomHeader from "../../components/common/CustomHeader";
import { useRecoilValue } from "recoil";
import { LocalChatData, LoginResponse } from "../../interfaces";
import { LocalChatListState, userInfoState } from "../../recoil/atoms";
import {ChatRoom, ChatRoomLocal, chatRoomMember} from "../../interfaces/Chatting.type";
import { fetchChatRoomList, deleteChat } from "../../service/Chatting/chattingAPI";
import BackgroundTimer from 'react-native-background-timer';
import {saveChatRoomList, getChatRoomList, removeChatRoom} from '../../service/Chatting/mmkvChatStorage';
import {convertChatRoomDateFormat, formatDateToKoreanTime} from "../../service/Chatting/DateHelpers";
import RoundBox from '../../components/common/RoundBox';
import Button from "../../components/common/Button";
import { navigate } from '../../navigation/RootNavigation';
import { ChatDisconnectOut } from '../../service/LocalChat';

const ChattingListScreen = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoomLocal[]>(getChatRoomList()||[]);
    const isFocused = useIsFocused();
    const intervalId = useRef<NodeJS.Timeout | null>(null);
    const localChatList = useRecoilValue(LocalChatListState);
    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;

    const handleDeleteChatRoom = (chatRoomId: number) => {
        deleteChat('none', String(chatRoomId));
        removeChatRoom(chatRoomId);
        setChatRooms(getChatRoomList);
        console.log("chat room list from local storage: ", getChatRoomList());
    };

    const fetchChatRooms = async () => {
        try {
            const response = await fetchChatRoomList();
            if (response) {
                setChatRooms(response);
                saveChatRoomList(response); // Save chat rooms to MMKV
            }
        } catch (error){
            console.error('Error fetching chatroom data:', error);
        }
    };

    useEffect(() => {
        const startPolling = () => {
            intervalId.current = BackgroundTimer.setInterval(async () =>{
                fetchChatRooms();
            }, 4000);
        };

        const delayedFetchChatRooms = () => {
            setTimeout(() => {
                fetchChatRooms();
            }, 500); // 0.5초 딜레이를 적용합니다.
        };

        delayedFetchChatRooms()

        if (isFocused) {
            startPolling();
            const handleAppStateChange = (nextAppState: AppStateStatus) => {
                if (nextAppState !== 'active') {
                    if (intervalId.current !== null) {
                        BackgroundTimer.clearInterval(intervalId.current);
                        intervalId.current = null;
                    }
                } else {
                    startPolling();
                }
            };
            const subscription = AppState.addEventListener('change', handleAppStateChange);
            return () => {
                if (intervalId.current !== null) {
                    BackgroundTimer.clearInterval(intervalId.current);
                    intervalId.current = null;
                }
                subscription.remove();
            };
        } else {
            if (intervalId.current !== null) {
                BackgroundTimer.clearInterval(intervalId.current);
                intervalId.current = null;
            }
        }
    }, [isFocused]);

    // Memoized map of chat room IDs to member usernames
    const chatRoomIdToUsernamesMap = useMemo(() => {
        const map = new Map<number, string>();
        chatRooms.forEach(room => {
            if (room.type !== 'LOCAL' && room.chatRoomMemberInfo && room.chatRoomMemberInfo.members ) {
                const usernames = room.chatRoomMemberInfo.members
                    .filter(member => member.memberId !== currentUserId)
                    .map(member => member.username)
                    .sort((a, b) => a.localeCompare(b)); // added sort
                map.set(room.id, usernames.join(', '));
            } else {

            }
        });
        return map;
    }, [chatRooms, currentUserId]);


    const distanceDisplay = (distance) => {
        if (distance) {
            const distanceInMeters = Math.round(distance * 1000);
            return distanceInMeters > 100 ? '(100m+)' : `(${distanceInMeters}m)`;
        }
        return ""
    };

    const getDisplayName = (chatRoom: ChatRoom ) => {
        return chatRoomIdToUsernamesMap.get(chatRoom.id) || '(알 수 없는 사용자)';

    };

    //recent message 넣기
    const getLastMsg = (room: ChatRoom) =>{
            return room.recentMessage ? (room.recentMessage.type == "FILE" ? "(사진)": room.recentMessage.content) : "";
    }

    // 몇명
    const getLastUpdate = (room: ChatRoom) =>{
        return room.recentMessage ? formatDateToKoreanTime(room.recentMessage.createdAt) : '';
    }

    return (
        <View style={styles.container}>
            <CustomHeader
                title={"채팅 목록"}
                useMenu={false}
                useNav={false}
            />
            <SafeAreaView>
                <FlatList
                    data={chatRooms}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }: {item :ChatRoomLocal}) => {
                        if (item.type === 'LOCAL') {
                            const findChatRoom = localChatList.find(room => room.localChat.chatRoomId === item.id);
                            if (findChatRoom?.localChat) {

                                return (
                                    <ChatRoomCard
                                        usernames={findChatRoom.localChat.name}
                                        memberCnt = {item.chatRoomMemberInfo.memberCount}
                                        profileImageId={findChatRoom.localChat.imageId}
                                        lastMsg={getLastMsg(item)}
                                        lastUpdate={getLastUpdate(item)}
                                        distance={findChatRoom ? distanceDisplay(findChatRoom.localChat.distance): ''}
                                        navigation={navigation}
                                        chatRoomType={item.type}
                                        chatRoomId={item.id}
                                        unReadMsg={item.unreadMessageCount}
                                        onDelete={handleDeleteChatRoom}
                                    />
                                )

                            } else {
                                ChatDisconnectOut(item.id, null);
                            }
                        }
                        let profileImageId = 0;
                        if (item.type === 'FRIEND' && item.chatRoomMemberInfo && item.chatRoomMemberInfo.memberCount === 2) {
                            const members:chatRoomMember[] = item.chatRoomMemberInfo.members.filter(member => member.memberId !== currentUserId)
                            profileImageId = members[0].profileImageId;
                        }
                        return (
                            <ChatRoomCard
                                usernames={getDisplayName(item)}
                                memberCnt = {item.chatRoomMemberInfo ? item.chatRoomMemberInfo.memberCount : 0}
                                profileImageId={profileImageId}
                                lastMsg={getLastMsg(item)}
                                lastUpdate={getLastUpdate(item)}
                                distance={''}
                                navigation={navigation}
                                chatRoomType={item.type}
                                chatRoomId={item.id}
                                unReadMsg={item.unreadMessageCount}
                                onDelete={handleDeleteChatRoom}
                            />
                        );
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>새로운 인연과 대화를 시작해보세요</Text>
                            <RoundBox>
                                <Button title="대화하기" onPress={() => navigate("로그인 성공", {screen: "인연", params: {} })}/>
                            </RoundBox>
                        </View>
                    )}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 30,
        fontSize: 18,
        color: '#999',
    },
});

export default ChattingListScreen;
