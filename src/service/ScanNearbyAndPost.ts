import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { axiosPost } from '../axios/axios.method';
import Config from 'react-native-config';
import { getAsyncObject, getAsyncString, setAsyncObject } from '../utils/asyncStorage';
import { SendMsgRequest } from '../interfaces';

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];
const DelayedMSGTime = 60000;

BLEAdvertiser.setCompanyId(APPLE_ID);

const sendMsg = async ( _uuid:string) => {
  const savedMsgText = await getAsyncString('msgText');
  const savedTag = await getAsyncString('tag');

  await axiosPost(Config.SEND_MSG_URL, "인연 보내기", {
    receiverDeviceId: _uuid,
    message: savedMsgText,
    interestTag:[savedTag]
  } as SendMsgRequest)
}

const sendRelationCnt = async (_uuid:string) => {
  await axiosPost(Config.SET_RELATION_CNT_URL + _uuid, "만난 횟수 증가")
}

export const addDevice = (_uuid: string, _date: number) => {
  const currentTime = new Date(_date).getTime();
  getAsyncObject<number>(`${_uuid}`).then((lastMeetTime) => {
    if (!lastMeetTime) {
      console.log(`Added device: ${_uuid}`);
      setAsyncObject<number>(`${_uuid}`, currentTime);
      sendRelationCnt(_uuid);
      sendMsg(_uuid);
    } else {
      console.log(`Updated device: ${_uuid}`); 
      if (new Date(lastMeetTime).getTime() > currentTime + DelayedMSGTime) {
        setAsyncObject<number>(`${_uuid}`, currentTime);
        sendRelationCnt(_uuid);
        sendMsg(_uuid);
      }
    }
  });
};

const ScanNearbyAndPost = async (
  uuid:string,
  setIsNearby?: Function
): Promise<EmitterSubscription> => {
  const { BLEAdvertiser } = NativeModules;
  const eventEmitter = new NativeEventEmitter(BLEAdvertiser);
  const onDeviceFound = eventEmitter.addListener('onDeviceFound', (event) => {
    if (event.serviceUuids) {
      for (let i = 0; i < event.serviceUuids.length; i++) {
        if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
          if (setIsNearby)
            setIsNearby();
          addDevice(event.serviceUuids[i], new Date().getTime());
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

  return onDeviceFound;
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