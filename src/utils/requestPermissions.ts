import { Platform } from 'react-native';
import { requestMultiple, checkMultiple, RESULTS, PERMISSIONS, Permission } from 'react-native-permissions'; 

const requestPermissions = async (requiredPermissions:Permission[]): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      await requestMultiple(requiredPermissions);
      const allPermissionsGranted = await checkMultiple(requiredPermissions);
      console.log(allPermissionsGranted);

      const allGranted = Object.values(allPermissionsGranted).every(
        (status) => status === RESULTS.GRANTED || status === RESULTS.UNAVAILABLE,
      );
      if (allGranted) {
        console.log('All permissions are granted')
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