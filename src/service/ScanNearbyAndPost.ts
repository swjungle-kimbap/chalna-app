import { EmitterSubscription, NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { axiosPost } from '../axios/axios.method';
import Config from 'react-native-config';

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];

interface Device {
  uuid: string;
  end: Date;
}

const devicesFound: Device[] = [];

const addDevice = (
  _uuid: string,
  _date: Date
) => {
  const index = devicesFound.findIndex((device) => device.uuid === _uuid);
  if (index < 0) {
    devicesFound.push({
      uuid: _uuid,
      end: _date,
    });
    console.log(`Added device: ${_uuid}`);
    // TODO post request
  } else {
    // const threeHoursAgo = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
    // if (devicesFound[index].end < threeHoursAgo) {
      devicesFound[index].end = _date;
      console.log(`Updated device: ${_uuid}`);
    // }
    // TODO post request
  }
};

const ScanNearbyAndPost = async (uuid:String): Promise<EmitterSubscription> => {
  BLEAdvertiser.setCompanyId(APPLE_ID);
  const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
  const onDeviceFound = eventEmitter.addListener('onDeviceFound', (event) => {
    if (event.serviceUuids) {
      for (let i = 0; i < event.serviceUuids.length; i++) {
        if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
          addDevice(event.serviceUuids[i], new Date());
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

export const ScanNearbyStop = () => {
  BLEAdvertiser.stopBroadcast()
  .then(() => console.log('Stop Broadcast Successful'))
  .catch((error) => console.log('Stop Broadcast Error', error));

  BLEAdvertiser.stopScan()
    .then(() => console.log('Stop Scan Successful'))
    .catch((error) => console.log( 'Stop Scan Error', error));
}

export default ScanNearbyAndPost;