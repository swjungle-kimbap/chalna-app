import styled from "styled-components/native";
import Text from "../../components/common/Text";

const TagSelectScreen: React.FC = ({navigation}) => {
  return (
    <TypeSelectStyle> 
      <Text>선호 태그 설정 페이지 입니다.</Text>
    </TypeSelectStyle>
  )
}

const TypeSelectStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default TagSelectScreen;
