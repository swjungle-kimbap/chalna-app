import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import ImageTextButton from "../common/Button";
import WebSocketManager from "../../utils/WebSocketManager";
import {acceptFriendRequest, rejectFriendRequest} from "../../service/FriendRelationService";

interface MessageBubbleProps {
    message: string;
    datetime: string;
    isSelf: boolean;
    type?: string;
    status?: boolean;
    otherId: number;
    chatRoomId:string;
    chatRoomType:string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, datetime, isSelf, type, status, otherId,chatRoomId, chatRoomType  }) => {
    const date = new Date(datetime);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [isDisabled, setIsDisabled] = useState(chatRoomType==='FRIEND');

    const handleAccept = async ({chatRoomId: string}) => {
        const response = await acceptFriendRequest(chatRoomId); // 성공시 true, 실패시 false 반환
        if(response) // 성공시 채팅방에 친구 성공 메세지 전송
            WebSocketManager.sendMessage(chatRoomId, "친구가 되었습니다!\n"+"대화를 이어가보세요.",'FRIEND_REQUEST');
        setIsDisabled(response); // 수락/거절 버튼 비활성화
    }

    const handleReject = async ({ otherId: string }) => {
        const response = await rejectFriendRequest(otherId.toString()); // 성공시 true, 실패시 false 반환
        if(response) // 성공시 채팅방에 거절 메세지 전송
            WebSocketManager.sendMessage(chatRoomId, "인연이 스쳐갔습니다.",'FRIEND_REQUEST');
        setIsDisabled(response); // 수락/거절 버튼 비활성화
    }

    return (
        <View style={[styles.container,
            isSelf ? styles.selfContainer : styles.otherContainer,
            (type === 'FRIEND_REQUEST' && message!=='친구 요청을 보냈습니다.') && styles.centerContainer]}>
            <View style={[styles.messageContent,
                isSelf ? styles.myMessageBubbleColor : styles.friendMessageBubbleColor,
                (type === 'FRIEND_REQUEST' && message!=='친구 요청을 보냈습니다.') && styles.centerMsg
            ]}>
                <Text style={styles.messageText}>{message}</Text>
                {type === 'FRIEND_REQUEST' && !isSelf && message === '친구 요청을 보냈습니다.' && (
                    <View style={styles.buttonContainer}>
                        <ImageTextButton title='수락' onPress={() => handleAccept(chatRoomId)} disabled={isDisabled} />
                        <ImageTextButton title='거절' onPress={handleReject(otherId.toString())} disabled={isDisabled} />
                    </View>
                )}
            </View>
            {isSelf ? (
                <View style={styles.tailRight} />
            ) : (
                <View style={styles.tailLeft} />
            )}
            <Text style={[styles.datetime,
                (type === 'FRIEND_REQUEST' && message !== '친구 요청을 보냈습니다.')?
                    styles.timeMiddle : styles.timeRight]}>{formattedTime}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxWidth: '80%',
        marginVertical: 5,
        alignSelf: 'flex-start',
    },
    selfContainer: {
        alignSelf: 'flex-end',
    },
    otherContainer: {
        alignSelf: 'flex-start',
    },
    messageContent: {
        paddingVertical: 10,
        paddingHorizontal:15,
        borderRadius: 20,
        shadowColor: '#000',        // Color of the shadow
        shadowOffset: { width: 0, height: 4 },  // Direction and distance of the shadow
        shadowOpacity: 0.25,        // Opacity of the shadow
        shadowRadius: 5,
    },
    friendMessageBubbleColor: {
        backgroundColor: '#FFFFFF',
    },
    myMessageBubbleColor:{
        // backgroundColor: '#DFEBEB',
        // backgroundColor: '#D5E3E8',
        backgroundColor: '#E4F1EE',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    datetime: {
        fontSize: 12,
        color: '#888888',
    },
    timeRight: {
        marginTop:5,
        alignSelf: 'flex-end',
        marginRight: 10,
    },
    timeMiddle: {
        alignSelf: 'center',
        marginTop: -10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginHorizontal:10,
    },
    centerContainer:{
        alignSelf: 'center',
        alignItems:'center',
        backgroundColor:'transparent',
        borderWidth: 0,
    },
    centerMsg:{
        backgroundColor: 'transparent'
    },
    tailRight: {
        position: 'absolute',
        right: -6,
        top: '50%',
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderLeftWidth: 6,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#DCF8C6',
        marginTop: -10,
    },
    tailLeft: {
        position: 'absolute',
        left: -6,
        top: '50%',
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderRightWidth: 6,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#FFFFFF',
        marginTop: -10,
    },
});

export default MessageBubble;
