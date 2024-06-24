import Text from "../../components/common/Text";
import { ActivityIndicator, Alert, Image, StyleSheet, View } from "react-native";
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
import { logIn } from "../../components/Login/logIn";
import { getKeychain } from "../../utils/keychain";

const LoginScreen: React.FC = () => {
  const setLocation = useSetRecoilState(locationState);
  const fcmToken:string = useFCMToken();
  const deviceUUID:string = useDeviceUUID();
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태 추가

  useEffect(() => {
    if (fcmToken) {
      useFcmMessage();
    }
  },[fcmToken])

  useBackground();

  useEffect(() => {
    endBackgroundService();
    const setSavedData = async () => {
      try {
        const lastLocation : Position|null = await getAsyncObject<Position>('lastLocation');
        if (lastLocation)
          setLocation(lastLocation);

        const loginToken = await getKeychain('loginToken');
        if (loginToken) {
          const loginSuccess = await logIn(loginToken, deviceUUID, fcmToken);
          if (loginSuccess)
            navigate("로그인 성공");
        }
        setIsLoading(false)
      } catch (e) {
        console.error("자동 로그인 실패", e);
      }
    }
    setSavedData();
  },[])

  const handleLogin = async () => {
    console.log('hi');
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
