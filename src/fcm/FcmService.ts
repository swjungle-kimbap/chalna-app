import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { fcmConfig } from './FcmConfig';

class FCMService {
  initialize() {
    // 앱 등록
    fcmConfig.registerAppWithFCM();

    // 포그라운드, 백그라운드 핸들러 등록
    fcmConfig.setupMessageHandlers();

    // fcm push 알림 설정
		fcmConfig.configurePushNotification();
  }
}

export const fcmService = new FCMService();
