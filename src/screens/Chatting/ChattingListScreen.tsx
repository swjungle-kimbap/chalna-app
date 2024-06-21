import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import ChatRoomCard from '../../components/ChatRoomCard';
import { User } from '../../interfaces/User';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";

type ChatRoomListScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, '채팅'>
};

const DATA = [
    { id: '1', user: { id: '1', name: 'John Doe' }, lastMsg: 'Hey there!', status: 'normal' },
    { id: '2', user: { id: '2', name: 'Jane Smith' }, lastMsg: 'How are you?', status: 'friend' },
    { id: '3', user: { id: '3', name: 'Alice Johnson' }, lastMsg: 'See you soon!', status: 'normal' },
    // Add more chat room data here
];

const ChatRoomListScreen: React.FC<ChatRoomListScreenProps> = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <ChatRoomCard
            user={item.user}
            lastMsg={item.lastMsg}
            status={item.status}
            navigation={navigation}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={DATA}
                renderItem={renderItem}
                keyExtractor={item => item.id}
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
