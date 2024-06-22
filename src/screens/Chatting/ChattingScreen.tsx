import Text from "../../components/common/Text";
import styled from "styled-components/native";

const ChattingScreen: React.FC = ({}) => {
  return (
    <ChattingStyle> 
      <Text>채팅 페이지입니다.</Text>
    </ChattingStyle>
  )
}

const ChattingStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default ChattingScreen;
