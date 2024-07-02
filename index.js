import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

// 메시지 핸들러
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  handleRemoteMessage(remoteMessage);
});

// 헤드리스 작업 (Android 전용)
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => {
  return async (remoteMessage) => {
    console.log('Headless task executed!', remoteMessage);
    handleRemoteMessage(remoteMessage);
  };
});

// 공통 알림 생성 함수
const createNotification = (data) => {
  const additionalData = data.additionalData ? JSON.parse(data.additionalData) : {};
  const title = additionalData.fcmType === 'match' ? "인연으로부터 메시지가 도착했습니다." : `Message from ${data.senderId || 'Unknown'}`;
  const body = data.message || "No message content";

  return { title, body, isMatch: additionalData.fcmType === 'match' };
};

// 백그라운드 FCM 처리 함수
const handleRemoteMessage = (remoteMessage) => {
  console.log('Received remote message', remoteMessage);
  const { title, body, isMatch } = createNotification(remoteMessage.data);

  showLocalNotification(title, body, isMatch);
};

// 로컬 알림 표시 함수
const showLocalNotification = (title, body, isMatch) => {
  let notificationOptions = {
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
PushNotification.configure({
  onNotification: function (notification) {
    console.log('LOCAL NOTIFICATION ==>', notification);

    // 안전하게 notification 객체 속성에 접근
    const { title, body, isMatch } = createNotification(notification.data || {});

    showLocalNotification(title, body, isMatch);

    // 알림 액션 처리
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

AppRegistry.registerComponent(appName, () => App);
