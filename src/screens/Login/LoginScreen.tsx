import Text from "../../components/common/Text";
import { ActivityIndicator, Alert, Image, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import useBackground from "../../hooks/useBackground";
import { endBackgroundService } from "../../service/BackgroundTask";
import { useSetRecoilState } from "recoil";
import { locationState } from "../../recoil/atoms";
import { getAsyncObject } from "../../utils/asyncStorage";
import { Position } from "../../interfaces";
import RoundBox from "../../components/common/RoundBox";
import Button from "../../components/common/Button";
import { SignUpByWithKakao } from "../../components/Login/SignUpByWithKakao";
import { navigate } from "../../navigation/RootNavigation";
import { logIn } from "../../components/Login/logIn";
import { deleteKeychain, getKeychain, setKeychain } from "../../utils/keychain";
import requestPermissions from "../../utils/requestPermissions";
import { PERMISSIONS } from "react-native-permissions";
import messaging from '@react-native-firebase/messaging';
import uuid from 'react-native-uuid'

const LoginScreen: React.FC = () => {
  const setLocation = useSetRecoilState(locationState);
  const [fcmToken, setFcmToken] = useState<string>("");
  const [deviceUUID, setDeviceUUID] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태 추가

  useEffect(() => {
    endBackgroundService();
  },[])

  useBackground();

  useEffect(() => {
    const initializeFCMToken = async () => {
      try {
        const hasPermission = await requestPermissions([PERMISSIONS.ANDROID.POST_NOTIFICATIONS]);
        if (!hasPermission) {
            return null;
        } else {
          const storedToken = await getKeychain('fcmToken');
          // 저장된 토큰이 없으면 새로운 토큰 요청
          if (!storedToken) {
            const token = await messaging().getToken();
            setFcmToken(token);
            console.log('New FCM Token:', token);
            await setKeychain('fcmToken', token);
          } else {
            setFcmToken(storedToken);
          }
        }
      } catch (error) {
        console.error('Error initializing FCM token:', error);
      }
    };

    const initializeDeviceUUID = async () => {
      try {
        await deleteKeychain('deviceUUID'); // test
        const deviceUUID = await getKeychain('deviceUUID');
        if (!deviceUUID) {
          const newDeviceUUID:string = uuid.v4().slice(0, -2) + '00' as string;
          setDeviceUUID(newDeviceUUID);
          await setKeychain('deviceUUID', newDeviceUUID);
        } else {
          setDeviceUUID(deviceUUID);
        }
      } catch (error) {
        console.error('Error fetching or setting device UUID:', error);
      }
    };

    const autoLogin = async () => {
      try {
        // get location first for using in mapscreen
        const lastLocation : Position|null = await getAsyncObject<Position>('lastLocation');
        if (lastLocation) setLocation(lastLocation);

        await initializeFCMToken();
        await initializeDeviceUUID();
        const loginToken = await getKeychain('loginToken');
        if (loginToken && deviceUUID && fcmToken) {
          const loginSuccess = await logIn(loginToken, deviceUUID, fcmToken);
          if (loginSuccess)
            navigate("로그인 성공");
        }
        setIsLoading(false)
      } catch (e) {
        console.error("자동 로그인 실패", e);
      }
    }
    autoLogin();

    // 초기화 되면 재설정
    return () => messaging().onTokenRefresh(async (token: string) => {
      console.log('FCM Token refreshed:', token);
      await setKeychain('fcmToken', token);
    });

  },[])

  const handleLogin = async () => {
    try {
      const loginSuccess = await SignUpByWithKakao(fcmToken, deviceUUID);
      if (loginSuccess) {
        await Alert.alert("회원가입 완료!", "환영합니다~🎉 \n메세지를 작성한뒤 인연 보내기를 눌러보세요!");
      }
       
      if (loginSuccess)
        navigate("로그인 성공");

    } catch {
      console.log("로그인 실패");
      Alert.alert("로그인 실패", "다시 로그인해 주세요");
    }
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <View style={styles.loadingConatiner}>
            <Text variant="title">반갑티비</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </>
      ) : ( 
      <>
      <View style={styles.logoContainer}>
        <Text variant="title">찰나, 스치다</Text>
      </View>
      <RoundBox style={styles.buttonContainer}>
        <Image source={require('../../assets/Icons/KakaoTalkIcon.png')} 
          style={{width:30, height: 30}} />
        <Button title="카카오로 시작하기" onPress={async () => {handleLogin();}}/>
      </RoundBox>
      </>
    )}
  </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingConatiner : {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 50,
    width: '60%',
    backgroundColor:'#FAE54D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default LoginScreen;
