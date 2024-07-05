import React , { useState }  from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { Swipeable } from 'react-native-gesture-handler';


interface ChatRoomCardProps {
    numMember: number;
    usernames: string;
    lastMsg?: string | null;
    lastUpdate?: string;
    navigation: any;
    chatRoomType: string;
    chatRoomId: number; // chatRoomId
    unReadMsg?: number;
    onDelete: (chatRoomId: number) =>void;
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
};


const ChatRoomCard: React.FC<ChatRoomCardProps> = ({
                                                       lastMsg, lastUpdate, usernames
                                                       , navigation, chatRoomType, chatRoomId
                                                       , unReadMsg, onDelete }) => {

    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(chatRoomId)}>
            <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
    );


    return (
        <Swipeable renderRightActions={renderRightActions}>
            <TouchableOpacity
                onPress={() => navigation.navigate('채팅', { chatRoomId })}
                style={[
                    styles.card,
                    chatRoomType === 'FRIEND' ? styles.friendCard : chatRoomType === 'MATCH' ? styles.matchCard : styles.waitCard
                ]} // Conditional styles
            >
                <View style={styles.row}>
                    <Image
                        source={require('../../assets/images/anonymous.png')} // Replace with your image path
                        style={styles.image}
                    />
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={[styles.usernames, chatRoomType === 'MATCH' && styles.matchUsername]}>{usernames}</Text>
                            {unReadMsg ? (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{unReadMsg}</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={styles.lastMsg}>{lastMsg || "대화를 시작해보세요"}</Text>
                        <View style={styles.bottomRow}>
                            <Text style={styles.status}>{/* Status message here */}</Text>
                            <Text style={styles.lastUpdate}>{lastUpdate ? formatTime(lastUpdate) : " "}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
}


const styles = StyleSheet.create({
    card: {
        padding: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        // shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    row: {
        flexDirection: 'row',
    },
    matchCard: {
        borderColor: '#ffffff', // Example color for MATCH type
    },
    friendCard: {
        backgroundColor:'#ffffff'
    },
    waitCard: {
        backgroundColor:'#ececec'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 10, // Space between the image and the content
    },
    usernames: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#5A5A5A',
        flex: 1, // Ensure the username takes up available space
    },
    matchUsername: {
        color: 'green',
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
    unreadBadge: {
        backgroundColor: 'green',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
    },
    image: {
        marginTop:3,
        marginRight:5,
        marginLeft:5,
        width: 45,
        height: 45,
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ChatRoomCard;
