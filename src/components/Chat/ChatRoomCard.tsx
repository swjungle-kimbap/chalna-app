import React , { useState }  from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

interface ChatRoomCardProps {
    numMember: number;
    usernames: string;
    lastMsg?: string | null;
    lastUpdate?: string;
    navigation: any;
    chatRoomType: string;
    chatRoomId: number; // chatRoomId
    unReadMsg?: number;
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
};

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ lastMsg, lastUpdate, usernames, navigation, chatRoomType, chatRoomId, unReadMsg }) => {

    // const [file, setFile] = useState<any>(null);

    // const pickImage = () => {
    //     ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
    //         if (response.didCancel) {
    //             console.log('User cancelled image picker');
    //         } else if (response.errorCode) {
    //             console.log('ImagePicker Error: ', response.errorMessage);
    //         } else {
    //             const { uri, type, fileName, fileSize } = response.assets[0];
    //             setFile({ uri, type, fileName, fileSize });
    //             // 이후에 서버로 메타데이터와 URL을 전송하는 로직을 추가
    //             // uploadImageMetadata({ uri, type, fileName, fileSize });
    //         }
    //     });
    // };

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('채팅', { chatRoomId })}
            style={[
                styles.card,
                chatRoomType === 'FRIEND' ? styles.friendCard : chatRoomType === 'MATCH' ? styles.matchCard : styles.waitCard
            ]} // Conditional styles
        >
            <View style={styles.row}>
                <Image
                    source={require('../../assets/images/anonymous.png')} // Replace with your image path
                    style={styles.image}
                />

                 {/* <TouchableOpacity onPress={pickImage} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity> */}

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.usernames, chatRoomType === 'MATCH' && styles.matchUsername]}>{usernames}</Text>
                        {unReadMsg ? (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unReadMsg}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text style={styles.lastMsg}>{lastMsg || "대화를 시작해보세요"}</Text>
                    <View style={styles.bottomRow}>
                        <Text style={styles.status}>{/* Status message here */}</Text>
                        <Text style={styles.lastUpdate}>{lastUpdate ? formatTime(lastUpdate) : " "}</Text>
                    </View>
                </View>
            </View>
            {/* {file && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: file.uri }} style={styles.selectedImage} />
                    <Text>File Name: {file.fileName}</Text>
                    <Text>File Size: {file.fileSize}</Text>
                    <Text>File Type: {file.type}</Text>
                </View>
            )} */}
        </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    },
    // addButton: {
    //     marginLeft: 10,
    //     backgroundColor: '#007BFF',
    //     borderRadius: 20,
    //     width: 40,
    //     height: 40,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
    // addButtonText: {
    //     color: 'white',
    //     fontSize: 24,
    //     fontWeight: 'bold',
    // },
    // imageContainer: {
    //     alignItems: 'center',
    //     marginTop: 10,
    // },
    // selectedImage: {
    //     width: 200,
    //     height: 200,
    //     resizeMode: 'cover',
    // },
});

export default ChatRoomCard;
