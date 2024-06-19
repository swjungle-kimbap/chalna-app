import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { Position } from '../../interfaces';

interface NaverMapProps {
  pos: Position;
}

export const NaverMap: React.FC<NaverMapProps> = ({pos}) => {
  return (
  <NaverMapView 
  style={{flex: 1}}
  initialCamera={{
    latitude : pos.latitude,
    longitude : pos.longitude,
    zoom:16}}>
      <NaverMapMarkerOverlay
        latitude={pos.latitude}
        longitude={pos.longitude}
        onTap={() => alert('안녕')}
        anchor={{ x: 0.5, y: 1 }}
        caption={{
          key: '1',
          text: '나',
        }}
        width={20}
        height={30}
      />
  </NaverMapView> 
);
}