import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Friend} from "../../interfaces";
import RoundBox from '../common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import Button from '../common/Button';
import { navigate } from '../../navigation/RootNavigation';
import { axiosGet, axiosPost } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import ProfileImage from '../common/ProfileImage';
import { useModal } from '../../context/ModalContext';
import Text from '../common/Text';
import FontTheme from '../../styles/FontTheme';
import { shadow } from 'react-native-paper';
import {getMMKVString, setMMKVString} from "../../utils/mmkvStorage";


interface FriendCardProps {
    user: Friend;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation?: StackNavigationProp<RootStackParamList, '채팅'>;
}

export interface ApiResponse {
    status: number;
    message: string;
    data: {
        id: number;
        username: string;
        message: string;
        profileImageId: number;
        chatRoomId: number;
    };
  }

const FriendCard: React.FC<FriendCardProps> = ({ user, isExpanded, onExpand, navigation}) => {

    const {showModal} = useModal();

    const handlePress = () => {
        onExpand();
    };

    const handleChat = async () => {
        try {
            const response = await axiosGet<ApiResponse>(`${urls.GET_FRIEND_LIST_URL}/${user.id}`);
            console.log(response.data);
            if (response.data && response.data.data && response.data.data.chatRoomId) {
                const { chatRoomId } = response.data.data;
                try {
                    await axiosPost(`${urls.CHATROOM_JOIN_URL}${chatRoomId}`); // 채팅방 참여 api 호출
                    console.log("from friend card to chatroom. ID: ", chatRoomId);
                    setMMKVString('chatRoomId', String(chatRoomId));
                    console.log('mmkv stored value: ', getMMKVString('chatRoomId'));
                    navigation.navigate("채팅", { chatRoomId: chatRoomId });
                }
                catch {
                    // Alert.alert('Error', '채팅방을 찾을 수 없습니다.');
                    showModal('친구랑 대화하기', '채팅방을 찾을 수 없습니다.',()=>{},undefined,false);
                }
            } else {
                // Alert.alert('Error', 'chatroomId를 찾을 수 없습니다.');
                showModal('친구랑 대화하기', '채팅방을 찾을 수 없습니다.',()=>{},undefined,false);
            }
        } catch (error) {
            // Alert.alert('Error', '대화 실패');
            showModal('Error', '대화 실패',()=>{},undefined,false);
            console.error('Error fetching chatroomId:', error);
        }
    };

    // const handleBlockFriend = (id) => {
    //     const filteredFriendsList = friendsList.filter(item => item.id !== id)
    //     setFriendsList(filteredFriendsList);
    //     axiosPost(urls.BLOCK_FRIEND_URL+id, "친구 차단");
    // }

    // const handleDeleteFriend = (id) => {
    //     const filteredFriendsList = friendsList.filter(item => item.id !== id)
    //     setFriendsList(filteredFriendsList);
    //     axiosPost(urls.DELETE_FRIEND_URL+id, "친구 삭제");
    // }

    // const handleUnblockFriend = (id) => {
    //     const filteredFriendsList = friendsList.filter(item => item.id !== id)
    //     setFriendsList(filteredFriendsList);
    //     axiosPost(urls.UNBLOCK_FRIEND_URL+id, "친구 차단 해제");
    // }

    return (
        <TouchableOpacity onPress={handlePress}>
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <ProfileImage profileImageId={user.profileImageId} avatarStyle={styles.avatar}/>
                    <View style={styles.textContainer}>
                        <Text style={[styles.textRow, styles.name]} >{user.username}</Text>
                        <Text style={[styles.textRow, styles.statusMessage]}>{user.message || ""}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={handleChat} style={styles.iconButton}>
                            <Image source={require('../../assets/Icons/ChatingIcon.png')} style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigate("로그인 성공", {
                            screen: "친구",
                            params: {
                                screen: "스쳐간 기록",
                                params: { otherId: user.id }
                            }
                        })} style={styles.iconButton}>
                            <Image source={require('../../assets/Icons/ReportMap.png')} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </RoundBox>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        padding: 0,
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
        width: 45,
        height: 45,
        borderRadius: 20,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',  // Ensure contents are aligned to the left
        justifyContent: 'space-between' // Space rows evenly
    },
    textRow: {
        width: '100%',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginHorizontal: 5,
        backgroundColor: '#FAFAFA',
        padding: 5,
        borderRadius: 20,
        elevation: 2
    },
    icon: {
        width: 20,
        height: 20,
    },
    name: {
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    statusMessage: {
        fontSize: 14,
        color: '#868686',
        fontFamily: FontTheme.fonts.sub,
        paddingRight: 6,
        alignSelf: 'flex-start',
    },
    buttonText: {
        fontSize: 12,
    }
});

export default FriendCard;
