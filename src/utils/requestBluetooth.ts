import { enableBluetooth } from 'react-native-bluetooth-client';
import BLEAdvertiser from 'react-native-ble-advertiser-advanced';
import { Platform } from 'react-native';

const requestBluetooth = async () => {
  if (Platform.OS === 'android') {
    enableBluetooth();
    const bluetoothActive = await BLEAdvertiser.getAdapterState()
      .then((result) => {
        console.log('[Bluetooth]', 'Bluetooth Status', result);
        return result === 'STATE_ON';
      })
      .catch((error) => {
        console.log('[Bluetooth]', 'Bluetooth Not Enabled', error);
        return false;
      });
    return bluetoothActive;
  }
  console.log('Not supported OS');
  return false;
};

export default requestBluetooth;
