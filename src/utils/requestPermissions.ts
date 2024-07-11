import { Platform } from 'react-native';
import { requestMultiple, checkMultiple, RESULTS, Permission } from 'react-native-permissions'; 

const requestPermissions = async (requiredPermissions:Permission[]): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const allPermissionsGranted = await requestMultiple(requiredPermissions);
      console.log(allPermissionsGranted);

      const allGranted = Object.values(allPermissionsGranted).every(
        (status) => status === RESULTS.GRANTED || status === RESULTS.UNAVAILABLE,
      );
      if (allGranted) {
        console.log('All permissions are granted');
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