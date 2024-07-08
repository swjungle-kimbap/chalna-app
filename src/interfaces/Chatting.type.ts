export type ChatMessage = {
    id: number;
    type: string;
    content: string | any;
    senderId: number;
    unreadCount: number;
    createdAt: string;
}

export type directedChatMessage = ChatMessage & {
    isSelf: boolean;
    formatedTime: string;
}

export type chatRoomMember = {
    memberId:number,
    username:string
}

export type chatroomInfoAndMsg= {
    id: number,
    type: string,
    members: chatRoomMember[],
    createdAt:string,
    messages: ChatMessage[],
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
}



export type chatRoomMemberImage = {
    memberId:number,
    username:string,
    profile: string,
    statusMsg: string,
}

export type ChatRoomLocal = {
    id: number;
    type: string;
    memberCount?: number;
    members: chatRoomMemberImage[];
    recentMessage?: ChatMessage;
    messages?: directedChatMessage[];
    unreadMessageCount?: number;
    createdAt?: string;
    updatedAt?: string;
    removedAt?: string | null;
}
