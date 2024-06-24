import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, AppState, AppStateStatus } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import { axiosGet } from "../../axios/axios.method";
import { useFocusEffect } from '@react-navigation/native';

interface ChatRoomMember {
    memberId: number;
    username: string;
}

interface RecentMessage {
    id: number;
    type: string;
    content: string;
    senderId: number;
    status: boolean;
    createdAt: string;
}

interface ChatRoom {
    id: number;
    type: string;
    memberCount: number;
    members: ChatRoomMember[];
    recentMessage: RecentMessage;
    createdAt: string;
    updatedAt: string;
    removedAt: string | null;
}

const ChattingListScreen = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    const fetchChatRooms = async () => {
        try {
            const response = await axiosGet<{ data: { list: ChatRoom[] } }>(
                'https://chalna.shop/api/v1/chatRoom',
                'Failed to fetch chat rooms',
            );
            console.log('API Response:', response);
            setChatRooms(response.data.data.list);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            fetchChatRooms();
        }
        setAppState(nextAppState);
    };

    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);

        return () => {
            AppState.removeEventListener('change', handleAppStateChange);
        };
    }, [appState]);

    useFocusEffect(
        useCallback(() => {
            fetchChatRooms();

            const interval = setInterval(() => {
                fetchChatRooms();
            }, 60000); // Poll every 60 seconds

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
            <FlatList
                data={chatRooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    console.log('Rendering item:', item);
                    const usernames = item.members.map(member => member.username).join(', ');
                    return (
                        <ChatRoomCard
                            members={item.members}
                            usernames={usernames}
                            lastMsg={item.recentMessage.content}
                            lastUpdate={item.updatedAt}
                            navigation={navigation}
                            chatRoomType={item.type}
                            chatRoomId={item.id}
                            numMember={item.memberCount}
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
        padding: 10,
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
