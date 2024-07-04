import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAsyncObject, removeAsyncItem, removeOneAsyncItem} from '../utils/asyncStorage';

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
  // sentTime 시간 변환
  const sentTime = convertTimestampToKoreanTime(remoteMessage.sentTime);
  const data = remoteMessage.data;
  const additionalData = JSON.parse(data.additionalData);

  switch (data.fcmType) {
    case 'match':
      await storeMatchFCM(data, additionalData, sentTime);
      break;
    case 'chat':
      await storeChatFCM(data);
      break;
    default:
      console.error('Unknown fcmType:', data.fcmType);
  }
};

interface MatchFCM {
  id: string,
  senderId: string,
  receiverId: string,
  message: string,
  createdAt: string
}

const storeMatchFCM = async (data: any, additionalData: any, sentTime: string): Promise<void> => {
  const newMatchFCM: MatchFCM = {
    id: additionalData.notificationId,
    message: data.message,
    senderId: data.senderId,
    receiverId: additionalData.receiverId,
    createdAt: sentTime,
  };

  await storeFCMAsync(newMatchFCM);
};

const storeChatFCM = async (data): Promise<void> => {
  console.log("chat 저장은 구현x");
};

const storeFCMAsync = async (newFCM: MatchFCM): Promise<void> => {
  try {
    const existingMessages = await AsyncStorage.getItem(MATCH_FCM_STORAGE);
    const matchMessages: MatchFCM[] = existingMessages ? JSON.parse(existingMessages) : [];
    matchMessages.push(newFCM);

    await AsyncStorage.setItem(MATCH_FCM_STORAGE, JSON.stringify(matchMessages));
    console.log(`Stored ${MATCH_FCM_STORAGE} message:`, newFCM);
  } catch (error) {
    console.error('Error storing matchFCMStorage message:', error);
  }
};

// 수락 or 거절 or 유효시간 10분이 넘은 메시지의 경우 단일 삭제 처리
const deleteMatchFCMById = async (id: string): Promise<void> => {
  removeOneAsyncItem<MatchFCM>(MATCH_FCM_STORAGE, id);
};

// 모든 저장된 메시지들을 삭제하는 함수 - 모두 지우기
export const removeAllMatchFCM = async (): Promise<void> => {
  removeAsyncItem(MATCH_FCM_STORAGE);
  console.log(`Removed all messages in ${MATCH_FCM_STORAGE}`);
};