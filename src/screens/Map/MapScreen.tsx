import { NaverMap } from "../../components/Map/NaverMap";
import AlarmButton from "../../components/Map/AlarmButton";
import MessageBox from "../../components/Map/MessageBox";

interface MapPrams {
  route: {
    params?: {
      notificationId? : string;
    }
  }
}

const MapScreen: React.FC<MapPrams> = ({ route }) => {
  const { notificationId = "" } = route.params ?? {};
  return (
    <>
      <AlarmButton notificationId={notificationId} />
      <NaverMap />
      <MessageBox/>
    </>
  );
}

export default MapScreen;
