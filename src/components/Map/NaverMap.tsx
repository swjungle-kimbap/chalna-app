import { NaverMapView, NaverMapMarkerOverlay, NaverMapCircleOverlay, NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { FlyingModeState, isNearbyState, showMsgBoxState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef } from "react";
import Geolocation, { GeoError } from "react-native-geolocation-service";
import { Alert, LogBox } from "react-native";
import { openSettings, PERMISSIONS } from "react-native-permissions";
import { IsNearbyState } from "../../recoil/atomtypes";
import LocalChatButton from "./LocalChatButton";
import LocalChatMarkerOverlay from "./LocalChatMarkerOverlay";
import { locationState } from "../../recoil/atoms";
import { Position } from '../../interfaces';
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import requestPermissions from "../../utils/requestPermissions";
import ArrowButton from "./ArrowButton";
import KalmanFilter from 'kalmanjs'

LogBox.ignoreLogs(['Called stopObserving with existing subscriptions.'])
const latkfilter = new KalmanFilter();
const longkfilter = new KalmanFilter();

export const NaverMap: React.FC = ({}) => {
  const [currentLocation, setCurrentLocation] = useRecoilState<Position>(locationState);
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const nearbyInfo = useRecoilValue<IsNearbyState>(isNearbyState);
  const mapViewRef = useRef<NaverMapViewRef>(null);
  const flyingMode = useRecoilValue(FlyingModeState);
  const watchId = useRef<number | null>(null);
  
  useChangeBackgroundSave<Position>('map.lastLocation', currentLocation);

  useEffect(() => {
    const startWatchPosition = async () => {
      const granted = await requestPermissions([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION])
      if (granted) {
        watchId.current = Geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const filteredLatitude = latkfilter.filter(latitude);
            const filteredlongitude = longkfilter.filter(longitude);
            setCurrentLocation({ latitude:filteredLatitude, longitude:filteredlongitude });
            console.log({ latitude:filteredLatitude, longitude:filteredlongitude });
          },
          (e:GeoError) => {
            if (e.code === 1) {
              Alert.alert(
                "위치 권한 필요",
                "위치 권한이 필요한 서비스입니다.",
                [
                  { text: "설정", onPress: () => openSettings()},
                  { text: "취소", onPress: () => {}, style: "cancel" } 
                ]
              );
            }
            if (e.code === 2) {
              Alert.alert(
                "GPS  필요",
                "GPS가 필요한 서비스 입니다. GPS를 켜주세요",
                [
                  { text: "설정", onPress: () => openSettings()},
                  { text: "취소", onPress: () => {}, style: "cancel" } 
                ]
              );
            }
          },
          { 
            accuracy: { android: "high" },
            interval: 3000,
            distanceFilter: 3,
            enableHighAccuracy: true,
            showLocationDialog: true,
          }
        );
    }}
    
    if (!flyingMode) {
      startWatchPosition();
      if (mapViewRef.current) {
        mapViewRef.current.setLocationTrackingMode("Face");
      }
    } else {
      Geolocation.clearWatch(watchId.current);
      Geolocation.stopObserving();
      if (mapViewRef.current) {
        mapViewRef.current.setLocationTrackingMode("NoFollow");
      }
    }
  }, [flyingMode]);
  
  const cameraMove = (newLocation) => {
    mapViewRef.current.animateCameraTo({...newLocation});
  };

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
          onTap={() => Alert.alert("반갑티비", "주위의 인연이 존재하면 초록색으로 바뀌어요!")}
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
    {flyingMode && (
      <ArrowButton cameraMove = {cameraMove} />
    )}
  </>
);
}