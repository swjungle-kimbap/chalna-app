import PushNotification from 'react-native-push-notification';
import { NativeModules } from 'react-native';
import { DEFAULT_CHANNEL_ID, DEFAULT_CHANNEL_NAME } from './FcmConfig';

const { NotificationModule } = NativeModules;

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
  PushNotification.createChannel(
    {
      channelId: DEFAULT_CHANNEL_ID, // 채널 ID
      channelName: DEFAULT_CHANNEL_NAME, // 채널 이름
      channelDescription: "A default channel", // (optional) default: undefined.
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      playSound: soundSet,
      vibrate: vibrateSet
    },
    (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
  );
}

export const deleteFCMChannel = () => {
  PushNotification.deleteChannel(DEFAULT_CHANNEL_ID, (deleted) => {
    console.log(`Delete Success: '${DEFAULT_CHANNEL_ID}' '${deleted}'`); // 삭제 여부 확인
  });  
}

export const updateFCMChannel = (soundSet: boolean, vibrateSet: boolean) => {
  deleteFCMChannel();
  createFCMChannel(soundSet, vibrateSet);
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
