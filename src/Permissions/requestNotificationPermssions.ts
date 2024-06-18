import { PermissionsAndroid, Platform } from 'react-native';

const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
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
