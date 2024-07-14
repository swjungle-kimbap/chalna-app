import {ChatRoomLocal, ChatMessage, directedChatMessage} from "../../interfaces/Chatting.type";
import { userMMKVStorage } from "../../utils/mmkvStorage";
import { ChatFCM } from "../../interfaces/ReceivedFCMData.type";
import { chatRoomMemberImage } from '../../interfaces/Chatting.type';


// Save chat room list
export const saveChatRoomList = (chatRooms: ChatRoomLocal[]) => {
    // console.log('setChatRoomList loacl');
    const currentChatRooms = getChatRoomList();
    if (JSON.stringify(currentChatRooms) !== JSON.stringify(chatRooms)) {
        userMMKVStorage.set('chatRoomList', JSON.stringify(chatRooms));
    }
};

// Retrieve chat room list
export const getChatRoomList = (): ChatRoomLocal[] | null => {
    // console.log('getChatRoomList loacl');
    const chatRoomListString = userMMKVStorage.getString('chatRoomList');
    return chatRoomListString ? JSON.parse(chatRoomListString) : null;
};


// Save a single chat room info
export const saveChatRoomInfo = (chatRoom: ChatRoomLocal) => {
    console.log('saveChatRoomInfo');
    const chatRooms = getChatRoomList() || [];
    let chatRoomIndex = chatRooms.findIndex(room => room.id === chatRoom.id);

    if (chatRoomIndex !== -1) {
        const existingChatRoom = chatRooms[chatRoomIndex];
        let isUpdated = false;

        // Update only fields that are different
        Object.keys(chatRoom).forEach((key) => {
            if (chatRoom[key] !== existingChatRoom[key]) {
                existingChatRoom[key] = chatRoom[key];
                isUpdated = true;
            }
        });

        if (isUpdated) {
            chatRooms[chatRoomIndex] = existingChatRoom;
            saveChatRoomList(chatRooms);
        }

    } else {
        // If chat room doesn't exist, add it
        const updatedChatRooms = [...chatRooms, chatRoom];
        saveChatRoomList(updatedChatRooms);
    }
};


// Retrieve a single chat room info
export const getChatRoomInfo = (chatRoomId: number): ChatRoomLocal | null => {
    console.log('getChatRoomInfo');
    const chatRooms = getChatRoomList();
    return chatRooms?.find(room => room.id === chatRoomId) || null;
};


// Remove a chat room from storage
export const removeChatRoom = (chatRoomId: number) => {
    console.log('removeChatRoom');
    // Remove associated chat messages
    removeChatMessages(chatRoomId.toString());
    // Retrieve the current chat room list
    const chatRoomList = getChatRoomList();
    if (!chatRoomList) {
        return;
    }
    // Filter out the chat room to be removed
    const updatedChatRoomList = chatRoomList.filter(room => room.id !== chatRoomId);
    // Save the updated chat room list back to storage
    saveChatRoomList(updatedChatRoomList);
};


// Save chat messages for a specific chat room
export const saveChatMessages = (chatRoomId: string, newMessages: directedChatMessage[]) => {
    console.log('save chat message');

    // Retrieve existing messages
    const existingMessagesString = userMMKVStorage.getString(`chatMessages_${chatRoomId}`);
    let existingMessages: directedChatMessage[] = [];

    if (existingMessagesString) {
        existingMessages = JSON.parse(existingMessagesString);
    }

    // Create a map of existing messages by id for quick lookup
    const messageMap = new Map<number, directedChatMessage>();
    existingMessages.forEach(message => {
        messageMap.set(message.id, message);
    });

    // Update or add new messages
    newMessages.forEach(newMessage => {
        messageMap.set(newMessage.id, newMessage);
    });

    // Convert map back to array
    const updatedMessages = Array.from(messageMap.values());

    // Save updated messages
    userMMKVStorage.set(`chatMessages_${chatRoomId}`, JSON.stringify(updatedMessages));
};


