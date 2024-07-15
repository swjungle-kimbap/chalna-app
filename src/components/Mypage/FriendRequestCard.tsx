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
import {acceptFriendRequest, rejectFriendRequest} from "../../service/Friends/FriendRelationService";
import Text from '../common/Text';
import {showModal} from "../../context/ModalService";


interface FriendRequestCardProps {
    request: friendRequest;
    isExpanded: boolean;
    onExpand: ()=> void;
    navigation?: StackNavigationProp<RootStackParamList, '채팅'>;
}


 // 눌렀을 때 n번 스친 인연입니다 + 대화방가기




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

    const handleRelation = async (id:number) => {
        const response<relationAPIResponse> = await axiosGet(urls.GET_RELATION_URL+`/${id}`);
        if (response) {
            response.data.data.overlapCount
        }





    }




    return (
        <TouchableOpacity onPress={handlePress}>
            <RoundBox style={styles.container}>
                <View style={styles.header}>
                    <ProfileImage profileImageId={request.profileImageId} avatarStyle={styles.avatar}/>
                    <View style={styles.textContainer}>
                        <Text style={styles.name} >{request.username}</Text>
                        <Text style={styles.statusMessage}>{  || ""}</Text>
                    </View>
                </View>
                {isExpanded && (
                    <View style={styles.expandedContainer}>
                        <Button title="대화하기" onPress={handleChat}  />
                        <Button title="요청 수락" onPress={()=>handleAccept(id)}  />
                        <Button title="거절 하기" onPress={()=> handleReject(id)} />
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
