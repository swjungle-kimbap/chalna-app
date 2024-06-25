import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser-advanced';
import { axiosPost } from '../axios/axios.method';
import Config from 'react-native-config';
import { getAsyncObject, getAsyncString, setAsyncObject, setAsyncString } from '../utils/asyncStorage';
import { SendMsgRequest } from '../interfaces';

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];
const DelayedCntTime = 3 * 60 * 60 * 1000;
const DelayedMSGTime = 60 * 60 * 1000;

BLEAdvertiser.setCompanyId(APPLE_ID);

const sendMsg = async ( _uuid:string) => {
  const savedMsgText = await getAsyncString('msgText');
  const savedTag = await getAsyncString('tag');
  await axiosPost(Config.SEND_MSG_URL, "인연 보내기",{
    receiverDeviceId: _uuid,
    message: savedMsgText,
    interestTag:[savedTag]
  } as SendMsgRequest)
}

const sendRelationCnt = async (_uuid:string) => {
  await axiosPost(Config.SET_RELATION_CNT_URL + _uuid, "만난 횟수 증가")
}

const addDevice = (_uuid: string, _date: number) => {
  getAsyncObject<number>(`CNT${_uuid}`).then((lastMeetTime) => {
    if (!lastMeetTime) {
      console.log(`CNT Added device: ${_uuid}`);
      setAsyncObject<number>(`CNT${_uuid}`, _date);
      sendRelationCnt(_uuid);
    } else {
      const checkDelayedCntTime = new Date().getTime() - DelayedCntTime;
      console.log(`CNT Updated device: ${_uuid}`); 
      if (lastMeetTime < checkDelayedCntTime) {
        setAsyncObject<number>(`CNT${_uuid}`, _date);
        sendRelationCnt(_uuid);
      }
    }
  });
  getAsyncObject<number>(`MSG${_uuid}`).then((lastMeetTime) => {
    if (!lastMeetTime) {
      console.log(`MSG Added device: ${_uuid}`);
      setAsyncObject<number>(`MSG${_uuid}`, _date);
      sendMsg(_uuid);
    } else {
      const checkDelayedCntTime = new Date().getTime() - DelayedMSGTime;
      console.log(`MSG Updated device: ${_uuid}`); 
      if (lastMeetTime < checkDelayedCntTime) {
        setAsyncObject<number>(`MSG${_uuid}`, _date);
        sendMsg(_uuid);
      }
    }
  });
};

const ScanNearbyAndPost = async (uuid:string): Promise<EmitterSubscription> => {
  const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
  const onDeviceFound = eventEmitter.addListener('onDeviceFound', (event) => {
    if (event.serviceUuids) {
      for (let i = 0; i < event.serviceUuids.length; i++) {
        if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
          addDevice(event.serviceUuids[i], new Date().getTime());
        }
      }
    }
  });

  console.log(uuid, 'Starting Advertising');
  BLEAdvertiser.broadcast(uuid, MANUF_DATA, {
    advertiseMode: 2,
    txPowerLevel: 3,
    connectable: false,
    includeDeviceName: false,
    includeTxPowerLevel: false,
  })
    .then((success) => console.log(uuid, 'Advertise Successful', success))
    .catch((error) => {
      console.log(uuid, 'Advertise Error', error);
      setAsyncString('isScanning', 'false');
      setAsyncString('isSendingMsg', 'false');
    });

  console.log(uuid, 'Starting Scanner');
  BLEAdvertiser.scan(MANUF_DATA, {
    scanMode: 2,
  })
    .then((success) => console.log(uuid, 'Scan Successful', success))
    .catch((error) => {
      console.log(uuid, 'Scan Error', error);
      setAsyncString('isScanning', 'false');
      setAsyncString('isSendingMsg', 'false');
    });

  return onDeviceFound;
}

export const ScanNearbyStop = async () => {
  BLEAdvertiser.stopBroadcast()
  .then(() => console.log('Stop Broadcast Successful'))
  .catch((error) => {
    console.log('Stop Broadcast Error', error);
    setAsyncString('isScanning', 'true');
    setAsyncString('isSendingMsg', 'true');
  });

  BLEAdvertiser.stopScan()
    .then(() => console.log('Stop Scan Successful'))
    .catch((error) => {
      console.log( 'Stop Scan Error', error);
      setAsyncString('isScanning', 'true');
      setAsyncString('isSendingMsg', 'true');
    });
}

export default ScanNearbyAndPost;