import styled from "styled-components/native";
import Text from "../../components/common/Text";
import { Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import { useFCMToken, useFcmMessage } from "../../hooks/useFCM";
import useDeviceUUID from '../../hooks/useDeviceUUID'
import { useEffect } from "react";
import useBackground from "../../hooks/useBackground";
import { endBackgroundService } from "../../service/BackgroundTask";
import { useSetRecoilState } from "recoil";
import { locationState } from "../../recoil/atoms";
import { getAsyncObject } from "../../utils/asyncStorage";
import { Position } from "../../interfaces";

type ChattingListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '로그인 성공'>
};

const LoginScreen: React.FC<ChattingListScreenProps> = ({navigation}) => {
  const setLocation = useSetRecoilState(locationState);
  const fcmToken = useFCMToken();
  useEffect(() => {
    if (fcmToken) {
      useFcmMessage();
    }
  },[fcmToken])
  useEffect(()=>{
    endBackgroundService();
    const setLastLocation = async () => {
      const lastLocation : Position|null = await getAsyncObject<Position>('lastLocation');
      if (lastLocation)
        setLocation(lastLocation);
    }
    setLastLocation();
  },[])

  useDeviceUUID();
  useBackground();
  return (
    <LoginStyle> 
      <Text>Login page</Text>
      <Button title="로그인 하기" onPress={() => navigation.navigate('로그인 성공')}/>
    </LoginStyle>
  )
}

const LoginStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default LoginScreen;
