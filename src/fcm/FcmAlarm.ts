import { defaultMMKVStorage } from '../utils/mmkvStorage';

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