import React, {useState, useEffect, useRef, useMemo} from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, SafeAreaView, AppState, AppStateStatus } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import { useIsFocused } from '@react-navigation/native';
import CustomHeader from "../../components/common/CustomHeader";
import { useRecoilValue } from "recoil";
import { LoginResponse } from "../../interfaces";
import {JoinedLocalChatListState, userInfoState} from "../../recoil/atoms";
import {ChatRoom, ChatRoomLocal} from "../../interfaces/Chatting.type";
import { fetchChatRoomList, deleteChat } from "../../service/Chatting/chattingAPI";
import BackgroundTimer from 'react-native-background-timer';
import {saveChatRoomList, getChatRoomList, removeChatRoom} from '../../service/Chatting/mmkvChatStorage';
import {convertChatRoomDateFormat, formatDateToKoreanTime} from "../../service/Chatting/DateHelpers";

const ChattingListScreen = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoomLocal[]>(getChatRoomList()||[]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();
    const intervalId = useRef<NodeJS.Timeout | null>(null);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const startPolling = () => {
            intervalId.current = BackgroundTimer.setInterval(async () =>{
                fetchChatRooms();
            }, 4000);
        };

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

        // fetchChatRooms();

        const delayedFetchChatRooms = () => {
            setTimeout(() => {
                fetchChatRooms();
            }, 500); // 0.5초 딜레이를 적용합니다.
        };

        delayedFetchChatRooms()

        if (isFocused) {
            startPolling();
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
            if (room.type !== 'LOCAL') {
                const usernames = room.members
                    .filter(member => member.memberId !== currentUserId)
                    .map(member => member.username)
                    .sort((a, b) => a.localeCompare(b)); // added sort
                map.set(room.id, usernames.join(', '));
            }
        });
        return map;
    }, [chatRooms, currentUserId]);

    const joinedLocalChatList = useRecoilValue(JoinedLocalChatListState);
    const getChatRoomInfo = (chatRoomId, joinedLocalChatList) => {
        const chatRoom = joinedLocalChatList.find(room => room.chatRoomId === Number(chatRoomId));
        return chatRoom
            ? { name: chatRoom.name, distance: chatRoom.distance, description: chatRoom.description }
            : { name: 'Unknown Chat Room', distance: 0, description: '' };
    };

    const getDisplayName = (room: ChatRoom) => {
        if (room.type === 'LOCAL') {
            return getChatRoomInfo(room.id, joinedLocalChatList).name;
        } else {
            return chatRoomIdToUsernamesMap.get(room.id) || '(알 수 없는 사용자)';
        }
    };

    //recent message 넣기
    const getLastMsg = (room: ChatRoom) =>{
        if (room.type === 'LOCAL') {
            return getChatRoomInfo(room.id, joinedLocalChatList).description;
        } else {
            return room.recentMessage ? (room.recentMessage.type == "FILE" ? "사진": room.recentMessage.content) : "";
        }
    }

    const calculateDistanceInMeters = (distanceInKm) => {
        const distanceInMeters = distanceInKm * 1000;
        return Math.round(distanceInMeters);
    };

    const distanceDisplay = (chatRoomId) => {
        const chatRoom = joinedLocalChatList.find(room => room.chatRoomId === Number(chatRoomId));
        if (chatRoom) {
            const distanceInMeters = calculateDistanceInMeters(chatRoom.distance);
            return distanceInMeters > 50 ? '50m+' : `${distanceInMeters}m`;
        }
        return '';
    };

    // 몇명
    const getLastUpdate = (room: ChatRoom) =>{
        if (room.type === 'LOCAL') {
            return distanceDisplay(room.id);
        } else {
            return room.recentMessage ?
                formatDateToKoreanTime(room.recentMessage.createdAt) : '';
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
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
                    renderItem={({ item }) => {
                        const usernames = item.members

                        return (
                            <ChatRoomCard
                                usernames={getDisplayName(item)}
                                memberCnt = {item.memberCount}
                                members={item.members.filter(member => member.memberId !== currentUserId)}
                                lastMsg={getLastMsg(item)}
                                lastUpdate={getLastUpdate(item)}
                                navigation={navigation}
                                chatRoomType={item.type}
                                chatRoomId={item.id}
                                numMember={item.memberCount}
                                unReadMsg={item.unreadMessageCount}
                                onDelete={handleDeleteChatRoom}
                            />
                        );
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>새로운 인연과 대화를 시작해보세요</Text>
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
        backgroundColor: '#f5f5f5',
        marginBottom:75,
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
