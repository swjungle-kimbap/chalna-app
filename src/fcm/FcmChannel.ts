import PushNotification from 'react-native-push-notification';
import { NativeModules } from 'react-native';
import { getAlarmSettings } from './FcmAlarm';
import uuid from 'react-native-uuid';


const { NotificationModule } = NativeModules;

export let DEFAULT_CHANNEL_ID = "chalna_default_channel";
export const DEFAULT_CHANNEL_NAME = "chalna";

const channelOptions = {};



export const getFCMChannels = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    NotificationModule.getNotificationChannels()
      .then((channels) => {
        console.log('Notification Channels:', channels);
        resolve(); // Promise 정상 완료
      })
      .catch((error) => {
        console.error('Error fetching channels:', error);
        reject(error); // Promise 실패
      });
  });
};

export const createFCMChannel = (soundSet: boolean, vibrateSet: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    DEFAULT_CHANNEL_ID = uuid.v4().toString();
    const options = {
      channelId: DEFAULT_CHANNEL_ID, // 채널 ID
      channelName: DEFAULT_CHANNEL_NAME, // 채널 이름
      channelDescription: "A default channel " + DEFAULT_CHANNEL_ID, // (optional) default: undefined.
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
        if (created) {
          PushNotification.getChannels((channelIds) => {
            console.log('Channel IDs:', channelIds);

            // 생성된 채널의 옵션들을 출력
            console.log('Created channel options:', channelOptions[DEFAULT_CHANNEL_ID]);
            resolve();
          });
        } else {
          reject(new Error('Failed to create channel'));
        }
      }
    );
  });
};



export const createDefaultFCMChannel = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    DEFAULT_CHANNEL_ID = uuid.v4().toString();
    const options = {
      channelId: DEFAULT_CHANNEL_ID, // 채널 ID
      channelName: DEFAULT_CHANNEL_NAME, // 채널 이름
      channelDescription: "A default channel " + DEFAULT_CHANNEL_ID, // (optional) default: undefined.
      importance: 4,
      priority: 'high',
      playSound: true,
      soundName: 'default', // 소리 설정
    };
    channelOptions[DEFAULT_CHANNEL_ID] = options;

    PushNotification.createChannel(
      options,
      (created) => {
        console.log(`createChannel returned '${created}'`);
        if (created) {
          PushNotification.getChannels((channelIds) => {
            console.log('Channel IDs:', channelIds);

            // 생성된 채널의 옵션들을 출력
            console.log('Created channel options:', channelOptions[DEFAULT_CHANNEL_ID]);
            resolve();
          });
        } else {
          reject(new Error('Failed to create channel'));
        }
      }
    );
  });
};


// 채널 업데이트 함수
export const updateFCMChannel = async (soundSet: boolean, vibrateSet: boolean) => {
  const DEFAULT_CHANNEL_ID_backup = DEFAULT_CHANNEL_ID
  try {
    await createFCMChannel(soundSet, vibrateSet);
    deleteFCMChannel(DEFAULT_CHANNEL_ID_backup);
    getFCMChannels();
    console.log('FCM 채널 업데이트 완료');
  } catch (error) {
    console.error('FCM 채널 업데이트 중 오류 발생:', error);
  }
};

export const updateDefaultFCMChannel = async() => {
  const { alarmSound, alarmVibration } = getAlarmSettings();
  try {
    await createFCMChannel(alarmSound, alarmVibration);
    deleteAllFCMChannels();
    console.log('FCM 채널 업데이트 완료');
  } catch (error) {
    console.error('FCM 채널 업데이트 중 오류 발생:', error);
  }
}

// 쓰지마!
export const deleteAllFCMChannels = () => {
  NotificationModule.deleteAllNotificationChannels()
    .then((result) => {
      console.log('All Notification Channels deleted:', result);
    })
    .catch((error) => {
      console.error('Error deleting channels:', error);
    });
};

export const deleteFCMChannel = (channelId) => {
  getFCMChannels();
  return NotificationModule.deleteNotificationChannel(channelId)
      .then(() => {
          console.log('Notification channel deleted successfully', channelId);
      })
      .catch(error => {
          console.error('Error deleting notification channel:', error);
      });
};