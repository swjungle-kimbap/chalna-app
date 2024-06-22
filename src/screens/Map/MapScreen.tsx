import styled from "styled-components/native";
import { NaverMap } from "../../components/Map/NaverMap";
import { useState, useEffect } from "react";
import { TestResponse, Position, LocationData } from '../../interfaces';
import Geolocation from "react-native-geolocation-service";
import { ActivityIndicator, AppState, AppStateStatus } from "react-native";
import { axiosPost } from "../../axios/axios.method";
import Config from 'react-native-config';
import requestPermissions from "../../utils/requestPermissions";
import requestBluetooth from "../../utils/requestBluetooth";
import { PERMISSIONS } from "react-native-permissions";
import { Platform } from "react-native";
import ScanButton from "../../components/Map/ScanButton";
import AlarmButton from "../../components/Map/AlarmButton";
import { useRecoilState } from "recoil";
import { locationState } from "../../recoil/atoms";
import { setAsyncObject } from "../../utils/asyncStorage";

const MapScreen: React.FC = ({}) => {
  const [currentLocation, setCurrentLocation] = useRecoilState<Position>(locationState);
  const [isLoading, setIsLoading] = useState<boolean | null>(true); // 로딩 상태 추가
  const [fetchedData, setfetchedData] = useState<TestResponse>([]);
  const [granted, setGranted] = useState<boolean>(false);

  const requestPermissionAndBluetooth = async () => {
    try {
      if (Platform.OS === 'android') {
        const allGranted = await requestPermissions();
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

  const startWatchingPosition = () => {
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.log("Location following failed", error);
      },
      { 
        accuracy: { android: "high" },
        interval: 3000,
        distanceFilter: 1,
        enableHighAccuracy: true,
        showLocationDialog: true,
      }
    );
  };

  useEffect(() => {
    requestPermissionAndBluetooth().then(() => {
      if (granted) {
        startWatchingPosition();
      }
      setIsLoading(false);
    });
  }, [granted]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      await setAsyncObject<Position>('lastLocation', currentLocation);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

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
          <AlarmButton />
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
