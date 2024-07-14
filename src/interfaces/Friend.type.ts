export type friend = {
    id: number,
    message?: string | null,
    username: string,
}

export type friendAPIResponse = {
    status: number;
    message: string;
    data: friend[];
}

export type requestedFriend = {
    id: number,
    senderId: number,
    receiverId: number,
    chatRoomId: number,
    username: string,
    createdAt: string
}
