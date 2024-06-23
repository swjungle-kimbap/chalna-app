import { Model } from '@nozbe/watermelondb';
import { field,  children } from '@nozbe/watermelondb/decorators';
import Membership from "./Membership.ts";


export default class Member extends Model {
    static table = 'members';

    @field('member_id') memberId!: number;
    @field('username') username!: string;

    @children('memberships') memberships!: Membership[];
}
