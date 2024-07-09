import React, {useEffect, useMemo, useState} from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRecoilValue } from 'recoil';
import { ProfileImageMapState } from '../../recoil/atoms';
import FastImage, { Source } from 'react-native-fast-image';
import { chatRoomMemberImage } from '../../interfaces/Chatting.type';
import { handleDownloadProfile } from '../../service/Friends/FriendListAPI';
import {JoinedLocalChatListState, userInfoState} from "../../recoil/atoms";
import {LocalChatRoomData, LoginResponse} from "../../interfaces";
import Text from '../../components/common/Text';

interface ChatRoomCardProps {
    numMember: number;
    usernames: string;
    members: chatRoomMemberImage[]
    memberCnt: number;
    lastMsg?: string | null;
    lastUpdate?: string;
    navigation: any;
    chatRoomType: string;
    chatRoomId: number; // chatRoomId
    unReadMsg?: number;
    onDelete: (chatRoomId: number) =>void;
}


const DefaultImgUrl = '../../assets/images/anonymous.png';

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({
                                                       lastMsg, lastUpdate, usernames, members, memberCnt
                                                       , navigation, chatRoomType, chatRoomId
                                                       , unReadMsg, onDelete }) => {
    const profileImageMap = useRecoilValue(ProfileImageMapState);
    const [profilePicture, setProfilePicture] = useState("");
    useEffect(() => {
        const fetchProfileImage = async () => {
            if (chatRoomType === 'FRIEND' && members.length === 1 && members[0].profileImageId) {
                const findProfileImageId = members[0].profileImageId;
                const newprofile = profileImageMap.get(findProfileImageId);
                if (newprofile)
                    setProfilePicture(newprofile);
                else {
                    const newProfileImageUri = await handleDownloadProfile(findProfileImageId);
                    profileImageMap.set(findProfileImageId, newProfileImageUri);
                    setProfilePicture(newProfileImageUri);
                }
            } else {
                setProfilePicture("");
            }
        }
        fetchProfileImage();
    }, [members])

    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(chatRoomId)}>
            <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
    );
    const joinedLocalChatList = useRecoilValue(JoinedLocalChatListState);
    const chatRoomName = useMemo(() => {
        const chatRoom = joinedLocalChatList.find(room => room.chatRoomId === chatRoomId);
        return chatRoom ? chatRoom.name : 'Unknown Chat Room';
    }, [chatRoomId, joinedLocalChatList]);


    return (
        <Swipeable renderRightActions={renderRightActions}>
            <TouchableOpacity
                onPress={() => navigation.navigate('채팅', { chatRoomId })}
                style={[
                    styles.card,
                    chatRoomType === 'FRIEND' ? styles.friendCard :
                        chatRoomType === 'MATCH' ? styles.matchCard :
                            chatRoomType==='LOCAL'? styles.localCard :styles.waitCard
                ]} // Conditional styles
            >
                <View style={styles.row}>
                    {(profilePicture) ?
                    (<FastImage
                    style={styles.image}
                    source={{uri: profilePicture, priority: FastImage.priority.normal } as Source}
                    resizeMode={FastImage.resizeMode.cover}
                    />) : (
                    <Image
                    source={ //chatRoomType!=='LOCAL'?
                        require(DefaultImgUrl)}
                        // : require('../../assets/images/localChatRoom.png')} // Replace with your image path
                    style={ styles.image }
                    />
                    )}

                    <View style={styles.content}>
                        <View style={styles.header}>

                            <Text style={[styles.usernames, chatRoomType === 'MATCH' && styles.matchUsername]}>
                                {chatRoomType==='LOCAL'? chatRoomName: usernames}
                            </Text>
                            <Text variant={'sub'} align={'left'} style={{ color: chatRoomType==='MATCH'? 'green': 'grey' }}>
                                {memberCnt===2?'':memberCnt}
                            </Text>

                            {unReadMsg ? (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{unReadMsg}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.bottomRow}>
                            <Text style={styles.lastMsg} align={'left'} >{lastMsg || " "}</Text>
                            <Text style={styles.lastUpdate}>{lastUpdate ? lastUpdate : " "}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
}


const styles = StyleSheet.create({
    card: {
        padding: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        // shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    row: {
        flexDirection: 'row',
    },
    matchCard: {
        borderColor: '#ffffff', // Example color for MATCH type
    },
    friendCard: {
        backgroundColor:'#ffffff'
    },
    waitCard: {
        backgroundColor:'#ececec'
    },
    localCard: {
        backgroundColor: '#d5ead6'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 10, // Space between the image and the content
    },
    usernames: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginRight:10,
        color: '#5A5A5A',
        flex: 1, // Ensure the username takes up available space
    },
    matchUsername: {
        color: 'green',
    },
    lastMsg: {
        fontSize: 14,
        color: '#666',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    status: {
        fontSize: 12,
        color: '#999',
    },
    lastUpdate: {
        fontSize: 12,
        color: '#999',
    },
    unreadBadge: {
        alignSelf: "flex-end",
        backgroundColor: 'green',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
    },
    image: {
        marginTop:3,
        marginRight:5,
        marginLeft:5,
        width: 45,
        height: 45,
        // borderRadius: 25,
    },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // localChatIcon:{
    //     marginHorizontal: 16,
    //     marginTop: 10,
    //     marginBottom: 15,
    //     width: 21,
    //     height: 20,
    // }

});

export default ChatRoomCard;
