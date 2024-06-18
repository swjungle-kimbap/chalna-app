import styled from "styled-components/native";
import Text from "../../components/common/Text";
import { Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";

type SettingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '선호 태그 설정'>
};

const SettingScreen: React.FC<SettingScreenProps> = ({navigation}) => {
  return (
    <SettingStyle> 
      <Text>설정 페이지 입니다.</Text>
      <Button title="설정 페이지" onPress={()=>navigation.navigate('선호 태그 설정')}/>
    </SettingStyle>
  )
}

const SettingStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default SettingScreen;
