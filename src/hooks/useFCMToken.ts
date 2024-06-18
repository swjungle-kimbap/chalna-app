import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { storeToken, getToken } from '../utils/keychain';
import requestNotificationPermission from '../Permissions/requestNotificationPermssions';

export const useFCMToken = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCMToken = async () => {
      try {
        // 먼저 저장된 토큰을 가져옴
        const storedToken = await getToken();
        if (storedToken) {
          setFcmToken(storedToken);
          console.log('Using stored FCM token:', storedToken);
        } else {
          // 저장된 토큰이 없으면 새로운 토큰 요청
          const hasPermission = await requestNotificationPermission();
          if (hasPermission) {
            const token = await messaging().getToken();
            console.log('New FCM Token:', token);
            setFcmToken(token);
            await storeToken(token);
          } else {
            console.log('Notification permission denied');
          }
        }
      } catch (error) {
        console.error('Error initializing FCM token:', error);
      }
    };

    initializeFCMToken();

    // 토큰 갱신 리스너 등록
    return () => messaging().onTokenRefresh(async (token: string) => {
      console.log('FCM Token refreshed:', token);
      setFcmToken(token);
      await storeToken(token);
    });
  }, []);

  return fcmToken;
};

// 포그라운드 메시지 수신 처리
export const useFcmMessage = messaging().onMessage( async (remoteMessage) => {
  console.log('Foreground message received:', JSON.stringify(remoteMessage));
});