import { database } from '../../database/database';
import ChatRoom from "../../database/model/ChatRoom";
import Member from "../../database/model/Member";
import Message from "../../database/model/Message";
import {axiosGet} from "../../axios/axios.method.ts";
import Config from "react-native-config";

// Function to fetch chat rooms from API
export const fetchChatRoomsFromAPI = async (lastSyncTime: number) => {
    const response = await axiosGet(Config.GET_CHAT_LIST_URL, "채팅방 리스트 요청")
    return [];
};

export const syncChatRooms = async (rooms: any[]) => {
    await database.action(async () => {
        const chatRoomCollection = database.get<ChatRoom>('chat_rooms');
        const memberCollection = database.get<Member>('members');
        const messageCollection = database.get<Message>('messages');

        for (const room of rooms) {
            // Check if the chat room already exists
            const existingRoom = await chatRoomCollection.find(room.id).catch(() => null);

            if (existingRoom) {
                // Update existing chat room
                await existingRoom.update(chatRoom => {
                    chatRoom.type = room.type;
                    chatRoom.memberCount = room.memberCount;
                    chatRoom.recentMessage = room.recentMessage;
                    chatRoom.updatedAt = new Date(room.updatedAt).getTime();
                    chatRoom.removedAt = room.removedAt ? new Date(room.removedAt).getTime() : undefined;
                });
            } else {
                // Create new chat room
                await chatRoomCollection.create(chatRoom => {
                    chatRoom._raw = {
                        id: room.id,
                        type: room.type,
                        member_count: room.memberCount,
                        recent_message: room.recentMessage,
                        created_at: new Date(room.createdAt).getTime(),
                        updated_at: room.updatedAt ? new Date(room.updatedAt).getTime() : undefined,
                        removed_at: room.removedAt ? new Date(room.removedAt).getTime() : undefined,
                    };
                });
            }

            for (const member of room.members) {
                // Check if the member already exists
                const existingMember = await memberCollection.find(`${room.id}_${member.memberId}`).catch(() => null);

                if (existingMember) {
                    // Update existing member
                    await existingMember.update(mem => {
                        mem.username = member.username;
                    });
                } else {
                    // Create new member
                    await memberCollection.create(mem => {
                        mem._raw = {
                            id: `${room.id}_${member.memberId}`, // Composite key
                            chat_room_id: room.id,
                            member_id: member.memberId,
                            username: member.username,
                        };
                    });
                }
            }

            if (room.recentMessage) {
                // Check if the message already exists
                const existingMessage = await messageCollection.find(room.recentMessage.id).catch(() => null);

                if (existingMessage) {
                    // Update existing message
                    await existingMessage.update(message => {
                        message.type = room.recentMessage.type;
                        message.content = room.recentMessage.content;
                        message.senderId = room.recentMessage.senderId;
                        message.createdAt = new Date(room.recentMessage.createdAt).getTime();
                    });
                } else {
                    // Create new message
                    await messageCollection.create(message => {
                        message._raw = {
                            id: room.recentMessage.id,
                            chat_room_id: room.id,
                            type: room.recentMessage.type,
                            content: room.recentMessage.content,
                            sender_id: room.recentMessage.senderId,
                            created_at: new Date(room.recentMessage.createdAt).getTime(),
                        };
                    });
                }
            }
        }
    });
};
