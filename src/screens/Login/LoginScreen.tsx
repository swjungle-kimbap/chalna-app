import Text from "../../components/common/Text";
import { ActivityIndicator, Alert, Image, StyleSheet, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { endBackgroundService } from "../../service/Background";
import { useRecoilState, useSetRecoilState } from "recoil";
import { DeviceUUIDState, locationState, userInfoState } from "../../recoil/atoms";
import { getAsyncObject } from "../../utils/asyncStorage";
import { LoginResponse, Position } from "../../interfaces";
import RoundBox from "../../components/common/RoundBox";
import Button from "../../components/common/Button";
import { SignUpByWithKakao, logIn } from "../../service/kakaoLoginSignup";
import { navigate } from "../../navigation/RootNavigation";
import requestPermissions from "../../utils/requestPermissions";
import { PERMISSIONS } from "react-native-permissions";
import messaging from '@react-native-firebase/messaging';
import uuid from 'react-native-uuid'
import { LogBox } from 'react-native';
import { getMMKVObject, loginMMKVStorage, setMMKVObject, setUserMMKVStorage } from "../../utils/mmkvStorage";
LogBox.ignoreLogs(['new NativeEventEmitter']); 

const LoginScreen: React.FC = () => {
  const setLocation = useSetRecoilState(locationState);
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  const [isLoading, setIsLoading] = useState(true);
  const fcmTokenRef = useRef<string>("");
  const setDeviceUUID = useSetRecoilState<string>(DeviceUUIDState);
  const deviceUUIDRef = useRef<string>("");
  const loginTokenRef = useRef<string>("");

  useEffect(() => {
    endBackgroundService();
    const initializeFCMToken = async () => {
      try {
        const hasPermission = await requestPermissions([PERMISSIONS.ANDROID.POST_NOTIFICATIONS]);
        if (!hasPermission) {
          return null;
        } else {
          const storedToken = loginMMKVStorage.getString('login.fcmToken');
          if (!storedToken) {
            const token = await messaging().getToken();
            fcmTokenRef.current = token;
            console.log('New FCM Token:', token);
            loginMMKVStorage.set('fcmToken', token);
          } else {
            fcmTokenRef.current = storedToken;
          }
        }
      } catch (error) {
        console.error('Error initializing FCM token:', error);
      }
    };

    const initializeDeviceUUID = async () => {
      try {
        const UUID = loginMMKVStorage.getString('login.deviceUUID');
        if (!UUID) {
          const newDeviceUUID: string = uuid.v4().slice(0, -2) + '00' as string;
          deviceUUIDRef.current = newDeviceUUID;
          loginMMKVStorage.set('deviceUUID', newDeviceUUID);
          console.log("DeviceUUID:", newDeviceUUID);
        } else {
          deviceUUIDRef.current = UUID;
          console.log("DeviceUUID:", UUID);
        }
        setDeviceUUID(deviceUUIDRef.current);
      } catch (error) {
        console.error('Error fetching or setting device UUID:', error);
      }
    };

    const getLoginToken = async () => {
      loginTokenRef.current = loginMMKVStorage.getString('loginToken');
    };

    const autoLogin = async () => {
      try {
        const lastLocation: Position | null = getMMKVObject<Position>('lastLocation');
        if (lastLocation) setLocation(lastLocation);

        await initializeFCMToken();
        await initializeDeviceUUID();
        await getLoginToken();
        
        if (loginTokenRef.current && deviceUUIDRef.current && fcmTokenRef.current) {
          const loginResponse = await logIn(loginTokenRef.current, deviceUUIDRef.current, fcmTokenRef.current);
          if (loginResponse) {
            setUserMMKVStorage(loginResponse.id.toString());
            const newUserInfo = getMMKVObject<LoginResponse>("mypage.userInfo");
            if (newUserInfo)
              setUserInfo(newUserInfo);
            else {
              setUserInfo(loginResponse);
              setMMKVObject<LoginResponse>("mypage.userInfo", loginResponse);
            }
            navigate("로그인 성공");
          }
        }
      } catch (e) {
        console.error("자동 로그인 실패", e);
      }
      setIsLoading(false);
    };

    autoLogin();
    return () => messaging().onTokenRefresh(async (token: string) => {
      console.log('FCM Token refreshed:', token);
      loginMMKVStorage.set('fcmToken', token);
    });
  }, []);

  const handleLogin = async () => {
    try {
      const loginResponse = await SignUpByWithKakao(deviceUUIDRef.current, fcmTokenRef.current);
      if (loginResponse) {
        await Alert.alert("로그인 완료!", "환영합니다~🎉 \n메세지를 작성한뒤 인연 보내기를 눌러보세요!");
        setUserMMKVStorage(loginResponse.id.toString());
        const newUserInfo = getMMKVObject<LoginResponse>("mypage.userInfo");
        if (newUserInfo)
          setUserInfo(newUserInfo);
        else {
          setUserInfo(loginResponse);
          setMMKVObject<LoginResponse>("mypage.userInfo", loginResponse);
        }
        navigate("로그인 성공");
      }


    } catch {
      console.log("로그인 실패");
      Alert.alert("로그인 실패", "다시 로그인해 주세요");
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <View style={styles.loadingConatiner}>
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
