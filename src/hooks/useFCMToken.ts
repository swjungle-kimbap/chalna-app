import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { storeToken } from '../utils/keychain';
import requestNotificationPermission from '../Permissions/requestNotificationPermssions';

const useFCMToken: React.FC<String> = () => {
  const [fcmToken, setFcmToken] = useState<string>('');

  useEffect(() => {
    const getToken = async () => {
      try {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          const token = await messaging().getToken();
          console.log('FCM Token:', token);
          setFcmToken(token);
          await storeToken(token);
        } else {
          console.log('Notification permission denied');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    // FCM 토큰 갱신 리스너 등록
    const onTokenRefreshListener = messaging().onTokenRefresh(async (token:string) => {
      console.log('FCM Token refreshed:', token);
      await storeToken(token);
    });

    // 포그라운드 메시지 수신 처리
    const onMessageListener = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', JSON.stringify(remoteMessage));
    });

    // 최초 토큰 요청
    getToken();

    return () => {
      onTokenRefreshListener();
      onMessageListener();
    };
  }, []);
  return fcmToken;
};

export default useFCMToken;
