import {User} from "./User";

export interface ChatMessage {
    id: number;
    type: string;
    content: string;
    senderId: number;
    createdAt: string;
}

type chatRoomMember = Pick<User, "id"|"username">;

export type chatroomInfoAndMsg = {
    id: number,
    type: string,
    members: chatRoomMember[],
    createdAt:string,
    list: ChatMessage[],
}
