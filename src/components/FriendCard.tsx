import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity , Alert} from 'react-native';
import { User } from '../interfaces/User';
import RoundBox from './common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../interfaces";
import Button from './common/Button';
import { axiosGet } from "../axios/axios.method";
import Config from 'react-native-config';
interface FriendCardProps {
    user: User;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation: StackNavigationProp<RootStackParamList, '채팅'>;
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

const FriendCard: React.FC<FriendCardProps> = ({ user , isExpanded, onExpand, navigation}) => {
    // const [expanded, setExpanded] = useState(false);

    const handlePress = () => {
        onExpand();
    };

    const handleChat = async () => {
        try {

            const response = await axiosGet<ApiResponse>(`${Config.GET_FRIEND_LIST_URL}/${user.id}`);

            console.log(response.data);
            if (response.data && response.data.data && response.data.data.chatRoomId) {
                const { chatRoomId } = response.data.data;

                navigation.navigate("로그인 성공", {
                    screen: "채팅목록",
                    params: {
                      screen: "채팅",
                      params: { chatRoomId: chatRoomId } // 필요시 채팅방 ID를 전달
                    }
                  });
            } else {
                Alert.alert('Error', 'chatroomId를 찾을 수 없습니다.');
            }
        } catch (error) {
            Alert.alert('Error', '대화 실패');
            console.error('Error fetching chatroomId:', error);
        }
    };

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
                        <View style={styles.btnContainer}>
                            <Button title="대화하기" onPress={handleChat}  />
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
