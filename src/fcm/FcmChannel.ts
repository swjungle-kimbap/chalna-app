import PushNotification from 'react-native-push-notification';
import { NativeModules } from 'react-native';
import { getDefaultMMKVString, setDefaultMMKVString } from '../utils/mmkvStorage';
import uuid from 'react-native-uuid';


const { NotificationModule } = NativeModules;

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

export const createFCMChannel = (channelIdValue:string, description:string, soundSet: boolean, vibrateSet: boolean): Promise<void> => {
  return new Promise((resolve) => {
    const options = {
      channelId: channelIdValue, // 채널 ID
      channelName: DEFAULT_CHANNEL_NAME, // 채널 이름
      channelDescription: description, // (optional) default: undefined.
      importance: 4,
      priority: 'high',
      playSound: soundSet,
      soundName: soundSet ? 'default' : null, // 소리 설정
      vibrate: vibrateSet
    };
    channelOptions[channelIdValue] = options;

    PushNotification.createChannel(
      options,
      (created) => {
        console.log(`createChannel returned '${created}'`);
        if (created) {
          PushNotification.getChannels((channelIds) => {
            console.log('Channel IDs:', channelIds);

            // 생성된 채널의 옵션들을 출력
            console.log('Created channel options:', channelOptions[channelIdValue]);
            resolve();
          });
        }
      }
    );
  });
};


// 채널 업데이트 함수
export const updateFCMChannel = async (soundSet: boolean, vibrateSet: boolean) => {
  try {
    getFCMChannels();

    if (soundSet && vibrateSet) {
      setDefaultMMKVString('channelId', 'chalna1');
    } else if (!soundSet && vibrateSet) {
      setDefaultMMKVString('channelId', 'chalna2');
    } else if (soundSet && !vibrateSet) {
      setDefaultMMKVString('channelId', 'chalna3');
    } else {
      setDefaultMMKVString('channelId', 'chalna4');
    }

    const channelId = getDefaultMMKVString('channelId');

    console.log('채널 Id가 변경되었습니다. : ', channelId);
  } catch (error) {
    console.error('FCM 채널 업데이트 중 오류 발생:', error);
  }
};

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