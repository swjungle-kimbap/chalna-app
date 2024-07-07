import PushNotification from 'react-native-push-notification';
import { storeFCM } from './FcmStorage'
import RNFS from 'react-native-fs';
import { navigate } from '../navigation/RootNavigation';
import { DEFAULT_CHANNEL_ID, DEFAULT_CHANNEL_NAME } from './FcmChannel';
import { checkMyPageSettings, checkKeywordSettings, checkMessageForKeywords } from './FcmAlarm';

// FCM Message 처리
const handleFCMMessage = async (remoteMessage) => {
  if (checkMyPageSettings(remoteMessage.data) || remoteMessage.notification) {
    const { title, body, isMatch, isImage, imageUrl } = await createNotification(remoteMessage);

    if (isImage) {
      showLocalNotificationImage(title, body, isMatch, imageUrl, remoteMessage.data);
    } else {
      showLocalNotification(title, body, isMatch, remoteMessage.data);
    }
  }
  if (remoteMessage.notification) return;

  storeFCM(remoteMessage);
};

// 공통 알림 생성 함수
const createNotification = async (remoteMessage) => {
  const { title, body, isNotification, isMatch, imageUrl } = handleFCMType(remoteMessage);

  if (imageUrl) {
    console.log("곧 보여줄 이미지 URL", imageUrl);
    //const localImagePath = await downloadImage(image);
    return { title, body, isMatch, isImage: true, imageUrl };
  }

  return { title, body, isMatch, isImage: false, localImagePath: null };
};

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


// 로컬 이미지 알림 함수
const showLocalNotificationImage = (title:string, body:string, isMatch:boolean, imageUrl:string, data:any) => {
  let notificationOptions: any = {
    channelId: DEFAULT_CHANNEL_ID,
    channelName: DEFAULT_CHANNEL_NAME,
    title: title,
    message: body,
    bigPictureUrl:imageUrl,
    largeIconUrl:imageUrl,
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


const handleFCMType = (remoteMessage) => {
  if (remoteMessage.notification) {
    return FCMNotificationType(remoteMessage.notification);
  } else {
    return FCMDataType(remoteMessage.data);
  }
};

const FCMNotificationType = (notification) => {
  const title = notification.title || "No title";
  const body = notification.body || "No body";
  const imageUrl = notification.android && notification.android.imageUrl ? notification.android.imageUrl : null;
  console.log(title, body, imageUrl);
  return { title, body, isNotification: true, isMatch: false, imageUrl };
};

const FCMDataType = (data) => {
  const additionalData = data.additionalData ? JSON.parse(data.additionalData) : {};
  const title = data.fcmType === 'match' ? "인연으로부터 메시지가 도착했습니다." : `Message from ${data.senderId || 'Unknown'}`;
  const body = data.message || "No message";
  const imageUrl = additionalData.imageUrl || null;

  return { title, body, isNotification: false, isMatch: data.fcmType === "match", imageUrl };
};


// const handleMatchKeyword = (remoteMessage) => {
//   const data = remoteMessage.data;

//   if (!checkMessageForKeywords(data.additionalData.receiverId, data.message)) return;

//   if (checkMyPageSettings(data)) {
//     const { title, body, isMatch } = createNotification(data);
//     showLocalNotification(title, body, isMatch, data);
//   }
//   storeFCM(remoteMessage);
// }

export { handleFCMMessage, createNotification, showLocalNotification, handleFCMClick };