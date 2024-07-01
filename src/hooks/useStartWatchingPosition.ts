import Geolocation from "react-native-geolocation-service";
import { useSetRecoilState } from "recoil";
import { locationState } from "../recoil/atoms";
import { Alert } from "react-native";
import { openSettings } from "react-native-permissions";

export const useStartWatchingPosition = () => {
  const setCurrentLocation = useSetRecoilState(locationState);
  const startWatchingPosition = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (e) => {
        Alert.alert(
          "GPS 필요",
          "GPS가 필요한 서비스 입니다. GPS를 켜주세요",
          [
            { text: "설정", onPress: () => openSettings()},
            { text: "취소", onPress: () => {}, style: "cancel" } // 지도 채팅방 나가기, 지도 정보 확인 불가
          ]
        );
      },
      { 
        accuracy: { android: "high" },
        interval: 3000,
        distanceFilter: 1,
        enableHighAccuracy: true,
        showLocationDialog: true,
      }
    );
    return watchId;
  };

  return startWatchingPosition;
};
