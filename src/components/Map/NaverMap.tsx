import { NaverMapView, NaverMapMarkerOverlay, NaverMapCircleOverlay, NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { isNearbyState, showMsgBoxState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef } from "react";
import Geolocation from "react-native-geolocation-service";
import requestPermissions from "../../utils/requestPermissions";
import { Alert } from "react-native";
import { useStartWatchingPosition } from "../../hooks/useStartWatchingPosition";
import { PERMISSIONS } from "react-native-permissions";
import { IsNearbyState } from "../../recoil/atomtypes";
import LocalChatButton from "./LocalChatButton";
import LocalChatMarkerOverlay from "./LocalChatMarkerOverlay";
import { locationState } from "../../recoil/atoms";
import { Position } from '../../interfaces';

export const NaverMap: React.FC = ({}) => {
  const currentLocation = useRecoilValue<Position>(locationState);
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const nearbyInfo = useRecoilValue<IsNearbyState>(isNearbyState);
  const mapViewRef = useRef<NaverMapViewRef>(null);
  const watchIdRef = useRef(0);
  const startWatchingPosition = useStartWatchingPosition();


  useEffect(() => {
    if (mapViewRef.current) {
      mapViewRef.current.setLocationTrackingMode("Face");
    }

    requestPermissions([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then((granted) => {
      if (granted) {
        watchIdRef.current = startWatchingPosition();
      }
    });

    return () => {
      if (watchIdRef.current)
        Geolocation.clearWatch(watchIdRef.current);
    }
  }, []);
  
  return (
  <>
    <NaverMapView
    style={{flex: 1, zIndex:1}}
    initialCamera={{
      latitude : currentLocation.latitude,
      longitude : currentLocation.longitude,
      zoom:18}}
      onTapMap={()=>{
        if (showMsgBox)
          setShowMsgBox(false)
      }}
      ref={mapViewRef}
      >
        <NaverMapMarkerOverlay
          latitude={currentLocation.latitude}
          longitude={currentLocation.longitude}
          onTap={() => Alert.alert("Hi", "반갑티비😀")}
          anchor={{ x: 0.5, y: 1 }}
          caption={{
            text: '나',
          }}
          image={{symbol:(nearbyInfo.isNearby ? "green" : "red") }}
          width={20}
          height={30}
        />
        <NaverMapCircleOverlay
          latitude={currentLocation.latitude}
          longitude={currentLocation.longitude}
          radius={9}
          color={nearbyInfo.isNearby ? '#3EB29780': '#D7351150'}
        />
        <LocalChatMarkerOverlay />
    </NaverMapView>
    <LocalChatButton />
  </>
);
}
