import BackgroundService from 'react-native-background-actions';
import { axiosPost } from '../axios/axios.method';
import { urls } from "../axios/config";
import { loginMMKVStorage } from '../utils/mmkvStorage';
import Geolocation from "react-native-geolocation-service";
import { Position } from '../interfaces';
const DelayedTime = 4 * 60 * 60 * 1000;

const sendRelationCnt = async (_uuid:string, currentTime:number) => {
  Geolocation.getCurrentPosition(
    async (position) => {
      await axiosPost(urls.SET_RELATION_CNT_URL + '/' + _uuid, "만난 횟수 증가", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      } as Position)
    },
    (error) => {
      loginMMKVStorage.set(`DeviceUUID.${_uuid}`,currentTime);
      console.error("위치 정보 가져오기 실패", error.code, error.message);
    },
    { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
  );
}

export const addDevice = (_uuid: string, currentTime: number) => {
  const lastMeetTime = loginMMKVStorage.getNumber(`DeviceUUID.${_uuid}`);
  if (!lastMeetTime) {
    loginMMKVStorage.set(`DeviceUUID.${_uuid}`, currentTime + DelayedTime);
    sendRelationCnt(_uuid, currentTime);
  } else if (new Date(lastMeetTime).getTime() < currentTime) {
    loginMMKVStorage.set(`DeviceUUID.${_uuid}`, currentTime + DelayedTime);
    sendRelationCnt(_uuid, currentTime);
  }
}

const backgroundBLE = async (args:any) => {
  const { uuid } = args;
  await new Promise((resolve) => {
    // ScanNearbyAndPost(uuid);
    // const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    // eventEmitter.removeAllListeners('onDeviceFound');
    // eventEmitter.addListener('onDeviceFound', async (event) => {
    //   const now = new Date().getTime();
    //   if (event.serviceUuids) {
    //     for (let i = 0; i < event.serviceUuids.length; i++) {
    //       const serviceUuid = event.serviceUuids[i];
    //       if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
    //         if (lastProcessed[serviceUuid] && (now - lastProcessed[serviceUuid]) < 4 * 1000) {
    //           continue;
    //         }
    //         console.log("background", lastProcessed, serviceUuid, now);
    //         lastProcessed[serviceUuid] = now;

    //         addDevice(event.serviceUuids[i], new Date().getTime());
    //       }
    //     }
    //   }
    // });
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
