// MemberList.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { chatRoomMember } from "../../interfaces/Chatting.type";

interface MemberListProps {
    members: chatRoomMember[];
}

const MemberList: React.FC<MemberListProps> = ({ members }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={members}
                keyExtractor={(item) => item.memberId.toString()}
                renderItem={({ item }) => (
                    <View style={styles.memberContainer}>
                        <Image
                            source={ require('../../assets/images/anonymous.png')}
                            // source={{ uri: item.profile || 'https://via.placeholder.com/50' }}
                            style={styles.profilePicture}
                        />
                        <Text style={styles.memberText}>{item.username}</Text>
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
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    memberText: {
        fontSize: 16,
    },
});

export default MemberList;
