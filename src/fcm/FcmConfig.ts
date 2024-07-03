import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { AppRegistry, Platform } from 'react-native';
import { handleFCMMessage, showLocalNotification, createNotification } from './FcmHandler';

class FcmConfig {
	// 유저 권한 확인
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  // 앱 등록 + 유저 권한 확인
  async registerAppWithFCM() {
    await messaging().registerDeviceForRemoteMessages();
    await this.requestUserPermission();
  }

  // 앱 상태 별 메시지 핸들러 등록
  setupMessageHandlers = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('background FCM : ', remoteMessage);
      await handleFCMMessage(remoteMessage);
    });

    messaging().onMessage(async remoteMessage => {
      console.log('foreground FCM : ', remoteMessage);
      await handleFCMMessage(remoteMessage);
    });


    // Headless 작업으로 추가
    if (Platform.OS === 'android') {
      AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => {
        return async (remoteMessage: any) => {
          console.log('Headless task executed!', remoteMessage);
          await handleFCMMessage(remoteMessage);
        };
      });
    }
  };

  // pushNotification 라이브러리 설정
  configurePushNotification = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('LOCAL NOTIFICATION ==>', notification);

        const { title, body, isMatch } = createNotification(notification.data || {});

        showLocalNotification(title, body, isMatch);

        if (notification.action === 'accept') {
          console.log('수락 버튼 눌림');
          // 수락 버튼 눌렀을 때의 로직 추가
        } else if (notification.action === 'reject') {
          console.log('거절 버튼 눌림');
          // 거절 버튼 눌렀을 때의 로직 추가
        }
      },
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
      },
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // 채널 생성 (안드로이드 8.0부터 default 채널 필요)
    PushNotification.createChannel(
      {
        channelId: "chalna_default_channel", // 채널 ID
        channelName: "Default Channel", // 채널 이름
        channelDescription: "A default channel", // (optional) default: undefined.
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }
}

export const fcmConfig = new FcmConfig();