import { SavedKeywords } from "../interfaces";
import { defaultMMKVStorage, 
  getDefaultMMKVString,
  setUserMMKVStorage,
  getMMKVBoolean,
  getMMKVObject
} from '../utils/mmkvStorage';

// 기본 푸시 알림, 채팅 알림, 인연 알림 on/off 기능
export const checkMyPageSettings = (data:any):boolean => {
  const fcmType = data.fcmType;

  const { isAlarm, isChatAlarm, isMatchAlarm } = getMyPageSettings();
  console.log("isAlarm : ", isAlarm, "isChatAlarm : ", isChatAlarm, "isMatchAlarm : ", isMatchAlarm);

  if (isAlarm === false) return false;
  if (fcmType === "match" && isMatchAlarm === false) return false;
  if (fcmType === "chat" && isChatAlarm === false) return false;  

  return true;
}

export const checkKeywordSettings = (): boolean => {
  const currentUserId = getDefaultMMKVString('currentUserId');
  const isKeywordAlarm = getIsKeywordAlarm(currentUserId);

  if (isKeywordAlarm) return true;
  else return false;
}

export const getIsKeywordAlarm = (userId: string): boolean => {
  setUserMMKVStorage(userId);
  const isKeywordAlarm = getMMKVBoolean('mypage.isKeywordAlarm');
  console.log(`mypage.isKeywordAlarm: ${isKeywordAlarm}`);
  return isKeywordAlarm ?? false;
};

// mypage.savedKeywords 값을 가져오는 함수
export const getSavedKeywords = (userId: string): SavedKeywords | null => {
  setUserMMKVStorage(userId);
  const savedKeywords = getMMKVObject<SavedKeywords>('mypage.savedKeywords');
  console.log(`mypage.savedKeywords: ${JSON.stringify(savedKeywords)}`);
  return savedKeywords;
};


export const getMyPageSettings = () => {
  const isAlarm = defaultMMKVStorage.getBoolean('mypage.isAlarm') ?? true; // 기본값 설정
  const isChatAlarm = defaultMMKVStorage.getBoolean('mypage.isChatAlarm') ?? true; // 기본값 설정
  const isMatchAlarm = defaultMMKVStorage.getBoolean('mypage.isMatchAlarm') ?? true; // 기본값 설정

  return { isAlarm, isChatAlarm, isMatchAlarm };
};

export const getAlarmSettings = () => {
  const alarmSound = defaultMMKVStorage.getBoolean('mypage.alarmSound') ?? true; // 기본값 설정
  const alarmVibration = defaultMMKVStorage.getBoolean('mypage.alarmVibration') ?? true; // 기본값 설정
  return { alarmSound, alarmVibration };
};

// 메시지에 키워드가 포함되어 있는지 확인하는 함수
export const checkMessageForKeywords = (userId: string, message: string): boolean => {
  const savedKeywords = getSavedKeywords(userId);
  if (savedKeywords && savedKeywords.interestKeyword) {
    for (const keyword of savedKeywords.interestKeyword) {
      if (message.includes(keyword)) {
        console.log(`Message contains keyword: ${keyword}`);
        return true;
      }
    }
    return false;
  } 
  else {
    console.log('No saved keywords, so all messages are allowed');
    return true;
  }
}