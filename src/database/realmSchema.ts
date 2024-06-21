import Realm from "realm";
import {ObjectSchema} from 'realm';

const UserSchema: ObjectSchema = {
    name: "User",
    properties: {
        id: "int",
        name: "string",
        profilePic: "string", // URL or base64 string
        // Other user-specific fields can be added here
    },
    primaryKey: "id",
};

// const MatchSchema = { //sent and icoming both?
//     name: "Match",
//     properties: {
//         id: "int",
//         text: "string",
//         createdAt: "date",
//         expiresAt: "date",
//         sender: "User",  // Reference to the user who sent the match message
//     },
//     primaryKey: "id",
// };


const ChatRoomSchema: ObjectSchema = {
    name: "ChatRoom",
    properties: {
        id: "int",
        name: "string",
        isAnonymous: "bool",
        members: { type: "list", objectType: "User" }, // List of users participating in the chat room
        messages: { type: "list", objectType: "Message" },  // List of messages in the chat room
        createdAt: "date",
        expiresAt: "date",
        lastMessage: "string"
    },
    primaryKey: "id",
};

const MessageSchema: ObjectSchema = {
    name: "Message",
    properties: {
        id: "int",
        text: "string",
        createdAt: "date",
        sender: "User",  // Reference to the user who sent the message
        senderId: "int", // how can I use sender in a more efficient way?
        receiverId: "int",
        chatRoomId: "int", //is it needed?
        status: "string",
        synced: { type: "bool", default: false },
    },
    primaryKey: "id",
};

const SyncMetadataSchema: ObjectSchema = {
    name: "SyncMetadata",
    properties: {
        id: "int",
        lastSyncTime: "date",
    },
    primaryKey: "id",
};

const realm = new Realm({ schema: [UserSchema, ChatRoomSchema, MessageSchema] });

export default realm;
