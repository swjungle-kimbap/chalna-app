import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema.ts';
import ChatRoom from './model/ChatRoom';
import Member from './model/Member';
import Message from './model/Message';
import Membership from "./model/Membership.ts";

const adapter = new SQLiteAdapter({
    schema,
    // jsi: true,
    dbName: 'chalnaApp', // you can change this name if needed
});

export const database = new Database({
    adapter,
    modelClasses: [ChatRoom, Member, Membership, Message],
    // actionsEnabled: true,
});

export default database;

