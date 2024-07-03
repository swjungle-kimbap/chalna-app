import PushNotification from 'react-native-push-notification';
import { storeFCM } from './FcmStorage'

// FCM Message 처리
const handleFCMMessage = (remoteMessage) => {
  console.log('Received remote message', remoteMessage);
  // 저장
  storeFCM(remoteMessage);
  // 모든 메시지는 Notification으로 변환하여 알림 디스플레이함!
  const { title, body, isMatch } = createNotification(remoteMessage.data);
  showLocalNotification(title, body, isMatch);
}

// 공통 알림 생성 함수
const createNotification = (data) => {
  const additionalData = data.additionalData ? JSON.parse(data.additionalData) : {};

  const title = data.fcmType === 'match' ? "인연으로부터 메시지가 도착했습니다." : `Message from ${data.senderId || 'Unknown'}`;
  const body = data.message || "No message content";

  return { title, body, isMatch: additionalData.fcmType === 'match' };
};

// 로컬 알림 표시 함수
const showLocalNotification = (title: string, body: string, isMatch: boolean) => {
  let notificationOptions: any = {
    channelId: "chalna_default_channel", // channelId 추가    
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

export { handleFCMMessage, createNotification, showLocalNotification };