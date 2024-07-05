import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity , Alert} from 'react-native';
import { User } from '../interfaces/savedData';
import RoundBox from './common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../interfaces";
import Button from './common/Button';
import { axiosGet, axiosPost } from "../axios/axios.method";
import Config from 'react-native-config';
import { useRecoilState } from 'recoil';
import { FriendsListState } from '../recoil/atoms';
import {urls} from "../axios/config";
interface FriendCardProps {
    user: User;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation: StackNavigationProp<RootStackParamList, '채팅'>;
    options: 'friend' | 'blocked' | 'requested'
}

interface ApiResponse {
    status: number;
    message: string;
    data: {
        id: number;
        username: string;
        message: string;
        profileImageUrl: string;
        chatRoomId: number;
    };
  }

const FriendCard: React.FC<FriendCardProps> = ({ user , isExpanded, onExpand, navigation, options}) => {
    const [friendsList, setFriendsList] = useRecoilState(FriendsListState);

    const handlePress = () => {
        onExpand();
    };

    const handleChat = async () => {
        try {

            const response = await axiosGet<ApiResponse>(`${urls.GET_FRIEND_LIST_URL}/${user.id}`);

            console.log(response.data);
            if (response.data && response.data.data && response.data.data.chatRoomId) {
                const { chatRoomId } = response.data.data;
                navigation.navigate("채팅", { chatRoomId: chatRoomId });
            } else {
                Alert.alert('Error', 'chatroomId를 찾을 수 없습니다.');
            }
        } catch (error) {
            Alert.alert('Error', '대화 실패');
            console.error('Error fetching chatroomId:', error);
        }
    };

    const handleBlockFriend = (id) => {
        const filteredFriendsList = friendsList.filter(item => item.id !== id)
        setFriendsList(filteredFriendsList);
        axiosPost(urls.BLOCK_FRIEND_URL+id, "친구 차단");
    }

    const handleDeleteFriend = (id) => {
        const filteredFriendsList = friendsList.filter(item => item.id !== id)
        setFriendsList(filteredFriendsList);
        axiosPost(urls.DELETE_FRIEND_URL+id, "친구 삭제");
    }

    const handleUnblockFriend = (id) => {
        const filteredFriendsList = friendsList.filter(item => item.id !== id)
        setFriendsList(filteredFriendsList);
        axiosPost(urls.UNBLOCK_FRIEND_URL+id, "친구 차단 해제");
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <Image source={require('../assets/images/anonymous.png')} style={styles.avatar} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name} >{user.username}</Text>
                        <Text style={styles.statusMessage}>{user.message}</Text>
                    </View>
                </View>
                {isExpanded && (
                    <View style={styles.expandedContainer}>
                        {/* <Text style={styles.additionalInfo}>Additional information about {user.username}</Text> */}
                        { options==='friend' && (
                            <View style={styles.btnContainer}>
                                <Button title="대화하기" onPress={handleChat}  />
                                <Button title="차단하기" onPress={()=> {handleBlockFriend(user.id)}} />
                            </View>
                        )}
                        { options==='blocked' && (
                            <View style={styles.btnContainer}>
                                <Button title="차단해제" onPress={()=> {handleUnblockFriend(user.id)}}  />
                                <Button title="삭제하기" onPress={()=> {handleDeleteFriend(user.id)}} />
                            </View>
                        )}
                        {/*{ options==='requested' && (*/}
                        {/*    <View style={styles.btnContainer}>*/}
                        {/*        <Button title="요청 수락" onPress={handleAccept}  />*/}
                        {/*        <Button title="거절 하기" onPress={()=> {handleReject(user.id)} />*/}
                        {/*    </View>*/}
                        {/*)}*/}



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
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'flex-end',
        paddingLeft: 90,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5A5A5A',
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
