import styled from "styled-components/native";
import { NaverMap } from "../../components/Map/NaverMap";
import { useState, useEffect, useRef } from "react";
import { TestResponse, Position, LocationData } from '../../interfaces';
import Geolocation from "react-native-geolocation-service";
import { ActivityIndicator } from "react-native";
import { axiosPost } from "../../axios/axios.method";
import Config from 'react-native-config';
import requestPermissions from "../../utils/requestPermissions";
import requestBluetooth from "../../utils/requestBluetooth";
import { Platform } from "react-native";
import ScanButton from "../../components/Map/ScanButton";
import AlarmButton from "../../components/Map/AlarmButton";
import { useRecoilState, useRecoilValue } from "recoil";
import { locationState, userInfoState } from "../../recoil/atoms";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import { useStartWatchingPosition } from "../../hooks/useStartWatchingPosition";
import { PERMISSIONS } from "react-native-permissions";

const requiredPermissions = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

interface MapPrams {
  route: {
    params?: {
      notificationId? : number;
    }
  }
}

const MapScreen: React.FC<MapPrams> = ({ route }) => {
  const { notificationId }  = route.params?.notificationId ?? -1;
  const currentLocation = useRecoilValue<Position>(locationState);
  const [isLoading, setIsLoading] = useState<boolean | null>(true); // 로딩 상태 추가
  const [fetchedData, setfetchedData] = useState<TestResponse>([]);
  const [granted, setGranted] = useState<boolean>(false);
  const startWatchingPosition = useStartWatchingPosition();
  const locationRef = useRef(currentLocation);

  const requestPermissionAndBluetooth = async () => {
    try {
      if (Platform.OS === 'android') {
        const allGranted = await requestPermissions(requiredPermissions);
        const bluetoothActive = await requestBluetooth();
        if (allGranted && bluetoothActive) {
          console.log("ALL permssions has been ready")
          setGranted(true);
        } else {
          console.log("ALL permssions are not satisfied")
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
      setIsLoading(false);
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
    <>
      {isLoading ? (
        <MapStyle>
          <ActivityIndicator size="large" color="#0000ff" />
        </MapStyle>
      ) : ( 
        <>
          <NaverMap pos={currentLocation} />
          <AlarmButton notificationId={notificationId} />
          <ScanButton disable={!granted} />
        </>
      )}
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
