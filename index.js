import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// 백그라운드 핸들러 (iOS 및 Android)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);

  // iOS: 백그라운드에서 알림 표시
  if (Platform.OS === 'ios') {
    // 필요한 알림 로직 추가 (예: notifee 라이브러리 사용)
    throw error('Not Implemented');
  }

  // Android: 데이터 업데이트 등 필요한 작업 수행
});

// Headless task (Android 전용)
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => {
  return (remoteMessage) => {
    console.log('Headless task executed!', remoteMessage);
    // 데이터 업데이트 등 필요한 작업 수행
  };
});

// Ios Headless task : Notification Service Extension 를 사용
// Notification Service Extension은 Xcode를 사용하여 Swift 또는 Objective-C로 개발해야 됨...

// 백그라운드 에서 실행 되는경우 isHeadless 값은 ios에서 항상 true 로 rendering을 방지함
function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
