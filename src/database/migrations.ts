import {createTable, schemaMigrations} from "@nozbe/watermelondb/Schema/migrations";
// import {tableSchema} from "@nozbe/watermelondb";

export default schemaMigrations({
    migrations:[
        {
            toVersion: 2,
            steps: [
                createTable({
                    name: 'memberships',
                    columns:[
                        {name: 'chat_room_id', type:'number', isIndexed: true},
                        {name: 'member_id', type: 'number', isIndexed: true},
                                        // {name: 'status', type: 'string'},
                    ],
                }),
            ]
        }
    ],
});
