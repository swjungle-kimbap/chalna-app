import { Platform } from 'react-native';
import { Permission, check, request, RESULTS } from 'react-native-permissions';

const requestPermissions = async (
  permissions: Array<Permission>,
  onFailed?: () => void,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const permissionsResult = await Promise.all(
        permissions.map(async (permission) => {
          const result = await check(permission);
          if (result !== RESULTS.GRANTED) {
            const requestResult = await request(permission);
            if (requestResult === RESULTS.GRANTED) {
              console.log(`${permission} has been granted`)
              return true
            }
            console.log(`${permission} has been denied`)
            return false;
          }
          console.log(`${permission} is already granted`)
          return true; // Already granted
        })
      );

      if (permissionsResult.every(Boolean)) {
        return true;
      } else {
        onFailed && onFailed();
        return false;
      }
    } catch (error) {
      console.error(`Permission request failed: ${error}`);
      onFailed && onFailed();
      return false;
    }
  }
  console.error(`Not supported OS`);
  return false;
};

export default requestPermissions;
