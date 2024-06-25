import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";
import { locationState, showMsgBoxState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useState, useEffect, useRef } from "react";
import { TestResponse, Position, LocationData } from '../../interfaces';
import Geolocation from "react-native-geolocation-service";
import { axiosPost } from "../../axios/axios.method";
import Config from 'react-native-config';
import requestPermissions from "../../utils/requestPermissions";
import { Platform } from "react-native";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import { useStartWatchingPosition } from "../../hooks/useStartWatchingPosition";
import { PERMISSIONS } from "react-native-permissions";

export const NaverMap: React.FC = ({}) => {
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const [fetchedData, setfetchedData] = useState<TestResponse>([]);
  const [granted, setGranted] = useState<boolean>(false);
  const currentLocation = useRecoilValue<Position>(locationState);
  const startWatchingPosition = useStartWatchingPosition();
  const locationRef = useRef(currentLocation);

  const requestPermissionAndBluetooth = async () => {
    try {
      if (Platform.OS === 'android') {
        const allGranted = await requestPermissions([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
        if (allGranted) {
          setGranted(true);
        } else {
          setGranted(false);
        }
      }
      else 
        console.log('Not supported OS');
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    let watchId:number;
    requestPermissionAndBluetooth().then(() => {
      if (granted) {
        watchId = startWatchingPosition();
      }
    });
    return () => {
      if (watchId)
        Geolocation.clearWatch(watchId);
    }
  }, [granted]);

  useChangeBackgroundSave<Position>('lastLocation', locationRef, currentLocation);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentLocation) {
          axiosPost(Config.SET_CUR_POS_URL, "위치 정보 전달", {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            distance: 200,
          } as LocationData)
          // const data = await sendLocation(currentLocation);
          // if (data) {
          //   setfetchedData(data);
          // }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    };
    // fetchData();
  }, [currentLocation])

  return (
  <NaverMapView 
  style={{flex: 1, zIndex:1}}
  initialCamera={{
    latitude : currentLocation.latitude,
    longitude : currentLocation.longitude,
    zoom:16}}
    mapPadding={{ bottom: 20 }}
    onTapMap={()=>{
      if (showMsgBox)
        setShowMsgBox(false)
    }}>
      <NaverMapMarkerOverlay
        latitude={currentLocation.latitude}
        longitude={currentLocation.longitude}
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