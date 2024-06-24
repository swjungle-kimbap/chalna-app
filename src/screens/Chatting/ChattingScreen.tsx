import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the import path as necessary
import {axiosGet,axiosPost,axiosDelete} from "../../axios/axios.method.ts";

//
//
// // GET_CHAT_URL 채팅방 메세지 목록 조회
// // Data
// // id: number
// // type: mesage type(friend request )
// // content string
// // senderId: number
// // createdAt: 보내는 시간
// // status: boolean // 읽었나 안읽었나
//
// // member info
//
// interface Message {
//     id: string;
//     message: string;
//     status: boolean;
//     datetime: string;
//     isSelf: boolean; //만들어야함
//     type?: string;
// }
//
// interface sendMessage {
//     type: string;
//     content: string;
// }
//
// const ChattingScreen: React.FC = ({ route }) => {
//     const { chatRoomType: initialChatRoomTyp, chatRoomId } = route.params; // Retrieve chatRoomType from route params
//
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [chatRoomType, setChatRoomType] = useState<'MATCH' | 'FRIEND'>(initialChatRoomType); // Initialize chatRoomType from params
//     const [loading, setLoading] = useState(true);
//
//     useEffect(() => {
//         const fetchMessages = async () => {
//             try {
//                 const response = await axiosGet<Message[]>(`GET_CHAT_URL/${chatRoomId}`, 'Failed to fetch messages');
//                 setMessages(response.data);
//             } catch (error) {
//                 console.error(error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchMessages();
//     }, [chatRoomId]);
//
//     const handleSend = async () => {
//         if (newMessage.trim() !== '') {
//             const newMessageObject: sendMessage = {
//                 type: "CHAT",
//                 content: newMessage
//             };
//             try{
//                 await axiosPost(`GET_CHAT_URL/${chatRoomId}/SendMessage`, 'failed to send message',{
//                     content: newMessage,
//                     type: "CHAT"
//                 })
//             }
//
//             setMessages([...messages, newMessageObject]);
//             setNewMessage('');
//         }
//     };
//
//     const handleFriendRequest = async () => {
//         try {
//             await axiosPost('/api/friend-request', 'Failed to send friend request', { chatRoomId: route.params.chatRoomId });
//             const friendRequestMessage: Message = {
//                 id: (messages.length + 1).toString(),
//                 message: 'Friend request sent.',
//                 datetime: new Date().toLocaleTimeString(),
//                 isSelf: true,
//                 type: 'friendRequest'
//             };
//             setMessages([...messages, friendRequestMessage]);
//             setIsModalVisible(false);
//             setChatRoomType('friend'); // Update chat room type to friend after sending request
//         } catch (error) {
//             console.error(error);
//         }
//     };
//
//     if (loading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#0000ff" />
//             </View>
//         );
//     }
//
//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={messages}
//                 renderItem={({ item }) => (
//                     <MessageBubble
//                         key={item.id}
//                         message={item.message}
//                         datetime={item.datetime}
//                         isSelf={item.isSelf}
//                         type={item.type}
//                     />
//                 )}
//                 keyExtractor={(item) => item.id}
//                 style={styles.messageList}
//                 contentContainerStyle={styles.messageListContent}
//             />
//             <View style={styles.inputContainer}>
//                 <TextInput
//                     style={styles.input}
//                     value={newMessage}
//                     onChangeText={setNewMessage}
//                     placeholder="Type a message..."
//                 />
//                 <Button title="Send" onPress={handleSend} />
//             </View>
//             <TouchableOpacity style={styles.menuButton} onPress={() => setIsModalVisible(true)}>
//                 <Text style={styles.menuButtonText}>Menu</Text>
//             </TouchableOpacity>
//             <Modal
//                 isVisible={isModalVisible}
//                 onBackdropPress={() => setIsModalVisible(false)}
//                 style={styles.modal}
//             >
//                 <View style={styles.modalContent}>
//                     <Button
//                         title="Send Friend Request"
//                         onPress={handleFriendRequest}
//                         disabled={chatRoomType === 'friend'} // Disable button if chat room type is friend
//                     />
//                     <Button title="Close" onPress={() => setIsModalVisible(false)} />
//                 </View>
//             </Modal>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//         marginBottom: 70, // Added bottom margin
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     messageList: {
//         flex: 1,
//         padding: 10,
//     },
//     messageListContent: {
//         paddingBottom: 70, // Ensure messages are not hidden behind the bottom margin
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         borderTopWidth: 1,
//         borderColor: '#ccc',
//         backgroundColor: '#fff',
//     },
//     input: {
//         flex: 1,
//         height: 40,
//         borderColor: '#ccc',
//         borderWidth: 1,
//         borderRadius: 20,
//         paddingHorizontal: 10,
//         marginRight: 10,
//     },
//     menuButton: {
//         position: 'absolute',
//         bottom: 10,
//         right: 10,
//         backgroundColor: '#007BFF',
//         borderRadius: 30,
//         padding: 10,
//         zIndex: 10,
//     },
//     menuButtonText: {
//         color: '#fff',
//         fontSize: 16,
//     },
//     modal: {
//         justifyContent: 'flex-end',
//         margin: 0,
//     },
//     modalContent: {
//         backgroundColor: 'white',
//         padding: 22,
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         alignItems: 'center',
//     },
// });
//
// export default ChattingScreen;
//
//

const ChattingScreen: React.FC = ({ route }) => {
    return(
        <View>
            chatting screen
        </View>
    )
}
export default ChattingScreen;
