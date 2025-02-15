import { NaverMapMarkerOverlay, NaverMapView, NaverMapViewRef, NaverMapCircleOverlay } from "@mj-studio/react-native-naver-map";
import { FlyingModeState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef, useState } from "react";
import Geolocation, { GeoError } from "react-native-geolocation-service";
import { LogBox, StyleSheet, View, Text } from "react-native";
import { openSettings, PERMISSIONS } from "react-native-permissions";
import { locationState } from "../../recoil/atoms";
import { Position } from '../../interfaces';
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import requestPermissions from "../../utils/requestPermissions";
import KalmanFilter from 'kalmanjs'
import LocalChatButton from "../../components/Map/LocalChatButton";
import ArrowButton from "../../components/Map/ArrowButton";
import MapBottomSheet from "../../components/Map/MapBottomSheet";
import LocalChatMarkerOverlay from "../../components/Map/LocalChatMarkerOverlay";
import { showModal } from "../../context/ModalService";
import { userInfoState } from '../../recoil/atoms';
import ProfileImage from '../../components/common/ProfileImage';
import color from "../../styles/ColorTheme";

LogBox.ignoreLogs(['Called stopObserving with existing subscriptions.'])
const latkfilter = new KalmanFilter();
const longkfilter = new KalmanFilter();

const MapScreen: React.FC = ({}) => {
  const [currentLocation, setCurrentLocation] = useRecoilState<Position>(locationState);
  const mapViewRef = useRef<NaverMapViewRef>(null);
  const flyingMode = useRecoilValue(FlyingModeState);
  const watchId = useRef<number | null>(null);
  const [showLocalChatModal, setShowLocalChatModal] = useState<boolean>(false);
  const [isgranted, setIsgranted] = useState(true);
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  useChangeBackgroundSave<Position>('map.lastLocation', currentLocation);

  useEffect(() => {
    const startWatchPosition = async () => {
      let granted = await requestPermissions([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION])
      setIsgranted(granted);
      // while (!granted) {
      //   showPermissionAlert("위치");
      //   granted = await requestPermissions([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION])
      // }
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
            setIsgranted(false);
            if (e.code === 1) {
              showModal(
                "위치 권한 필요",
                "위치 권한이 필요한 서비스입니다.",
                () => openSettings(),
                () => {},
                true,
                "설정",
                "취소",
                false
              );
            }
            if (e.code === 2) {
              showModal(
                "GPS 필요",
                "GPS가 필요한 서비스 입니다. GPS를 켜주세요",
                () => openSettings(),
                () => {},
                true,
                "설정",
                "취소",
                false
              );
            }
          },
          {
            accuracy: { android: "high" },
            interval: 4000,
            distanceFilter: 3,
            enableHighAccuracy: true,
            showLocationDialog: true,
          }
        );
      }
    }

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
  }, [flyingMode, isgranted]);
  
  const cameraMove = (newLocation) => {
    mapViewRef.current.animateCameraTo({...newLocation});
  };

  return (
    <>
    {!isgranted ?
    <NaverMapView
      style={{flex: 1, zIndex:1}}
      initialCamera={{
      latitude : currentLocation.latitude,
      longitude : currentLocation.longitude,
      zoom:17}}
      ref={mapViewRef}
      /> : 
      <NaverMapView
      style={{flex: 1, zIndex:1}}
        initialCamera={{
        latitude : currentLocation.latitude,
        longitude : currentLocation.longitude,
        zoom:17}}
        ref={mapViewRef}
        >
      <LocalChatMarkerOverlay cameraMove={cameraMove} />
      <NaverMapCircleOverlay
        latitude={currentLocation.latitude}
        longitude={currentLocation.longitude}
        radius={100} 
        color={'#438EE630'}
      />
      <NaverMapMarkerOverlay
        latitude={currentLocation.latitude}
        longitude={currentLocation.longitude}
        image={{symbol: 'blue'}}
        anchor={{ x: 0.5, y: 1 }}
        width={20}
        height={30}
        zIndex={3}
        caption={{'text': "나"}}
      />
    </NaverMapView>}
      {isgranted && <>
        <LocalChatButton showLocalChatModal={showLocalChatModal} setShowLocalChatModal={setShowLocalChatModal} />
      </>}
      {isgranted &&
        <View style={styles.bottomSheet}>
          <MapBottomSheet cameraMove={cameraMove} setShowLocalChatModal={setShowLocalChatModal} />
        </View>}
      {flyingMode && (
        <ArrowButton cameraMove={cameraMove} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: "100%",
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: '#05FF69',
    borderRadius: 25,
    padding: 2,
    backgroundColor: 'white',
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "contain",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
})

export default MapScreen;