import PushNotification from 'react-native-push-notification';
import { storeFCM } from './FcmStorage'
import { navigate } from '../navigation/RootNavigation';
import { DEFAULT_CHANNEL_ID, DEFAULT_CHANNEL_NAME } from './FcmChannel';
import { checkMyPageSettings, checkKeywordSettings, checkMessageForKeywords } from './FcmAlarm';

// FCM Message 처리
const handleFCMMessage = (remoteMessage) => {

  if (remoteMessage.data.fcmType === 'match' && checkKeywordSettings()) {
    handleMatchKeyword(remoteMessage);
  } 
  else {
    const result = checkMyPageSettings(remoteMessage.data);
    if (result) {
      // 모든 메시지는 Notification으로 변환하여 알림 디스플레이함!
      const { title, body, isMatch } = createNotification(remoteMessage.data);
      showLocalNotification(title, body, isMatch, remoteMessage.data);
    }
    // 저장
    storeFCM(remoteMessage);
  }
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
  let notificationOptions: any = {
    channelId: DEFAULT_CHANNEL_ID,
    channelName: DEFAULT_CHANNEL_NAME,
    title: title,
    message: body,
    data: data,
    importance: 'high',
    priority: 'high',
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

const handleMatchKeyword = (remoteMessage) => {
  const data = remoteMessage.data;

  if (!checkMessageForKeywords(data.additionalData.receiverId, data.message)) return;

  if (checkMyPageSettings(data)) {
    const { title, body, isMatch } = createNotification(data);
    showLocalNotification(title, body, isMatch, data);
  }
  storeFCM(remoteMessage);
}

export { handleFCMMessage, createNotification, showLocalNotification, handleFCMClick };