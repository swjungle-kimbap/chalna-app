import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import {useDatabase} from "@nozbe/watermelondb/hooks";
import ChatRoom from '../../database/model/ChatRoom';
import ChatRoomCard from '../../components/ChatRoomCard';
import {fetchChatRoomsFromAPI, syncChatRooms} from "../../api/Chat/ChatRoomAPI.ts";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";

interface ChatRoomListScreenProps {
    navigation: any;
}

const ChattingListScreen:React.FC<ChatRoomListScreenProps>=({navigation}) => {
    const database = useDatabase();
    const myUserId = '1';
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);


    useEffect(() => {
        const lastSyncTime = Date.now()-24*60*60*1000; //example last 24 hours
        const fetchAndSync = async()=>{
            const rooms = await fetchChatRoomsFromAPI(lastSyncTime);
            await syncChatRooms(rooms); //sync local database
            const chatRoomCollection = database.get<ChatRoom>('chat rooms');
            const localRooms = await chatRoomCollection.query().fetch();
            setChatRooms(localRooms);
        };

        fetchAndSync();
    }, [database]);

    const renderItem = ({ item }: { item: ChatRoom }) => (
        <ChatRoomCard
            members = {item.members}
            lastMsg={item.recentMessage}
            status={item.updatedAt ? 'Updated' : 'New'} // example status logic
            navigation=StackNavigationProp<RootStackParamList, '채팅'> //옵션 줘서 API & 화면 호출?
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

export default ChattingListScreen;
