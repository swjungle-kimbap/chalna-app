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
    description?: string;
    distance?: string;
    navigation: any;
    chatRoomType: string;
    chatRoomId: number; // chatRoomId
    unReadMsg?: number;
    onDelete: (chatRoomId: number) =>void;
}


const DefaultImgUrl = '../../assets/images/anonymous.png';

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({
                                                       lastMsg, lastUpdate, description, distance
                                                       , usernames, members, memberCnt
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

    const truncateString = (str, num) => {
        const newLineIndex = str.indexOf('\n');
        if (newLineIndex !== -1 && newLineIndex < num) {
            return str.slice(0, newLineIndex);
        } else if (str.length > num) {
            return str.slice(0, num) + '...';
        }
        return str;
    };
    const truncatedMsg = truncateString(lastMsg || " ", 15);


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
                                <Text style={[styles.usernames, chatRoomType === 'MATCH' && styles.matchUsername]}
                                      variant={chatRoomType=='MATCH'?"title":"main"}
                                >
                                    {chatRoomType==='LOCAL'? chatRoomName: usernames}
                                </Text>
                                <Text variant={'sub'} align={'left'} style={{ color: chatRoomType==='MATCH'? '#006a81': 'grey', marginRight: 3 }}>
                                    {memberCnt===2?'':memberCnt}
                                </Text>
                                {chatRoomType==='LOCAL' && (
                                    <Text variant={'sub'} style={styles.lastUpdate}>{distance ? '('+distance+')' : " "}</Text>
                                )}
                                {unReadMsg ? (
                                    <View style={styles.unreadBadge}>
                                        <Text  style={styles.unreadText}>{unReadMsg}</Text>
                                    </View>
                                ) : null}

                        </View>
                        <View style={styles.bottomRow}>
                            <Text variant={'sub'} style={styles.lastMsg} numberOfLines={1}  align={'left'} >{truncatedMsg || " "}</Text>
                            <Text variant={'sub'} style={styles.lastUpdate}>{lastUpdate ? lastUpdate : " "}</Text>
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
        backgroundColor: 'f3f3f3'// '#eeeeee'
    },
    localCard: {
        // backgroundColor: '#d9ebfa'
        backgroundColor: '#e6f4ff'
    },
    header: {
        flexDirection: 'row',
        alignItems:'center',
    },
    content: {
        flex: 1,
        marginLeft: 10, // Space between the image and the content
        flexDirection: 'column'
    },
    usernames: {
        fontSize: 16,
        marginBottom: 5,
        marginRight:2,
        flex: 1, // Ensure the username takes up available space
    },
    matchUsername: {
        color: '#006a81',
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
        // flex: 1,
        alignContent:'flex-end',
        backgroundColor: '#006a81',
        marginLeft: 'auto',
        borderRadius: 10,
        paddingHorizontal: 8,
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
        borderRadius: 20,
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
