import React from 'react';
import { View, StyleSheet, TouchableOpacity , Alert, Image} from 'react-native';
import { Friend } from '../../interfaces/savedData';
import RoundBox from '../common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import Button from '../common/Button';
import { axiosGet, axiosPost } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import ProfileImage from '../common/ProfileImage';
import { useModal } from '../../context/ModalContext';
import {requestedFriend} from "../../interfaces/Friend.type";
import {acceptFriendRequest, rejectFriendRequest} from "../../service/Friends/FriendRelationService";
import Text from '../common/Text';


interface FriendCardProps {
    user?: Friend;
    request?: requestedFriend;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation?: StackNavigationProp<RootStackParamList, '채팅'>;
    options?: 'friend' | 'blocked' | 'requested'
}

interface ApiResponse {
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

const FriendCard: React.FC<FriendCardProps> = ({ user, request , isExpanded, onExpand, navigation, options}) => {

    const {showModal} = useModal();

    const handlePress = () => {
        onExpand();
    };

    const name = user? user.username:request.username;
    const id = user? user.id:request.id;

    const handleChat = async () => {
        try {
            const response = await axiosGet<ApiResponse>(`${urls.GET_FRIEND_LIST_URL}/${user.id}`);
            console.log(response.data);
            if (response.data && response.data.data && response.data.data.chatRoomId) {
                const { chatRoomId } = response.data.data;
                try {
                    await axiosPost(`${urls.CHATROOM_JOIN_URL}${chatRoomId}`); // 채팅방 참여 api 호출
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

    const handleAccept = async (id: number) => {
        const response = await acceptFriendRequest(id);
        if (response === true) {
            // rerender or show message of somekind  대화방으로 이동하시겠습니까?
        }
    };

    const handleReject = async (id: number) => {
        const response = await rejectFriendRequest(id);
        if (response === true) {
            // rerender and show message of somekind
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
                        <Text style={styles.name} >{name}</Text>
                        <Text style={styles.statusMessage}>{user.message || ""}</Text>
                    </View>
                </View>
                {isExpanded && (
                    <View style={styles.expandedContainer}>
                        { options==='friend' && (
                            <View style={styles.btnContainer}>
                                <Button title="대화하기" onPress={handleChat}  />
                                {/* <Button title="차단하기" onPress={()=> {handleBlockFriend(user.id)}} /> */}
                            </View>
                        )}
                        {/* { options==='blocked' && (
                            <View style={styles.btnContainer}>
                                <Button title="차단해제" onPress={()=> {handleUnblockFriend(user.id)}}  />
                                <Button title="삭제하기" onPress={()=> {handleDeleteFriend(user.id)}} />
                            </View>
                        )} */}
                        { options==='requested' && (
                            <View style={styles.btnContainer}>
                                <Button title="요청 수락" onPress={()=>handleAccept(id)}  />
                                <Button title="거절 하기" onPress={()=> handleReject(id)} />
                            </View>
                        )}

                    </View>
                )}
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
    },
    btnContainer:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'flex-end',
        paddingLeft: 90,
    },
    name: {
        marginBottom: 5,
        alignSelf:'flex-start',
    },
    statusMessage: {
        fontSize: 14,
        color: '#555',
        alignSelf:'flex-start',
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
