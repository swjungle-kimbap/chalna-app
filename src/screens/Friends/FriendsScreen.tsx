import Text from "../../components/common/Text";
import styled from "styled-components/native";
import { Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";

type FriendsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '차단친구 목록'>
};

const FriendsScreen: React.FC<FriendsScreenProps> = ({navigation}) => {
  return (
    <FriendsStyle> 
      <Text>친구목록 페이지 입니다.</Text>
      <Button title="차단친구 목록" onPress={()=>navigation.navigate('차단친구 목록')}/>
    </FriendsStyle>
  )
}

const FriendsStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default FriendsScreen;
