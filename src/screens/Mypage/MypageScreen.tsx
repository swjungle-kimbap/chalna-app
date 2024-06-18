import styled from "styled-components/native";
import Text from "../../components/common/Text";
import { Button } from "react-native";

const MypageScreen: React.FC = ({navigation}) => {
  return (
    <MypageStyle> 
      <Text>마이페이지 입니다</Text>
      <Button title="설정 페이지" onPress={()=>navigation.navigate('앱 설정')}/>
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
