import React from 'react';
import { View, StyleSheet } from 'react-native';
import ImageTextButton from "../../common/Button";
import WebSocketManager from "../../../utils/WebSocketManager";
import { acceptFriendRequest, rejectFriendRequest } from "../../../service/Friends/FriendRelationAPI";
import { useRecoilState } from 'recoil';
import { FriendsMapState } from '../../../recoil/atoms';
import {friendRequest} from "../../../interfaces/Friend.type";
import {fetchReceivedFriendRequest} from "../../../service/Friends/FriendListAPI";
import {axiosDelete} from "../../../axios/axios.method";
import {urls} from "../../../axios/config";

interface FriendRequestActionsProps {
    chatRoomId: number;
    senderId: number;
    isDisabled: boolean;
    setIsDisabled: (disabled: boolean) => void;
}


const FriendRequestActions: React.FC<FriendRequestActionsProps> = ({
                                                                       chatRoomId, senderId, isDisabled, setIsDisabled
                                                                   }) => {

    const [friendMap, setFriendsMap] = useRecoilState(FriendsMapState);
    const handleAccept = async () => {
        setIsDisabled(true);

        const friendRequests:friendRequest[] =  await fetchReceivedFriendRequest();
        const request = friendRequests.find(request => request.senderId === senderId);

        const response = await acceptFriendRequest(request.id, friendMap, setFriendsMap);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "친구가 되었습니다!\n대화를 이어가보세요.", 'FRIEND_REQUEST');
        } else {
            setIsDisabled(false);
        }
    };

    const handleReject = async () => {
        setIsDisabled(true);

        const friendRequests:friendRequest[] =  await fetchReceivedFriendRequest();
        const request = friendRequests.find(request => request.senderId === senderId);

        const response = await rejectFriendRequest(request.id);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "인연이 스쳐갔습니다.", 'FRIEND_REQUEST');
        } else {
            setIsDisabled(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageTextButton title='수락' onPress={handleAccept} disabled={isDisabled} />
            <ImageTextButton title='거절' onPress={handleReject} disabled={isDisabled} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginLeft: 30,
        marginRight: 30,
    },
});

export default FriendRequestActions;
