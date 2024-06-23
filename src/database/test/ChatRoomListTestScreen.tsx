import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { database } from '../database';
import ChatRoom from '../model/ChatRoom';
import ChatRoomCard from "../../components/ChatRoomCard";
import { Q } from '@nozbe/watermelondb';
import insertMockData from './insertMockChatRoom';

interface ChatRoomListScreenProps {
    navigation: any;
}

const ChatRoomListScreen: React.FC<ChatRoomListScreenProps> = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            await insertMockData(); // Insert mock data

            const rooms = await database.collections.get<ChatRoom>('chat_rooms').query().fetch();
            const roomDetails = await Promise.all(
                rooms.map(async (room) => {
                    const memberships = await room.memberships.fetch();
                    const members = await Promise.all(
                        memberships.map(async (membership) => {
                            const member = await membership.member.fetch();
                            return member.username;
                        })
                    );
                    return {
                        ...room,
                        members,
                    };
                })
            );

            setChatRooms(roomDetails);
        };

        fetchChatRooms();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <ChatRoomCard
            members={item.members}
            lastMsg={item.recentMessage}
            status = 'active'
            navigation={navigation}
            type={item.type}
            lastUpdate={item.last_updated_at}

        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={chatRooms}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
});

export default ChatRoomListScreen;
