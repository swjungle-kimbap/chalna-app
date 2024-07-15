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


interface FriendRequestCardProps {
    request: friendRequest;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation?: StackNavigationProp<RootStackParamList, '채팅'>;
}


 // 눌렀을 때 n번 스친 인연입니다 + 대화방가기 -> 보류

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request, isExpanded, onExpand, navigation }) => {

    const {showModal} = useModal();

    const handlePress = () => {
        onExpand();
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

    const handleChat = async(chatRoomId: number) =>{
        try {
            navigation.navigate("채팅", { chatRoomId: chatRoomId });
        } catch (error) {
            const errorMessage = error.message || "대화방이 존재하지 않습니다.";
            showModal('찰나가 아파요..', errorMessage, () => {}, undefined, false);
        }
    }

    // 프로필 귀여운 아이콘 랜덤으로 넣으면 좋을것같은데
    return (
        <TouchableOpacity onPress={handlePress}>
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <ProfileImage profileImageId={0} avatarStyle={styles.avatar}/>
                    <View style={styles.textContainer}>
                        <Text style={styles.name} >{request.username}</Text>
                        <Text style={styles.statusMessage}>{""}</Text>
                    </View>
                </View>
                {isExpanded && (
                    <View style={styles.expandedContainer}>
                        <Button title="대화방 이동" onPress={()=> handleChat(request.chatRoomId)} />
                        <Button title="요청 수락" onPress={()=>handleAccept(request.id)}  />
                        <Button title="거절 하기" onPress={()=> handleReject(request.id)} />
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

export default FriendRequestCard;
