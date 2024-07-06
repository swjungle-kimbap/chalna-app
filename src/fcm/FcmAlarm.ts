import { setUserMMKVStorage, loginMMKVStorage, userMMKVStorage } from "../utils/mmkvStorage";


export const checkFCMSettings = (data, additionalData):boolean => {
  const userSettings = getUserAlarmSettings();
  if (userSettings.isAlarm === false) return false;

  return true;
}

// 알림 설정 가져오기
export const getUserAlarmSettings = () => {
  const receiverId = loginMMKVStorage.getString("currentUserId");

  setUserMMKVStorage(receiverId);

  const isAlarm = userMMKVStorage.getBoolean('mypage.isAlarm') || false;
  const isChatAlarm = userMMKVStorage.getBoolean('mypage.isChatAlarm') || false;
  const isMatchAlarm = userMMKVStorage.getBoolean('mypage.isMatchAlarm') || false;

  console.log("User Alarm Settings:", { isAlarm, isChatAlarm, isMatchAlarm });
  return {
    isAlarm,
    isChatAlarm,
    isMatchAlarm
  };
}