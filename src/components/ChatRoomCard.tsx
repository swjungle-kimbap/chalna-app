import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from '../interfaces/User';
import RoundBox from './common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../interfaces";
import Button from './common/Button';


interface ChatRoomCardProps {
    user: User; //includes profile image
    lastMsg: string; // ChatRoomCard -> latest msg, FriendCard-> status msg
    navigation: StackNavigationProp<RootStackParamList, '채팅'>
    status: string; // default state(friend, normal)
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ user , lastMsg, status}, navigation) => {
    return (
        <TouchableOpacity onPress={()=>navigation.navigate('채팅')}>
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <Image source={require('../assets/images/anonymous.png')} style={styles.avatar} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name} >{user.name}</Text>
                        <Text style={styles.statusMessage}>{lastMsg}</Text>
                    </View>
                </View>
            </RoundBox>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        margin: 0,
        borderRadius: 0,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems:  'flex-start',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statusMessage: {
        fontSize: 14,
        color: '#555',
    },

});

export default ChatRoomCard;
