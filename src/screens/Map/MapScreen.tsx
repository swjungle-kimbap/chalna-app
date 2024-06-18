import styled from "styled-components/native";
import Text from "../../components/common/Text";

const MapScreen: React.FC = ({}) => {
  return (
    <MapStyle> 
      <Text>Map page</Text>
    </MapStyle>
  )
}

const MapStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default MapScreen;
