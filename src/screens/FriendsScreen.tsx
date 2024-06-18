import { Text, View } from "react-native";
import styled from "styled-components/native";

const FriendsScreen: React.FC = ({}) => {
  return (
    <FriendsStyle> 
      <Text>Friends page</Text>
    </FriendsStyle>
  )
}

const FriendsStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default FriendsScreen;
