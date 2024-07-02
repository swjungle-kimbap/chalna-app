import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';
import { RecoilRoot } from 'recoil';
import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { navigate } from './src/navigation/RootNavigation';
import { fcmService } from './src/service/FCMService';
import messaging from '@react-native-firebase/messaging';


export default function App() {
  useEffect(() => {
      fcmService.initialize();

      // 포그라운드 fcm 수신처리
	    const unsubscribe = messaging().onMessage(async remoteMessage => {
	        console.log(remoteMessage);
	    });
//     // 이벤트 리스너 등록
//     const subscription = DeviceEventEmitter.addListener('FCMOpenScreen', (event) => {
//       const { screen, screenId } = event;
//       if (screen === "채팅") {
//         console.log('Joo Received screen value in App:', screen, screenId);
//         navigate("채팅", { chatRoomId: screenId });
//       } else {
//         console.log('Screen value is null or undefined');
//         navigate("로그인 성공", {
//           screen: "지도",
//           params: { NotificationId: screenId }
//           }
//         )};
//       })
//
//     // 컴포넌트 언마운트 시 이벤트 리스너 제거
//     return () => {
//       subscription.remove();
//     };
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
	    return () => {
	      unsubscribe();
	//       subscription.remove();
	    };
    }, []);

  return (
    <ThemeProvider theme={FontTheme}>
      <RecoilRoot>
        <MainScreen />
      </RecoilRoot>
    </ThemeProvider>
  );
}
