// schemas.ts
import Realm from "realm";

// ChatRoomMember Schema
const ChatRoomMemberSchema = {
    name: 'ChatRoomMember',
    properties: {
        userId: 'int',
        name: 'string',
        relationship: 'string',
        status: 'string',
    },
    primaryKey: 'userId'
};

// ChatMessage Schema
const ChatMessageSchema = {
    name: 'ChatMessage',
    properties: {
        msgId: 'int',
        senderId: 'int',
        content: 'string',
        msgType: 'string',
        createdAt: 'date',
        unreadCnt: 'int',
    },
    primaryKey: 'msgId',
};

// ChatRoom Schema
const ChatRoomSchema = {
    name: 'ChatRoom',
    properties: {
        chatRoomId: 'int',
        unReadMsg: 'int',
        chatRoomType: 'string',
        members: 'ChatRoomMember[]',
        messages: 'ChatMessage[]',
        lastLeaveAt: "string",
        createdAt: "string",
        removedAt: "string",

    },
    primaryKey: 'chatRoomId',
};

export const realmConfig = {
    schema: [ChatRoomMemberSchema, ChatMessageSchema, ChatRoomSchema],
    schemaVersion: 1, // Increment this if you make schema changes
};

export default new Realm(realmConfig);
