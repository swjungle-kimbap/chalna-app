import React from 'react';
import { View, StyleSheet, TouchableOpacity , Alert, Image} from 'react-native';
import RoundBox from '../common/RoundBox';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces";
import Button from '../common/Button';
import { navigate } from '../../navigation/RootNavigation';
import { axiosGet, axiosPost } from "../../axios/axios.method";
import {urls} from "../../axios/config";
import ProfileImage from '../common/ProfileImage';
import { useModal } from '../../context/ModalContext';
import {friendRequest} from "../../interfaces/Friend.type";
import {acceptFriendRequest, rejectFriendRequest} from "../../service/Friends/FriendRelationAPI";
import Text from '../common/Text';
import {showModal} from "../../context/ModalService";
import { useRecoilState } from 'recoil';
import { FriendsMapState } from '../../recoil/atoms';
import {getMMKVString, setMMKVString} from "../../utils/mmkvStorage";
import {doesChatRoomExist} from "../../service/Chatting/mmkvChatStorage";


interface FriendRequestCardProps {
    request: friendRequest;
    navigation?: StackNavigationProp<RootStackParamList, '채팅'>;
}


 // 눌렀을 때 n번 스친 인연입니다 + 대화방가기 -> 보류

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request, navigation }) => {
    const [friendMap, setFriendsMap] = useRecoilState(FriendsMapState);

    const {showModal} = useModal();

    const handleAccept = async (id: number) => {
        const response = await acceptFriendRequest(id, friendMap, setFriendsMap);
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

    const handleChat = async(chatRoomId: number) =>{
        try {
            console.log("from friend request card to chatroom. ID: ", chatRoomId);
            setMMKVString('chatRoomId', String(chatRoomId));
            console.log('mmkv stored value: ', getMMKVString('chatRoomId'));
            if (doesChatRoomExist(Number(chatRoomId)) ){
                navigation.navigate("채팅", { chatRoomId: chatRoomId });
            } else {
                showModal('나간 대화방', "친구가 되면 대화를 이어갈 수 있습니다!", () => {}, undefined, false);
            }

        } catch (error) {
            const errorMessage = error.message || "대화방이 존재하지 않습니다.";
            showModal('찰나가 아파요..', errorMessage, () => {}, undefined, false);
        }
    }

    // 프로필 귀여운 아이콘 랜덤으로 넣으면 좋을것같은데
    return (
        <TouchableOpacity >
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <ProfileImage profileImageId={0} avatarStyle={styles.avatar}/>
                    <View style={styles.textContainer}>
                        <Text style={styles.name} >{request.username}</Text>
                        <Text style={styles.statusMessage}>{""}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={()=> handleChat(request.chatRoomId)}  style={styles.iconButton}>
                            <Image source={require('../../assets/Icons/ChatingIcon.png')} style={styles.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>handleAccept(request.id)} style={styles.iconButton}>
                            <Image source={require('../../assets/Icons/AcceptCircle.png')} style={[styles.icon, styles.accept]} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=> handleReject(request.id)} style={styles.iconButton}>
                            <Image source={require('../../assets/Icons/RejectCircle.png')} style={[styles.icon, styles.reject]} />
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
    accept:{
        tintColor: '#74d1d1'
    },
    reject: {
        tintColor: '#f17b89'
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
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 20,
    },
    icon: {
        width: 20,
        height: 20,
    },

    buttonText: {
        fontSize: 12,
    }
});

export default FriendRequestCard;
