import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, AppState, SafeAreaView} from 'react-native';
import ChatRoomCard from '../../components/Chat/ChatRoomCard';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from "../../components/common/CustomHeader";
import {useRecoilValue} from "recoil";
import {LoginResponse} from "../../interfaces";
import {userInfoState} from "../../recoil/atoms";
import {ChatRoom} from "../../interfaces/Chatting";
import {fetchChatRoomList} from "../../service/Chatting/chattingAPI";


const ChattingListScreen = ({ navigation }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;

    const fetchChatRooms = async () => {
        const response = await fetchChatRoomList('2024-06-23T10:32:40')
        if (response)
            setChatRooms(response);
        setLoading(false);
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
            <SafeAreaView>
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
        marginTop:30,
        fontSize: 18,
        color: '#999',
    },
});

export default ChattingListScreen;
