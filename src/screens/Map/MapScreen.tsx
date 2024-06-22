import styled from "styled-components/native";
import { NaverMap } from "../../components/Map/NaverMap";
import { useState, useEffect } from "react";
import { TestResponse, Position, LocationData } from '../../interfaces';
import Geolocation from "react-native-geolocation-service";
import Text from "../../components/common/Text";
import { ActivityIndicator } from "react-native";
import { axiosPost } from "../../axios/axios.method";
import Config from 'react-native-config';
import RoundBox from "../../components/common/RoundBox";
import Button from '../../components/common/Button';
import requestPermissions from "../../utils/requestPermissions";
import requestBluetooth from "../../utils/requestBluetooth";
import { PERMISSIONS } from "react-native-permissions";
import retryPermissions from "../../utils/retryPermissions";
import useBackground from "../../hooks/useBackground";
import { Platform } from "react-native";
import ScanButton from "../../components/Map/ScanButton";
import AlarmButton from "../../components/Map/AlarmButton";

const requiredPermissions = [
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
  PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
  PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE];

const MapScreen: React.FC = ({}) => {
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState<boolean | null>(true); // 로딩 상태 추가
  const [fetchedData, setfetchedData] = useState<TestResponse>([]);
  const [granted, setGranted] = useState<boolean>(false);

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

  // background ble sevice
  useBackground();

  const WatchingPosition = async () => {
    try {
      const hasPermission = await requestPermissions([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
      if (hasPermission)
        startWatchingPosition();
    } catch (error: any) { // Use any type for the error object
      console.error('Error fetching device ID:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    WatchingPosition();
    requestPermissionAndBluetooth();
  }, []); 

  const startWatchingPosition = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.log("Location following failed", error);
      },
      { 
        accuracy: {android : "high"},
        interval: 1000,
        distanceFilter: 1,
        enableHighAccuracy: true,
        showLocationDialog: true,
      }
    );
    return () => Geolocation.clearWatch(watchId);
  } 

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
      ) : currentLocation ? ( 
        <>
          <NaverMap pos={currentLocation} />
          <AlarmButton />
          <ScanButton />
        </>
      ) : (
        <MapStyle>
          <Text>위치를 찾을 수 없습니다</Text>
          <Text>위치 설정을 허용해 주세요</Text>
          <RoundBox>
            <Button title='위치 권한 설정' onPress={async () => {
              const hasPermission = await retryPermissions([PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION])
              if (hasPermission)
                startWatchingPosition()
              }} />
          </RoundBox>
        </MapStyle>
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
