export type ChatMessage = {
    id: number;
    type: string;
    content: string;
    senderId: number;
    status: boolean;
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
