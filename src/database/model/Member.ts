import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import ChatRoom from './ChatRoom';

export default class Member extends Model {
    static table = 'members';

    @relation('chat_rooms', 'chat_room_id') chatRoom!: ChatRoom;
    @field('member_id') memberId!: string;
    @field('username') username!: string;
}
