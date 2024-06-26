// import { ChatPushAlarm, MatchPushAlarm } from '../interfaces';
// import { navigate } from '../navigation/RootNavigation';

// export const NotificationRoute = (additionalData: string | undefined) => {
//   if (!additionalData) {
//     console.error('Additional data is undefined or null.');
//     return;
//   }

//   try {
//     const parsedData = JSON.parse(additionalData); // 문자열을 객체로 변환
//     if ('chatRoomId' in parsedData) {
//       const chatData = parsedData as ChatPushAlarm;
//       navigate('채팅', {chatRoomId: chatData.chatRoomId})
//     } else if ('notificationId' in parsedData) {
//       const matchData = parsedData as MatchPushAlarm;
//       navigate('지도', { notificationId: matchData.notificationId });
//     } else {
//       console.error('Unknown notification data format:', parsedData);
//   }
//   } catch (e) {
//     console.error("라우팅 실패!", e);
//   }
// }
