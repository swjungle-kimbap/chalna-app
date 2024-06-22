import messaging from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import { setKeychain, getKeychain, deleteKeychain } from '../utils/keychain';
import requestPermissions from '../utils/requestPermissions';
import { PERMISSIONS } from 'react-native-permissions';

export const useFCMToken = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFCMToken = async () => {
      try {
        const hasPermission = await requestPermissions([PERMISSIONS.ANDROID.POST_NOTIFICATIONS]);
        if (!hasPermission) {
            return null;
        } else {
          const storedToken = await getKeychain('fcmToken');
          // 저장된 토큰이 없으면 새로운 토큰 요청
          if (!storedToken) {
            const token = await messaging().getToken();
            console.log('New FCM Token:', token);
            setFcmToken(token);
            await setKeychain('fcmToken', token);
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
      await setKeychain('fcmToken', token);
    });
  }, []);

  return fcmToken;
};

// 포그라운드 메시지 수신 처리
export const useFcmMessage = messaging().onMessage( async (remoteMessage) => {
  console.log('Foreground message received:', JSON.stringify(remoteMessage));
});