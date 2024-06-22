import { Platform } from 'react-native';
import { requestMultiple, checkMultiple, RESULTS, Permission } from 'react-native-permissions'; 

const requestPermissions = async (
  permissions: Array<Permission>,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      await requestMultiple(permissions);
      const allPermissionsGranted = await checkMultiple(permissions);
      console.log(allPermissionsGranted);

      const allGranted = Object.values(allPermissionsGranted).every(
        (status) => status === RESULTS.GRANTED || RESULTS.UNAVAILABLE,
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