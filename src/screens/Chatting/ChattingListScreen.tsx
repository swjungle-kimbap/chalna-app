import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import {useDatabase} from "@nozbe/watermelondb/hooks";
import ChatRoom from '../../database/model/ChatRoom';
import ChatRoomCard from '../../components/ChatRoomCard';
//import { StackNavigationProp } from "@react-navigation/stack";
//import { RootStackParamList } from "../../interfaces";


interface ChatRoomListScreenProps {
    navigation: any;
}

const ChatRoomListScreen: React.FC<ChatRoomListScreenProps> = ({ navigation }) => {
    const database = useDatabase();
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            const chatRoomCollection = database.get<ChatRoom>('chat_rooms');
            const rooms = await chatRoomCollection.query().fetch();
            setChatRooms(rooms);
        };

        fetchChatRooms();
    }, [database]);

    const renderItem = ({ item }: { item: ChatRoom }) => (
        <ChatRoomCard
            user={item.type} // assuming user is derived from type, modify as needed
            lastMsg={item.recentMessageId}
            status={item.updatedAt ? 'Updated' : 'New'} // example status logic
            navigation={navigation}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            {chatRooms.length > 0 ? (
                <FlatList
                    data={chatRooms}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <Text>No chat rooms available</Text>
            )}
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
