import { NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { axiosPost } from '../axios/axios.method';
import { getAsyncObject, setAsyncObject } from '../utils/asyncStorage';
import {urls} from "../axios/config";

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];
const DelayedTime = 2 * 60 * 60 * 1000;

BLEAdvertiser.setCompanyId(APPLE_ID);

const sendRelationCnt = async (_uuid:string) => {
  await axiosPost(urls.SET_RELATION_CNT_URL + '/' + _uuid, "만난 횟수 증가")
}

export const addDevice = async (_uuid: string, _date: number) => {
  const currentTime = new Date(_date).getTime();
  getAsyncObject<number>(`${_uuid}`).then((lastMeetTime) => {
    if (!lastMeetTime) {
      Promise.all([
        setAsyncObject<number>(`${_uuid}`, currentTime),
        sendRelationCnt(_uuid),
      ])
    } else {
      if (new Date(lastMeetTime).getTime() + DelayedTime < currentTime) {
        Promise.all([
          setAsyncObject<number>(`${_uuid}`, currentTime),
          sendRelationCnt(_uuid),
        ])
      }
    }
  });
};


const ScanNearbyAndPost = (
  uuid:string,
  sendNearby?: Function
) => {
  const { BLEAdvertiser } = NativeModules;
  const eventEmitter = new NativeEventEmitter(BLEAdvertiser);
  eventEmitter.removeAllListeners('onDeviceFound');
  eventEmitter.addListener('onDeviceFound', async (event) => {
    if (event.serviceUuids) {
      for (let i = 0; i < event.serviceUuids.length; i++) {
        if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
          if (sendNearby)
            sendNearby(event.serviceUuids[i]);
          await addDevice(event.serviceUuids[i], new Date().getTime());
        }
      }
    }
  });

  console.log(uuid, 'Starting Advertising');
  BLEAdvertiser.broadcast(uuid, MANUF_DATA, {
    advertiseMode: BLEAdvertiser.ADVERTISE_MODE_BALANCED,
    txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_MEDIUM,
    connectable: false,
    includeDeviceName: false,
    includeTxPowerLevel: false,
  })
    .then((success) => console.log(uuid, 'Advertise Successful', success))
    .catch((error) => console.log(uuid, 'Advertise Error', error));

  console.log(uuid, 'Starting Scanner');
  BLEAdvertiser.scan(MANUF_DATA, {
    scanMode: BLEAdvertiser.SCAN_MODE_LOW_LATENCY,
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
