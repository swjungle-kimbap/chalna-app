import {Model, Query} from '@nozbe/watermelondb';
import { field,  children } from '@nozbe/watermelondb/decorators';
import Membership from "./Membership.ts";


export default class Member extends Model {
    static table = 'members';
    static associations = {
        memberships: {type: 'has_many', foreignKey: 'chat_room_id'},
    };

    @field('member_id') memberId!: number;
    @field('username') username!: string;

    @children('memberships') memberships!: Query<Membership>;
}
