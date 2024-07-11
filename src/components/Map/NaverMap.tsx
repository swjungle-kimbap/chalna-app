import { NaverMapMarkerOverlay, NaverMapView, NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { FlyingModeState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef, useState } from "react";
import Geolocation, { GeoError } from "react-native-geolocation-service";
import { Alert, LogBox, StyleSheet, View } from "react-native";
import { openSettings, PERMISSIONS } from "react-native-permissions";
import LocalChatButton from "./LocalChatButton";
import LocalChatMarkerOverlay from "./LocalChatMarkerOverlay";
import { locationState } from "../../recoil/atoms";
import { Position } from '../../interfaces';
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import requestPermissions from "../../utils/requestPermissions";
import ArrowButton from "./ArrowButton";
import KalmanFilter from 'kalmanjs'
import MapBottomSheet from "./MapBottomSheet";

LogBox.ignoreLogs(['Called stopObserving with existing subscriptions.'])
const latkfilter = new KalmanFilter();
const longkfilter = new KalmanFilter();

export const NaverMap: React.FC = ({}) => {
  const [currentLocation, setCurrentLocation] = useRecoilState<Position>(locationState);
  const mapViewRef = useRef<NaverMapViewRef>(null);
  const flyingMode = useRecoilValue(FlyingModeState);
  const watchId = useRef<number | null>(null);
  const [showLocalChatModal, setShowLocalChatModal] = useState<boolean>(false);

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
            //console.log({ latitude:filteredLatitude, longitude:filteredlongitude });
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
      ref={mapViewRef}
      >
      <LocalChatMarkerOverlay/>
      <NaverMapMarkerOverlay
        isHideCollidedCaptions={true}
        latitude={currentLocation.latitude}
        longitude={currentLocation.longitude}
        anchor={{ x: 0.5, y: 1 }}
        caption={{
          text: '나',
        }}
        image={{symbol:"green"}}
        width={20}
        height={30}
        zIndex={3}
      />
    </NaverMapView>
    <LocalChatButton showLocalChatModal={showLocalChatModal} setShowLocalChatModal={setShowLocalChatModal}/>
    {flyingMode && (
      <ArrowButton cameraMove = {cameraMove} />
    )}
    <View style={styles.bottomSheet}>
      <MapBottomSheet cameraMove={cameraMove} setShowLocalChatModal={setShowLocalChatModal}/>
    </View>
  </>
);
}

const styles = StyleSheet.create({
  bottomSheet: {
    position:'absolute',
    bottom: 10,
    right: 15,
    width: "90%",
  },
})