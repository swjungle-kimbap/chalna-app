import { NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { axiosPost } from '../axios/axios.method';
import {urls} from "../axios/config";
import { getMMKVObject, loginMMKVStorage, userMMKVStorage } from '../utils/mmkvStorage';

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];
const DelayedTime = 2 * 60 * 60 * 1000;

BLEAdvertiser.setCompanyId(APPLE_ID);

const sendRelationCnt = async (_uuid:string) => {
  await axiosPost(urls.SET_RELATION_CNT_URL + '/' + _uuid, "만난 횟수 증가")
}

export const addDevice = async (_uuid: string, _date: number) => {
  const currentTime = new Date(_date).getTime();
  const lastMeetTime = loginMMKVStorage.getNumber(`DeviceUUID.${_uuid}`);
  if (!lastMeetTime) {
    loginMMKVStorage.set(`DeviceUUID.${_uuid}`, currentTime);
    await sendRelationCnt(_uuid);
  } else if (new Date(lastMeetTime).getTime() + DelayedTime < currentTime) {
    loginMMKVStorage.set(`DeviceUUID.${_uuid}`, currentTime);
    await sendRelationCnt(_uuid);
  }
}

const ScanNearbyAndPost = (
  uuid:string,
  sendNearby?: Function
) => {
  const RSSIvalue =  userMMKVStorage.getNumber("bluetooth.rssivalue");

  const { BLEAdvertiser } = NativeModules;
  const eventEmitter = new NativeEventEmitter(BLEAdvertiser);
  eventEmitter.removeAllListeners('onDeviceFound');
  eventEmitter.addListener('onDeviceFound', async (event) => {
    if (event.serviceUuids) {
      for (let i = 0; i < event.serviceUuids.length; i++) {
        if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00') && event.rssi >= RSSIvalue) {
          if (sendNearby)
            sendNearby(event.serviceUuids[i], event);
          await addDevice(event.serviceUuids[i], new Date().getTime());
        }
      }
    }
  });

  const advertiseMode = userMMKVStorage.getNumber("bluetooth.advertiseMode");
  const txPowerLevel =  userMMKVStorage.getNumber("bluetooth.txPowerLevel");
  const scanMode =  userMMKVStorage.getNumber("bluetooth.scanMode");
  const numberOfMatches =  userMMKVStorage.getNumber("bluetooth.numberOfMatches");
  
  console.log(uuid, 'Starting Advertising', "AdvertisingSetting: ", {
    advertiseMode,
    txPowerLevel,
    connectable: false,
    includeDeviceName: false,
    includeTxPowerLevel: true,
  }, "ScanSetting: ", {
    scanMode,
    matchMode: BLEAdvertiser.MATCH_MODE_AGGRESSIVE,
    reportDelay: 5,
  });
  BLEAdvertiser.broadcast(uuid, MANUF_DATA, {
    advertiseMode,
    txPowerLevel,
    connectable: false,
    includeDeviceName: false,
    includeTxPowerLevel: true,
  })
    .then((success) => console.log(uuid, 'Advertise Successful', success))
    .catch((error) => console.log(uuid, 'Advertise Error', error));

  console.log(uuid, 'Starting Scanner');
  BLEAdvertiser.scan(MANUF_DATA, {
    scanMode,
    matchMode: BLEAdvertiser.MATCH_MODE_AGGRESSIVE,
    numberOfMatches,
  })
    .then((success) => console.log(uuid, 'Scan Successful', success))
    .catch((error) => console.log(uuid, 'Scan Error', error));
}

export const ScanNearbyStop = async () => {
  BLEAdvertiser.stopBroadcast()
  .then(() => console.log('Stop Broadcast Successful'))
  .catch((error) => console.log('Stop Broadcast Error', error));

  BLEAdvertiser.stopScan()
    .then(() => console.log('Stop Scan Successful'))
    .catch((error) => console.log( 'Stop Scan Error', error));
}


export default ScanNearbyAndPost;
