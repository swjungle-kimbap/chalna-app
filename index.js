import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { fcmService } from './src/fcm/FcmService';

// FCM 초기화
fcmService.initialize();

AppRegistry.registerComponent(appName, () => App);
