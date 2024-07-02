import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { configurePushNotification, setupMessageHandlers } from './src/service/NotificationHandler';

// 메시지 핸들러 설정
setupMessageHandlers();

// PushNotification 설정
configurePushNotification();

AppRegistry.registerComponent(appName, () => App);
