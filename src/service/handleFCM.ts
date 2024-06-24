import { Linking } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { ChatPushAlarm, MatchPushAlarm } from '../interfaces';
import { navigate } from '../navigation/RootNavigation';

type PushAlarm = ChatPushAlarm | MatchPushAlarm | undefined;

const NotificationRoute = (data: PushAlarm)=> {
  if ((data as ChatPushAlarm).chatRoomId !== undefined) {
    const chatData = data as ChatPushAlarm;
    navigate('채팅', {chatRoomId: chatData.chatRoomId})
  }
  navigate('지도', {modalOpen: true})
}

export const linking = {
  prefixes: ['myapp://'],
  config: {
    initialRouteName: '로그인',
    screens: {
      '로그인': '로그인',
      '로그인 성공': {
        screens: {
          '친구목록' : {
            screens: {
              '친구 목록' : '친구 목록',
              '차단친구 목록' : '차단친구 목록'
            }
          },
          '지도': {
            path: '지도/:notificationId',
            parse: {
              modalOpen: (notificationId: string) => parseInt(notificationId,10),
            }
          },
          '채팅목록' : { 
            screens: {
              '채팅 목록' : '채팅 목록',
              '채팅' : {
                path: '채팅/:chatRoomId',
                parse: {
                  chatRoomId: (chatRoomId: string) => parseInt(chatRoomId, 10),
                }
              }
            },
          },
          '마이페이지' : { 
            screens: {
              '마이 페이지' : '마이 페이지',
              '앱 설정' : '앱 설정',
              '선호 태그 설정' : '선호 태그 설정'
            }
          }
        }
      },
    }
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (typeof url === 'string') {
      return url;
    }
    //getInitialNotification: When the application is opened from a quit state.
    const message: FirebaseMessagingTypes.RemoteMessage | null = await messaging().getInitialNotification();
    NotificationRoute(message?.data as PushAlarm);
  },
  subscribe(listener: (url: string) => void)  {
    const onReceiveURL = ({url}: {url: string}) => listener(url);

    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    //onNotificationOpenedApp: When the application is running, but in the background.
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      NotificationRoute(remoteMessage?.data as PushAlarm)
    });

    return () => {
      linkingSubscription.remove();
      unsubscribe();
    };
  },
}