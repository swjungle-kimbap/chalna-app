// Membership.ts
import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import ChatRoom from './ChatRoom';
import Member from './Member';

export default class Membership extends Model {
    static table = 'memberships';

    @field('chat_room_id') ChatRoomId!: number;
    @field('member_id') memberId!: number;
    @relation('chat_rooms', 'chat_room_id') chatRoom!:any;
    @relation('members', 'member_id') member!: any;
}
