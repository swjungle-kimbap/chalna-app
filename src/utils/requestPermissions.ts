import { Platform } from 'react-native';
import { requestMultiple, checkMultiple, RESULTS, PERMISSIONS } from 'react-native-permissions'; 

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      await requestMultiple(requiredPermissions);
      const allPermissionsGranted = await checkMultiple(requiredPermissions);
      console.log(allPermissionsGranted);

      const allGranted = Object.values(allPermissionsGranted).every(
        (status) => status === RESULTS.GRANTED || status === RESULTS.UNAVAILABLE,
      );
      if (allGranted) {
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Permission request failed: ${error}`);
      return false;
    }
  }
  console.error(`Not supported OS`);
  return false;
};

export default requestPermissions;