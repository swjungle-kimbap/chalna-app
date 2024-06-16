import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { Position } from '../interfaces';

export const NaverMap: React.FC<Position> = ({ latitude, longitude }) => {

  return (
  <NaverMapView 
  style={{flex: 1}}
  initialCamera={{
    latitude,
    longitude,
    zoom:16}}>
      <NaverMapMarkerOverlay
        latitude={latitude}
        longitude={longitude}
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