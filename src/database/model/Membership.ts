// Membership.ts
import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import ChatRoom from './ChatRoom';
import Member from './Member';

export default class Membership extends Model {
    static table = 'memberships';
    static associations = {
        chat_rooms: {type: 'belongs_to', foreignKey: 'chat_room_id'},
        members: {type: 'belongs_to', foreignKey: 'chat_room_id'},
    };

    @field('chat_room_id') ChatRoomId!: number;
    @field('member_id') memberId!: number;
    // @field('status') status?: string;
    @relation('chat_rooms', 'chat_room_id') chat_room!:ChatRoom;
    @relation('members', 'member_id') member!: Member;

}
