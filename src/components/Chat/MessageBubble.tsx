import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import axiosInstance from '../../axios/axios.instance'; // Adjust the path as necessary

interface MessageBubbleProps {
    message: string;
    datetime: string;
    isSelf: boolean;
    type?: string;
    status: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, datetime, isSelf, type, status }) => {
    const date = new Date(datetime);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const [isDisabled, setIsDisabled] = useState(false);

    const handleAccept = async ({otherId: number }) => {
        Alert.alert(
            '친구 요청 수락',
            '친구 요청을 수락하시겠습니까?',
            [
                { text: '아니오', style: 'cancel' },
                {
                    text: '네', onPress: async () => {
                        try {
                            await axiosInstance.post(`https://chalna.shop/api/v1/relation/accept/${chatRoomId}`); //get uuid and myUserId from somewhere
                            Alert.alert('Success', 'Friend request accepted!');
                            setIsDisabled(true);
                            // Add additional logic here if needed, e.g., updating the message status
                        } catch (error) {
                            console.error('Failed to accept friend request:', error);
                            Alert.alert('Error', 'Failed to accept friend request.');
                        }
                    }
                }
            ]
        );
    }

    const handleReject = async () => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to reject the friend request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK', onPress: async () => {
                        try {
                            await axiosInstance.post(`https://chalna.shop/api/v1/relation/areject/${otherId}`);
                            Alert.alert('Success', 'Friend request rejected!');
                            setIsDisabled(true);
                            // Add additional logic here if needed, e.g., removing the message
                        } catch (error) {
                            console.error('Failed to reject friend request:', error);
                            Alert.alert('Error', 'Failed to reject friend request.');
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
            {type === 'friendRequest' && !isSelf && (
                <View style={styles.buttonContainer}>
                    <Button title='수락' onPress={handleAccept} disabled={isDisabled} />
                    <Button title='거절' onPress={handleReject} disabled={isDisabled} />
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
        marginTop: 5,
    },
});

export default MessageBubble;
