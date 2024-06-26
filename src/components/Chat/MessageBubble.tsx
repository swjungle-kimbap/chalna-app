import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary
import ImageTextButton from "../common/Button";
import WebSocketManager from "../../utils/WebSocketManager";

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
                            const response = await axiosInstance.patch(`https://chalna.shop/api/v1/relation/accept/${chatRoomId}`);
                            console.log(response)

                            Alert.alert('친구 맺기 성공', '친구가 되었습니다!');
                            setIsDisabled(true);

                            // 친구수락 채팅메세지 보내기
                            const messageObject = {
                                type: 'CHAT',
                                content: "친구 요청을 수락했습니다.",
                            };

                            const messageJson = JSON.stringify(messageObject);
                            console.log('Sending message: ' + messageJson);
                            WebSocketManager.sendMessage(chatRoomId, messageJson);

                            // Add additional logic here if needed, e.g., updating the message status
                        } catch (error) {
                            // console.log(response)
                            // console.error('Failed to accept friend request:', error);
                            Alert.alert('Error', 'Failed to accept friend request.');
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
                            await axiosInstance.patch(`https://chalna.shop/api/v1/relation/reject/${otherId}`);
                            Alert.alert('친구 요청 거절 성공', '친구 요청을 거절했습니다.');
                            setIsDisabled(true);

                            // 친구수락 채팅메세지 보내기
                            const messageObject = {
                                type: 'CHAT',
                                content: "친구 요청을 거절했습니다.",
                            };

                            const messageJson = JSON.stringify(messageObject);
                            console.log('Sending message: ' + messageJson);
                            WebSocketManager.sendMessage(chatRoomId, messageJson);

                        } catch (error) {
                            // console.error('Failed to reject friend request:', error);
                            // 리턴코드에 따라 수정
                            Alert.alert('전송 실패', 'Failed to reject friend request.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, isSelf ? styles.selfContainer : styles.otherContainer]}>
            <View style={styles.messageContent}>
                <Text style={styles.messageText}>{message}</Text>
                <Text style={styles.datetime}>{formattedTime}</Text>
            </View>
            {type === 'FRIEND_REQUEST' && !isSelf && (
                <View style={styles.buttonContainer}>
                    <ImageTextButton title='수락' onPress={handleAccept} disabled={isDisabled} />
                    <ImageTextButton title='거절' onPress={handleReject} disabled={isDisabled} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxWidth: '80%',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        alignSelf: 'flex-start',
    },
    selfContainer: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    otherContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
    },
    messageContent: {
        marginBottom: 5,
    },
    messageText: {
        fontSize: 16,
    },
    datetime: {
        fontSize: 12,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        marginHorizontal:15,
    },
});

export default MessageBubble;
