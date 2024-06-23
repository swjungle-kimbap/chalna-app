import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { axiosPost } from '../axios/axios.method';
import Config from 'react-native-config';
import { getAsyncObject, getAsyncString, setAsyncObject, setAsyncString } from '../utils/asyncStorage';

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];

interface Device {
  uuid: string;
  end: Date;
}

BLEAdvertiser.setCompanyId(APPLE_ID);

const sendMsg = async (myuuid:string, _uuid:string) => {
  const savedMsgText = await getAsyncString('msgText');
  const savedTag = await getAsyncString('tag');
  await axiosPost(Config.SEND_MSG_URL, "인연 보내기",{
    receiverList: [myuuid, _uuid],
    message: savedMsgText,
    interestTag:savedTag
  })
}

const addDevice = (myuuid:string, _uuid: string, _date: Date) => {
  getAsyncObject<Date>(`${_uuid}`).then((lastMeetTime) => {
    if (!lastMeetTime) {
      console.log(`Added device: ${_uuid}`);
      setAsyncObject<Date>(`${_uuid}`, _date);
      sendMsg(myuuid, _uuid);
    } else {
      console.log(`Updated device: ${_uuid}`);  
      const threeHoursAgo = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
      if (lastMeetTime < threeHoursAgo) {
        setAsyncObject<Date>(`${_uuid}`, _date);
        sendMsg(myuuid, _uuid);
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
          addDevice(uuid, event.serviceUuids[i], new Date());
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
    .catch((error) => console.log(uuid, 'Advertise Error', error));

  console.log(uuid, 'Starting Scanner');
  BLEAdvertiser.scan(MANUF_DATA, {
    scanMode: 2,
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