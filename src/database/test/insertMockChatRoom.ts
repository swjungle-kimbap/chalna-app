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

const insertMockData = async () => {
    await database.write(async () => {
        const chatRoomCollection = database.collections.get<ChatRoom>('chat_rooms');
        const memberCollection = database.collections.get<Member>('members');
        const membershipCollection = database.collections.get<Membership>('memberships');

        // Check if mock data already exists to avoid duplicate insertions
        const existingRooms = await chatRoomCollection.query().fetch();
        if (existingRooms.length === 0) {
            const room1 = await chatRoomCollection.create((room) => {
                // room.name = 'Mock Chat Room 1';
                room.ChatRoomId=1;
                room.type='FRIEND';
                room.memberCount=2;
                room.recentMessage='Last Message for Chat Room 1';
            });

            const room2 = await chatRoomCollection.create((room) => {
                // room.name = 'Mock Chat Room 2';
                room.ChatRoomId=2;
                room.type='anonymous';
                room.memberCount=4;
                room.recentMessage='Last Message for Chat Room 2';
            });

            // myself = user1
            const member1 = await memberCollection.create((member) => {
                member.username = 'User1';
                member.memberId = 1;
            });

            const member2 = await memberCollection.create((member) => {
                member.username = 'User2';
                member.memberId = 2;
            });

            const memberA = await memberCollection.create((member) => {
                member.username = 'Ann';
                member.memberId = 3;
            });

            const memberB = await memberCollection.create((member) => {
                member.username = 'Beatrice';
                member.memberId = 4;
            });

            const memberC = await memberCollection.create((member) => {
                member.username = 'Clair';
                member.memberId = 5;
            });

            await membershipCollection.create((membership) => {
                membership.chatRoom.set(room1);
                membership.member.set(member1);
            });

            await membershipCollection.create((membership) => {
                membership.chatRoom.set(room1);
                membership.member.set(member2);
            });

            await membershipCollection.create((membership) => {
                membership.chatRoom.set(room2);
                membership.member.set(memberA);
            });

            await membershipCollection.create((membership) => {
                membership.chatRoom.set(room2);
                membership.member.set(memberB);
            });

            await membershipCollection.create((membership) => {
                membership.chatRoom.set(room2);
                membership.member.set(memberC);
            });
        }
    });
};

export default insertMockData;
