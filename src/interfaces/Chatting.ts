import {User} from "./User";


export type ChatMessage = {
    id: number;
    type: string;
    content: string;
    senderId: number;
    createdAt: string;
}

export type chatRoomMember = Pick<User, "id"|"username">;

export type chatroomInfoAndMsg= {
    id: number,
    type: string,
    members: chatRoomMember[],
    createdAt:string,
    list: ChatMessage[],
}

export type ChatRoom = {
    id: number;
    type: string;
    memberCount: number;
    members: chatRoomMember[];
    recentMessage?: ChatMessage;
    unreadMessageCount?: number;
    createdAt: string;
    updatedAt?: string;
    removedAt?: string | null;
}
