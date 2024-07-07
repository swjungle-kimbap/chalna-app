// MemberList.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { chatRoomMember } from "../../interfaces/Chatting.type";
import ImageTextButton from "../common/Button";
import {useRecoilValue} from "recoil";
import {LoginResponse} from "../../interfaces";
import {userInfoState} from "../../recoil/atoms";

interface MemberListProps {
    members: chatRoomMember[];
}



const MemberList: React.FC<MemberListProps> = ({ members }) => {

    const currentUserId = useRecoilValue<LoginResponse>(userInfoState).id;
    const sortedMembers = members.sort((a, b) => (a.memberId === currentUserId ? -1 : b.memberId === currentUserId ? 1 : 0));

    return (
        <View style={styles.container}>
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
                        {item.memberId !==currentUserId && (
                            <ImageTextButton
                                iconSource={require('../../assets/Icons/addFriendIcon.png')}
                                imageStyle={{height: 18, width: 18, marginTop:2, marginLeft: 10}}
                            />
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
        fontSize: 16,
    },
});

export default MemberList;
