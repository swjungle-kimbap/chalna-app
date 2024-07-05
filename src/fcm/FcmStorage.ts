import { setUserMMKVStorage, setMMKVObject, getMMKVObject, removeMMKVItem } from '../utils/mmkvStorage';
import { saveChatRoomInfo, createChatRoomLocal, getChatRoomList } from '../service/Chatting/mmkvChatStorage';
import { ChatFCM, MatchFCM } from '../interfaces/ReceivedFCMData.type';
import { formatDateToKoreanTime } from "../service/Chatting/DateHelpers";
import { ChatRoomLocal } from '../interfaces/Chatting.type';

const MATCH_FCM_STORAGE = "matchFCMStorage";

const convertTimestampToKoreanTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return new Intl.DateTimeFormat('ko-KR', options).format(date);
};

export const storeFCM = async (remoteMessage): Promise<void> => {
  const sentTime = convertTimestampToKoreanTime(remoteMessage.sentTime);
  const data = remoteMessage.data;
  const additionalData = JSON.parse(data.additionalData);

  switch (data.fcmType) {
    case 'match':
      const newMatchFCM: MatchFCM = {
        id: additionalData.notificationId,
        message: data.message,
        senderId: data.senderId,
        receiverId: additionalData.receiverId,
        createdAt: sentTime
      };
      await storeMatchFCM(newMatchFCM);
      break;
    case 'chat':
      const newChatFCM: ChatFCM = {
        chatRoomId: additionalData.chatRoomId,
        senderId: data.senderId,
        message: data.message,
        senderName: additionalData.senderName,
        chatRoomType: additionalData.chatRoomType,
        messageType: additionalData.messageType === "ALARM" ? "CHAT" : additionalData.messageType,
        createdAt: remoteMessage.sentTime
      };
      await storeChatFCM(newChatFCM);
      break;
    default:
      console.error('Unknown fcmType:', data.fcmType);
  }
};

const storeChatFCM = async (newFCM: ChatFCM): Promise<void> => {
  try {
    saveChatRoomInfo(createChatRoomLocal(newFCM));
  } catch (error) {
    console.error('채팅룸 정보를 저장하는 동안 오류가 발생했습니다:', error);
  }

  console.log(`저장한 채팅룸Id: ${newFCM.chatRoomId}, 저장한 메시지: ${newFCM.message}`);
};

const storeMatchFCM = async (newFCM: MatchFCM): Promise<void> => {
  try {
    setUserMMKVStorage(newFCM.receiverId);
    const existingMessages = getMMKVObject<MatchFCM[]>(MATCH_FCM_STORAGE) || [];
    existingMessages.push(newFCM);

    setMMKVObject(MATCH_FCM_STORAGE, existingMessages);
    console.log(`Stored ${MATCH_FCM_STORAGE} message for user ${newFCM.receiverId}:`, newFCM);
    console.log(`All ${MATCH_FCM_STORAGE} messages: `, existingMessages);

    // 10분 뒤에 메시지 삭제
    setTimeout(() => {
      deleteMatchFCMById(newFCM.receiverId, newFCM.id);
      console.log(`Deleted ${MATCH_FCM_STORAGE} message for user ${newFCM.receiverId} after 10 minutes:`, newFCM);
    }, 10 * 60 * 1000);
    console.log(`All ${MATCH_FCM_STORAGE} messages: `, existingMessages);
  } catch (error) {
    console.error(`Error storing ${MATCH_FCM_STORAGE} message for user ${newFCM.receiverId}:`, error);
  }
};

const deleteMatchFCMById = async (receiverId: string, id: string): Promise<void> => {
  setUserMMKVStorage(receiverId);
  const existingMessages = getMMKVObject<MatchFCM[]>(MATCH_FCM_STORAGE);
  if (existingMessages) {
    const updatedMessages = existingMessages.filter(message => message.id !== id);
    setMMKVObject(MATCH_FCM_STORAGE, updatedMessages);
  }
};

export const removeAllMatchFCM = async (receiverId: string): Promise<void> => {
  setUserMMKVStorage(receiverId);
  removeMMKVItem(MATCH_FCM_STORAGE);
  console.log(`Removed all messages in ${MATCH_FCM_STORAGE} for user ${receiverId}`);
};

