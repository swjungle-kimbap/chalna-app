import { NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { userMMKVStorage } from '../utils/mmkvStorage';

const APPLE_ID = 0x4c;
const MANUF_DATA = [1, 0];

BLEAdvertiser.setCompanyId(APPLE_ID);

const ScanNearbyAndPost = (uuid:string) => {
  const { BLEAdvertiser } = NativeModules;

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
