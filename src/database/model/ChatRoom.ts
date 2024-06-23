// model/ChatRoom.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, children} from '@nozbe/watermelondb/decorators';
import Message from './Message';
import Member from './Member';
import Membership from "./Membership";

export default class ChatRoom extends Model {
    static table = 'chat_rooms';
    @field('chat_room_id') ChatRoomId!:number;
    @field('type') type!: string;
    @field('member_count') memberCount!: number;
    @field('recent_message') recentMessage!: string;
    @field('opened_at') createdAt!: string;
    @field('last_updated_at') updatedAt?: string;
    @field('removed_at') removedAt?: string;

    @children('messages') messages!: Message[];
    @children('memberships') memberships!: Membership[];
}
