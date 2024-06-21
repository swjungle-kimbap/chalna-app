import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import ChatRoom from './ChatRoom';

export default class Message extends Model {
    static table = 'messages';

    @relation('chat_rooms', 'chat_room_id') chatRoom!: ChatRoom;
    @field('type') type!: string;
    @field('content') content!: string;
    @field('sender_id') senderId!: string;
    @field('status') status?: boolean;
    @field('created_at') createdAt!: number;
}
