import AsyncStorage from '@react-native-async-storage/async-storage';

// 간단한 고유 식별자 생성 함수
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  notificationId: string,
  senderId: string,
  message: string,
  createdAt: string
}

const storeMatchFCM = async (data: any, additionalData: any, sentTime: string): Promise<void> => {
  const id = generateUUID();
  const newMatchFCM: MatchFCM = {
    id,
    notificationId: additionalData.notificationId,
    message: data.message,
    senderId: data.senderId,
    createdAt: sentTime,
  };

  await storeFCMAsync(newMatchFCM);
};

const storeChatFCM = async (data): Promise<void> => {
  console.log("chat 저장은 구현x");
};

const storeFCMAsync = async (newFCM: MatchFCM): Promise<void> => {
  try {
    const matchFCMStorage = "matchFCMStorage";
    const existingMessages = await AsyncStorage.getItem(matchFCMStorage);
    const matchMessages: MatchFCM[] = existingMessages ? JSON.parse(existingMessages) : [];
    matchMessages.push(newFCM);

    await AsyncStorage.setItem(matchFCMStorage, JSON.stringify(matchMessages));
    console.log(`Stored ${matchFCMStorage} message:`, newFCM);
  } catch (error) {
    console.error('Error storing matchFCMStorage message:', error);
  }
};
