import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// import Button from '../common/Button';
import styled from 'styled-components/native';

// input type 보여주기 -> 나중에 interface로 이동
interface MessageProps {
    message: string,
    datetime: string,
    isSelf: boolean,
    type: string //number? -> 친구요청일경우 수락 거절 버튼
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
        <TouchableOpacity style={styles.acceptButton}>
        <Text style={styles.buttonText}>수락</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton}>
    <Text style={styles.buttonText}>거절</Text>
        </TouchableOpacity>
        </View>
    )}
    </View>
);
};