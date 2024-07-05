import React, {useState, useCallback, useEffect, useRef, useMemo} from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, SafeAreaView, AppState, AppStateStatus } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import CustomHeader from "../../components/common/CustomHeader";
import { useRecoilValue } from "recoil";
import { LoginResponse } from "../../interfaces";
import { userInfoState } from "../../recoil/atoms";
import {ChatRoom, ChatRoomLocal} from "../../interfaces/Chatting.type";
import { fetchChatRoomList } from "../../service/Chatting/chattingAPI";
import BackgroundTimer from 'react-native-background-timer';
import { saveChatRoomList, getChatRoomList } from '../../localstorage/mmkvStorage';

const ChattingListScreen = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoomLocal[]>([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();
    const intervalId = useRef<NodeJS.Timeout | null>(null);

    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;

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

        const storedChatRooms = getChatRoomList();
        if (storedChatRooms) {
            setChatRooms(storedChatRooms);
            setLoading(false);
        } else {
            fetchChatRooms();
        }

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
            // if (room.type !== 'LOCAL') {
                const usernames = room.members
                    .filter(member => member.memberId !== currentUserId)
                    .map(member => member.username);
                map.set(room.id, usernames.join(', '));
            // }
        });
        return map;
    }, [chatRooms, currentUserId]);

    const getDisplayName = (room: ChatRoom) => {
        // if (room.type === 'LOCAL') {
        //     return room.name;
        // } else {
            return chatRoomIdToUsernamesMap.get(room.id) || 'Unknown';
        // }
    };

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
                                lastMsg={item.recentMessage ? (item.recentMessage.type == "FILE" ? "사진": item.recentMessage.content) : ""}
                                lastUpdate={item.recentMessage?.createdAt || " "}
                                navigation={navigation}
                                chatRoomType={item.type}
                                chatRoomId={item.id}
                                numMember={item.memberCount}
                                unReadMsg={item.unreadMessageCount}
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
