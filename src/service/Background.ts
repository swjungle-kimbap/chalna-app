import BackgroundService from 'react-native-background-actions';
import ScanNearbyAndPost from './Bluetooth'
import { getKeychain } from '../utils/keychain';

const backgroundBLE = async (args:any) => {
  const { uuid } = args;
  await new Promise(async () => {
    await ScanNearbyAndPost(uuid);
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
    taskTitle: '인연 만나기',
    taskDesc: '새로운 인연을 찾고 있습니다.',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'myapp://지도',
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