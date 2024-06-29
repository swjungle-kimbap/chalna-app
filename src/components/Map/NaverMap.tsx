import { NaverMapView, NaverMapMarkerOverlay, NaverMapCircleOverlay, NaverMapViewRef } from "@mj-studio/react-native-naver-map";
import { isNearbyState, locationState, showMsgBoxState } from "../../recoil/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useState, useEffect, useRef } from "react";
import { Position, LocationData, AxiosResponse } from '../../interfaces';
import Geolocation from "react-native-geolocation-service";
import { axiosPost } from "../../axios/axios.method";
import Config from 'react-native-config';
import requestPermissions from "../../utils/requestPermissions";
import { Platform, Alert } from "react-native";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import { useStartWatchingPosition } from "../../hooks/useStartWatchingPosition";
import { PERMISSIONS } from "react-native-permissions";
import { navigate } from "../../navigation/RootNavigation";
import { IsNearbyState } from "../../recoil/atomtypes";
import {urls} from "../../axios/config";
import { joinLocalChat } from "../../service/LocalChat";

export const NaverMap: React.FC = ({}) => {
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const [nearbyInfo, setNearbyInfo] = useRecoilState<IsNearbyState>(isNearbyState);
  const mapViewRef = useRef<NaverMapViewRef>(null);
  const [fetchedData, setfetchedData] = useState([]);
  const [granted, setGranted] = useState<boolean>(false);
  const currentLocation = useRecoilValue<Position>(locationState);
  const locationRef = useRef(currentLocation);
  const watchIdRef = useRef(0);
  const startWatchingPosition = useStartWatchingPosition();
  useChangeBackgroundSave<Position>('lastLocation', locationRef, currentLocation);

  useEffect(() => {
    if (mapViewRef.current) {
      mapViewRef.current.setLocationTrackingMode("Face"); 
    }

    requestPermissionAndBluetooth().then(() => {
      if (granted) {
        watchIdRef.current = startWatchingPosition();
      }
    });

    return () => {
      if (watchIdRef.current)
        Geolocation.clearWatch(watchIdRef.current);
    }
  }, [granted]);

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
    if (mapViewRef.current) {
      mapViewRef.current.setLocationTrackingMode("Face");
    }

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
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentLocation) {
          axiosPost(urls.SET_CUR_POS_URL, "위치 정보 전달", {
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

  const localChatTapHandler = (name:string, description:string, chatRoomId:number) => {
    Alert.alert(name, description,
      [
        {
          text: '채팅 참가',
          onPress: async () => {
            alert("아직 미구현입니다!")
            // joinLocalChat(chatRoomId);
          },
          style: 'default'
        },
      ],
      { cancelable: true }
    )
  };

  const makeLocalChat = () => {
    axiosPost(urls.SET_LOCAL_CHAT_URL, "장소채팅 만들기", {
    
    })
  }

  return (
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
      <NaverMapMarkerOverlay
        latitude={currentLocation.latitude+0.0001}
        longitude={currentLocation.longitude+0.0001}
        onTap={() => localChatTapHandler("질분방","무엇이든지 물어보세요~", 1)}
        image={require('../../assets/Icons/LocalchatIcon.png')}
        width={40}
        height={40}
      />
      <NaverMapCircleOverlay
        latitude={currentLocation.latitude}
        longitude={currentLocation.longitude}
        radius={9}
        color={nearbyInfo.isNearby ? '#3EB29780': '#D7351150'}
      />
  </NaverMapView>
);
}
