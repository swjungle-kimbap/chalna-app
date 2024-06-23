import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import ChatRoom from './ChatRoom';

export default class Message extends Model {
    static table = 'messages';
    static associations = {
        chat_rooms: {type: 'belongs_to', foreignKey: 'chat_room_id'},
    };

    @field('chat_room_id') ChatRoomId!: number;
    @field('type') type!: string;
    @field('content') content!: string;
    @field('sender_id') senderId!: number;
    @field('status') status?: boolean;
    @field('created_at') createdAt!: string;

    @relation('chat_rooms','chat_room_id') chat_room: ChatRoom;
}
