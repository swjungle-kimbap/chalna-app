import { PermissionsAndroid, Platform } from 'react-native';

const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (hasPermission) {
      console.log('NotificationPermission already granted');
      return true; 
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: '푸시 허가 요청',
          message: '푸시 알림을 위해선 허가 요청이 필요합니다.',
          buttonNegative: '허용',
          buttonPositive: '거부',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can post notifications');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    console.log('Notification permission is not required for this Android version');
    return true;
  }
};

export default requestNotificationPermission;
