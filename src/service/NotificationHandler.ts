// src/services/notificationHandler.ts

import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// 시간 변경 함수
const formatSentTime = (sentTime: number): string => {
  const date = new Date(sentTime);
  return date.toLocaleString();
};

// 공통 알림 생성 함수
const createNotification = (data: any) => {
  const additionalData = data.additionalData ? JSON.parse(data.additionalData) : {};
  const title = additionalData.fcmType === 'match' ? "인연으로부터 메시지가 도착했습니다." : `Message from ${data.senderId || 'Unknown'}`;
  const body = data.message || "No message content";

  return { title, body, isMatch: additionalData.fcmType === 'match' };
};

// 백그라운드 FCM 처리 함수
const handleRemoteMessage = (remoteMessage: any) => {
  console.log('Received remote message', remoteMessage);
  const { title, body, isMatch } = createNotification(remoteMessage.data);

  showLocalNotification(title, body, isMatch);
};

// 로컬 알림 표시 함수
const showLocalNotification = (title: string, body: string, isMatch: boolean) => {
  let notificationOptions: any = {
    title: title,
    message: body,
    playSound: true,
    soundName: 'default',
    importance: 'high',
  };

  if (isMatch) {
    notificationOptions = {
      ...notificationOptions,
      actions: [
        {
          id: 'accept',
          title: '수락',
        },
        {
          id: 'reject',
          title: '거절',
        }
      ],
    };
  }

  PushNotification.localNotification(notificationOptions);
};

// PushNotification configuration
const configurePushNotification = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('LOCAL NOTIFICATION ==>', notification);

      const { title, body, isMatch } = createNotification(notification.data || {});

      showLocalNotification(title, body, isMatch);

      if (notification.action === 'accept') {
        console.log('수락 버튼 눌림');
        // 수락 버튼 눌렀을 때의 로직 추가
      } else if (notification.action === 'reject') {
        console.log('거절 버튼 눌림');
        // 거절 버튼 눌렀을 때의 로직 추가
      }
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
};

// 메시지 핸들러 설정
const setupMessageHandlers = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    handleRemoteMessage(remoteMessage);
  });

  if (Platform.OS === 'android') {
    AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => {
      return async (remoteMessage: any) => {
        console.log('Headless task executed!', remoteMessage);
        handleRemoteMessage(remoteMessage);
      };
    });
  }
};

export { configurePushNotification, setupMessageHandlers };
