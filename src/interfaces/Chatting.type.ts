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

export type chatRoomMemberInfo = {
    members: chatRoomMember[];
    memberCount: number;
}


export type chatRoomMember = {
    memberId:number,
    username:string,
    profileImageId: number,
    isJoined: boolean,
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
    chatRoomMemberInfo: chatRoomMemberInfo;
    recentMessage?: ChatMessage;
    unreadMessageCount?: number;
    lastReceivedAt?: string;
    createdAt: string;
    updatedAt?: string;
}


export type chatRoomMemberImage = {
    memberId:number,
    username:string,
    profileImageId: number,
    isJoined: boolean,
}

export type ChatRoomLocal = {
    id: number;
    type: string;
    chatRoomMemberInfo: chatRoomMemberInfo;
    recentMessage?: ChatMessage;
    messages?: directedChatMessage[];
    unreadMessageCount?: number;
    lastReceivedAt?: string;
    createdAt: string;
    updatedAt?: string;
    name?:string;
}
