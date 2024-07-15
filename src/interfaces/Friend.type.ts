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

export type friendRequest = {
    id: number,
    senderId: number,
    receiverId: number,
    chatRoomId: number,
    username: string,
    createdAt: string
}

export interface relationAPIResponse {
    friendStatus: string;
    isBlocked: boolean;
    overlapCount: number;
    lastOverlapAt?: any|null;
}
