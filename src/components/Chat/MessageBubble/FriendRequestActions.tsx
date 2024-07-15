import React from 'react';
import { View, StyleSheet } from 'react-native';
import ImageTextButton from "../../common/Button";
import WebSocketManager from "../../../utils/WebSocketManager";
import { acceptFriendRequest, rejectFriendRequest } from "../../../service/Friends/FriendRelationAPI";

interface FriendRequestActionsProps {
    chatRoomId: number;
    senderId: number;
    isDisabled: boolean;
    setIsDisabled: (disabled: boolean) => void;
}

const FriendRequestActions: React.FC<FriendRequestActionsProps> = ({
                                                                       chatRoomId, senderId, isDisabled, setIsDisabled
                                                                   }) => {


    const handleAccept = async () => {
        setIsDisabled(true);
        const response = await acceptFriendRequest(senderId);
        if (response === true) {
            WebSocketManager.sendMessage(String(chatRoomId), "친구가 되었습니다!\n대화를 이어가보세요.", 'FRIEND_REQUEST');
        } else {
            setIsDisabled(false);
        }
    };

    const handleReject = async () => {
        setIsDisabled(true);
        const response = await rejectFriendRequest(senderId);
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
        marginLeft: 10,
        marginRight: 10,
    },
});

export default FriendRequestActions;
