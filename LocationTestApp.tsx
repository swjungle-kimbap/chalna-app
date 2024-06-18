import React, { useEffect, useState } from "react"
import Geolocation from "react-native-geolocation-service"
import { View, Text, StyleSheet, PermissionsAndroid, ActivityIndicator } from "react-native"
import sendLocation from "./src/axios/sendLocation";
import { requestLocationPermission } from "./src/Permissions/requestLocationPermission";
import { Position } from './src/interfaces';
import { NaverMap } from "./src/components/NaverMap";
import DeviceInfo from 'react-native-device';
import { TestResponse } from "./src/interfaces";

function App(): React.JSX.Element {
  const [currentLocation, setCurrentLocation] = useState<Position | null >(null);
  const [isLoading, setIsLoading] = useState<boolean | null>(true); // 로딩 상태 추가
  const [fetchedData, setfetchedData] = useState<TestResponse>([]);
  const [deviceID, setDeviceID] = useState<string>("");

  const startWatchingPosition = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.log(error);
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

  const requestLocation = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // 권한 허용 시 위치 정보 가져오기
        startWatchingPosition();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {   
    const permissionSettings = async () => {
      try {
        await requestLocationPermission();
        await requestLocation();
        const id = await DeviceInfo.getUniqueId();
        if (id)
          setDeviceID(id);
      } catch (error: any) { // Use any type for the error object
        console.error('Error fetching device ID:', error);
        throw error;
      }
    }
    permissionSettings();
  }, []); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentLocation) {
          const data = await sendLocation(deviceID, currentLocation);
          if (data) {
            setfetchedData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();  
  }, [currentLocation])

  return (
  <View style={{ flex: 1 }}>
    <Text style={styles.title}>Geolocation Test</Text>
    {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {currentLocation && fetchedData ? (
            <>
              <Text style={styles.title}>
                {currentLocation.latitude} / {currentLocation.longitude}
                {fetchedData.map((result) => `[userUUID : ${result.userUUID} / distance : ${result.distance}]`)}
              </Text>
              <NaverMap
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
              />
            </>
          ) : currentLocation && !fetchedData ? (
            <>
              <Text style={styles.title}>
                {currentLocation.latitude} / {currentLocation.longitude}
              </Text>
              <NaverMap
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
              />
            </>
          ) : (
            <Text style={styles.title}>Location undefined</Text>
          )}
        </>
      )
    }
  </View>
  )
}
const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 20,
    margin: 15,
    color: "white",
    fontWeight: "600",
  },
})
export default App