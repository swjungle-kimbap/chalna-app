import React, { useEffect, useState } from "react"
import Geolocation from "react-native-geolocation-service"
import { View, Text, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator } from "react-native"
import { request, PERMISSIONS, requestLocationAccuracy, requestMultiple } from "react-native-permissions";
import { NaverMapView, NaverMapMarkerOverlay } from "@mj-studio/react-native-naver-map";

function MyMap(): React.JSX.Element {
    return (
    <NaverMapView style={{flex: 1}}/>
  );
}

function App(): React.JSX.Element {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((status) => {
        console.log(`Location request status: ${status}`);
        if (status === 'granted') {
          requestLocationAccuracy({
            purposeKey: 'common-purpose', // replace your purposeKey of Info.plist
          })
            .then((accuracy) => {
              console.log(`Location accuracy is: ${accuracy}`);
            })
            .catch((e) => {
              console.error(`Location accuracy request has been failed: ${e}`);
            });
        }
      });
    }
    if (Platform.OS === 'android') {
      requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      ])
        .then((status) => {
          console.log(`Location request status: ${status}`);
        })
        .catch((e) => {
          console.error(`Location request has been failed: ${e}`);
        });
    }

    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        // 권한 요청 결과에 따라 상태 업데이트
        setLocationPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // 권한 허용 시 위치 정보 가져오기
          const watchId = Geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setCurrentLocation({ latitude, longitude });
              setIsLoading(false); // 위치 정보 가져온 후 로딩 상태 해제
            },
            (error) => {
              console.log(error);
              setIsLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
              distanceFilter: 1,
            }
          );
          return () => Geolocation.clearWatch(watchId);
        } else {
          console.log('Location permission denied');
          setIsLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setIsLoading(false);
      }
    };
    requestLocationPermission();
  }, []); 


  return (
    <View style={{flex: 1}}>
      <Text style={styles.title}>Geolocation Test</Text>
      {isLoading ? (<ActivityIndicator size="large" color="#0000ff" />) : 
        currentLocation ? (
        <>
        <Text style={styles.title}>
          {currentLocation.latitude} / {currentLocation.longitude}
        </Text>
        <NaverMapView 
        style={{flex: 1}}
        initialCamera={{
          latitude : currentLocation.latitude,
          longitude : currentLocation.longitude,
          zoom:16}}>
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
        </>
      ) : (
        <Text style={styles.title}>location undefined</Text>
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 25,
    margin: 15,
    color: "white",
    fontWeight: "600",
  },
})
export default App