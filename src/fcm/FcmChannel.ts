import PushNotification from 'react-native-push-notification';
import { NativeModules } from 'react-native';
import { getAlarmSettings } from './FcmAlarm';
import uuid from 'react-native-uuid';


const { NotificationModule } = NativeModules;

export let DEFAULT_CHANNEL_ID = "chalna_default_channel";
export const DEFAULT_CHANNEL_NAME = "chalna";

const channelOptions = {};



export const getFCMChannels = () => {
  NotificationModule.getNotificationChannels()
  .then((channels) => {
    console.log('Notification Channels:', channels);
  })
  .catch((error) => {
    console.error('Error fetching channels:', error);
  });
}

export const createFCMChannel = (soundSet: boolean, vibrateSet: boolean) => {
  DEFAULT_CHANNEL_ID = uuid.v4().toString();
  const options = {
    channelId: DEFAULT_CHANNEL_ID, // 채널 ID
    channelName: DEFAULT_CHANNEL_NAME, // 채널 이름
    channelDescription: "A default channel" + DEFAULT_CHANNEL_ID, // (optional) default: undefined.
    importance: 4,
    priority: 'high',
    playSound: soundSet,
    soundName: soundSet ? 'default' : null, // 소리 설정
    vibrate: vibrateSet
  };
  channelOptions[DEFAULT_CHANNEL_ID] = options;

  PushNotification.createChannel(
    options,
    (created) => {
      console.log(`createChannel returned '${created}'`);
      PushNotification.getChannels((channelIds) => {
        console.log('Channel IDs:', channelIds);

        // 생성된 채널의 옵션들을 출력
        if (created) {
          console.log('Created channel options:', channelOptions[DEFAULT_CHANNEL_ID]);
        }
      });      
    }
  );
}

export const deleteFCMChannel = () => {
  PushNotification.deleteChannel(DEFAULT_CHANNEL_ID, (deleted) => {
    console.log(`Delete Success: '${DEFAULT_CHANNEL_ID}' '${deleted}'`); // 삭제 여부 확인
  });  
}

export const updateFCMChannel = (soundSet: boolean, vibrateSet: boolean) => {
  deleteAllFCMChannels();
  getFCMChannels();
  createFCMChannel(soundSet, vibrateSet);
}

export const updateDefaultFCMChannel = () => {
  const { alarmSound, alarmVibration } = getAlarmSettings();
  deleteAllFCMChannels();
  createFCMChannel(alarmSound, alarmVibration);
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