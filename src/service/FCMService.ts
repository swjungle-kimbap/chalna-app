import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class FCMService {
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  async registerAppWithFCM() {
    await messaging().registerDeviceForRemoteMessages();
    await this.requestUserPermission();
  }

  async saveMessageData(data: any) {
    try {
      const existingMessages = await AsyncStorage.getItem('messages');
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push(data);
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save message data:', error);
    }
  }

  async handleRemoteMessage(remoteMessage: any) {
    const { data } = remoteMessage;
    const { senderId, message, createdAt, additionalData } = data;

    let title: string | null = null;
    let senderName: string | null = null;
    let chatRoomId: string | null = null;
    let chatRoomType: string | null = null;
    let fcmType: string | null = null;
    let screenId: string | null = null;

    try {
      if (additionalData) {
        const additionalDataObj = JSON.parse(additionalData);
        fcmType = additionalDataObj.fcmType;

        if (fcmType === 'match') {
          title = '인연으로부터 메시지가 도착했습니다';
          screenId = additionalDataObj.notificationId;
        } else if (fcmType === 'chat') {
          chatRoomType = additionalDataObj.chatRoomType;
          senderName = additionalDataObj.senderName;
          screenId = additionalDataObj.chatRoomId;
          title = chatRoomType === '1' ? `Message from ${senderName}` : `Message from 익명${senderId}`;
        } else {
          title = `Message from ${senderName}`;
        }
      } else {
        console.warn('No additionalData provided');
      }
    } catch (error) {
      console.error('Failed to parse additionalData:', error);
    }

    const messageBody = message;

    PushNotification.localNotification({
      channelId: "default_channel_id", // 채널 ID 설정
      title: title || "Default Title",
      message: messageBody || "Default Message",
    });

    await this.saveMessageData({ senderId, message, createdAt, additionalData });
  }

  initialize() {
    this.registerAppWithFCM();

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      await this.handleRemoteMessage(remoteMessage);
    });

    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      await this.handleRemoteMessage(remoteMessage);
    });

    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        notification.finish(PushNotification.FetchResult.NoData);
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

    // 채널 생성
    PushNotification.createChannel(
      {
        channelId: "default_channel_id", // 채널 ID
        channelName: "Default Channel", // 채널 이름
        channelDescription: "A default channel", // (optional) default: undefined.
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }
}

export const fcmService = new FCMService();
