import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'chat_rooms',
            columns: [
                { name: 'type', type: 'string' },
                { name: 'member_count', type: 'number' },
                { name: 'recent_message_id', type: 'string', isOptional: true },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number', isOptional: true },
                { name: 'removed_at', type: 'number', isOptional: true },
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
            name: 'messages',
            columns: [
                { name: 'chat_room_id', type: 'string' },
                { name: 'type', type: 'string' },
                { name: 'content', type: 'string' },
                { name: 'sender_id', type: 'string' },
                { name: 'status', type: 'boolean', isOptional: true },
                { name: 'created_at', type: 'number' },
            ],
        }),
    ],
});
