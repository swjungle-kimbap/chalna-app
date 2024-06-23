import React, { useState } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the import path as necessary

interface Message {
    id: string;
    message: string;
    status: boolean;
    datetime: string;
    isSelf: boolean;
    type?: string;


}

const ChattingScreen: React.FC = ({ route }) => {
    const [messages, setMessages] = useState<Message[]>([
        // Initial messages for demonstration
        { id: '1', message: 'Hello!', datetime: '10:00 AM', status: true, isSelf: false },
        { id: '2', message: 'Hi there!', datetime: '10:01 AM', status: true, isSelf: true },
        { id: '3', message: 'How are you?', datetime: '10:02 AM', status: true, isSelf: false },
        { id: '4', message: 'I\'m good, thanks!', datetime: '10:03 AM', status: true, isSelf: true },
        { id: '5', message: 'Can we be friends?', datetime: '10:04 AM', status: true, isSelf: false, type: 'friendRequest' },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [chatRoomType, setChatRoomType] = useState('default'); // Add state to manage chatroom type

    const handleSend = () => {
        if (newMessage.trim() !== '') {
            const newMessageObject: Message = {
                id: (messages.length + 1).toString(),
                message: newMessage,
                datetime: new Date().toLocaleTimeString(),
                isSelf: true,
            };
            setMessages([...messages, newMessageObject]);
            setNewMessage('');
        }
    };

    const handleFriendRequest = () => {
        const friendRequestMessage: Message = {
            id: (messages.length + 1).toString(),
            message: 'Friend request sent.',
            datetime: new Date().toLocaleTimeString(),
            isSelf: true,
            type: 'friendRequest'
        };
        setMessages([...messages, friendRequestMessage]);
        setIsModalVisible(false);
        setChatRoomType('friend'); // Update chatroom type to friend after sending request
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <MessageBubble
                        key={item.id}
                        message={item.message}
                        datetime={item.datetime}
                        isSelf={item.isSelf}
                        type={item.type}
                    />
                )}
                keyExtractor={(item) => item.id}
                style={styles.messageList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={handleSend} />
            </View>
            <TouchableOpacity style={styles.menuButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.menuButtonText}>Menu</Text>
            </TouchableOpacity>
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setIsModalVisible(false)}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Button
                        title="Send Friend Request"
                        onPress={handleFriendRequest}
                        disabled={chatRoomType === 'FRIEND'} // Disable button if chatroom type is friend
                    />
                    <Button title="Close" onPress={() => setIsModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingBottom: 70, // Ensure messages are not hidden behind the bottom margin
    },
    messageList: {
        flex: 1,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    menuButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#007BFF',
        borderRadius: 30,
        padding: 10,
        zIndex: 10,
    },
    menuButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
    },
});

export default ChattingScreen;
