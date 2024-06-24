import Text from "../../components/common/Text";
import { Alert, StyleSheet, View } from "react-native";
import { useFCMToken, useFcmMessage } from "../../hooks/useFCM";
import useDeviceUUID from '../../hooks/useDeviceUUID'
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
import { logIn } from "../../components/Login/login";
import { getKeychain } from "../../utils/keychain";

const LoginScreen: React.FC = ({}) => {
  const setLocation = useSetRecoilState(locationState);
  const fcmToken:string = useFCMToken();
  const deviceUUID:string = useDeviceUUID();
  const [loginToken, setLoginToken] = useState<string>("");

  useEffect(() => {
    if (fcmToken) {
      useFcmMessage();
    }
  },[fcmToken])

  useEffect(()=>{
    endBackgroundService();
    const setSavedData = async () => {
      const logintoken = await getKeychain('loginToken');
      setLoginToken(logintoken);

      const lastLocation : Position|null = await getAsyncObject<Position>('lastLocation');
      if (lastLocation)
        setLocation(lastLocation);
    }
    setSavedData();
  },[])

  useBackground();

  const handleLogin = async () => {
    try {
      let loginSuccess;
      if (!loginToken) {
        loginSuccess = await SignUpByWithKakao(fcmToken, deviceUUID);
        if (loginSuccess) {
          await Alert.alert("회원가입 완료!", "환영합니다~🎉 \n메세지를 작성한뒤 인연 보내기를 눌러보세요!");
        }
      } else {
        loginSuccess = logIn(loginToken, deviceUUID, fcmToken);
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
        <View style={styles.logoContainer}>
          <Text variant="title">찰나, 스치다</Text>
        </View>
        <RoundBox style={styles.buttonContainer}>
          <Button title={loginToken ? "로그인" : "카카오로 시작하기"} onPress={handleLogin}/>
        </RoundBox>
      </View>
    );
  };
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 50, 
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});


export default LoginScreen;
