import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Member from '../database/model/Member';

interface ChatRoomCardProps {
    members: Member[];
    lastMsg: string;
    lastUpdate: number;
    status: string; //active 인지 아닌지 판단하려고 넣어둔 필드인듯
    navigation: any;
    type: string;
    myUserId: number;   // temp.. might not save my info at the first plac
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ members, lastMsg, lastUpdate,status, navigation, type, myUserId }) => {
    // Filter out your own username if memberCount == 2'
    console.log(members);
    const filteredMembers = Array.isArray(members) ? members.filter(member => member.memberId !== myUserId):[];
    const usernames = filteredMembers.map(member => member.username).join(', ');

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('채팅', { members, lastMsg, status })}
            style={[styles.card, type === 'FRIEND' ? styles.friendCard : styles.matchCard]} // Conditional styles
        >
            <Text style={styles.usernames}>{usernames}</Text>
            <Text style={styles.lastMsg}>{lastMsg}</Text>
            <Text style={styles.status}>{lastUpdate}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
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
    usernames: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    lastMsg: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
});

export default ChatRoomCard;
