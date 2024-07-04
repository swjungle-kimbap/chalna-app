import {ChatRoomLocal, ChatMessage, directedChatMessage} from "../interfaces/Chatting.type";
import { userMMKVStorage } from "../utils/mmkvStorage";

// Save chat room list
export const saveChatRoomList = (chatRooms: ChatRoomLocal[]) => {
    console.log('setChatRoomList loacl');
    const currentChatRooms = getChatRoomList();
    if (JSON.stringify(currentChatRooms) !== JSON.stringify(chatRooms)) {
        userMMKVStorage.set('chatRoomList', JSON.stringify(chatRooms));
    }
};

// Retrieve chat room list
export const getChatRoomList = (): ChatRoomLocal[] | null => {
    console.log('getChatRoomList loacl');
    const chatRoomListString = userMMKVStorage.getString('chatRoomList');
    return chatRoomListString ? JSON.parse(chatRoomListString) : null;
};

// Save a single chat room info
export const saveChatRoomInfo = (chatRoom: ChatRoomLocal) => {
    console.log('saveChatRoomInfo');
    const chatRooms = getChatRoomList() || [];
    const existingChatRoom = chatRooms.find(room => room.id === chatRoom.id);

    if (existingChatRoom) {
        const updatedChatRoom = { ...existingChatRoom };

        // Update only fields that are different
        Object.keys(chatRoom).forEach((key) => {
            if (chatRoom[key] !== existingChatRoom[key]) {
                updatedChatRoom[key] = chatRoom[key];
            }
        });

        const updatedChatRooms = chatRooms.map(room => room.id === chatRoom.id ? updatedChatRoom : room);
        saveChatRoomList(updatedChatRooms);
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
    return chatRooms ? chatRooms.find(room => room.id === chatRoomId) || null : null;
};




// Remove a chat room from storage
export const removeChatRoom = (chatRoomId: number) => {
    // Retrieve the current chat room list
    const chatRoomList = getChatRoomList();
    if (chatRoomList) {
        // Filter out the chat room to be removed
        const updatedChatRoomList = chatRoomList.filter(room => room.id !== chatRoomId);
        // Save the updated chat room list back to storage
        saveChatRoomList(updatedChatRoomList);
    }
    // Remove associated chat messages
    removeChatMessages(chatRoomId.toString());
};




// Save chat messages for a specific chat room
export const saveChatMessages = (chatRoomId: string, newMessages: directedChatMessage[]) => {
    console.log('save chat message');
    const existingMessages = getChatMessages(chatRoomId) || [];
    const updatedMessages = [...existingMessages, ...newMessages];
    userMMKVStorage.set(`chatMessages_${chatRoomId}`, JSON.stringify(updatedMessages));
};

// Retrieve chat messages for a specific chat room
export const getChatMessages = (chatRoomId: string): directedChatMessage[] | null => {
    console.log('get chat message');
    const messagesString = userMMKVStorage.getString(`chatMessages_${chatRoomId}`);
    return messagesString ? JSON.parse(messagesString) : null;
};

// Remove chat messages for a specific chat room
export const removeChatMessages = (chatRoomId: string) => {
    userMMKVStorage.delete(`chatMessages_${chatRoomId}`);
};
