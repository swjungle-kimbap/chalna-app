import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ChatRoomCardProps {
    numMember: number;
    usernames: string;
    lastMsg?: string | null;
    lastUpdate?: string;
    navigation: any;
    chatRoomType: string;
    chatRoomId: number; // chatRoomId
    unReadMsg?: number;
}
interface ChatRoomMember {
    memberId: number;
    username: string;
}

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
};

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ lastMsg, lastUpdate, usernames, navigation, chatRoomType,chatRoomId }) => {

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('채팅', { chatRoomId })}
            style={[
                styles.card,
                chatRoomType === 'FRIEND' ? styles.friendCard : chatRoomType==='MATCH'? styles.matchCard:styles.waitCard]} // Conditional styles
        >
            <Text style={styles.usernames}>{usernames}</Text>
            <Text style={styles.lastMsg}>{lastMsg || "대화를 시작해보세요"}</Text>
            <View style={styles.bottomRow}>
                {/*<Text style={styles.status}>{status}</Text>*/}
                <Text style={styles.lastUpdate}>{formatTime(lastUpdate) || " "}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 15,
        paddingHorizontal:20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    matchCard: {
        backgroundColor: '#e0f7fa',  // Example color for MATCH type
    },
    friendCard: {
        backgroundColor: '#fff3e0',  // Example color for FRIEND type
    },
    waitCard: {
        backgroundColor: '#c5e7c8',  // Example color for WATING type
    },
    usernames: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    lastMsg: {
        fontSize: 14,
        color: '#666',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    status: {
        fontSize: 12,
        color: '#999',
    },
    lastUpdate: {
        fontSize: 12,
        color: '#999',
    },
});

export default ChatRoomCard;
