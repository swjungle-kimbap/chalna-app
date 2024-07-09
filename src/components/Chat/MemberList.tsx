// MemberList.tsx
import React from 'react';
import { View,  FlatList, StyleSheet, Image } from 'react-native';
import { chatRoomMember } from "../../interfaces/Chatting.type";
import ImageTextButton from "../common/Button";
import {useRecoilValue} from "recoil";
import {LoginResponse} from "../../interfaces";
import {userInfoState} from "../../recoil/atoms";
import {sendFriendRequest} from "../../service/Friends/FriendRelationService";
import WebSocketManager from "../../utils/WebSocketManager";
import Text from '../common/Text';

interface MemberListProps {
    members: chatRoomMember[];
    chatRoomId: number,
    chatRoomType: string,
}



const MemberList: React.FC<MemberListProps> = ({ members, chatRoomId,chatRoomType }) => {
    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;
    const sortedMembers = members.sort((a, b) => (a.memberId === currentUserId ? -1 : b.memberId === currentUserId ? 1 : 0));

    const handleSend = async (otherId: number) =>{
        const response = await sendFriendRequest(otherId);
        if (response === true) {
            if (chatRoomType!=='LOCAL'){ // 매치 1:1 채팅일 때만 채팅방에 친구요청 메세지 전송
                WebSocketManager.sendMessage(chatRoomId, "친구 요청을 보냈습니다.", 'FRIEND_REQUEST');
            }
            // 친구추가 버튼 없애기 버튼 or 요청중 상태 나타내는 것 추가
        }
    };

    return (
        <View style={styles.container}>
            <Text> 참여자 목록</Text>
            <FlatList
                data={sortedMembers}
                keyExtractor={(item) => item.memberId.toString()}
                renderItem={({ item }) => (
                    <View style={styles.memberContainer}>

                        {<Image
                            source={require('../../assets/images/anonymous.png')}
                            // source={{ uri: item.profile || 'https://via.placeholder.com/50' }}
                            style={styles.profilePicture}
                        />}
                        <Text style={styles.memberText}>{item.username}</Text>
                        {item.memberId !==currentUserId ? (
                            <ImageTextButton
                                iconSource={require('../../assets/Icons/addFriendIcon.png')}
                                imageStyle={{height: 18, width: 18, marginTop:2}}
                                onPress={()=>handleSend(item.memberId)}
                            />
                        ): (
                            <View style = {styles.badgeContainer} >
                                <Text style={styles.badgeText}>나</Text>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    memberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ececec',
    },
    profilePicture: {
        width: 25,
        height: 25,
        borderRadius: 20,
        marginRight: 10,
    },
    memberText: {
        fontSize: 14,
        marginRight: 10,
        color: 	'#222222',
    },

    badgeContainer: {
        backgroundColor: '#303136', // Customize the color as needed
        borderRadius: 12,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        marginTop: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },

});

export default MemberList;
