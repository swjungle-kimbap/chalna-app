import BackgroundService from 'react-native-background-actions';
import ScanNearbyAndPost, { ScanNearbyStop } from './ScanNearbyAndPost'
import { getKeychain } from '../utils/keychain';
import { EmitterSubscription } from 'react-native';

let onDeviceFoundListener: EmitterSubscription | null = null;

const backgroundBLE = async (args:any) => {
  const { uuid } = args;
  await new Promise(async () => {
    if (!onDeviceFoundListener) {
      onDeviceFoundListener = await ScanNearbyAndPost(uuid);
    }
  });
};

export const startBackgroundService = async () => {
  const deviceUUID = await getKeychain('deviceUUID');

  if (!deviceUUID) {
    console.error('deviceUUID is not available');
    return;
  } 

  const options = {
    taskName: 'shortService',
    taskTitle: '인연 찾기',
    taskDesc: '주변의 인연에게 메세지를 보내고 있습니다.',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'ChalnaApp://지도',
    parameters: {
      uuid: deviceUUID,
    },
  };

  try {
    await BackgroundService.start(backgroundBLE, options);
    console.log('Background service started');
  } catch (error) {
    console.error('Failed to start background service', error);
  }
};

export const endBackgroundService = async () => {
  if (BackgroundService.isRunning()) {
    console.log('Stopping background service.');
    await BackgroundService.stop();
    console.log('Stopped background service');
  }
};
