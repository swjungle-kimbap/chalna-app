import { Button, Text } from "react-native";
import styled from "styled-components/native";

const MessageScreen: React.FC = ({}) => {
  return (
    <MessageStyle> 
      <Text>Message page</Text>
      <Button title="Go MyPage" onPress={()=>navigation.navigate('MyPage')}/>
    </MessageStyle>
  )
}

const MessageStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default MessageScreen;
