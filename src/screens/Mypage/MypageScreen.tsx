import styled from "styled-components/native";
import Text from "../../components/common/Text";
import Button from "../../components/common/Button"
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";
import RoundBox from "../../components/common/RoundBox";

type MypageScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '앱 설정'>
};

const MypageScreen: React.FC<MypageScreenProps> = ({navigation}) => {
  return (
    <MypageStyle> 
      <Text>마이페이지 입니다</Text>
      <Button title="설정 페이지" onPress={()=>navigation.navigate('앱 설정')}/>
      <RoundBox color="#FFFFFF">
        <Text>내용</Text>
      </RoundBox>
      <RoundBox color="#FFFFFF">
        <Button title='hi' onPress={() => alert('hi')}/>
      </RoundBox>
    </MypageStyle>
  )
}

const MypageStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default MypageScreen;
