import Text from "../../components/common/Text";
import styled from "styled-components/native";
import Button from '../../components/common/Button'
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';

const ChattingListScreen = ({ navigation }) => {
    // Mock data for chat rooms
    const chatRooms = [
        {
            id: 1,
            members: 'John, Jane',
            lastMsg: 'Hey, how are you?',
            lastUpdate: Date.now() - 1000 * 60 * 5, // 5 minutes ago
            status: 'active',
            type: 'MATCH',
            myUserId: 1,
        },
        {
            id: 2,
            members: 'Alice, Bob',
            lastMsg: 'Are you coming to the party?',
            lastUpdate: Date.now() - 1000 * 60 * 60, // 1 hour ago
            status: 'inactive',
            type: 'MATCH',
            myUserId: 1,
        },
        {
            id: 3,
            members: 'Charlie, Dave',
            lastMsg: 'Good morning!',
            lastUpdate: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
            status: 'active',
            type: 'MATCH',
            myUserId: 1,
        },
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={chatRooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ChatRoomCard
                        members={item.members}
                        lastMsg={item.lastMsg}
                        lastUpdate={item.lastUpdate}
                        status={item.status}
                        navigation={navigation}
                        chatRoomType={item.type}
                        myUserId={item.myUserId}
                    />
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
});


export default ChattingListScreen;
