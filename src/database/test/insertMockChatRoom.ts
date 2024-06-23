import {Database, Model} from '@nozbe/watermelondb';
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import schema from "../schema.ts";
// import { database } from '../database';
import ChatRoom from '../model/ChatRoom';
import Member from '../model/Member';
import Membership from "../model/Membership.ts";
import Message from "../model/Message";

// insertMockData.ts
import { database } from '../database';

const verifyTableExists = async () => {
    try {
        const memberships = await database.adapter.query("SELECT name FROM sqlite_master WHERE type='table' AND name='memberships';");
        if (memberships.length > 0) {
            console.log('Memberships table exists');
        } else {
            console.log('Memberships table does not exist');
        }
    } catch (error) {
        console.error('Error verifying table:', error);
    }
};

verifyTableExists();


const insertMockData = async () => {
    await database.write(async () => {
        try {
            const chatRoom = await database.collections.get('chat_rooms').create((room) => {
                room.chatRoomId = 1;
                room.type = 'MATCH';
                room.memberCount = 2;
                room.recentMessage = 'Hello!';
                room.createdAt = new Date().toISOString();
            });
            console.log('Chat room created:', chatRoom);

            const member1 = await database.collections.get('members').create((member) => {
                member.memberId = 1;
                member.username = 'User1';
            });
            console.log('Member 1 created:', member1);

            const member2 = await database.collections.get('members').create((member) => {
                member.memberId = 2;
                member.username = 'User2';
            });
            console.log('Member 2 created:', member2);

            const membership1 = await database.collections.get('memberships').create((membership) => {
                membership.chatRoomId = chatRoom.id;
                membership.memberId = member1.id;
                membership.status = 'active';
            });
            console.log('Membership 1 created:', membership1);

            const membership2 = await database.collections.get('memberships').create((membership) => {
                membership.chatRoomId = chatRoom.id;
                membership.memberId = member2.id;
                membership.status = 'active';
            });
            console.log('Membership 2 created:', membership2);
        } catch (error) {
            console.error('Error creating mock data:', error);
        }
    });
};

export default insertMockData;
