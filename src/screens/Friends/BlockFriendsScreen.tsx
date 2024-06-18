import styled from "styled-components/native";
import Text from "../../components/common/Text";

const BlockFriendsScreen: React.FC = ({}) => {
  return (
    <BlockFriendsStyle> 
      <Text>차단 친구 페이지 입니다.</Text>
    </BlockFriendsStyle>
  )
}

const BlockFriendsStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default BlockFriendsScreen;
