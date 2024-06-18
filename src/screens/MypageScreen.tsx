import { Button, View } from "react-native";
import styled from "styled-components/native";
import Text from "../components/common/Text";

const MypageScreen: React.FC = ({navigation}) => {
  return (
    <MypageStyle> 
      <Text variant="title">안녕</Text>
    </MypageStyle>
  )
}

const MypageStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default MypageScreen;
