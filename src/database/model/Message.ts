import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import ChatRoom from './ChatRoom';
import Membership from "./Membership";

export default class Message extends Model {
    static table = 'messages';
    @field('chat_room_id') ChatRoomId!: number;
    @relation('chat_rooms', 'chat_room_id') chatRoom!: ChatRoom;
    @field('type') type!: string;
    @field('content') content!: string;
    @field('sender_id') senderId!: number;
    @field('status') status?: boolean;
    @field('created_at') createdAt!: string;
}
