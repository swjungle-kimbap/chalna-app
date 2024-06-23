import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'chat_rooms',
            columns: [
                { name: 'chat_room_id', type: 'number'}, // change to string if needed
                { name: 'type', type: 'string' },
                { name: 'member_count', type: 'number' },
                { name: 'username', type: 'string'},
                { name: 'recent_message', type: 'string', isOptional: true },
                { name: 'opened_at', type: 'string' },
                { name: 'last_updated_at', type: 'string', isOptional: true },
                { name: 'removed_at', type: 'string', isOptional: true },
            ],
        }),
        tableSchema({
            name: 'members',
            columns: [
                { name: 'chat_room_id', type: 'string' },
                { name: 'member_id', type: 'string' },
                { name: 'username', type: 'string' },
            ],
        }),
        tableSchema({
            name: 'memberships',
            columns:[
                {name: 'chat_room_id', type:'string', isIndexed: true},
                {name: 'member_id', type: 'string', isIndexed: true},
            ],
        }),
        tableSchema({
            name: 'messages',
            columns: [
                { name: 'chat_room_id', type: 'string' },
                { name: 'type', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'sender_id', type: 'string' },
                { name: 'status', type: 'boolean', isOptional: true },
                { name: 'sent_at', type: 'string' },
            ],
        }),
    ],
});