export const getChatMessages = (chatRoomId, limit = 20, lastMessageId = null) => {
    console.log("------get Chat Messages run in mmkv ------");

    const allMessagesKey = `chatMessages_${chatRoomId}`;
    const allMessagesString = userMMKVStorage.getString(allMessagesKey);
    if (!allMessagesString) {
        return [];
    }

    const allMessages = JSON.parse(allMessagesString);
    if (lastMessageId) {
        const lastMessageIndex = allMessages.findIndex(msg => msg.id === lastMessageId);
        if (lastMessageIndex !== -1) {
            const start = Math.max(lastMessageIndex - limit, 0);
            return allMessages.slice(start, lastMessageIndex);
        }
    }

    return allMessages.slice(-limit); // Default to the latest messages if no lastMessageId provided
};


export const getAllChatMessages = (chatRoomId) => {
    console.log("------get All Chat Messages run in mmkv ------");

    const allMessagesKey = `chatMessages_${chatRoomId}`;
    const allMessagesString = userMMKVStorage.getString(allMessagesKey);
    if (!allMessagesString) {
        return [];
    }

    const allMessages = JSON.parse(allMessagesString);
    return allMessages;
};




// Reset unread count for a specific chat room ===============================
export const resetUnreadCountForChatRoom = (chatRoomId: number) => {
    console.log('reset unread count for chat room');
    const chatRooms = getChatRoomList();
    if (!chatRooms || chatRooms.length === 0) {
        return;
    }

    const updatedChatRooms = chatRooms.map(chatRoom => {
        if (chatRoom.id === chatRoomId) {
            return { ...chatRoom, unreadMessageCount: 0 };
        }
        return chatRoom;
    });

    saveChatRoomList(updatedChatRooms);
};

// Remove chat messages for a specific chat room
export const removeChatMessages = (chatRoomId: string) => {
    userMMKVStorage.delete(`chatMessages_${chatRoomId}`);
};

export const decrementUnreadCountBeforeTimestamp = (chatRoomId: string, timestamp: string) => {
    console.log('decrement unread count before timestamp');
    const messages = getAllChatMessages(chatRoomId);
    if (messages) {
        let messagesChanged = false;

        const updatedMessages = messages.map(message => {
            if (message.createdAt < timestamp && message.unreadCount > 0) {
                messagesChanged = true;
                return { ...message, unreadCount: message.unreadCount - 1 };
            }
            return message;
        });

        if (messagesChanged) {
            userMMKVStorage.set(`chatMessages_${chatRoomId}`, JSON.stringify(updatedMessages));
        }
    }
};

// export const createChatRoomLocal = (fcmData: ChatFCM): ChatRoomLocal => {
//     const chatRoomMemberImage: chatRoomMemberImage = {
//         memberId: Number(fcmData.senderId),
//         username: fcmData.senderName,
//         profileImageId: 0, // Assuming you have a way to get the profile URL
//         isJoined: true // Assuming you have a way to get the status message
//     };
//
//     const chatMessage: ChatMessage = {
//         id: Date.now(), // Generate a unique ID for the message
//         type: fcmData.messageType,
//         content: fcmData.message,
//         senderId: Number(fcmData.senderId),
//         unreadCount: 0, // Assuming no unread count initially
//         createdAt: fcmData.createdAt
//     };
//
//     return {
//         id: Number(fcmData.chatRoomId),
//         type: fcmData.chatRoomType,
//         members: [chatRoomMemberImage],
//         recentMessage: chatMessage,
//         messages: [{
//             ...chatMessage,
//             isSelf: false, // Assuming the message is sent by the current user
//             formatedTime: new Date(fcmData.createdAt).toLocaleString() // Format the time as needed
//         }],
//         createdAt: new Date().toISOString(), // Assuming the current time as createdAt
//         updatedAt: new Date().toISOString() // Assuming the current time as updatedAt
//     };
// }
