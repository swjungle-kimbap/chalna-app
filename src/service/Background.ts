import BackgroundService from 'react-native-background-actions';
import ScanNearbyAndPost from './Bluetooth'
import { NativeEventEmitter, NativeModules } from 'react-native';
import { axiosPost } from '../axios/axios.method';
import { urls } from "../axios/config";
import { loginMMKVStorage } from '../utils/mmkvStorage';

const DelayedTime = 2 * 60 * 60 * 1000;

const sendRelationCnt = async (_uuid:string) => {
  await axiosPost(urls.SET_RELATION_CNT_URL + '/' + _uuid, "만난 횟수 증가")
}

export const addDevice = async (_uuid: string, _date: number) => {
  const currentTime = new Date(_date).getTime();
  const lastMeetTime = loginMMKVStorage.getNumber(`DeviceUUID.${_uuid}`);
  if (!lastMeetTime) {
    loginMMKVStorage.set(`DeviceUUID.${_uuid}`, currentTime + DelayedTime);
    await sendRelationCnt(_uuid);
  } else if (new Date(lastMeetTime).getTime() < currentTime) {
    loginMMKVStorage.set(`DeviceUUID.${_uuid}`, currentTime + DelayedTime);
    await sendRelationCnt(_uuid);
  }
}

const backgroundBLE = async (args:any) => {
  const { uuid } = args;
  await new Promise( async (resolve) => {
    ScanNearbyAndPost(uuid);
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    eventEmitter.removeAllListeners('onDeviceFound');
    eventEmitter.addListener('onDeviceFound', async (event) => {
      if (event.serviceUuids) {
        for (let i = 0; i < event.serviceUuids.length; i++) {
          if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
            await addDevice(event.serviceUuids[i], new Date().getTime());
          }
        }
      }
    });
  });
};

export const startBackgroundService = async () => {
  const deviceUUID = loginMMKVStorage.getString('login.deviceUUID');

  if (!deviceUUID) {
    console.error('deviceUUID is not available');
    return;
  } 

  const options = {
    taskName: 'shortService',
    taskTitle: '인연 만나기',
    taskDesc: '새로운 인연을 기다리고 있습니다.',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'chalna://지도',
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
