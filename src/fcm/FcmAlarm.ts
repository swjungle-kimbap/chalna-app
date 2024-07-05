import { userMMKVStorage } from "../utils/mmkvStorage";
import { NativeModules } from 'react-native';
const { NotificationModule } = NativeModules;

// 알림 설정 가져오기
export const getUserAlarmSettings = () => {
  const isAlarm = userMMKVStorage.getBoolean('mypage.isAlarm') || false;
  const alarmSound = userMMKVStorage.getBoolean('mypage.alarmSound') || false;
  const alarmVibration = userMMKVStorage.getBoolean('mypage.alarmVibration') || false;

  console.log("User Alarm Settings:", { isAlarm, alarmSound, alarmVibration });
  return {
    isAlarm,
    alarmSound,
    alarmVibration
  }
}

export const getFCMChannels = () => {
  NotificationModule.getNotificationChannels()
  .then((channels) => {
    console.log('Notification Channels:', channels);
  })
  .catch((error) => {
    console.error('Error fetching channels:', error);
  });
}

export const deleteAllFCMChannels = () => {
  NotificationModule.deleteAllNotificationChannels()
    .then((result) => {
      console.log('All Notification Channels deleted:', result);
    })
    .catch((error) => {
      console.error('Error deleting channels:', error);
    });
};
