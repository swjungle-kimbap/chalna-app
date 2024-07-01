// ChatRoomMember Schema
import {Realm} from "realm";
import ObjectSchema = Realm.ObjectSchema;

export class ChatRoomMember extends Realm.Object<ChatRoomMember>{
    userId!: number;
    name!:string;
    profilepic?:string;
    relationship?: string;
    status?: string;

    static schema: ObjectSchema = {
    name: 'ChatRoomMember',
    properties: {
        userId: 'int',
        name: 'string',
        profilepic: { type: 'string', optional: true,},
        relationship: { type: 'string', optional: true,},
        status: { type: 'string', optional: true,},
    },
    primaryKey: 'userId'
    };
}

// ChatMessage Schema

export class ChatMessage extends Realm.Object<ChatMessage>{
    msgId!: number;
    senderId!: number;
    content!: string;
    msgType!: string;
    createdAt: string;
    unreadCnt?: number;

    static schema: ObjectSchema = {
        name: 'ChatMessage',
        properties: {
            msgId: 'int',
            senderId: 'int',
            content: 'string',
            msgType: 'string',
            createdAt: 'string',
            unreadCnt: { type: 'int', optional: true, },
        },
        primaryKey: 'msgId',
    };
}
// ChatRoom Schema
export class ChatRoom extends Realm.Object<ChatRoom> {
    chatRoomId: number;
    unReadMsg: number;
    chatRoomType: string;
    members: any[];
    messages?: any[];
    lastLeaveAt?: string;
    createdAt: string;
    removedAt?:string;

    static schema: ObjectSchema ={
        name: 'ChatRoom',
        properties: {
            chatRoomId: 'int',
            unReadMsg: 'int',
            chatRoomType: 'string',
            members: 'ChatRoomMember[]',
            messages: 'ChatMessage[]',
            lastLeaveAt: { type: "string", optional: true,},
            createdAt: "string",
            removedAt: { type: "string", optional: true,},
        },
        primaryKey: 'chatRoomId',
    };
}
