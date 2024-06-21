import { Platform, Alert } from 'react-native';
import { check, request, openSettings, PERMISSIONS, Permission, RESULTS } from 'react-native-permissions';

const permissionMSG: Record<Permission, string> = {
  [PERMISSIONS.ANDROID.BLUETOOTH_SCAN]: '근처 기기',
  [PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE]: '근처 기기',
  [PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]: '근처 기기',
  [PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION]: '위치',
  [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]: '위치',
  [PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION]: '위치',
  [PERMISSIONS.ANDROID.POST_NOTIFICATIONS]: '알림',
};

const checkAndRequestPermission = async (permission: Permission): Promise<boolean> => {
  const result = await check(permission);

  if (result === RESULTS.GRANTED) {
    console.log(`${permission} is already granted`);
    return true;
  } else {
    const requestResult = await request(permission);
    if (requestResult === RESULTS.GRANTED) {
      console.log(`${permission} has been granted`);
      return true;
    }

    Alert.alert(
      "추가 권한이 필요합니다.",
      `필수 기능을 위해 앱 [권한 > ${permissionMSG[permission]}]을 허용해주세요`,
      [
        {
          text: "설정으로 가기",
          onPress: () => openSettings().catch(() => console.warn('Cannot open settings')),
        },
        {
          text: "취소",
          style: "cancel",
        }
      ]
    );
    }
  return false;
};


const retryPermissions = async (
  permissions: Array<Permission>,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const results = await Promise.all(permissions.map(permission => checkAndRequestPermission(permission)));
      return results.every(result => result === true);
    
    } catch (error) {
      console.error(`Permission request failed: ${error}`);
      return false;
    }
  }
  console.log('Not supported OS in requestPermissions due to ', Platform.OS);
  return false;
};

export default retryPermissions;
