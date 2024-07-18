import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRecoilValue } from 'recoil';
import Text from '../../components/common/Text';
import ProfileImage from '../common/ProfileImage';
import color from '../../styles/ColorTheme';
import {getMMKVString, setMMKVString} from "../../utils/mmkvStorage";

interface ChatRoomCardProps {
    usernames: string;
    profileImageId: number;
    memberCnt: number;
    lastMsg?: string | null;
    lastUpdate?: string;
    description?: string;
    distance?: string;
    navigation: any;
    chatRoomType: string;
    chatRoomId: number; // chatRoomId
    unReadMsg?: number;
    onDelete: (chatRoomId: number) =>void;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({
                                                       lastMsg, lastUpdate, distance
                                                       , usernames, profileImageId, memberCnt
                                                       , navigation, chatRoomType, chatRoomId
                                                       , unReadMsg, onDelete }) => {

    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(chatRoomId)}>
            <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
    );

    const truncateString = (str, num) => {
        const newLineIndex = str.indexOf('\n');
        if (newLineIndex !== -1 && newLineIndex < num) {
            return str.slice(0, newLineIndex);
        } else if (str.length > num) {
            return str.slice(0, num) + '...';
        }
        return str;
    };
    const truncatedMsg = truncateString(lastMsg || " ", 15);

    const goToChattingScreen=(chatRoomId: number, chatRoomType: string) => {
        setMMKVString('showPrevModal', chatRoomType==='MATCH'?'match':'' );
        setMMKVString('chatRoomId', String(chatRoomId));
        console.log('from chatRoom Card to chatting screen: ', chatRoomId);
        console.log('mmkv stored chatroomID: ', getMMKVString('chatRoomId'));
        navigation.navigate('채팅', { chatRoomId })
    }

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <TouchableOpacity
                onPress={() => goToChattingScreen(chatRoomId, chatRoomType)}
                style={[
                    styles.card,
                    chatRoomType === 'FRIEND' ? styles.friendCard :
                        chatRoomType === 'MATCH' ? styles.matchCard :
                            chatRoomType==='LOCAL'? styles.localCard :styles.waitCard
                ]} // Conditional styles
            >
                <View style={styles.row}>
                    <ProfileImage profileImageId={profileImageId} avatarStyle={styles.image}/>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={[styles.usernames, chatRoomType === 'MATCH' && styles.matchUsername]}
                                    variant={chatRoomType=='MATCH'?"title":"main"}
                            >
                                {usernames}
                            </Text>
                            <Text variant={'main'} align={'left'} style={{ color: 'grey', marginRight: 5, size:14 }}>
                                {chatRoomType==='FRIEND'? '':memberCnt}
                            </Text>
                            {chatRoomType==='LOCAL' && (
                                <Text variant={'sub'} style={styles.lastUpdate}>{distance}</Text>
                            )}
                            {unReadMsg ? (
                                <View style={styles.unreadBadge}>
                                    <Text  style={styles.unreadText}>{unReadMsg}</Text>
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.bottomRow}>
                            <Text variant={'sub'} style={styles.lastMsg} numberOfLines={1}  align={'left'} >{truncatedMsg || " "}</Text>
                            <Text variant={'sub'} style={styles.lastUpdate}>{lastUpdate ? lastUpdate : " "}</Text>
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
        backgroundColor: '#EFEFEF90'// '#eeeeee'
    },
    localCard: {
        // backgroundColor: '#d9ebfa'
        backgroundColor: "#E9F2FF"
    },
    header: {
        flexDirection: 'row',
        alignItems:'center',
        marginBottom: 5,
    },
    content: {
        flex: 1,
        marginLeft: 10, // Space between the image and the content
        flexDirection: 'column'
    },
    usernames: {
        alignItems:'center',
        fontSize: 16,
        marginRight:5,
        flex: 1, // Ensure the username takes up available space
    },
    matchUsername: {
        color: '#006a81',
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
        // flex: 1,
        alignContent:'flex-end',
        backgroundColor: color.colors.main,
        marginLeft: 'auto',
        borderRadius: 10,
        paddingHorizontal: 8,
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
        borderRadius: 20,
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
    // localChatIcon:{
    //     marginHorizontal: 16,
    //     marginTop: 10,
    //     marginBottom: 15,
    //     width: 21,
    //     height: 20,
    // }

});

export default ChatRoomCard;
