import styled from "styled-components/native";
import { NaverMap } from "../../components/Map/NaverMap";
import ScanButton from "../../components/Map/ScanButton";
import AlarmButton from "../../components/Map/AlarmButton";
import BleButton from "../../components/Map/BleButton";


interface MapPrams {
  route: {
    params?: {
      notificationId? : number;
    }
  }
}

const MapScreen: React.FC<MapPrams> = ({ route }) => {
  const { notificationId = -1 } = route.params ?? {};
  
  return (
    <>
      <BleButton />
      <AlarmButton notificationId={notificationId} />
      <NaverMap />
      <ScanButton />
    </>
  );
}

const MapStyle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;

export default MapScreen;
