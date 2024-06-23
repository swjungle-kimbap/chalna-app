import Geolocation from "react-native-geolocation-service";
import { useSetRecoilState } from "recoil";
import { locationState } from "../recoil/atoms";

export const useStartWatchingPosition = () => {
  const setCurrentLocation = useSetRecoilState(locationState);

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
