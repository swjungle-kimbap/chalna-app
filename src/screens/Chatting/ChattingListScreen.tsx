import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, AppState, AppStateStatus } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import { axiosGet } from "../../axios/axios.method";
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from "../../components/common/CustomHeader";
import {useRecoilValue} from "recoil";
import {LoginResponse} from "../../interfaces";
import {userInfoState} from "../../recoil/atoms";

interface ChatRoomMember {
    memberId: number;
    username: string;
}

interface RecentMessage {
    id: number | null;
    type: string | null;
    content: string | null;
    senderId: number | null;
    createdAt: string | null;
}

interface ChatRoom {
    id: number;
    type: string;
    memberCount: number;
    members: ChatRoomMember[];
    recentMessage?: RecentMessage;
    unreadMessageCount?: number;
    createdAt: string;
    updatedAt?: string;
    removedAt?: string | null;
}

const ChattingListScreen = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    const userInfo = useRecoilValue<LoginResponse>(userInfoState);
    const currentUserId = userInfo.id;

    const fetchChatRooms = async () => {
        try {
            const response = await axiosGet<{ data: { list: ChatRoom[] } }>(
                'https://chalna.shop/api/v1/chatRoom',
                'Failed to fetch chat rooms',
            );
            // console.log('API Response:', response);
            setChatRooms(response.data.data.list);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useFocusEffect(
        useCallback(() => {
            fetchChatRooms();

            const interval = setInterval(() => {
                fetchChatRooms();
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(interval); // Clear interval on screen unfocus
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChatRooms().then(() => setRefreshing(false));
    }, []);

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
            <FlatList
                data={chatRooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    console.log('Rendering item:', item);
                    const usernames = item.members
                        .filter(member => member.memberId !== currentUserId)
                        .map(member => item.type === 'FRIEND' ? member.username : `익명${member.memberId}`)
                        .join(', ');

                    return (
                        <ChatRoomCard
                            usernames={usernames}
                            lastMsg={item.recentMessage === null ? "" : item.recentMessage.content}
                            lastUpdate={item.recentMessage ===null? "" : item.recentMessage.createdAt}
                            navigation={navigation}
                            chatRoomType={item.type}
                            chatRoomId={item.id}
                            numMember={item.memberCount}
                            unReadMsg={item.unreadMessageCount}
                        />
                    );
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No chat rooms available</Text>
                    </View>
                )}
            />
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
        fontSize: 18,
        color: '#999',
    },
});

export default ChattingListScreen;
