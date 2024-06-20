import React from 'react';
import { View,Text, StyleSheet, TouchableOpacity } from 'react-native';
import Button from '../../components/common/Button'

interface MessageProps {
    message: string;
    datetime: string;
    isSelf: boolean;
    type?: string;
}

const MessageBubble: React.FC<MessageProps> = ({ message, datetime, isSelf, type }) => {
    return (
        <View style={[styles.container, isSelf ? styles.selfContainer : styles.otherContainer]}>
            <View style={styles.messageContent}>
                <Text style={styles.messageText}>{message}</Text>
                <Text style={styles.datetime}>{datetime}</Text>
            </View>
            {type === 'friendRequest' && !isSelf && (
                <View style={styles.buttonContainer}>
                    <Button title='수락'/>
                    <Button title='거절'/>
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
        alignSelf: 'flex-start', // Align to the left by default
    },
    selfContainer: {
        alignSelf: 'flex-end', // Align to the right if it's a self message
        backgroundColor: '#DCF8C6',
    },
    otherContainer: {
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
    acceptButton: {
        backgroundColor: '#5cb85c',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    rejectButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default MessageBubble;
