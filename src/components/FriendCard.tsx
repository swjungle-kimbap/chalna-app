import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from '../interfaces/User';
import RoundBox from './common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../interfaces";
import Button from './common/Button';


interface FriendCardProps {
    user: User;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation: StackNavigationProp<RootStackParamList, '채팅'>
}

const FriendCard: React.FC<FriendCardProps> = ({ user , isExpanded, onExpand}, navigation) => {
    const [expanded, setExpanded] = useState(false);

    const handlePress = () => {
        onExpand();
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <Image source={require('../assets/images/anonymous.png')} style={styles.avatar} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name} >{user.name}</Text>
                        <Text style={styles.statusMessage}>{user.statusMsg}</Text>
                    </View>
                </View>
                {isExpanded && (
                    <View style={styles.expandedContainer}>
                        <Text style={styles.additionalInfo}>Additional information about {user.name}</Text>
                        <View style={styles.btnContainer}>
                            <Button title="대화하기" onPress={() => navigation.navigate('채팅')}  />
                        </View>
                    </View>
                )}
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
    btnContainer:{
        alignItems: 'flex-end',
        marginRight: 30
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
    expandedContainer: {
        marginTop: 10,
    },
    additionalInfo: {
        marginLeft: 70,
        marginBottom: 15,
        fontSize: 14,
        color: '#777',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default FriendCard;
