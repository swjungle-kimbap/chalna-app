import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { axiosPatch } from '../../axios/axios.method'; // Adjust the path as necessary
import ImageTextButton from "../common/Button";
import WebSocketManager from "../../utils/WebSocketManager";
import {urls} from "../../axios/config";

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

    const handleAccept = async ({otherId: number }) => {
        Alert.alert(
            '친구 요청 수락',
            '친구 요청을 수락하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '수락', onPress: async () => {
                        try {
                            const response = await axiosPatch(
                                urls.ACCEPT_FRIEND_REQUEST_URL+`/${chatRoomId}`);
                            console.log(response)

                            Alert.alert('친구 맺기 성공', '친구가 되었습니다!');
                            setIsDisabled(true);

                            // 친구수락 채팅메세지 보내기
                            const messageObject = {
                                type: 'FRIEND_REQUEST',
                                content: "친구가 되었습니다!\n" +
                                    "대화를 이어가보세요.",
                            };

                            const messageJson = JSON.stringify(messageObject);
                            console.log('Sending message: ' + messageJson);
                            WebSocketManager.sendMessage(chatRoomId, messageJson);

                            // Add additional logic here if needed, e.g., updating the message status
                        } catch (error) {
                            const errorMessage = error.response?.data?.message || error.message || '친구 요청을 수락할 수 없습니다.';
                            Alert.alert('Error', errorMessage);
                        }
                    }
                }
            ]
        );
    }

    const handleReject = async () => {
        Alert.alert(
            '친구 요청 거절',
            '친구 요청을 거절하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '거절', onPress: async () => {
                        try {
                            await axiosPatch( urls.REJECT_FRIEND_REQUEST_URL+`/${otherId}`);
                            Alert.alert('친구 요청 거절 성공', '친구 요청을 거절했습니다.');
                            setIsDisabled(true);

                            // 친구수락 채팅메세지 보내기
                            const messageObject = {
                                type: 'FRIEND_REQUEST',
                                content: "인연이 스쳐갔습니다.",
                            };

                            const messageJson = JSON.stringify(messageObject);
                            console.log('Sending message: ' + messageJson);
                            WebSocketManager.sendMessage(chatRoomId, messageJson);

                        } catch (error) {
                            const errorMessage = error.response?.data?.message || error.message || '친구 요청을 거절할 수 없습니다.';
                            Alert.alert('전송 실패', errorMessage);
                        }
                    }
                }
            ]
        );
    };


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
                        <ImageTextButton title='수락' onPress={() => handleAccept(otherId)} disabled={isDisabled} />
                        <ImageTextButton title='거절' onPress={handleReject} disabled={isDisabled} />
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
