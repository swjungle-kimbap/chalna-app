import PushNotification from 'react-native-push-notification';
import { storeFCM } from './FcmStorage'
import { navigate } from '../navigation/RootNavigation';
import { checkFCMSettings } from './FcmAlarm';
import { DEFAULT_CHANNEL_ID } from './FcmConfig';
import { getFCMChannels } from './FcmChannel';

// FCM Message 처리
const handleFCMMessage = (remoteMessage) => {
  const additionalData = remoteMessage.data.additionalData ? 
                      JSON.parse(remoteMessage.data.additionalData) : {};

  console.log("oh my god!!!!!!!!", checkFCMSettings(remoteMessage.data, additionalData)); 
    // 모든 메시지는 Notification으로 변환하여 알림 디스플레이함!
  const { title, body, isMatch } = createNotification(remoteMessage.data);
  showLocalNotification(title, body, isMatch, remoteMessage.data);
  
  // 저장
  storeFCM(remoteMessage);
}

// 공통 알림 생성 함수
const createNotification = (data) => {
  const additionalData = data.additionalData ? JSON.parse(data.additionalData) : {};

  const title = data.fcmType === 'match' ? "인연으로부터 메시지가 도착했습니다." : `Message from ${data.senderId || 'Unknown'}`;
  const body = data.message || "No message content";

  return { title, body, isMatch: additionalData.fcmType === 'match' };
}

// 로컬 알림 표시 함수
const showLocalNotification = (title: string, body: string, isMatch: boolean, data: any) => {
  console.log(getFCMChannels());
  let notificationOptions: any = {
    channelId: "chalna_default_channel", // channelId 추가    
    title: title,
    message: body,
    data: data,
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
}

const handleFCMClick = (notification: any) => {
  const data = notification.data;
  console.log(`클릭이 발생한 fcm 내용 : '${data.message}'`);
  
  const additionalData = data.additionalData ? JSON.parse(data.additionalData) : {};

  if (data) {
    const fcmType = data.fcmType;

    switch (fcmType) {
      case 'match':
        // 예: 매치 화면으로 이동
        navigate("로그인 성공", {
          screen: "지도",
          params: { notificationId: additionalData.notificationId }
        });
        break;
      case 'chat':
        // 예: 채팅 화면으로 이동
        navigate("채팅", { chatRoomId: additionalData.chatRoomId });  
        break;
      default:
        console.log('Unknown fcmType:', fcmType);
        break;
    }
  } else {
    console.log('Notification data is undefined');
  }  
}

export { handleFCMMessage, createNotification, showLocalNotification, handleFCMClick };