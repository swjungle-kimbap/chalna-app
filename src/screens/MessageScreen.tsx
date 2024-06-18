import Text from "../components/common/Text";
import styled from "styled-components/native";

const MessageScreen: React.FC = ({}) => {
  return (
    <MessageStyle> 
      <Text>Message page</Text>
    </MessageStyle>
  )
}

const MessageStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default MessageScreen;
