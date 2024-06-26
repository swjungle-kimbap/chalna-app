// import { Linking } from 'react-native';
// import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
// import { ChatPushAlarm, MatchPushAlarm } from '../interfaces';
// import { navigate } from '../navigation/RootNavigation';

// const NotificationRoute = (additionalData: string | undefined) => {
//     if (!additionalData) {
//       console.error('Additional data is undefined or null.');
//       return;
//     }
  
//     try {
//       const parsedData = JSON.parse(additionalData); // 문자열을 객체로 변환
//       if ('chatRoomId' in parsedData) {
//         const chatData = parsedData as ChatPushAlarm;
//         navigate('채팅', {chatRoomId: chatData.chatRoomId})
//       } else if ('notificationId' in parsedData) {
//         const matchData = parsedData as MatchPushAlarm;
//         navigate('지도', { notificationId: matchData.notificationId });
//       } else {
//         console.error('Unknown notification data format:', parsedData);
//     }
//     } catch (e) {
//       console.error("라우팅 실패!", e);
//     }
// }

// export const linking = {
//   prefixes: ['myapp://'],
//   config: {
//     initialRouteName: '로그인',
//     screens: {
//       '로그인': '로그인',
//       '로그인 성공': {
//         screens: {
//           '친구목록' : {
//             screens: {
//               '친구 목록' : '친구 목록',
//               '차단친구 목록' : '차단친구 목록'
//             }
//           },
//           '지도': {
//             path: '지도/:notificationId',
//             parse: {
//               modalOpen: (notificationId: string) => parseInt(notificationId,10),
//             }
//           },
//           '채팅목록' : { 
//             screens: {
//               '채팅 목록' : '채팅 목록',
//               '채팅' : {
//                 path: '채팅/:chatRoomId',
//                 parse: {
//                   chatRoomId: (chatRoomId: string) => parseInt(chatRoomId, 10),
//                 }
//               }
//             },
//           },
//           '마이페이지' : { 
//             screens: {
//               '마이 페이지' : '마이 페이지',
//               '앱 설정' : '앱 설정',
//               '선호 태그 설정' : '선호 태그 설정'
//             }
//           }
//         }
//       },
//     }
//   },
//   async getInitialURL() {
//     const url = await Linking.getInitialURL();
//     console.log("url 입니다", url);
//     if (typeof url === 'string') {
//       return url;
//     }
//     //getInitialNotification: When the application is opened from a quit state.
//     const message: FirebaseMessagingTypes.RemoteMessage | null = await messaging().getInitialNotification();
//     const additionalData = message?.data?.additionalData;
//     console.log("additionalData 입니다", message);
//     if (typeof additionalData === 'string') {
//       NotificationRoute(additionalData);
//     } else {
//       console.error('Invalid additionalData format:', additionalData);
//     }
//   },
//   subscribe(listener: (url: string) => void)  {
//     const onReceiveURL = ({url}: {url: string}) => {console.log("background url 입니다", url); listener(url)};

//     // Listen to incoming links from deep linking
//     const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

//     //onNotificationOpenedApp: When the application is running, but in the background.
//     const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
//       console.log("background additionalData 입니다", remoteMessage);
//       const additionalData = remoteMessage?.data?.additionalData;
//       if (typeof additionalData === 'string') {
//         NotificationRoute(additionalData);
//       } else {
//         console.error('Invalid additionalData format:', additionalData);
//       }
//     });

//     return () => {
//       linkingSubscription.remove();
//       unsubscribe();
//     };
//   },
// }