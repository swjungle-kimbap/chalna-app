// model/ChatRoom.ts
import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';
import Message from './Message';
import Member from './Member';

export default class ChatRoom extends Model {
    static table = 'chat_rooms';

    @field('type') type!: string;
    @field('member_count') memberCount!: number;
    @field('recent_message_id') recentMessageId!: string;
    @field('created_at') createdAt!: number;
    @field('updated_at') updatedAt?: number;
    @field('removed_at') removedAt?: number;

    @children('messages') messages!: Message[];
    @children('members') members!: Member[];
}
