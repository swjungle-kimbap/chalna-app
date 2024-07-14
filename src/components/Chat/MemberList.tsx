// MemberList.tsx
import React from 'react';
import { View,  FlatList, StyleSheet, Image } from 'react-native';
import { chatRoomMember } from "../../interfaces/Chatting.type";
import ImageTextButton from "../common/Button";
import FastImage from "react-native-fast-image";
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
    const filteredAndSortedMembers = members
        .filter(member => member.isJoined) // Filter members with hasJoined === true
        .sort((a, b) => (a.memberId === currentUserId ? -1 : b.memberId === currentUserId ? 1 : 0));


    const handleSend = async (otherId: number) =>{
        const response = await sendFriendRequest(otherId, chatRoomId);
        if (response === true) {
            if (chatRoomType!=='LOCAL'){ // 매치 1:1 채팅일 때만 채팅방에 친구요청 메세지 전송
                WebSocketManager.sendMessage(chatRoomId, "친구 요청을 보냈습니다.", 'FRIEND_REQUEST');
            }
            // 친구추가 버튼 없애기 버튼 or 요청중 상태 나타내는 것 추가
        }
    };

    // profile 추가하기
    return (
        <View style={styles.container}>
            {/*<Text> 참여자 목록</Text>*/}
            <FlatList
                data={filteredAndSortedMembers}
                keyExtractor={(item) => item.memberId.toString()}
                renderItem={({ item }) => (
                    <View style={styles.memberContainer}>
                        <FastImage
                            source={item.profileImageId ?  "" : require('../../assets/images/anonymous.png')}
                            style={styles.profilePicture}
                        />
                        <Text style={styles.memberText}>{item.username}</Text>
                        {item.memberId !==currentUserId ? (
                            <View style={{marginLeft:'auto'}}>
                                {chatRoomType!=='FRIEND' ? (
                                <ImageTextButton
                                    iconSource={require('../../assets/Icons/addFriendIcon.png')}
                                    imageStyle={{height: 18, width: 18, marginTop:2, marginLeft: "auto"}}
                                    onPress={()=>handleSend(item.memberId)}
                                />
                                ):(
                                    <FastImage
                                        source={require('../../assets/Icons/friendIcon.png')}
                                        style = {styles.badgeContainer}
                                    />
                                        )}
                            </View>
                        ): (
                            <View style = {[styles.badgeContainer, styles.badgeColor]} >
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
        borderRadius: 12,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
        marginTop: 2,
    },
    badgeColor: {
        backgroundColor: '#303136', // Customize the color as needed
    },
    badgeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },

});

export default MemberList;
