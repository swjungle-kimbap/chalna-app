import { Button, Text, View } from "react-native";
import styled from "styled-components/native";

const MypageScreen: React.FC = ({navigation}) => {
  return (
    <MypageStyle> 
      <Text>My page</Text>
      <Button title="Go Map" onPress={() => navigation.goBack()}/> 
    </MypageStyle>
  )
}

const MypageStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default MypageScreen;
