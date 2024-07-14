import { Platform, Linking, Alert } from "react-native";
import { openSettings } from "react-native-permissions";
import { useModal } from "../context/ModalContext";

const showPermissionAlert = (msg:string) => {

  Alert.alert(
    '권한 필요',
    `이 기능을 사용하려면 ${msg} 권한이 필요합니다.`,
    [ 
      {
        text: '설정',
        onPress: () => {
          if (Platform.OS === 'android') {
            openSettings().catch(() => console.warn('cannot open settings'));
          } else {
            Linking.openURL('app-settings:');
          }
        },
      },
      {
        text: '취소',
        style: 'cancel',
      },
      
    ],
    { cancelable: false }
  );
};

export default showPermissionAlert;