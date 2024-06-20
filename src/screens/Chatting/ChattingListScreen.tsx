import Text from "../../components/common/Text";
import styled from "styled-components/native";
import Button from '../../components/common/Button'
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../interfaces/Navigation";

type ChattingListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, '채팅'>
};

const ChattingListScreen: React.FC<ChattingListScreenProps> = ({navigation}) => {
  return (
    <ChattingListStyle>
      <Text>채팅 목록 페이지입니다.</Text>
      <Button title="채팅" onPress={()=>navigation.navigate('채팅')}/>
    </ChattingListStyle>
  )
}

const ChattingListStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default ChattingListScreen;
