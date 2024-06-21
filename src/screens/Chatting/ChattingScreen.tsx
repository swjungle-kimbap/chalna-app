import React from 'react';
import {View, FlatList, TextInput, Button, StyleSheet, SafeAreaView} from 'react-native';
import MessageBubble from '../../components/Chat/MessageBubble'; // Adjust the import path as per your project structure

const ChattingScreen = () => {
    // Dummy data for chat messages
    const messages = [
        { id: '1', message: 'Hello!', datetime: '2024-06-21T10:00:00', isSelf: false },
        { id: '2', message: 'Hi there!', datetime: '2024-06-21T10:01:00', isSelf: true },
        { id: '3', message: 'How are you?', datetime: '2024-06-21T10:02:00', isSelf: false },
        { id: '4', message: "Let's be friends", datetime: '2024-06-21T10:03:00', isSelf: false, type:'friendRequest' },
        // Add more messages as needed
    ].reverse();

    return (
        // <SafeAreaView>
            <View style={styles.container}>
                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <MessageBubble
                            message={item.message}
                            datetime={item.datetime}
                            isSelf={item.isSelf}
                        />
                    )}
                    contentContainerStyle={styles.messagesContainer}
                    inverted // To display messages from bottom to top
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        multiline
                        numberOfLines={2}
                    />
                    <Button title="Send" onPress={() => {}} />
                </View>
            </View>
        // </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 10,
        paddingBottom: 60,
    },
    messagesContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginRight: 10,
        maxHeight: 80,
    },
});

export default ChattingScreen;
