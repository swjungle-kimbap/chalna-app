import styled from "styled-components/native";
import Text from "../../components/common/Text";

import { Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import { useFCMToken, useFcmMessage } from "../../hooks/FCM";

type ChattingListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '로그인 성공'>
};

const LoginScreen: React.FC<ChattingListScreenProps> = ({navigation}) => {
  const fcmToken = useFCMToken();
  if (fcmToken)
    useFcmMessage();
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
