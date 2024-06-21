import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './model/schema';
import ChatRoom from './model/ChatRoom';
import Member from './model/Member';
import Message from './model/Message';

const adapter = new SQLiteAdapter({
    schema,
    dbName: 'chalnaApp', // you can change this name if needed
});

const database = new Database({
    adapter,
    modelClasses: [ChatRoom, Member, Message],
    actionsEnabled: true,
});

export default database;
