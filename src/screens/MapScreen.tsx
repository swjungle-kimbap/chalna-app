import { Button, Text } from "react-native";
import styled from "styled-components/native";

const MapScreen: React.FC = ({ navigation }) => {
  return (
    <MapStyle> 
      <Text>Map page</Text>
      <Button title="Go MyPage" onPress={()=>navigation.navigate('MyPage')}/>
    </MapStyle>
  )
}

const MapStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default MapScreen;
