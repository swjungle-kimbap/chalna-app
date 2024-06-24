import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import {axiosGet} from "../../axios/axios.method";


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

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await axiosGet<{ list: ChatRoom[] }>(
                    'https://chalna.shop/api/v1/chatRoom',
                    'Failed to fetch chat rooms',
                    {
                        headers:{
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjAyLCJpYXQiOjE3MTkxNjQxODcsImV4cCI6MTcxOTc2ODk4N30.X6q2d5bSPNDX3Wnb_XqHM96POz9baikyb1C5UU8Yyq0'
                        }
                    });
                setChatRooms(response.data.list);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!loading && chatRooms.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chat rooms available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={chatRooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
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
