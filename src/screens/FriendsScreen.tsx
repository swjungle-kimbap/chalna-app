import { Text, View } from "react-native";
import styled from "styled-components/native";

const FriendsScreen: React.FC = ({}) => {
  return (
    <View> 
      <Text>Friends page</Text>
    </View>
  )
}

const FriendsStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default FriendsScreen;
