import { NaverMap } from "../../components/Map/NaverMap";
import AlarmButton from "../../components/Map/AlarmButton";
import ScanButtons from "../../components/Map/ScanButtons";

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
      <AlarmButton notificationId={notificationId} />
      <NaverMap />
      <ScanButtons/>
    </>
  );
}

export default MapScreen;
